import axios from 'axios';
import NodeCache from 'node-cache';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const cache = new NodeCache({ stdTTL: 86400 }); // 24 hour TTL

const API_BASE = process.env.POKEAPI_BASE_URL || 'https://pokeapi.co/api/v2';
const POKEMON_LIST_LIMIT = Number(process.env.POKEAPI_POKEMON_LIST_LIMIT || 20000);
const DETAIL_BATCH_SIZE = 20;
const overridePath = fileURLToPath(new URL('../config/vgc-current-overrides.json', import.meta.url));
const currentOverrides = JSON.parse(readFileSync(overridePath, 'utf8'));
const overridePokemonByName = new Map(
  currentOverrides.pokemon.flatMap(pokemon => [
    [pokemon.name, pokemon],
    ...(pokemon.aliases || []).map(alias => [alias, pokemon])
  ])
);
const overrideMovesByName = new Map(currentOverrides.moves.map(move => [move.name, move]));
const overrideItemsByName = new Map(currentOverrides.items.map(item => [item.name, item]));
const HELD_ITEM_CATEGORIES = new Set([
  'held-items',
  'choice',
  'effort-training',
  'training',
  'jewels',
  'plates',
  'species-specific',
  'type-enhancement',
  'mega-stones',
  'z-crystals'
]);
const HELD_ITEM_CATEGORY_NAMES = [...HELD_ITEM_CATEGORIES];

function normalizeName(value) {
  return String(value || '').toLowerCase().trim();
}

function titleizeName(name) {
  return name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function toOverridePokemon(override, inheritedMoves = []) {
  return {
    id: override.id,
    name: override.name,
    displayName: override.displayName || titleizeName(override.name),
    types: override.types,
    baseStats: override.baseStats,
    abilities: override.abilities,
    sprite: override.sprite,
    moves: [...new Set([...(override.extraMoves || []), ...inheritedMoves])]
  };
}

function toItemSummary(item) {
  return {
    id: item.id,
    name: item.name,
    displayName: item.displayName || titleizeName(item.name),
    category: item.category
  };
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = [];

  for (let i = 0; i < items.length; i += limit) {
    const batch = items.slice(i, i + limit);
    results.push(...await Promise.all(batch.map(mapper)));
  }

  return results;
}

/**
 * Fetch Pokémon by ID or name with caching
 */
export async function fetchPokemon(idOrName) {
  const normalizedName = normalizeName(idOrName);
  const cacheKey = `pokemon:${normalizedName}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  const override = overridePokemonByName.get(normalizedName);

  if (override) {
    let inheritedMoves = [];

    if (override.movesFrom) {
      try {
        inheritedMoves = (await fetchPokemon(override.movesFrom)).moves;
      } catch (error) {
        console.warn(`Could not inherit moves for ${override.name}:`, error.message);
      }
    }

    const pokemon = toOverridePokemon(override, inheritedMoves);
    cache.set(cacheKey, pokemon);
    return pokemon;
  }

  try {
    const response = await axios.get(`${API_BASE}/pokemon/${normalizedName}`);
    const pokemon = {
      id: response.data.id,
      name: response.data.name,
      displayName: titleizeName(response.data.name),
      types: response.data.types.map(t => t.type.name),
      baseStats: {
        hp: response.data.stats[0].base_stat,
        attack: response.data.stats[1].base_stat,
        defense: response.data.stats[2].base_stat,
        spAtk: response.data.stats[3].base_stat,
        spDef: response.data.stats[4].base_stat,
        speed: response.data.stats[5].base_stat
      },
      abilities: response.data.abilities.map(a => ({
        name: a.ability.name,
        isHidden: a.is_hidden
      })),
      sprite: response.data.sprites.other['official-artwork'].front_default || response.data.sprites.front_default,
      moves: response.data.moves.map(m => m.move.name)
    };
    
    cache.set(cacheKey, pokemon);
    return pokemon;
  } catch (error) {
    console.error(`Error fetching Pokémon ${idOrName}:`, error.message);
    throw new Error(`Pokémon not found: ${idOrName}`);
  }
}

/**
 * Fetch move by ID or name with caching
 */
export async function fetchMove(idOrName) {
  const normalizedName = normalizeName(idOrName);
  const cacheKey = `move:${normalizedName}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  const override = overrideMovesByName.get(normalizedName);

  if (override) {
    cache.set(cacheKey, override);
    return override;
  }

  try {
    const response = await axios.get(`${API_BASE}/move/${normalizedName}`);
    const move = {
      id: response.data.id,
      name: response.data.name,
      type: response.data.type.name,
      power: response.data.power,
      accuracy: response.data.accuracy,
      pp: response.data.pp,
      priority: response.data.priority,
      effect: response.data.effect_entries.find(entry => entry.language.name === 'en')?.effect || 'No effect listed'
    };
    
    cache.set(cacheKey, move);
    return move;
  } catch (error) {
    console.error(`Error fetching move ${idOrName}:`, error.message);
    throw new Error(`Move not found: ${idOrName}`);
  }
}

/**
 * Fetch type with effectiveness data
 */
export async function fetchType(typeNameOrId) {
  const normalizedName = normalizeName(typeNameOrId);
  const cacheKey = `type:${normalizedName}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(`${API_BASE}/type/${normalizedName}`);
    const type = {
      name: response.data.name,
      damageRelations: {
        superEffectiveAgainst: response.data.damage_relations.double_damage_to.map(t => t.name),
        notVeryEffectiveAgainst: response.data.damage_relations.half_damage_to.map(t => t.name),
        noEffectAgainst: response.data.damage_relations.no_damage_to.map(t => t.name),
        takesWeaknessesFrom: response.data.damage_relations.double_damage_from.map(t => t.name),
        takesResistancesFrom: response.data.damage_relations.half_damage_from.map(t => t.name),
        immuneTo: response.data.damage_relations.no_damage_from.map(t => t.name)
      }
    };
    
    cache.set(cacheKey, type);
    return type;
  } catch (error) {
    console.error(`Error fetching type ${typeNameOrId}:`, error.message);
    throw new Error(`Type not found: ${typeNameOrId}`);
  }
}

/**
 * Search Pokémon by name (returns first 20 matches from PokéAPI's namespace)
 */
export async function searchPokemon(query) {
  const normalizedQuery = normalizeName(query);
  const cacheKey = `search:pokemon:${normalizedQuery}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(`${API_BASE}/pokemon?limit=${POKEMON_LIST_LIMIT}`);
    const allPokemon = [
      ...response.data.results,
      ...currentOverrides.pokemon.map(pokemon => ({ name: pokemon.name, url: null }))
    ];
    const matches = allPokemon
      .filter(p => p.name.includes(normalizedQuery))
      .slice(0, 30)
      .map(p => ({ name: p.name, url: p.url }));
    
    cache.set(cacheKey, matches);
    return matches;
  } catch (error) {
    console.error(`Error searching Pokémon:`, error.message);
    return [];
  }
}

