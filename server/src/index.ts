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
import marketRoutes from './routes/market.routes.js';
import historyRoutes from './routes/history.routes.js';
import { startPriceUpdater } from './engines/priceUpdater.js';

const app = express();

// === GLOBAL MIDDLEWARE ===
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));

// === JSON PARSE ERROR HANDLER ===
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Invalid JSON payload' });
  }
  next();
});

app.use(morganMiddleware);
app.use(sanitize);
app.use(apiLimiter);

// === DEBUG LOGGING (as requested) ===
console.log("ENV SUPABASE_URL:", env.SUPABASE_URL);

app.use((req, _res, next) => {
  console.log(`API HIT: ${req.method} ${req.path}`);
  next();
});

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
app.use('/api/market', marketRoutes);

// === 404 HANDLER ===
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// === GLOBAL ERROR HANDLER ===
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  
  // Ensure we always return JSON, even if err is not a standard Error object
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || (typeof err === 'string' ? err : 'Internal Server Error');
  
  res.status(statusCode).json({
    success: false,
    message: env.NODE_ENV === 'production' ? 'Internal server error' : message,
    error: env.NODE_ENV === 'development' ? err : undefined,
  });
});

// === START SERVER ===
const PORT = parseInt(env.PORT);
app.listen(PORT, () => {
  logger.info(`🚀 SpareSmart API running on http://localhost:${PORT}`);
  logger.info(`   Environment: ${env.NODE_ENV}`);
  logger.info(`   CORS origin: ${env.CORS_ORIGIN}`);

  // Start the market data cron job after server is listening
  startPriceUpdater();
});

export default app;
