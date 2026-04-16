import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { getAllAssetPrices, getStoredPrice } from '../services/marketData.service.js';
import { getPortfolioWithValues } from '../services/portfolio.service.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /api/market/prices
 * Returns the latest cached prices for all supported assets (live + simulated).
 * No auth required — public market data.
 */
router.get('/prices', async (_req, res: Response) => {
  try {
    const prices = await getAllAssetPrices();
    res.json({
      success: true,
      data: prices,
      meta: {
        count:      prices.length,
        fetchedAt:  new Date().toISOString(),
        note:       'Prices are refreshed every 3 minutes during market hours.',
      },
    });
  } catch (err: any) {
    logger.error('[Market] /prices error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch market prices' });
  }
});

/**
 * GET /api/market/prices/:symbol
 * Returns the latest cached price for a single symbol.
 */
router.get('/prices/:symbol', async (req, res: Response) => {
  try {
    const { symbol } = req.params;
    const price = await getStoredPrice(decodeURIComponent(symbol));

    if (!price) {
      return res.status(404).json({ success: false, error: `No price data found for symbol: ${symbol}` });
    }

    res.json({ success: true, data: price });
  } catch (err: any) {
    logger.error('[Market] /prices/:symbol error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch price' });
  }
});

/**
 * GET /api/market/portfolio
 * Returns the user's portfolio with live valuations and returns%.
 * Requires auth.
 */
router.get('/portfolio', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const portfolio = await getPortfolioWithValues(req.userId!);
    res.json({ success: true, data: portfolio });
  } catch (err: any) {
    logger.error('[Market] /portfolio error:', err);
    res.status(500).json({ success: false, error: 'Failed to compute portfolio' });
  }
});

export default router;
