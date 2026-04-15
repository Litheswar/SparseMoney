import { Request, Response, NextFunction } from 'express';
import { supabaseAnon } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Missing or invalid Authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const { data, error } = await supabaseAnon.auth.getUser(token);

    if (error || !data.user) {
      logger.warn(`Auth failed: ${error?.message || 'No user found'}`);
      res.status(401).json({ success: false, error: 'Invalid or expired token' });
      return;
    }

    req.userId = data.user.id;
    req.userEmail = data.user.email;
    next();
  } catch (err) {
    logger.error('Auth middleware error:', err);
    res.status(500).json({ success: false, error: 'Authentication error' });
  }
}
