import express from 'express';
import { fetchMove } from '../services/pokeapi-cache.js';

const router = express.Router();

/**
 * GET /api/moves/:idOrName
 * Get details for a specific move
 */
router.get('/:idOrName', async (req, res) => {
  try {
    const data = await fetchMove(req.params.idOrName);
    
    res.json({
      id: data.id,
      name: data.name,
      type: data.type,
      power: data.power,
      accuracy: data.accuracy,
      pp: data.pp,
      priority: data.priority,
      effect: data.effect
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
