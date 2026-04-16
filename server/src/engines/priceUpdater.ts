import cron from 'node-cron';
import { logger } from '../utils/logger.js';
import { LIVE_ASSETS, fetchAndCachePrice } from '../services/marketData.service.js';

let isRunning = false;

async function refreshAllPrices() {
  if (isRunning) {
    logger.warn('[PriceUpdater] Previous run still in progress, skipping.');
    return;
  }

  isRunning = true;
  logger.info('[PriceUpdater] Starting market price refresh…');
  const startTime = Date.now();

  for (const asset of LIVE_ASSETS) {
    try {
      await fetchAndCachePrice(asset.symbol, asset.name);
      // Polite delay between requests — 3 seconds
      await new Promise(r => setTimeout(r, 3000));
    } catch (err: any) {
      logger.error(`[PriceUpdater] Unexpected error for ${asset.symbol}:`, err.message);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  logger.info(`[PriceUpdater] ✓ Refresh complete in ${elapsed}s`);
  isRunning = false;
}

/**
 * Starts the market data cron job.
 * Runs every 3 minutes during market hours (IST: Mon–Fri, 9:15–15:30).
 * Also runs once immediately on startup for a fresh cache.
 */
export function startPriceUpdater() {
  logger.info('[PriceUpdater] Scheduling market data updater…');

  // Run immediately on startup
  refreshAllPrices().catch(err => logger.error('[PriceUpdater] Initial run failed:', err));

  // Every 3 minutes, Mon–Fri (IST = UTC+5:30 → 9:15 IST = 3:45 UTC, 15:30 IST = 10:00 UTC)
  // Using */3 * * * 1-5 for simplicity; runs all day for hackathon convenience
  cron.schedule('*/3 * * * 1-5', async () => {
    await refreshAllPrices();
  }, {
    timezone: 'Asia/Kolkata',
  });

  // Weekend fallback: run once an hour to keep cache warm (pre-market prep)
  cron.schedule('0 * * * 0,6', async () => {
    await refreshAllPrices();
  }, {
    timezone: 'Asia/Kolkata',
  });

  logger.info('[PriceUpdater] ✓ Cron jobs active.');
}
