import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

/**
 * Portfolio service — reads from the EXISTING holdings table.
 * 
 * Existing schema (from trigger.service.ts):
 *   holdings(id, user_id, name, type, amount, returns_percent, color)
 * 
 * Where:
 *   type = 'GOLD' | 'INDEX' | 'DEBT' | 'FD'
 *   amount = invested ₹ amount (not units)
 *   returns_percent = fixed annual return %
 */

const TYPE_MAP: Record<string, { label: string; symbol: string; assetType: string }> = {
  GOLD:  { label: 'Nippon Gold ETF', symbol: 'GOLDBEES.NS', assetType: 'Gold ETF'       },
  INDEX: { label: 'Nifty 50 Index',  symbol: '^NSEI',       assetType: 'Index Fund'     },
  DEBT:  { label: 'HDFC Debt Fund',  symbol: 'HDFC_DEBT',   assetType: 'Debt Fund'      },
  FD:    { label: 'SBI FD (1yr)',    symbol: 'SBI_FD_1YR',  assetType: 'Fixed Deposit'  },
  ETF:   { label: 'ETF Fund',        symbol: 'GOLDBEES.NS', assetType: 'Gold ETF'       },
};

const FIXED_RETURNS: Record<string, number> = {
  DEBT: 7.5,
  FD:   6.5,
};

interface HoldingRow {
  id: string;
  user_id: string;
  name: string;
  type: string;
  amount: number;
  returns_percent: number;
  color: string;
}

interface AssetPriceRow {
  symbol: string;
  price: number;
  change_percent: number;
  updated_at: string;
}

export async function getPortfolioWithValues(userId: string) {
  // 1. Read user's holdings (existing schema)
  const { data: holdings, error } = await supabase
    .from('holdings')
    .select('*')
    .eq('user_id', userId)
    .order('amount', { ascending: false });

  if (error) {
    logger.error('[Portfolio] Holdings query error:', error.message);
    throw error;
  }
  if (!holdings || holdings.length === 0) {
    return { holdings: [], totalValue: 0, totalInvested: 0, returnsPercent: 0 };
  }

  // 2. Fetch live prices for market-linked assets from asset_prices cache
  const liveSymbols = ['GOLDBEES.NS', '^NSEI'];
  const { data: prices } = await supabase
    .from('asset_prices')
    .select('symbol, price, change_percent, updated_at')
    .in('symbol', liveSymbols);

  const priceMap = new Map<string, AssetPriceRow>();
  (prices || []).forEach((p: AssetPriceRow) => priceMap.set(p.symbol, p));

  // 3. Enrich each holding with live or fixed returns
  const enriched = (holdings as HoldingRow[]).map(h => {
    const meta = TYPE_MAP[h.type] || { label: h.name, symbol: '', assetType: h.type };
    const investedAmount = Number(h.amount);
    const isSimulated = ['DEBT', 'FD'].includes(h.type);

    let currentValue: number;
    let changePercent: number;
    let returnsPercent: number;

    if (isSimulated) {
      // Fixed return — simple annual growth
      const fixedReturn = FIXED_RETURNS[h.type] ?? Number(h.returns_percent) ?? 7;
      currentValue   = investedAmount * (1 + fixedReturn / 100);
      changePercent  = fixedReturn;
      returnsPercent = fixedReturn;
    } else {
      // Live market asset — use stored price to estimate current value
      const marketData = priceMap.get(meta.symbol);
      const baseReturn = Number(h.returns_percent) || 12;

      if (marketData) {
        // Scale invested amount by today's change% to show live movement
        const dailyGain = (marketData.change_percent ?? 0) / 100;
        currentValue   = investedAmount * (1 + dailyGain);
        changePercent  = marketData.change_percent;
        // returns_percent is the long-term return stored in DB
        returnsPercent = baseReturn;
      } else {
        currentValue   = investedAmount;
        changePercent  = 0;
        returnsPercent = baseReturn;
      }
    }

    const returns = currentValue - investedAmount;

    return {
      id:             h.id,
      symbol:         meta.symbol,
      name:           h.name || meta.label,
      type:           meta.assetType,
      color:          h.color || '#10B981',
      investedAmount,
      currentValue:   Math.round(currentValue * 100) / 100,
      returns:        Math.round(returns * 100) / 100,
      returnsPercent: Math.round(returnsPercent * 100) / 100,
      changePercent:  Math.round(changePercent * 100) / 100,
    };
  });

  const totalValue    = enriched.reduce((s, h) => s + h.currentValue, 0);
  const totalInvested = enriched.reduce((s, h) => s + h.investedAmount, 0);
  const totalReturns  = totalInvested > 0
    ? ((totalValue - totalInvested) / totalInvested) * 100
    : 0;

  return {
    holdings:       enriched,
    totalValue:     Math.round(totalValue * 100) / 100,
    totalInvested:  Math.round(totalInvested * 100) / 100,
    returnsPercent: Math.round(totalReturns * 100) / 100,
  };
}
