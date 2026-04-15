import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema, updateSettingsSchema } from '../schemas/profile.schema.js';
import { getProfile, getSettings, updateProfile, updateSettings } from '../services/profile.service.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /api/profile
 * Returns user profile + settings combined.
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const [profile, settings] = await Promise.all([
      getProfile(req.userId!),
      getSettings(req.userId!),
    ]);
    res.json({ success: true, data: { profile, settings } });
  } catch (err: any) {
    logger.error('Profile fetch error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/profile/settings
 * Returns user settings only.
 */
router.get('/settings', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const settings = await getSettings(req.userId!);
    res.json({ success: true, data: settings });
  } catch (err: any) {
    logger.error('Settings fetch error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/profile
 * Update user profile fields.
 */
router.patch('/', authMiddleware, validate(updateProfileSchema), async (req: AuthRequest, res: Response) => {
  try {
    const data = await updateProfile(req.userId!, req.body);
    res.json({ success: true, data });
  } catch (err: any) {
    logger.error('Profile update error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/settings
 * Update user settings (allocations, threshold, notifications).
 */
router.patch('/settings', authMiddleware, validate(updateSettingsSchema), async (req: AuthRequest, res: Response) => {
  try {
    const data = await updateSettings(req.userId!, req.body);
    res.json({ success: true, data });
  } catch (err: any) {
    logger.error('Settings update error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
