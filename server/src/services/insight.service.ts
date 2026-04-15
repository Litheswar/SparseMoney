import { supabase } from '../config/supabase.js';

/**
 * Insight Service — calculates analytics from real transaction data.
 * Uses: transactions(spare, amount, category, merchant), wallet, investments, holdings, logs
 */

export async function getSpendingByCategory(userId: string) {
  const { data: txs, error } = await supabase
    .from('transactions')
    .select('category, amount')
    .eq('user_id', userId);

  if (error) throw error;

  const catMap: Record<string, number> = {};
  for (const tx of txs || []) {
    if (!tx.category) continue;
    catMap[tx.category] = (catMap[tx.category] || 0) + Number(tx.amount);
  }

  const total = Object.values(catMap).reduce((s, v) => s + v, 0);
  const icons: Record<string, string> = {
    Food: '🍔', Transport: '🚗', Shopping: '🛍️', Entertainment: '🎬',
    Groceries: '🥬', Health: '💊', Electronics: '📱', Subscriptions: '🎬',
  };

  return Object.entries(catMap)
    .map(([name, amount]) => ({
      name,
      amount: Math.round(amount),
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      icon: icons[name] || '💳',
    }))
    .sort((a, b) => b.amount - a.amount);
}

export async function getHealthScore(userId: string) {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();

  const { data: thisWeek } = await supabase
    .from('transactions')
    .select('amount, spare')
    .eq('user_id', userId)
    .gte('created_at', weekAgo);

  const { data: lastWeek } = await supabase
    .from('transactions')
    .select('amount, spare')
    .eq('user_id', userId)
    .gte('created_at', twoWeeksAgo)
    .lt('created_at', weekAgo);

  const thisWeekSpend = (thisWeek || []).reduce((s, t) => s + Number(t.amount), 0);
  const lastWeekSpend = (lastWeek || []).reduce((s, t) => s + Number(t.amount), 0);
  const thisWeekSaved = (thisWeek || []).reduce((s, t) => s + Number(t.spare || 0), 0);

  // Get investment behavior
  const { data: investments } = await supabase
    .from('investments')
    .select('amount')
    .eq('user_id', userId);

  const { data: allTxs } = await supabase
    .from('transactions')
    .select('spare')
    .eq('user_id', userId);

  const totalInvested = (investments || []).reduce((s, i) => s + Number(i.amount), 0);
  const totalSaved = (allTxs || []).reduce((s, t) => s + Number(t.spare || 0), 0);

  const spendingControl = lastWeekSpend > 0
    ? Math.min(100, Math.round(100 - ((thisWeekSpend - lastWeekSpend) / lastWeekSpend) * 100))
    : 75;

  const savingConsistency = (thisWeek || []).length > 0
    ? Math.min(100, Math.round((thisWeekSaved / Math.max(thisWeekSpend, 1)) * 1000))
    : 50;

  const investmentBehavior = totalSaved > 0
    ? Math.min(100, Math.round((totalInvested / totalSaved) * 100))
    : 50;

  const score = Math.round(
    Math.max(0, Math.min(100, spendingControl)) * 0.4 +
    Math.max(0, Math.min(100, savingConsistency)) * 0.3 +
    Math.max(0, Math.min(100, investmentBehavior)) * 0.3
  );

  return {
    score: Math.max(0, Math.min(100, score)),
    spendingControl: Math.max(0, Math.min(100, spendingControl)),
    savingConsistency: Math.max(0, Math.min(100, savingConsistency)),
    investmentBehavior: Math.max(0, Math.min(100, investmentBehavior)),
  };
}

export async function getFinancialPersonality(userId: string) {
  const health = await getHealthScore(userId);

  const spendingHigh = health.spendingControl < 70;
  const savingHigh = health.savingConsistency > 80;

  if (spendingHigh && !savingHigh) {
    return { title: 'Impulse Spender 💸', desc: 'You tend to spend frequently on lifestyle categories but lack active saving discipline.' };
  }
  if (savingHigh && !spendingHigh) {
    return { title: 'Smart Saver 🎯', desc: 'Highly disciplined with savings, maintaining strict control over discretionary spending.' };
  }
  return { title: 'Balanced Builder ⚖️', desc: 'You balance enjoying life today while maintaining moderate saving discipline for tomorrow.' };
}

