import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { simulateTransactionSchema } from '../schemas/transaction.schema.js';
import { simulateTransaction } from '../engines/simulate.js';
import { getTransactions, getCategories } from '../services/transaction.service.js';
import { simulateLimiter } from '../middleware/rateLimiter.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * POST /api/transactions/simulate
 * Inserts one simulated transaction and runs the full engine pipeline.
 */
router.post('/simulate', authMiddleware, simulateLimiter, validate(simulateTransactionSchema), async (req: AuthRequest, res: Response) => {
  try {
    const result = await simulateTransaction(req.userId!, req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    logger.error('Simulate error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/transactions
 * List transactions with search, category filter, and pagination.
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { search, category, limit, offset } = req.query;
    const result = await getTransactions(req.userId!, {
      search: search as string,
      category: category as string,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0,
    });
    res.json({ success: true, data: result });
  } catch (err: any) {
    logger.error('Transactions list error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/transactions/categories
 * Returns distinct categories for filter dropdown.
 */
router.get('/categories', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const categories = await getCategories(req.userId!);
    res.json({ success: true, data: categories });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
