/**
 * Type effectiveness lookup table for Pokémon
 * Based on Generation VI+ type chart
 */
const typeChart = {
  normal: {
    superEffectiveAgainst: [],
    weakTo: ['fighting'],
    resistsTo: [],
    immuneTo: ['ghost']
  },
  fire: {
    superEffectiveAgainst: ['bug', 'steel', 'grass', 'ice'],
    weakTo: ['water', 'ground', 'rock'],
    resistsTo: ['bug', 'steel', 'grass', 'ice', 'fairy'],
    immuneTo: []
  },
  water: {
    superEffectiveAgainst: ['fire', 'ground', 'rock'],
    weakTo: ['electric', 'grass'],
    resistsTo: ['steel', 'fire', 'water', 'ice'],
    immuneTo: []
  },
  electric: {
    superEffectiveAgainst: ['water', 'flying'],
    weakTo: ['ground'],
    resistsTo: ['flying', 'steel', 'electric'],
    immuneTo: []
  },
  grass: {
    superEffectiveAgainst: ['water', 'ground', 'rock'],
    weakTo: ['fire', 'ice', 'poison', 'flying', 'bug'],
    resistsTo: ['ground', 'water', 'grass', 'electric'],
    immuneTo: []
  },
  ice: {
    superEffectiveAgainst: ['flying', 'ground', 'grass', 'dragon'],
    weakTo: ['fire', 'fighting', 'rock', 'steel'],
    resistsTo: ['ice'],
    immuneTo: []
  },
  fighting: {
    superEffectiveAgainst: ['normal', 'ice', 'rock', 'dark', 'steel'],
    weakTo: ['flying', 'psychic', 'fairy'],
    resistsTo: ['rock', 'bug', 'dark'],
    immuneTo: []
  },
  poison: {
    superEffectiveAgainst: ['grass', 'fairy'],
    weakTo: ['ground', 'psychic'],
    resistsTo: ['fighting', 'poison', 'bug', 'grass'],
    immuneTo: []
  },
  ground: {
    superEffectiveAgainst: ['poison', 'rock', 'fire', 'electric', 'steel'],
    weakTo: ['water', 'grass', 'ice'],
    resistsTo: ['poison', 'rock'],
    immuneTo: ['electric']
  },
  flying: {
    superEffectiveAgainst: ['fighting', 'bug', 'grass'],
    weakTo: ['electric', 'ice', 'rock'],
    resistsTo: ['fighting', 'bug', 'grass'],
    immuneTo: ['ground']
  },
  psychic: {
    superEffectiveAgainst: ['fighting', 'poison'],
    weakTo: ['bug', 'ghost', 'dark'],
    resistsTo: ['fighting', 'psychic'],
    immuneTo: []
  },
  bug: {
    superEffectiveAgainst: ['grass', 'psychic', 'dark'],
    weakTo: ['fire', 'flying', 'rock'],
    resistsTo: ['fighting', 'ground', 'grass'],
    immuneTo: []
  },
  rock: {
    superEffectiveAgainst: ['flying', 'bug', 'fire', 'ice'],
    weakTo: ['water', 'grass', 'fighting', 'ground', 'steel'],
    resistsTo: ['normal', 'flying', 'poison', 'fire'],
    immuneTo: []
  },
  ghost: {
    superEffectiveAgainst: ['ghost', 'psychic'],
    weakTo: ['ghost', 'dark'],
    resistsTo: ['poison', 'bug'],
    immuneTo: ['normal', 'fighting']
  },
  dragon: {
    superEffectiveAgainst: ['dragon'],
    weakTo: ['ice', 'dragon', 'fairy'],
    resistsTo: ['fire', 'water', 'grass', 'electric'],
    immuneTo: []
  },
  dark: {
    superEffectiveAgainst: ['ghost', 'psychic'],
    weakTo: ['fighting', 'bug', 'fairy'],
    resistsTo: ['ghost', 'dark'],
    immuneTo: ['psychic']
  },
  steel: {
    superEffectiveAgainst: ['ice', 'rock', 'fairy'],
    weakTo: ['fire', 'water', 'ground'],
    resistsTo: ['normal', 'flying', 'rock', 'bug', 'steel', 'grass', 'psychic', 'ice', 'dragon', 'fairy'],
    immuneTo: ['poison']
  },
  fairy: {
    superEffectiveAgainst: ['fighting', 'dragon', 'dark'],
    weakTo: ['poison', 'steel'],
    resistsTo: ['fighting', 'bug', 'dark'],
    immuneTo: []
  }
};