export async function getMissedOpportunities(userId: string) {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  // Check for transactions without spare
  const { data: noSpare } = await supabase
    .from('transactions')
    .select('id, amount')
    .eq('user_id', userId)
    .eq('spare', 0)
    .gte('created_at', weekAgo);

  const missed = [];

  if (noSpare && noSpare.length > 0) {
    const potential = noSpare.reduce((s, t) => {
      const next10 = Math.ceil(Number(t.amount) / 10) * 10;
      return s + (next10 - Number(t.amount) || 10);
    }, 0);
    missed.push({
      desc: `${noSpare.length} transactions without round-up rules`,
      amount: `₹${potential}`,
      type: 'roundup',
    });
  }

  // Check for idle wallet cash
  const { data: wallet } = await supabase
    .from('wallet')
    .select('balance')
    .eq('user_id', userId)
    .single();

  if (wallet && Number(wallet.balance) > 200) {
    const inflationLoss = Math.round(Number(wallet.balance) * 0.005);
    missed.push({
      desc: `Your ₹${Math.round(Number(wallet.balance)).toLocaleString('en-IN')} idle cash is losing to inflation`,
      amount: `₹${inflationLoss}/mo`,
      type: 'idle',
    });
  }

  return missed;
}

export async function getRiskAlerts(userId: string) {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();

  const { data: thisWeek } = await supabase
    .from('transactions')
    .select('category, amount')
    .eq('user_id', userId)
    .gte('created_at', weekAgo);

  const { data: lastWeek } = await supabase
    .from('transactions')
    .select('category, amount')
    .eq('user_id', userId)
    .gte('created_at', twoWeeksAgo)
    .lt('created_at', weekAgo);

  const thisMap: Record<string, number> = {};
  for (const t of thisWeek || []) { if (t.category) thisMap[t.category] = (thisMap[t.category] || 0) + Number(t.amount); }

  const lastMap: Record<string, number> = {};
  for (const t of lastWeek || []) { if (t.category) lastMap[t.category] = (lastMap[t.category] || 0) + Number(t.amount); }

  const alerts = [];
  for (const [cat, amount] of Object.entries(thisMap)) {
    const prev = lastMap[cat] || 0;
    if (prev > 0) {
      const change = Math.round(((amount - prev) / prev) * 100);
      if (change > 20) {
        alerts.push({ message: `${cat} spending up ${change}% this week`, severity: change > 50 ? 'high' : 'medium' });
      }
    }
  }

  return alerts;
}

export async function getBehaviorTimeline(userId: string) {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const { data: logs } = await supabase
    .from('logs')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', weekAgo)
    .order('created_at', { ascending: false })
    .limit(10);

  return (logs || []).map(log => ({
    day: new Date(log.created_at).toLocaleDateString('en-US', { weekday: 'short' }),
    event: log.action.replace(/_/g, ' ').replace(/^\w/, (c: string) => c.toUpperCase()),
    type: log.action.includes('invest') ? 'positive' : log.action.includes('risk') ? 'risk' : 'warning',
    amount: (log.details as any)?.amount || null,
    timestamp: log.created_at,
  }));
}

export async function getBaseValues(userId: string) {
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const { data: monthTxs } = await supabase
    .from('transactions')
    .select('amount, spare, category')
    .eq('user_id', userId)
    .gte('created_at', monthAgo);

  const avgMonthlySpare = (monthTxs || []).reduce((s, t) => s + Number(t.spare || 0), 0);

  const { data: investments } = await supabase
    .from('investments')
    .select('amount')
    .eq('user_id', userId);

  const { data: allTxs } = await supabase
    .from('transactions')
    .select('spare')
    .eq('user_id', userId);

  const totalInvested = (investments || []).reduce((s, i) => s + Number(i.amount), 0);
  const totalSaved = (allTxs || []).reduce((s, t) => s + Number(t.spare || 0), 0);

  const catTotals: Record<string, number> = {};
  for (const t of monthTxs || []) {
    if (t.category) catTotals[t.category] = (catTotals[t.category] || 0) + Number(t.amount);
  }

  return {
    avgMonthlySpare,
    totalInvested,
    totalSaved,
    categoryTotals: catTotals,
    transactionCount: (monthTxs || []).length,
  };
}
