import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

/**
 * Wallet Engine — manages the user's spare change wallet.
 * Schema: wallet(user_id PK, balance, updated_at)
 * total_saved/total_invested are computed from transactions/investments tables.
 */

export async function getWallet(userId: string) {
  const { data, error } = await supabase
    .from('wallet')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
    // No wallet exists, create one
    const { data: newWallet, error: createErr } = await supabase
      .from('wallet')
      .insert({ user_id: userId, balance: 0 })
      .select()
      .single();
    if (createErr) throw createErr;
    return newWallet;
  }
  if (error) throw error;
  return data;
}

/** Compute total_saved = sum of all spare from transactions */
export async function getTotalSaved(userId: string): Promise<number> {
  const { data } = await supabase
    .from('transactions')
    .select('spare')
    .eq('user_id', userId);
  return (data || []).reduce((s, t) => s + Number(t.spare || 0), 0);
}

/** Compute total_invested = sum of all investments */
export async function getTotalInvested(userId: string): Promise<number> {
  const { data } = await supabase
    .from('investments')
    .select('amount')
    .eq('user_id', userId);
  return (data || []).reduce((s, t) => s + Number(t.amount || 0), 0);
}

export async function addToWallet(userId: string, spare: number) {
  const wallet = await getWallet(userId);
  const newBalance = Number(wallet.balance) + spare;

  const { data, error } = await supabase
    .from('wallet')
    .update({
      balance: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  logger.info(`Wallet updated for ${userId}: +₹${spare}, balance=₹${newBalance}`);
  return data;
}

export async function deductFromWallet(userId: string, amount: number) {
  const wallet = await getWallet(userId);
  const newBalance = Math.max(0, Number(wallet.balance) - amount);

  const { data, error } = await supabase
    .from('wallet')
    .update({
      balance: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  logger.info(`Wallet deducted for ${userId}: -₹${amount}, balance=₹${newBalance}`);
  return data;
}
