const https = require('https');

const sql = [
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS role text DEFAULT 'user'",
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar text",
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS masked_account text",
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now()",
  "ALTER TABLE transactions ADD COLUMN IF NOT EXISTS merchant text DEFAULT 'Unknown'",
  "ALTER TABLE transactions ADD COLUMN IF NOT EXISTS icon text DEFAULT '💳'",
  "ALTER TABLE groups ADD COLUMN IF NOT EXISTS emoji text DEFAULT '🎯'",
  "ALTER TABLE holdings ADD COLUMN IF NOT EXISTS color text DEFAULT 'hsl(174 62% 40%)'",
  "CREATE TABLE IF NOT EXISTS logs(id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), user_id uuid REFERENCES users(id) ON DELETE SET NULL, action text NOT NULL, details jsonb, created_at timestamp DEFAULT now())",
  "CREATE INDEX IF NOT EXISTS idx_logs_user ON logs(user_id, created_at DESC)",
].join(";\n") + ";";

const body = JSON.stringify({ query: sql });

const opts = {
  hostname: 'bndehtagmtdftrpjwyxw.supabase.co',
  path: '/rest/v1/rpc/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZGVodGFnbXRkZnRycGp3eXh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE2NzEzNSwiZXhwIjoyMDkxNzQzMTM1fQ.LP9zTMJOzTnJ3dLmov16XTExpBtcVv13StoqoiLDxao',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZGVodGFnbXRkZnRycGp3eXh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE2NzEzNSwiZXhwIjoyMDkxNzQzMTM1fQ.LP9zTMJOzTnJ3dLmov16XTExpBtcVv13StoqoiLDxao',
  },
};

console.log('SQL to run:\n', sql);
console.log('\n⚠️  The Supabase REST API cannot run DDL (ALTER TABLE).');
console.log('👉 Please copy the SQL above and run it in your Supabase SQL Editor:');
console.log('   https://supabase.com/dashboard/project/bndehtagmtdftrpjwyxw/sql/new\n');
