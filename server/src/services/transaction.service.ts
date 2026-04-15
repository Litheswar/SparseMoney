import { supabase } from '../config/supabase.js';

export async function getTransactions(userId: string, opts?: { search?: string; category?: string; limit?: number; offset?: number }) {
  let query = supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (opts?.search) {
    query = query.ilike('merchant', `%${opts.search}%`);
  }
  if (opts?.category && opts.category !== 'all') {
    query = query.eq('category', opts.category);
  }
  if (opts?.limit) query = query.limit(opts.limit);
  if (opts?.offset) query = query.range(opts.offset, opts.offset + (opts.limit || 50) - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { transactions: data || [], total: count || 0 };
}

export async function getCategories(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('category')
    .eq('user_id', userId);

  if (error) throw error;
  const unique = [...new Set((data || []).map(t => t.category).filter(Boolean))];
  return unique;
}
