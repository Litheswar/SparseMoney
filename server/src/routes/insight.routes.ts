import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import {
  getSpendingByCategory,
  getHealthScore,
  getFinancialPersonality,
  getMissedOpportunities,
  getRiskAlerts,
  getBehaviorTimeline,
  getBaseValues,
} from '../services/insight.service.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /api/insights/spending
 * Spending breakdown by category.
 */
router.get('/spending', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = await getSpendingByCategory(req.userId!);
    res.json({ success: true, data });
  } catch (err: any) {
    logger.error('Spending insight error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/insights/health
 * Financial health score and sub-metrics.
 */
router.get('/health', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = await getHealthScore(req.userId!);
    res.json({ success: true, data });
  } catch (err: any) {
    logger.error('Health score error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/insights/personality
 * Derived financial personality.
 */
router.get('/personality', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = await getFinancialPersonality(req.userId!);
    res.json({ success: true, data });
  } catch (err: any) {
    logger.error('Personality error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/insights/missed
 * Missed opportunities.
 */
router.get('/missed', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = await getMissedOpportunities(req.userId!);
    res.json({ success: true, data });
  } catch (err: any) {
    logger.error('Missed opps error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/insights/risks
 * Risk alerts from spending behavior.
 */
router.get('/risks', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = await getRiskAlerts(req.userId!);
    res.json({ success: true, data });
  } catch (err: any) {
    logger.error('Risk alerts error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/insights/timeline
 * Behavior timeline events from logs.
 */
router.get('/timeline', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = await getBehaviorTimeline(req.userId!);
    res.json({ success: true, data });
  } catch (err: any) {
    logger.error('Timeline error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/insights/base-values
 * Base values needed by the Horizon Predictor frontend.
 */
router.get('/base-values', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = await getBaseValues(req.userId!);
    res.json({ success: true, data });
  } catch (err: any) {
    logger.error('Base values error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
