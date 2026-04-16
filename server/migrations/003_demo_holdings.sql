-- ============================================================
-- Seed demo holdings for current user (if investments table is empty)
-- Run this AFTER 002_seed_holdings.sql
-- ============================================================

-- Only insert if the user has no holdings yet
-- Replace the auth.uid() with your actual user UUID if needed
-- (find it in: Supabase → Authentication → Users)

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the first/only user who has a wallet record
  SELECT user_id INTO v_user_id FROM public.wallet LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No user found in wallet table. Skipping seed.';
    RETURN;
  END IF;

  -- Only seed if holdings table is empty for this user
  IF EXISTS (SELECT 1 FROM public.holdings WHERE user_id = v_user_id) THEN
    RAISE NOTICE 'Holdings already exist for user %. Skipping.', v_user_id;
    RETURN;
  END IF;

  -- Insert demo portfolio holdings
  INSERT INTO public.holdings (user_id, name, type, amount, returns_percent, color)
  VALUES
    (v_user_id, 'Nippon Gold ETF', 'GOLD',  2400, 12.5, 'hsl(45 93% 47%)'),
    (v_user_id, 'Nifty 50 Index',  'INDEX', 4200, 15.2, 'hsl(174 62% 40%)'),
    (v_user_id, 'HDFC Debt Fund',  'DEBT',  1800,  7.8, 'hsl(220 70% 50%)'),
    (v_user_id, 'SBI FD (1yr)',    'FD',    1000,  6.5, 'hsl(280 60% 50%)');

  RAISE NOTICE 'Demo holdings seeded for user %', v_user_id;
END $$;

-- Verify
SELECT name, type, amount, returns_percent FROM public.holdings ORDER BY amount DESC;
