import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { getNotifications, markAsRead, markAllRead } from '../services/notification.service.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /api/notifications
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const data = await getNotifications(req.userId!, limit);
    res.json({ success: true, data });
  } catch (err: any) {
    logger.error('Notifications list error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/notifications/:id/read
 */
router.patch('/:id/read', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await markAsRead(req.params.id as string, req.userId!);
    res.json({ success: true });
  } catch (err: any) {
    logger.error('Mark read error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/notifications/read-all
 */
router.patch('/read-all', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await markAllRead(req.userId!);
    res.json({ success: true });
  } catch (err: any) {
    logger.error('Mark all read error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
