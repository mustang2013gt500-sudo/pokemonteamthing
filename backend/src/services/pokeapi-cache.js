import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 86400 }); // 24 hour TTL

const API_BASE = process.env.POKEAPI_BASE_URL || 'https://pokeapi.co/api/v2';

/**
 * Fetch Pokémon by ID or name with caching
 */
export async function fetchPokemon(idOrName) {
  const cacheKey = `pokemon:${idOrName}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(`${API_BASE}/pokemon/${idOrName.toLowerCase()}`);
    const pokemon = {
      id: response.data.id,
      name: response.data.name,
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
  const cacheKey = `move:${idOrName}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(`${API_BASE}/move/${idOrName.toLowerCase()}`);
    const move = {
      id: response.data.id,
      name: response.data.name,
      type: response.data.type.name,
      power: response.data.power,
      accuracy: response.data.accuracy,
      pp: response.data.pp,
      priority: response.data.priority,
      effect: response.data.effect_entries[0]?.effect || 'No effect listed'
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
  const cacheKey = `type:${typeNameOrId}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(`${API_BASE}/type/${typeNameOrId.toLowerCase()}`);
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
  const cacheKey = `search:pokemon:${query.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(`${API_BASE}/pokemon?limit=1025`); // Fetch all Pokémon
    const allPokemon = response.data.results;
    const matches = allPokemon
      .filter(p => p.name.includes(query.toLowerCase()))
      .slice(0, 20)
      .map(p => ({ name: p.name, url: p.url }));
    
    cache.set(cacheKey, matches);
    return matches;
  } catch (error) {
    console.error(`Error searching Pokémon:`, error.message);
    return [];
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
  clearCache
};
