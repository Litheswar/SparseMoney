-- ============================================================
-- SpareSmart: asset_prices table migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Asset price cache table
-- Stores ONE row per symbol (upsert strategy)
CREATE TABLE IF NOT EXISTS public.asset_prices (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol         TEXT        NOT NULL UNIQUE,      -- e.g. 'GOLDBEES.NS', '^NSEI'
  name           TEXT        NOT NULL,             -- Human-readable name
  price          NUMERIC(12,4),                   -- Latest market price
  change_percent NUMERIC(8,4) DEFAULT 0,           -- % change from previous close
  source         TEXT        DEFAULT 'api',        -- 'api' | 'scraper' | 'simulated'
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast symbol lookups
CREATE INDEX IF NOT EXISTS idx_asset_prices_symbol ON public.asset_prices(symbol);

-- Holdings table — tracks user's asset positions
-- (unit-based for live assets, amount-based for simulated)
CREATE TABLE IF NOT EXISTS public.holdings (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_symbol    TEXT        NOT NULL,            -- Maps to asset_prices.symbol
  asset_name      TEXT        NOT NULL,
  asset_type      TEXT        NOT NULL,            -- 'Gold ETF' | 'Index Fund' | 'Debt Fund' | 'Fixed Deposit'
  units           NUMERIC(14,6) DEFAULT 0,         -- For price-based assets
  invested_amount NUMERIC(12,2) DEFAULT 0,         -- Total amount user has put in
  color           TEXT        DEFAULT '#10B981',   -- For chart display
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_holdings_user ON public.holdings(user_id);

-- Row Level Security
ALTER TABLE public.asset_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;

-- asset_prices: public read
DROP POLICY IF EXISTS "asset_prices_public_read" ON public.asset_prices;
CREATE POLICY "asset_prices_public_read" ON public.asset_prices
  FOR SELECT USING (true);

-- asset_prices: service role write (used by backend cron)
DROP POLICY IF EXISTS "asset_prices_service_write" ON public.asset_prices;
CREATE POLICY "asset_prices_service_write" ON public.asset_prices
  FOR ALL USING (auth.role() = 'service_role');

-- holdings: users see only their own rows
DROP POLICY IF EXISTS "holdings_user_access" ON public.holdings;
CREATE POLICY "holdings_user_access" ON public.holdings
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- Seed initial placeholder rows so the cron has something
-- to overwrite on first successful fetch
-- ============================================================
INSERT INTO public.asset_prices (symbol, name, price, change_percent, source)
VALUES
  ('GOLDBEES.NS', 'Nippon Gold ETF', 68.50, 0.12, 'seed'),
  ('^NSEI',       'Nifty 50 Index',  22380.00, 0.45, 'seed')
ON CONFLICT (symbol) DO NOTHING;
