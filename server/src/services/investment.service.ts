import { supabase } from '../config/supabase.js';

export async function getHoldings(userId: string) {
  const { data, error } = await supabase
    .from('holdings')
    .select('*')
    .eq('user_id', userId)
    .order('amount', { ascending: false });

  if (error) {
    console.error(`[DB Error] getHoldings for ${userId}:`, error);
    throw new Error(error.message);
  }
  return data || [];
}

export async function getInvestments(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error(`[DB Error] getInvestments for ${userId}:`, error);
    throw new Error(error.message);
  }
  return data || [];
}

export async function getAllocations(userId: string) {
  const { data, error } = await supabase
    .from('allocations')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error(`[DB Error] getAllocations for ${userId}:`, error);
    throw new Error(error.message);
  }

  // Return defaults if none set
  if (!data || data.length === 0) {
    return [
      { type: 'GOLD', percentage: 30 },
      { type: 'INDEX', percentage: 40 },
      { type: 'DEBT', percentage: 20 },
      { type: 'FD', percentage: 10 },
    ];
  }
  return data;
}
