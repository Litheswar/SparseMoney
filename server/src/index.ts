import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { logger, morganMiddleware } from './utils/logger.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { sanitize } from './middleware/sanitize.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import ruleRoutes from './routes/rule.routes.js';
import groupRoutes from './routes/group.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import insightRoutes from './routes/insight.routes.js';
import profileRoutes from './routes/profile.routes.js';

const app = express();

// === GLOBAL MIDDLEWARE ===
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));
app.use(morganMiddleware);
app.use(sanitize);
app.use(apiLimiter);

// === HEALTH CHECK ===
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: env.NODE_ENV });
});

// === API ROUTES ===
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/profile', profileRoutes);

// === 404 HANDLER ===
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// === GLOBAL ERROR HANDLER ===
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// === START SERVER ===
const PORT = parseInt(env.PORT);
app.listen(PORT, () => {
  logger.info(`🚀 SpareSmart API running on http://localhost:${PORT}`);
  logger.info(`   Environment: ${env.NODE_ENV}`);
  logger.info(`   CORS origin: ${env.CORS_ORIGIN}`);
});

export default app;
