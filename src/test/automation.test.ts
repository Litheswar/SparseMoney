import { describe, expect, it } from 'vitest';
import {
  calculateRuleContribution,
  createRuleDefinition,
  doesRuleMatch,
  Transaction,
} from '@/lib/automation';

const sampleTransaction: Transaction = {
  id: 'tx-1',
  merchant: 'Swiggy',
  category: 'Food',
  amount: 356,
  roundUp: 4,
  timestamp: new Date('2026-04-12T12:00:00.000Z'),
  icon: '🍕',
  ruleExecutions: [],
};

describe('automation engine', () => {
  it('matches multi-condition advanced rules', () => {
    const rule = createRuleDefinition({
      name: 'Weekend Food Rule',
      mode: 'advanced',
      logic: 'AND',
      conditions: [
        { id: 'c1', field: 'category', operator: 'equals', value: 'Food' },
        { id: 'c2', field: 'amount', operator: 'greater_than', value: 300 },
        { id: 'c3', field: 'day', operator: 'equals', value: 'Weekend' },
      ],
      action: { type: 'fixed_invest', value: 50 },
      destination: 'Gold ETF',
    });

    expect(doesRuleMatch(sampleTransaction, rule)).toBe(true);
    expect(calculateRuleContribution(sampleTransaction, rule)).toBe(50);
  });

  it('calculates percentage and round-up contributions correctly', () => {
    const percentageRule = createRuleDefinition({
      name: 'Transport % Rule',
      mode: 'quick',
      logic: 'AND',
      conditions: [{ id: 'c1', field: 'merchant', operator: 'equals', value: 'Swiggy' }],
      action: { type: 'percentage_invest', value: 10 },
      destination: 'Debt Fund',
    });

    const roundUpRule = createRuleDefinition({
      name: 'Round-up Rule',
      mode: 'quick',
      logic: 'AND',
      conditions: [{ id: 'c1', field: 'transaction', operator: 'always', value: 'Every transaction' }],
      action: { type: 'round_up', value: 10 },
      destination: 'Wallet',
    });

    expect(calculateRuleContribution(sampleTransaction, percentageRule)).toBe(36);
    expect(calculateRuleContribution(sampleTransaction, roundUpRule)).toBe(4);
  });
});
