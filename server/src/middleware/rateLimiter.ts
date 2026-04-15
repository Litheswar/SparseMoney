import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const apiLimiter = rateLimit({
  windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS),
  max: parseInt(env.RATE_LIMIT_MAX),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later' },
});

// Stricter limit for simulate endpoint
export const simulateLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  message: { success: false, error: 'Too many simulations, slow down' },
});