/**
 * Get offensive coverage for a list of move types
 * Returns types that are super-effective against those types
 */
export function getOffensiveCoverage(moveTypes) {
  const superEffectiveAgainst = new Set();
  const notVeryEffectiveAgainst = new Set();
  const ineffectiveAgainst = new Set();

  moveTypes.forEach(moveType => {
    const type = typeChart[moveType.toLowerCase()];
    if (type) {
      type.superEffectiveAgainst.forEach(t => superEffectiveAgainst.add(t));
      type.weakTo.forEach(t => notVeryEffectiveAgainst.add(t));
      type.immuneTo.forEach(t => ineffectiveAgainst.add(t));
    }
  });

  return {
    superEffectiveAgainst: Array.from(superEffectiveAgainst).sort(),
    notVeryEffectiveAgainst: Array.from(notVeryEffectiveAgainst).sort(),
    ineffectiveAgainst: Array.from(ineffectiveAgainst).sort()
  };
}

/**
 * Get defensive profile for a list of Pokémon types
 * Returns types that are super-effective AGAINST this Pokémon
 */
export function getDefensiveCoverage(pokemonTypes) {
  const weaknessesTo = new Set();
  const resistancesTo = new Set();
  const immunitiesTo = new Set();

  pokemonTypes.forEach(pType => {
    const type = typeChart[pType.toLowerCase()];
    if (type) {
      type.weakTo.forEach(t => weaknessesTo.add(t));
      type.resistsTo.forEach(t => resistancesTo.add(t));
      type.immuneTo.forEach(t => immunitiesTo.add(t));
    }
  });

  // Remove resistances that are also weaknesses
  resistancesTo.forEach(r => weaknessesTo.delete(r));

  return {
    weaknessesTo: Array.from(weaknessesTo).sort(),
    resistancesTo: Array.from(resistancesTo).sort(),
    immunitiesTo: Array.from(immunitiesTo).sort()
  };
}

/**
 * Analyze overall team type coverage (offensive + defensive)
 */
export function analyzeTeamCoverage(team) {
  // Collect all move types from team
  const allMoveTypes = [];
  const allPokemonTypes = [];

  team.forEach(member => {
    if (member.moves && member.moves.length > 0) {
      member.moves.forEach(move => {
        if (move.type) {
          allMoveTypes.push(move.type);
        }
      });
    }
    if (member.pokemon && member.pokemon.types) {
      allPokemonTypes.push(...member.pokemon.types);
    }
  });

  const offensiveCoverage = getOffensiveCoverage(allMoveTypes);
  const defensiveCoverage = getDefensiveCoverage(allPokemonTypes);

  return {
    offensive: offensiveCoverage,
    defensive: defensiveCoverage
  };
}

/**
 * Check for defensive gaps in a team
 */
export function findDefensiveGaps(team) {
  const allTypes = Object.keys(typeChart);
  const defensiveCoverage = getDefensiveCoverage(
    team.flatMap(member => member.pokemon?.types || [])
  );

  const coverage = new Set([
    ...defensiveCoverage.resistancesTo,
    ...defensiveCoverage.immunitiesTo
  ]);

  const gaps = allTypes.filter(type => !coverage.has(type));

  return {
    weaknessesCount: defensiveCoverage.weaknessesTo.length,
    coverageCount: coverage.size,
    gaps: gaps
  };
}

export default {
  getOffensiveCoverage,
  getDefensiveCoverage,
  analyzeTeamCoverage,
  findDefensiveGaps
};
