import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import { validate } from '../middleware/validate.js';
import { createRuleSchema } from '../schemas/rule.schema.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /api/rules
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('rules')
      .select('*')
      .eq('user_id', req.userId!)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err: any) {
    logger.error('Rules list error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/rules
 */
router.post('/', authMiddleware, validate(createRuleSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { name, condition, action, category, enabled } = req.body;
    const { data, error } = await supabase
      .from('rules')
      .insert({
        user_id: req.userId!,
        name,
        condition,
        action,
        target: category || 'WALLET',
        is_active: enabled !== undefined ? enabled : true,
        trigger_count: 0,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    logger.error('Rule create error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/rules/:id/toggle
 */
router.patch('/:id/toggle', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: rule, error: fetchErr } = await supabase
      .from('rules')
      .select('is_active')
      .eq('id', id)
      .eq('user_id', req.userId!)
      .single();

    if (fetchErr) throw fetchErr;

    const { data, error } = await supabase
      .from('rules')
      .update({ is_active: !rule.is_active })
      .eq('id', id)
      .eq('user_id', req.userId!)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err: any) {
    logger.error('Rule toggle error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/rules/:id
 */
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { error } = await supabase
      .from('rules')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId!);

    if (error) throw error;
    res.json({ success: true, message: 'Rule deleted' });
  } catch (err: any) {
    logger.error('Rule delete error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
