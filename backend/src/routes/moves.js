import express from 'express';
import { fetchMove, listMovesForPokemon } from '../services/pokeapi-cache.js';

const router = express.Router();

function toMoveResponse(data) {
  return {
    id: data.id,
    name: data.name,
    type: data.type,
    power: data.power,
    accuracy: data.accuracy,
    pp: data.pp,
    priority: data.priority,
    effect: data.effect
  };
}

/**
 * GET /api/moves?pokemon=pikachu&q=thunder
 * Get real move data for a Pokemon's legal move pool.
 */
router.get('/', async (req, res) => {
  try {
    if (!req.query.pokemon) {
      return res.status(400).json({ error: 'pokemon query parameter is required' });
    }

    const moves = await listMovesForPokemon(req.query.pokemon, req.query.q || '');
    res.json(moves.map(toMoveResponse));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/moves/:idOrName
 * Get details for a specific move
 */
router.get('/:idOrName', async (req, res) => {
  try {
    const data = await fetchMove(req.params.idOrName);
    res.json(toMoveResponse(data));
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
