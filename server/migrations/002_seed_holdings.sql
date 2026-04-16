-- ============================================================
-- Seed holdings from existing investments data
-- Run this in Supabase SQL Editor
-- ============================================================

-- Aggregate investments by user + type and upsert into holdings
INSERT INTO public.holdings (user_id, name, type, amount, returns_percent, color)
SELECT
  i.user_id,
  CASE i.type
    WHEN 'GOLD'  THEN 'Nippon Gold ETF'
    WHEN 'INDEX' THEN 'Nifty 50 Index'
    WHEN 'DEBT'  THEN 'HDFC Debt Fund'
    WHEN 'FD'    THEN 'SBI FD (1yr)'
    ELSE i.type
  END AS name,
  i.type,
  SUM(i.amount) AS amount,
  AVG(COALESCE(i.returns_percent, 10)) AS returns_percent,
  CASE i.type
    WHEN 'GOLD'  THEN 'hsl(45 93% 47%)'
    WHEN 'INDEX' THEN 'hsl(174 62% 40%)'
    WHEN 'DEBT'  THEN 'hsl(220 70% 50%)'
    WHEN 'FD'    THEN 'hsl(280 60% 50%)'
    ELSE 'hsl(174 62% 40%)'
  END AS color
FROM public.investments i
GROUP BY i.user_id, i.type
ON CONFLICT DO NOTHING;

-- Verify what was inserted
SELECT h.user_id, h.name, h.type, h.amount, h.returns_percent
FROM public.holdings h
ORDER BY h.user_id, h.amount DESC;
