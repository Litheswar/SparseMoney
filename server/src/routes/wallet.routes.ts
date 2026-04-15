import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { getWallet, getTotalSaved, getTotalInvested } from '../services/wallet.service.js';
import { getHoldings, getInvestments, getAllocations } from '../services/investment.service.js';
import { getSettings } from '../services/profile.service.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /api/wallet
 * Returns wallet balance, threshold, and computed totals.
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const [wallet, settings, totalSaved, totalInvested] = await Promise.all([
      getWallet(req.userId!),
      getSettings(req.userId!),
      getTotalSaved(req.userId!),
      getTotalInvested(req.userId!),
    ]);

    res.json({
      success: true,
      data: {
        balance: Number(wallet.balance),
        threshold: Number(settings.auto_invest_threshold),
        totalSaved,
        totalInvested,
      },
    });
  } catch (err: any) {
    logger.error('Wallet error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/wallet/holdings
 */
router.get('/holdings', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const holdings = await getHoldings(req.userId!);
    res.json({ success: true, data: holdings });
  } catch (err: any) {
    logger.error('Holdings error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/wallet/investments
 */
router.get('/investments', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const investments = await getInvestments(req.userId!);
    res.json({ success: true, data: investments });
  } catch (err: any) {
    logger.error('Investments error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/wallet/allocations
 */
router.get('/allocations', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const allocations = await getAllocations(req.userId!);
    res.json({ success: true, data: allocations });
  } catch (err: any) {
    logger.error('Allocations error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
