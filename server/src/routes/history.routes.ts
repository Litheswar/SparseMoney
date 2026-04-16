import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /api/market/history
 * Fetch real rule execution history from logs table
 */
router.get('/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('user_id', req.userId!)
      .eq('action', 'rule_executed')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    // Transform logs into RuleExecution shape for frontend
    const executions = (data || []).map((log: any) => ({
      id: log.id,
      ruleName: log.details?.rule_name || 'Automation Rule',
      amount: log.details?.transaction_amount || 0,
      description: `Target: ${log.details?.action || 'Invest'}`,
      executedAt: log.created_at,
    }));

    res.json({ success: true, data: executions });
  } catch (err: any) {
    logger.error('[Logs] Error fetching history:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
