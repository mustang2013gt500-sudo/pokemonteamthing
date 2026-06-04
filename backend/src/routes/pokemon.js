import express from 'express';
import { fetchPokemon, listPokemon } from '../services/pokeapi-cache.js';
import { isPokemonAllowed, isRestricted } from '../services/vgc-validator.js';

const router = express.Router();

function toPokemonResponse(data, includeDetails = false) {
  const response = {
    id: data.id,
    name: data.name,
    displayName: data.displayName || data.name,
    types: data.types,
    baseStats: data.baseStats,
    sprite: data.sprite,
    isRestricted: isRestricted(data.name),
    isAllowed: isPokemonAllowed(data.name)
  };

  if (includeDetails) {
    response.abilities = data.abilities;
    response.moves = data.moves;
  }

  return response;
}

/**
 * GET /api/pokemon
 * Browse/search Pokémon.
 * Query params: q, page, limit, type, stat, minStat
 */
router.get('/', async (req, res) => {
  try {
    const pokemonList = await listPokemon({
      query: req.query.q || '',
      page: req.query.page,
      limit: req.query.limit,
      type: req.query.type || '',
      stat: req.query.stat || '',
      minStat: req.query.minStat || ''
    });

    res.json({
      ...pokemonList,
      results: pokemonList.results.map(pokemon => toPokemonResponse(pokemon))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/pokemon/:idOrName
 * Get full details for a specific Pokémon
 */
router.get('/:idOrName', async (req, res) => {
  try {
    const data = await fetchPokemon(req.params.idOrName);
    res.json(toPokemonResponse(data, true));
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
