import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const rulesPath = fileURLToPath(new URL('../config/vgc-rules.json', import.meta.url));
const vgcRulesConfig = JSON.parse(readFileSync(rulesPath, 'utf8'));

const { restrictedSpecies, bannedSpecies, restrictedSpeciesLimit, maxMovesPerPokemon, maxTeamSize } = vgcRulesConfig;

/**
 * Validate a complete team against VGC rules
 * Returns { valid: boolean, errors: string[] }
 */
export function validateTeam(team) {
  const errors = [];

  // Check team size
  if (!team || team.length === 0) {
    errors.push('Team is empty');
    return { valid: false, errors };
  }

  if (team.length > maxTeamSize) {
    errors.push(`Team exceeds maximum size of ${maxTeamSize} Pokémon`);
  }

  // Check for duplicate species
  const speciesNames = team.map(m => m.pokemon?.name?.toLowerCase());
  const uniqueSpecies = new Set(speciesNames);
  if (uniqueSpecies.size !== team.length) {
    errors.push('Each Pokémon species can only appear once on a team');
  }

  // Check for banned species
  team.forEach((member, index) => {
    const pokemonName = member.pokemon?.name?.toLowerCase();
    if (pokemonName && bannedSpecies.includes(pokemonName)) {
      errors.push(`Pokémon "${member.pokemon.name}" (slot ${index + 1}) is banned in VGC`);
    }
  });

  // Check restricted species limit
  const restrictedCount = team.filter(
    member => member.pokemon?.name && restrictedSpecies.includes(member.pokemon.name.toLowerCase())
  ).length;

  if (restrictedCount > restrictedSpeciesLimit) {
    errors.push(
      `Team has ${restrictedCount} restricted species, but maximum is ${restrictedSpeciesLimit}`
    );
  }

  // Check moves per Pokémon
  team.forEach((member, index) => {
    if (member.moves && member.moves.length > maxMovesPerPokemon) {
      errors.push(
        `Pokémon "${member.pokemon?.name}" (slot ${index + 1}) has ${member.moves.length} moves, but maximum is ${maxMovesPerPokemon}`
      );
    }
  });

  // Check move legality (Pokémon can learn each move)
  team.forEach((member, index) => {
    if (member.moves && member.pokemon?.moves) {
      const legalMoves = member.pokemon.moves.map(m => m.toLowerCase());
      member.moves.forEach(move => {
        if (!legalMoves.includes(move.name?.toLowerCase())) {
          errors.push(
            `Pokémon "${member.pokemon?.name}" (slot ${index + 1}) cannot learn move "${move.name}"`
          );
        }
      });
    }
  });

  // Check ability validity
  team.forEach((member, index) => {
    if (member.ability && member.pokemon?.abilities) {
      const legalAbilities = member.pokemon.abilities.map(a => a.name.toLowerCase());
      if (!legalAbilities.includes(member.ability.toLowerCase())) {
        errors.push(
          `Pokémon "${member.pokemon?.name}" (slot ${index + 1}) cannot have ability "${member.ability}"`
        );
      }
    }
  });

  // Check item uniqueness (max 1 Pokémon per item)
  const items = team.map(m => m.item).filter(Boolean);
  const uniqueItems = new Set(items);
  if (uniqueItems.size !== items.length) {
    const duplicateItems = items.filter((item, idx) => items.indexOf(item) !== idx);
    errors.push(`Duplicate items not allowed: ${[...new Set(duplicateItems)].join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if a single Pokémon is allowed (not banned/etc)
 */
export function isPokemonAllowed(pokemonName) {
  const name = pokemonName.toLowerCase();
  return !bannedSpecies.includes(name);
}

/**
 * Check if a Pokémon is restricted
 */
export function isRestricted(pokemonName) {
  const name = pokemonName.toLowerCase();
  return restrictedSpecies.includes(name);
}

/**
 * Get all restricted species for display/filtering
 */
export function getRestrictedSpecies() {
  return restrictedSpecies;
}

/**
 * Get all banned species for display/filtering
 */
export function getBannedSpecies() {
  return bannedSpecies;
}

export default {
  validateTeam,
  isPokemonAllowed,
  isRestricted,
  getRestrictedSpecies,
  getBannedSpecies
};
