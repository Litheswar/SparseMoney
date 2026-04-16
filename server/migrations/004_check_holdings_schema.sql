-- ============================================================
-- Direct holdings seed using real user UUIDs
-- Run in Supabase SQL Editor
-- ============================================================

-- First check what columns the holdings table actually has
-- (so we know which schema was used)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'holdings'
ORDER BY ordinal_position;
