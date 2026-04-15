import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

/**
 * Trigger Engine — checks if wallet balance has reached the auto-invest threshold.
 * Uses: wallet, user_settings, investments, holdings, allocations, notifications
 */

export interface TriggerResult {
  invested: boolean;
  amount: number;
  wallet: any;
}

export async function checkAndTriggerInvestment(userId: string): Promise<TriggerResult> {
  // Get wallet and settings
  const { data: wallet } = await supabase
    .from('wallet')
    .select('*')
    .eq('user_id', userId)
    .single();

  const { data: settings } = await supabase
    .from('user_settings')
    .select('auto_invest_threshold')
    .eq('user_id', userId)
    .single();

  if (!wallet || !settings) {
    return { invested: false, amount: 0, wallet };
  }

  const threshold = Number(settings.auto_invest_threshold) || 500;
  const balance = Number(wallet.balance);

  if (balance < threshold) {
    return { invested: false, amount: 0, wallet };
  }

  const investAmount = balance;
  logger.info(`Threshold reached for ${userId}: ₹${balance} >= ₹${threshold}. Investing ₹${investAmount}`);

  // Get user allocations
  const { data: allocations } = await supabase
    .from('allocations')
    .select('type, percentage')
    .eq('user_id', userId);

  // Default allocations if none exist
  const allocs = (allocations && allocations.length > 0) ? allocations : [
    { type: 'GOLD', percentage: 30 },
    { type: 'INDEX', percentage: 40 },
    { type: 'DEBT', percentage: 20 },
    { type: 'FD', percentage: 10 },
  ];

  const holdingsMap: Record<string, { name: string; color: string; returns: number }> = {
    'GOLD': { name: 'Nippon Gold ETF', color: 'hsl(45 93% 47%)', returns: 12.5 },
    'INDEX': { name: 'Nifty 50 Index', color: 'hsl(174 62% 40%)', returns: 15.2 },
    'DEBT': { name: 'HDFC Debt Fund', color: 'hsl(220 70% 50%)', returns: 7.8 },
    'FD': { name: 'SBI FD (1yr)', color: 'hsl(280 60% 50%)', returns: 6.5 },
    'ETF': { name: 'ETF Fund', color: 'hsl(174 62% 40%)', returns: 14.0 },
  };

  for (const alloc of allocs) {
    const pct = Number(alloc.percentage);
    if (pct <= 0) continue;
    const portion = Math.round((investAmount * pct) / 100);
    const holdingInfo = holdingsMap[alloc.type] || { name: alloc.type, color: 'hsl(174 62% 40%)', returns: 10 };

    // Create investment record
    await supabase.from('investments').insert({
      user_id: userId,
      amount: portion,
      type: alloc.type,
      returns_percent: holdingInfo.returns,
    });

    // Upsert holding
    const { data: existing } = await supabase
      .from('holdings')
      .select('id, amount')
      .eq('user_id', userId)
      .eq('type', alloc.type)
      .single();

    if (existing) {
      await supabase
        .from('holdings')
        .update({ amount: Number(existing.amount) + portion })
        .eq('id', existing.id);
    } else {
      await supabase.from('holdings').insert({
        user_id: userId,
        name: holdingInfo.name,
        type: alloc.type,
        amount: portion,
        returns_percent: holdingInfo.returns,
        color: holdingInfo.color,
      });
    }
  }

  // Reset wallet balance
  const { data: updatedWallet } = await supabase
    .from('wallet')
    .update({ balance: 0, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  // Create notification
  await supabase.from('notifications').insert({
    user_id: userId,
    message: `🎉 ₹${investAmount} auto-invested! Threshold of ₹${threshold} reached.`,
    type: 'INVESTMENT',
    is_read: false,
  });

  // Audit log
  await supabase.from('logs').insert({
    user_id: userId,
    action: 'investment_triggered',
    details: { amount: investAmount, threshold, allocations: allocs },
  });

  return { invested: true, amount: investAmount, wallet: updatedWallet };
}