/**
 * List real move data for a Pokemon move pool.
 */
export async function listMovesForPokemon(pokemonName, query = '') {
  const pokemon = await fetchPokemon(pokemonName);
  const normalizedQuery = normalizeName(query);
  const moveNames = pokemon.moves
    .filter(moveName => !normalizedQuery || moveName.includes(normalizedQuery))
    .slice(0, 120);

  const moves = await mapWithConcurrency(
    moveNames,
    DETAIL_BATCH_SIZE,
    moveName => fetchMove(moveName).catch(() => null)
  );

  return moves.filter(Boolean);
}

export async function fetchItem(idOrName) {
  const normalizedName = normalizeName(idOrName);
  const cacheKey = `item:${normalizedName}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const override = overrideItemsByName.get(normalizedName);

  if (override) {
    const item = toItemSummary(override);
    cache.set(cacheKey, item);
    return item;
  }

  try {
    const response = await axios.get(`${API_BASE}/item/${normalizedName}`);
    const item = {
      id: response.data.id,
      name: response.data.name,
      displayName: response.data.names.find(name => name.language.name === 'en')?.name || titleizeName(response.data.name),
      category: response.data.category.name,
      effect: response.data.effect_entries.find(entry => entry.language.name === 'en')?.short_effect || ''
    };

    cache.set(cacheKey, item);
    return item;
  } catch (error) {
    console.error(`Error fetching item ${idOrName}:`, error.message);
    throw new Error(`Item not found: ${idOrName}`);
  }
}

export async function listHeldItems(query = '') {
  const normalizedQuery = normalizeName(query);
  const cacheKey = `items:held:${normalizedQuery}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const categoryResponses = await mapWithConcurrency(
      HELD_ITEM_CATEGORY_NAMES,
      4,
      category => axios.get(`${API_BASE}/item-category/${category}`).catch(() => null)
    );
    const candidates = [
      ...categoryResponses
        .filter(Boolean)
        .flatMap(response => response.data.items),
      ...currentOverrides.items.map(item => ({ name: item.name, url: null }))
    ].filter(item => !normalizedQuery || item.name.includes(normalizedQuery));

    const uniqueCandidates = [...new Map(candidates.map(item => [item.name, item])).values()];

    const detailed = await mapWithConcurrency(
      uniqueCandidates,
      DETAIL_BATCH_SIZE,
      item => fetchItem(item.name).catch(() => null)
    );

    const items = detailed
      .filter(Boolean)
      .filter(item => HELD_ITEM_CATEGORIES.has(item.category) || overrideItemsByName.has(item.name))
      .map(toItemSummary)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    cache.set(cacheKey, items);
    return items;
  } catch (error) {
    console.error('Error listing held items:', error.message);
    throw new Error('Failed to list held items');
  }
}

/**
 * Clear cache for testing/debugging
 */
export function clearCache() {
  cache.flushAll();
}

export default {
  fetchPokemon,
  fetchMove,
  fetchType,
  searchPokemon,
  listMovesForPokemon,
  fetchItem,
  listHeldItems,
  clearCache
};
