import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { getWallet, getTotalSaved, getTotalInvested } from '../services/wallet.service.js';
import { getTransactions } from '../services/transaction.service.js';
import { getHoldings } from '../services/investment.service.js';
import { getNotifications } from '../services/notification.service.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /api/dashboard/summary
 * Returns all KPI data for the home dashboard in one call.
 */
router.get('/summary', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const [wallet, txResult, holdings, notifications, totalSaved, totalInvested] = await Promise.all([
      getWallet(userId),
      getTransactions(userId, { limit: 10 }),
      getHoldings(userId),
      getNotifications(userId, 10),
      getTotalSaved(userId),
      getTotalInvested(userId),
    ]);

    // Calculate weekly spare
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const weeklyTransactions = txResult.transactions.filter(
      (t: any) => new Date(t.created_at) >= new Date(weekAgo)
    );
    const weeklySpare = weeklyTransactions.reduce((sum: number, t: any) => sum + Number(t.spare || 0), 0);

    // Calculate growth percent from holdings
    const totalPortfolio = holdings.reduce((s: number, h: any) => s + Number(h.amount), 0);
    const portfolioReturns = holdings.reduce(
      (s: number, h: any) => s + (Number(h.amount) * Number(h.returns_percent || 0)) / 100, 0
    );
    const growthPercent = totalInvested > 0
      ? Math.round((portfolioReturns / totalInvested) * 100) / 10
      : 0;

    res.json({
      success: true,
      data: {
        wallet: {
          balance: Number(wallet.balance),
          threshold: 500,
          totalSaved,
          totalInvested,
        },
        weeklySpare,
        growthPercent,
        transactions: txResult.transactions,
        notifications,
      },
    });
  } catch (err: any) {
    logger.error('Dashboard summary error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
