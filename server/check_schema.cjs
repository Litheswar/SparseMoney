const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bndehtagmtdftrpjwyxw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZGVodGFnbXRkZnRycGp3eXh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE2NzEzNSwiZXhwIjoyMDkxNzQzMTM1fQ.LP9zTMJOzTnJ3dLmov16XTExpBtcVv13StoqoiLDxao'
);

async function runMigration() {
  // Test each column addition individually by trying to insert/select
  const tests = [
    { table: 'users', column: 'role' },
    { table: 'users', column: 'avatar' },
    { table: 'users', column: 'masked_account' },
    { table: 'users', column: 'updated_at' },
    { table: 'transactions', column: 'merchant' },
    { table: 'transactions', column: 'icon' },
    { table: 'groups', column: 'emoji' },
    { table: 'holdings', column: 'color' },
  ];

  for (const t of tests) {
    const { data, error } = await supabase.from(t.table).select(t.column).limit(1);
    if (error) {
      console.log(`MISSING: ${t.table}.${t.column} - ${error.message}`);
    } else {
      console.log(`OK: ${t.table}.${t.column}`);
    }
  }

  // Check logs table
  const { data: logsData, error: logsErr } = await supabase.from('logs').select('id').limit(1);
  if (logsErr) {
    console.log(`MISSING: logs table - ${logsErr.message}`);
  } else {
    console.log('OK: logs table');
  }

  // Check allocations table
  const { data: allocData, error: allocErr } = await supabase.from('allocations').select('id').limit(1);
  if (allocErr) {
    console.log(`MISSING: allocations table - ${allocErr.message}`);
  } else {
    console.log('OK: allocations table');
  }

  // Check group_contributions table
  const { data: gcData, error: gcErr } = await supabase.from('group_contributions').select('id').limit(1);
  if (gcErr) {
    console.log(`MISSING: group_contributions table - ${gcErr.message}`);
  } else {
    console.log('OK: group_contributions table');
  }

  // Check insights_cache table
  const { data: icData, error: icErr } = await supabase.from('insights_cache').select('user_id').limit(1);
  if (icErr) {
    console.log(`MISSING: insights_cache table - ${icErr.message}`);
  } else {
    console.log('OK: insights_cache table');
  }
}

runMigration().then(() => console.log('\nDone checking schema.')).catch(console.error);
