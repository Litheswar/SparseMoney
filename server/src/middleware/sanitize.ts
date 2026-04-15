import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

/**
 * Recursively sanitize string values in request body
 */
function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return validator.escape(validator.trim(value));
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      sanitized[k] = sanitizeValue(v);
    }
    return sanitized;
  }
  return value;
}

export function sanitize(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  next();
}
