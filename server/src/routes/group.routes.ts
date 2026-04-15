import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createGroupSchema, contributeSchema } from '../schemas/group.schema.js';
import { getGroups, createGroup, contribute } from '../services/group.service.js';
import { getProfile } from '../services/profile.service.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /api/groups
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const groups = await getGroups(req.userId!);
    res.json({ success: true, data: groups });
  } catch (err: any) {
    logger.error('Groups list error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/groups
 */
router.post('/', authMiddleware, validate(createGroupSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { name, goal, emoji } = req.body;
    const profile = await getProfile(req.userId!);
    const group = await createGroup(req.userId!, name, goal, emoji, profile.name);
    res.status(201).json({ success: true, data: group });
  } catch (err: any) {
    logger.error('Group create error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/groups/:id/contribute
 */
router.post('/:id/contribute', authMiddleware, validate(contributeSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { amount } = req.body;
    await contribute(req.params.id, req.userId!, amount);
    res.json({ success: true, message: `Contributed ₹${amount}` });
  } catch (err: any) {
    logger.error('Contribution error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
