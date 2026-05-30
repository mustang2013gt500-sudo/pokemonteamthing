import express from 'express';
import { fetchPokemon, searchPokemon } from '../services/pokeapi-cache.js';
import { isPokemonAllowed, isRestricted } from '../services/vgc-validator.js';

const router = express.Router();

/**
 * GET /api/pokemon
 * Search Pokémon by name/query
 * Query params: q=pikachu
 */
router.get('/', async (req, res) => {
  try {
    const query = req.query.q || '';
    
    if (query.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const results = await searchPokemon(query);
    const pokemonData = await Promise.all(
      results.map(async (result) => {
        try {
          const data = await fetchPokemon(result.name);
          return {
            id: data.id,
            name: data.name,
            types: data.types,
            sprite: data.sprite,
            isRestricted: isRestricted(data.name),
            isAllowed: isPokemonAllowed(data.name)
          };
        } catch (err) {
          return null;
        }
      })
    );

    res.json(pokemonData.filter(Boolean));
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
    
    res.json({
      id: data.id,
      name: data.name,
      types: data.types,
      baseStats: data.baseStats,
      abilities: data.abilities,
      sprite: data.sprite,
      moves: data.moves,
      isRestricted: isRestricted(data.name),
      isAllowed: isPokemonAllowed(data.name)
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
