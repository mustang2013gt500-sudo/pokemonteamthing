/**
 * API client for backend communication
 */

const API_BASE = '/api';

/**
 * Search Pokémon
 */
export async function searchPokemon({
  query = '',
  page = 1,
  limit = 24,
  type = '',
  stat = '',
  minStat = ''
} = {}) {
  const params = new URLSearchParams({
    q: query,
    page: String(page),
    limit: String(limit)
  });

  if (type) params.set('type', type);
  if (stat) params.set('stat', stat);
  if (minStat) params.set('minStat', String(minStat));

  const response = await fetch(`${API_BASE}/pokemon?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to load Pokémon');
  return response.json();
}

/**
 * Get Pokémon details
 */
export async function getPokemon(idOrName) {
  const response = await fetch(`${API_BASE}/pokemon/${idOrName}`);
  if (!response.ok) throw new Error('Pokémon not found');
  return response.json();
}

/**
 * Get move details
 */
export async function getMove(idOrName) {
  const response = await fetch(`${API_BASE}/moves/${idOrName}`);
  if (!response.ok) throw new Error('Move not found');
  return response.json();
}

/**
 * Get legal move details for a Pokemon.
 */
export async function getMovesForPokemon(pokemonName, query = '') {
  const params = new URLSearchParams({ pokemon: pokemonName, q: query });
  const response = await fetch(`${API_BASE}/moves?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to load moves');
  return response.json();
}

/**
 * Search held items.
 */
export async function searchItems(query = '') {
  const params = new URLSearchParams({ q: query });
  const response = await fetch(`${API_BASE}/items?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to load items');
  return response.json();
}

/**
 * Validate team
 */
export async function validateTeam(team) {
  const response = await fetch(`${API_BASE}/teams/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team })
  });
  if (!response.ok) throw new Error('Validation failed');
  return response.json();
}

/**
 * Analyze team coverage
 */
export async function analyzeTeam(team) {
  const response = await fetch(`${API_BASE}/teams/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team })
  });
  if (!response.ok) throw new Error('Analysis failed');
  return response.json();
}

export default {
  searchPokemon,
  getPokemon,
  getMove,
  getMovesForPokemon,
  searchItems,
  validateTeam,
  analyzeTeam
};
