import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

/**
 * Rule Engine — evaluates active rules after a transaction is inserted.
 * Schema: rules(id, user_id, name, condition, action, target, trigger_count, is_active, created_at)
 */

interface Transaction {
  merchant: string;
  category: string;
  amount: number;
  spare: number;
}

interface Rule {
  id: string;
  name: string;
  condition: string;
  action: string;
  target: string;
  is_active: boolean;
  trigger_count: number;
}

export async function evaluateRules(userId: string, tx: Transaction): Promise<string[]> {
  const { data: rules, error } = await supabase
    .from('rules')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error || !rules || rules.length === 0) return [];

  const triggered: string[] = [];

  for (const rule of rules as Rule[]) {
    let shouldTrigger = false;

    // Parse condition — support multiple formats
    const condition = rule.condition.toLowerCase();

    // "every transaction" — always triggers
    if (condition.includes('every transaction') || condition.includes('all transaction')) {
      shouldTrigger = true;
    }
    // "food spend > 300" style
    else if (condition.match(/(\w+)\s+spend\s*>\s*₹?(\d+)/i)) {
      const match = condition.match(/(\w+)\s+spend\s*>\s*₹?(\d+)/i)!;
      const targetCategory = match[1];
      const threshold = parseInt(match[2]);
      if (tx.category.toLowerCase().includes(targetCategory.toLowerCase()) && tx.amount > threshold) {
        shouldTrigger = true;
      }
    }
    // "weekend shopping > 500" / overspend style
    else if (condition.match(/(\w+)\s+(?:shopping|spend)\s*>\s*₹?(\d+)/i)) {
      const match = condition.match(/(\w+)\s+(?:shopping|spend)\s*>\s*₹?(\d+)/i)!;
      const targetCat = match[1];
      const limit = parseInt(match[2]);
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

      const { data: weekTxs } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .ilike('category', `%${targetCat}%`)
        .gte('created_at', weekAgo);

      const weekTotal = (weekTxs || []).reduce((s, t) => s + Number(t.amount), 0);
      if (weekTotal > limit) {
        shouldTrigger = true;
      }
    }
    // "spare > 25" style
    else if (condition.match(/spare\s*>\s*₹?(\d+)/i)) {
      const match = condition.match(/spare\s*>\s*₹?(\d+)/i)!;
      const minSpare = parseInt(match[1]);
      if (tx.spare > minSpare) {
        shouldTrigger = true;
      }
    }

    if (shouldTrigger) {
      triggered.push(rule.name);

      // Increment trigger count
      await supabase
        .from('rules')
        .update({ trigger_count: rule.trigger_count + 1 })
        .eq('id', rule.id);

      // Log execution
      await supabase.from('logs').insert({
        user_id: userId,
        action: 'rule_executed',
        details: {
          rule_id: rule.id,
          rule_name: rule.name,
          condition: rule.condition,
          action: rule.action,
          transaction_amount: tx.amount,
          transaction_category: tx.category,
        },
      });

      // Execute action — parse "Invest ₹X in Y"
      const investMatch = rule.action.match(/invest\s*₹?(\d+)\s*(?:in\s+(.+))?/i);
      if (investMatch) {
        const investAmt = parseInt(investMatch[1]);
        const targetAsset = investMatch[2]?.trim() || rule.target || 'GOLD';

        const { data: existing } = await supabase
          .from('holdings')
          .select('id, amount')
          .eq('user_id', userId)
          .ilike('type', `%${targetAsset}%`)
          .single();

        if (existing) {
          await supabase
            .from('holdings')
            .update({ amount: Number(existing.amount) + investAmt })
            .eq('id', existing.id);
        }

        // Create notification
        await supabase.from('notifications').insert({
          user_id: userId,
          message: `Rule "${rule.name}" executed — invested ₹${investAmt} in ${targetAsset}`,
          type: 'ALERT',
          is_read: false,
        });
      }

      logger.info(`Rule "${rule.name}" triggered for user ${userId}`);
    }
  }

  return triggered;
}
