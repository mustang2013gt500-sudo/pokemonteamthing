import express from 'express';
import { validateTeam } from '../services/vgc-validator.js';
import { analyzeTeamCoverage, findDefensiveGaps } from '../services/type-calc.js';

const router = express.Router();

/**
 * POST /api/teams/validate
 * Validate a team against VGC rules
 * Body: { team: [{ pokemon: {...}, moves: [...], ability, nature, item }, ...] }
 */
router.post('/validate', (req, res) => {
  try {
    const { team } = req.body;

    if (!team || !Array.isArray(team)) {
      return res.status(400).json({ error: 'Team must be an array of Pokémon' });
    }

    const validation = validateTeam(team);
    res.json(validation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/teams/analyze
 * Analyze team type coverage
 * Body: { team: [{ pokemon: {...}, moves: [...] }, ...] }
 */
router.post('/analyze', (req, res) => {
  try {
    const { team } = req.body;

    if (!team || !Array.isArray(team)) {
      return res.status(400).json({ error: 'Team must be an array of Pokémon' });
    }

    const coverage = analyzeTeamCoverage(team);
    const gaps = findDefensiveGaps(team);

    res.json({
      coverage,
      defensiveGaps: gaps
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
