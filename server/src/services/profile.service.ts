import { supabase } from '../config/supabase.js';

/**
 * Profile service — uses users, user_settings, wallet, allocations tables.
 * Schema:
 *   users(id, name, email, bank_name, phone, is_bank_connected, role, avatar, masked_account, ...)
 *   user_settings(user_id PK, round_limit, round_enabled, min_spare, max_spare, auto_invest_threshold, ...)
 */

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function getSettings(userId: string) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
    // Create default settings
    const { data: newSettings, error: createErr } = await supabase
      .from('user_settings')
      .insert({ user_id: userId })
      .select()
      .single();
    if (createErr) throw createErr;
    return newSettings;
  }
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSettings(userId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('user_settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function completeOnboarding(userId: string, bankName: string, maskedAccount?: string, phone?: string) {
  const { data, error } = await supabase
    .from('users')
    .update({
      is_bank_connected: true,
      bank_name: bankName,
      masked_account: maskedAccount || `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  // Ensure settings + wallet exist
  await supabase
    .from('user_settings')
    .upsert({ user_id: userId }, { onConflict: 'user_id' });

  await supabase
    .from('wallet')
    .upsert({ user_id: userId, balance: 0 }, { onConflict: 'user_id' });

  // Seed default allocations
  const { data: existing } = await supabase
    .from('allocations')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (!existing || existing.length === 0) {
    await supabase.from('allocations').insert([
      { user_id: userId, type: 'GOLD', percentage: 30 },
      { user_id: userId, type: 'INDEX', percentage: 40 },
      { user_id: userId, type: 'DEBT', percentage: 20 },
      { user_id: userId, type: 'FD', percentage: 10 },
    ]);
  }

  // Seed default rules
  await supabase.from('rules').insert([
    { user_id: userId, name: 'Smart Round-Up', condition: 'Every transaction', action: 'Round up to nearest ₹10', target: 'WALLET', is_active: true, trigger_count: 0 },
    { user_id: userId, name: 'Food Guilt Tax', condition: 'Food spend > ₹300', action: 'Invest ₹50 in Gold ETF', target: 'GOLD', is_active: true, trigger_count: 0 },
    { user_id: userId, name: 'Weekend Spender', condition: 'Weekend shopping > ₹500', action: 'Invest ₹100 in Index Fund', target: 'INDEX', is_active: false, trigger_count: 0 },
    { user_id: userId, name: 'Spare Overflow', condition: 'Spare > ₹25', action: 'Invest in Gold ETF', target: 'GOLD', is_active: true, trigger_count: 0 },
  ]);

  return data;
}
