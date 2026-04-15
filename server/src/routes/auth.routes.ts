import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import { validate } from '../middleware/validate.js';
import { completeOnboardingSchema } from '../schemas/profile.schema.js';
import { logger } from '../utils/logger.js';
import { completeOnboarding } from '../services/profile.service.js';

const router = Router();

/**
 * POST /api/auth/signup
 * Creates a user record in public.users after Supabase Auth signup.
 */
router.post('/signup', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email } = req.body;
    const userId = req.userId!;

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (existing) {
      res.json({ success: true, data: existing, message: 'User already exists' });
      return;
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        name: name || email?.split('@')[0] || 'User',
        email: email || req.userEmail,
        role: 'user',
        is_bank_connected: false,
      })
      .select()
      .single();

    if (error) throw error;

    logger.info(`User created: ${userId}`);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    logger.error('Signup error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/auth/complete-onboarding
 */
router.post('/complete-onboarding', authMiddleware, validate(completeOnboardingSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { bank_name, masked_account, phone } = req.body;
    const data = await completeOnboarding(req.userId!, bank_name, masked_account, phone);
    res.json({ success: true, data });
  } catch (err: any) {
    logger.error('Onboarding error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
