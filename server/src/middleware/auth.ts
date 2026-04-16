import { Request, Response, NextFunction } from 'express';
import { supabaseAnon, supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

/**
 * Ensure the user row exists in our public.users table.
 * Also seeds wallet and user_settings if they are missing.
 * Called after every successful JWT verification.
 */
async function ensureUserExists(userId: string, email?: string, name?: string) {
  try {
    // Upsert user row (do nothing if already exists)
    await supabase
      .from('users')
      .upsert(
        {
          id: userId,
          email: email || '',
          name: name || email?.split('@')[0] || 'User',
          role: 'user',
          is_bank_connected: false,
        },
        { onConflict: 'id', ignoreDuplicates: true }
      );

    // Seed wallet row
    await supabase
      .from('wallet')
      .upsert({ user_id: userId, balance: 0 }, { onConflict: 'user_id', ignoreDuplicates: true });

    // Seed user_settings row
    await supabase
      .from('user_settings')
      .upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: true });
  } catch (err) {
    // Non-fatal — log but don't block the request
    logger.warn(`[Auth] ensureUserExists failed for ${userId}: ${(err as any)?.message}`);
  }
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

    // Guarantee user row exists before any route handler runs
    await ensureUserExists(
      data.user.id,
      data.user.email,
      data.user.user_metadata?.name
    );

    next();
  } catch (err) {
    logger.error('Auth middleware error:', err);
    res.status(500).json({ success: false, error: 'Authentication error' });
  }
}
