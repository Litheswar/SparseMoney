-- ============================================
-- SpareSmart — Schema Additions
-- Run AFTER the existing schema
-- Adds missing columns needed by the backend
-- ============================================

-- Users: add role, avatar, masked_account, updated_at
ALTER TABLE users ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS masked_account text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now();

-- Transactions: add merchant and icon for UI display
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS merchant text DEFAULT 'Unknown';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS icon text DEFAULT '💳';

-- Groups: add emoji for UI display
ALTER TABLE groups ADD COLUMN IF NOT EXISTS emoji text DEFAULT '🎯';

-- Holdings: add color for chart rendering
ALTER TABLE holdings ADD COLUMN IF NOT EXISTS color text DEFAULT 'hsl(174 62% 40%)';

-- Logs table for audit trail
CREATE TABLE IF NOT EXISTS logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb,
  created_at timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_logs_user ON logs(user_id, created_at DESC);
