import { supabase } from '../config/supabase.js';
import { calculateRoundUp } from '../services/roundup.service.js';
import { addToWallet } from '../services/wallet.service.js';
import { evaluateRules } from '../services/rule.service.js';
import { checkAndTriggerInvestment } from '../services/trigger.service.js';
import { createNotification } from '../services/notification.service.js';
import { logger } from '../utils/logger.js';

/**
 * Merchant pool for random transaction generation.
 */
const MERCHANTS = [
  { name: 'Swiggy', category: 'Food', icon: '🍕', range: [80, 650] },
  { name: 'Uber', category: 'Transport', icon: '🚗', range: [50, 400] },
  { name: 'Amazon', category: 'Shopping', icon: '📦', range: [150, 3000] },
  { name: 'Netflix', category: 'Entertainment', icon: '🎬', range: [149, 649] },
  { name: 'Flipkart', category: 'Shopping', icon: '🛒', range: [200, 5000] },
  { name: 'Zomato', category: 'Food', icon: '🍔', range: [100, 800] },
  { name: 'BigBasket', category: 'Groceries', icon: '🥬', range: [200, 2000] },
  { name: 'Ola', category: 'Transport', icon: '🛺', range: [40, 350] },
  { name: 'BookMyShow', category: 'Entertainment', icon: '🎭', range: [150, 500] },
  { name: 'Reliance Digital', category: 'Electronics', icon: '📱', range: [500, 15000] },
  { name: 'PharmEasy', category: 'Health', icon: '💊', range: [100, 1500] },
  { name: 'Starbucks', category: 'Food', icon: '☕', range: [200, 600] },
];

export interface SimulateResult {
  transaction: any;
  wallet: any;
  investment: { invested: boolean; amount: number } | null;
  rulesTriggered: string[];
  notifications: any[];
}

/**
 * Full simulation flow:
 * 1. Pick/use merchant, compute amount
 * 2. Calculate round-up using user settings
 * 3. Insert transaction (uses: spare, merchant, icon columns)
 * 4. Add spare to wallet
 * 5. Create notification
 * 6. Evaluate rules
 * 7. Check threshold → trigger investment
 * 8. Write audit log
 */
export async function simulateTransaction(
  userId: string,
  overrides?: { merchant?: string; category?: string; amount?: number; icon?: string }
): Promise<SimulateResult> {
  // 1. Generate or use provided transaction data
  const merchantData = overrides?.merchant
    ? { name: overrides.merchant, category: overrides.category || 'Other', icon: overrides.icon || '💳', range: [100, 1000] as [number, number] }
    : MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];

  const amount = overrides?.amount ||
    Math.floor(Math.random() * (merchantData.range[1] - merchantData.range[0])) + merchantData.range[0];

  // 2. Get user settings for round-up
  const { data: settings } = await supabase
    .from('user_settings')
    .select('round_limit, min_spare, max_spare, round_enabled')
    .eq('user_id', userId)
    .single();

  const roundUpResult = calculateRoundUp(amount, settings ? {
    round_limit: Number(settings.round_limit),
    min_spare: Number(settings.min_spare),
    max_spare: Number(settings.max_spare),
    round_up_enabled: settings.round_enabled,
  } : undefined);

  // 3. Insert transaction — uses spare (not round_up), merchant, icon columns
  const { data: transaction, error: txErr } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      merchant: merchantData.name,
      category: merchantData.category,
      amount,
      rounded_amount: roundUpResult.rounded_amount,
      spare: roundUpResult.spare,
      icon: merchantData.icon,
      source: 'simulated',
    })
    .select()
    .single();

  if (txErr) throw txErr;
  logger.info(`Transaction simulated: ${merchantData.name} ₹${amount} → spare ₹${roundUpResult.spare} for user ${userId}`);

  // 4. Add spare to wallet
  let wallet = null;
  if (!roundUpResult.skipped && roundUpResult.spare > 0) {
    wallet = await addToWallet(userId, roundUpResult.spare);
  }

  // 5. Create notification for spare
  const notifications: any[] = [];
  if (!roundUpResult.skipped) {
    const n = await createNotification(userId, `+₹${roundUpResult.spare} spare from ${merchantData.name}`, 'ROUNDUP');
    if (n) notifications.push(n);
  }

  // 6. Evaluate rules
  const rulesTriggered = await evaluateRules(userId, {
    merchant: merchantData.name,
    category: merchantData.category,
    amount,
    spare: roundUpResult.spare,
  });

  // 7. Check threshold
  const investResult = await checkAndTriggerInvestment(userId);
  if (investResult.invested) {
    wallet = investResult.wallet;
  }

  // 8. Audit log
  await supabase.from('logs').insert({
    user_id: userId,
    action: 'transaction_simulated',
    details: {
      merchant: merchantData.name,
      category: merchantData.category,
      amount,
      spare: roundUpResult.spare,
      skipped: roundUpResult.skipped,
      rules_triggered: rulesTriggered,
      invested: investResult.invested,
    },
  });

  // If wallet wasn't updated yet, fetch it
  if (!wallet) {
    const { data: w } = await supabase.from('wallet').select('*').eq('user_id', userId).single();
    wallet = w;
  }

  return {
    transaction,
    wallet,
    investment: investResult.invested ? { invested: true, amount: investResult.amount } : null,
    rulesTriggered,
    notifications,
  };
}
