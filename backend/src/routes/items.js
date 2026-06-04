import express from 'express';
import { fetchItem, listHeldItems } from '../services/pokeapi-cache.js';

const router = express.Router();

/**
 * GET /api/items?q=choice
 * Search legal held items for team building.
 */
router.get('/', async (req, res) => {
  try {
    const items = await listHeldItems(req.query.q || '');
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/items/:idOrName
 * Get one item by name.
 */
router.get('/:idOrName', async (req, res) => {
  try {
    const item = await fetchItem(req.params.idOrName);
    res.json(item);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
