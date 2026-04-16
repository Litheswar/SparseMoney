import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import axios from 'axios';
import * as cheerio from 'cheerio';

// ─── Asset Registry ───────────────────────────────────────────────────────────
// Real assets fetched from Yahoo Finance
export const LIVE_ASSETS = [
  { symbol: 'GOLDBEES.NS',  name: 'Nippon Gold ETF', type: 'Gold ETF'    },
  { symbol: '^NSEI',        name: 'Nifty 50 Index',  type: 'Index Fund'  },
] as const;

// Simulated assets — fixed growth, no API call needed
export const SIMULATED_ASSETS = [
  { symbol: 'HDFC_DEBT',  name: 'HDFC Debt Fund',  type: 'Debt Fund',       fixedReturn: 7.5  },
  { symbol: 'SBI_FD_1YR', name: 'SBI FD (1yr)',    type: 'Fixed Deposit',   fixedReturn: 6.5  },
] as const;

// ─── Yahoo Finance API fetch (primary) ───────────────────────────────────────
async function fetchFromYahooAPI(symbol: string): Promise<{ price: number; changePercent: number; source: 'api' | 'scraper' } | null> {
  try {
    // Yahoo Finance v8 quotes endpoint — free, no auth needed
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const response = await axios.get(url, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    const result = response.data?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const price = meta.regularMarketPrice ?? meta.previousClose;
    const prevClose = meta.previousClose || meta.chartPreviousClose;
    const changePercent = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

    if (!price || isNaN(price)) return null;

    return { price: Math.round(price * 100) / 100, changePercent: Math.round(changePercent * 100) / 100, source: 'api' };
  } catch (err: any) {
    logger.warn(`Yahoo API failed for ${symbol}: ${err.message}`);
    return null;
  }
}

// ─── Yahoo Finance scraper (fallback) ────────────────────────────────────────
async function fetchFromScraper(symbol: string): Promise<{ price: number; changePercent: number; source: 'api' | 'scraper' } | null> {
  try {
    // Small polite delay before scraping
    await new Promise(r => setTimeout(r, 1200));

    const url = `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}/`;
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const $ = cheerio.load(response.data);

    // Yahoo Finance uses fin-streamer elements with data-field attributes
    const priceText = $('fin-streamer[data-field="regularMarketPrice"]').first().attr('value')
      || $('fin-streamer[data-symbol][data-field="regularMarketPrice"]').first().text();
    const changeText = $('fin-streamer[data-field="regularMarketChangePercent"]').first().attr('value')
      || $('fin-streamer[data-field="regularMarketChangePercent"]').first().text();

    const price = parseFloat(priceText?.replace(/,/g, '') || '');
    const changePercent = parseFloat(changeText?.replace(/[()%]/g, '') || '0');

    if (!price || isNaN(price)) return null;

    return { price: Math.round(price * 100) / 100, changePercent: Math.round(changePercent * 100) / 100, source: 'scraper' };
  } catch (err: any) {
    logger.warn(`Scraper fallback failed for ${symbol}: ${err.message}`);
    return null;
  }
}

// ─── Public: get latest price from cache (DB) ────────────────────────────────
export async function getStoredPrice(symbol: string) {
  const { data } = await supabase
    .from('asset_prices')
    .select('*')
    .eq('symbol', symbol)
    .single();
  return data || null;
}

// ─── Core fetch with fallback chain ──────────────────────────────────────────
interface FetchResult {
  price: number;
  changePercent: number;
  source: 'api' | 'scraper';
}

export async function fetchAndCachePrice(symbol: string, name: string): Promise<boolean> {
  logger.info(`[Market] Fetching price for ${symbol}…`);

  // 1. Try Yahoo Finance v8 API
  let result = await fetchFromYahooAPI(symbol);

  // 2. Fallback: light scraper
  if (!result) {
    logger.warn(`[Market] API miss for ${symbol}, trying scraper…`);
    result = await fetchFromScraper(symbol);
  }

  if (!result) {
    logger.error(`[Market] Both API and scraper failed for ${symbol}. Keeping last stored price.`);
    return false;
  }

  // 3. Upsert into asset_prices (overwrite latest snapshot per symbol)
  const { error } = await supabase
    .from('asset_prices')
    .upsert({
      symbol,
      name,
      price: result.price,
      change_percent: result.changePercent,
      source: result.source,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'symbol' });

  if (error) {
    logger.error(`[Market] DB upsert failed for ${symbol}:`, error.message);
    return false;
  }

  logger.info(`[Market] ✓ ${symbol} = ₹${result.price} (${result.changePercent > 0 ? '+' : ''}${result.changePercent}%) via ${result.source}`);
  return true;
}

// ─── Get all prices (live + simulated) for API response ──────────────────────
export async function getAllAssetPrices() {
  // Fetch stored real-asset prices from DB
  const { data: stored } = await supabase
    .from('asset_prices')
    .select('*')
    .in('symbol', LIVE_ASSETS.map(a => a.symbol));

  const livePrices = (stored || []).map(row => ({
    symbol:        row.symbol,
    name:          row.name,
    price:         row.price,
    changePercent: row.change_percent,
    source:        row.source || 'api',
    updatedAt:     row.updated_at,
    isLive:        true,
  }));

  // Attach simulated assets with descriptive growth rates
  const simulatedPrices = SIMULATED_ASSETS.map(asset => ({
    symbol:        asset.symbol,
    name:          asset.name,
    price:         null,  // no market price — frontend uses invested amount
    changePercent: asset.fixedReturn,
    source:        'simulated',
    updatedAt:     new Date().toISOString(),
    isLive:        false,
  }));

  return [...livePrices, ...simulatedPrices];
}
