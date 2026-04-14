export function calculateRoundUp(amount: number, multiple: number = 10): number {
  const next = Math.ceil(amount / multiple) * multiple;
  return next - amount || multiple;
}

export interface WalletState {
  balance: number;
  threshold: number;
  totalSaved: number;
  totalInvested: number;
}

export function addToWallet(wallet: WalletState, amount: number): WalletState {
  return {
    ...wallet,
    balance: wallet.balance + amount,
    totalSaved: wallet.totalSaved + amount,
  };
}

export function triggerInvestment(wallet: WalletState): { wallet: WalletState; invested: boolean; amount: number } {
  if (wallet.balance >= wallet.threshold) {
    const investAmount = wallet.balance;
    return {
      wallet: {
        ...wallet,
        balance: 0,
        totalInvested: wallet.totalInvested + investAmount,
      },
      invested: true,
      amount: investAmount,
    };
  }

  return { wallet, invested: false, amount: 0 };
}

export type RuleMode = 'quick' | 'advanced';
export type RuleLogic = 'AND' | 'OR';
export type RuleCategory = 'round-up' | 'invest' | 'auto-sweep' | 'goal' | 'group';
export type RuleConditionField = 'transaction' | 'category' | 'amount' | 'day' | 'merchant';
export type RuleConditionOperator = 'always' | 'equals' | 'greater_than' | 'less_than' | 'contains';
export type RuleActionType =
  | 'round_up'
  | 'fixed_invest'
  | 'percentage_invest'
  | 'auto_sweep'
  | 'goal_allocate'
  | 'group_allocate';
export type RuleDestination =
  | 'Gold ETF'
  | 'Index Fund'
  | 'Debt Fund'
  | 'Wallet'
  | 'Specific Goal'
  | 'Group Fund';

export interface RuleCondition {
  id: string;
  field: RuleConditionField;
  operator: RuleConditionOperator;
  value?: string | number;
}

export interface RuleAction {
  type: RuleActionType;
  value: number;
}

export interface RuleExecution {
  id: string;
  transactionId: string;
  ruleId: string;
  ruleName: string;
  merchant: string;
  amount: number;
  destination: RuleDestination;
  actionType: RuleActionType;
  description: string;
  executedAt: string;
}

export interface Rule {
  id: string;
  name: string;
  enabled: boolean;
  mode: RuleMode;
  logic: RuleLogic;
  conditions: RuleCondition[];
  action: RuleAction;
  destination: RuleDestination;
  category: RuleCategory;
  triggerCount: number;
  lastTriggeredAt: string | null;
  totalExecutedAmount: number;
  monthlyExecutedAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRuleInput {
  id?: string;
  name: string;
  enabled?: boolean;
  mode: RuleMode;
  logic: RuleLogic;
  conditions: RuleCondition[];
  action: RuleAction;
  destination: RuleDestination;
  triggerCount?: number;
  lastTriggeredAt?: string | null;
  totalExecutedAmount?: number;
  monthlyExecutedAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SuggestedRule {
  id: string;
  title: string;
  description: string;
  insight: string;
  estimatedMonthlySavings: number;
  template: Rule;
}

export interface Transaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  roundUp: number;
  timestamp: Date;
  icon: string;
  ruleExecutions: RuleExecution[];
}

export interface Investment {
  name: string;
  type: 'Gold ETF' | 'Index Fund' | 'Debt Fund' | 'Fixed Deposit';
  amount: number;
  returns: number;
  color: string;
}

const MERCHANTS = [
  { name: 'Swiggy', category: 'Food', icon: '🍕', range: [80, 650] },
  { name: 'Uber', category: 'Transport', icon: '🚕', range: [50, 400] },
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

export const CATEGORY_OPTIONS = [
  'Food',
  'Shopping',
  'Travel',
  'Transport',
  'Entertainment',
  'Groceries',
  'Health',
  'Electronics',
];

export const DAY_OPTIONS = ['Weekend', 'Weekday'] as const;
export const DESTINATION_OPTIONS: RuleDestination[] = [
  'Gold ETF',
  'Index Fund',
  'Debt Fund',
  'Wallet',
  'Specific Goal',
  'Group Fund',
];
export const MERCHANT_OPTIONS = MERCHANTS.map((merchant) => merchant.name);

export const MOCK_PORTFOLIO: Investment[] = [
  { name: 'Nippon Gold ETF', type: 'Gold ETF', amount: 2400, returns: 12.5, color: 'hsl(45 93% 47%)' },
  { name: 'Nifty 50 Index', type: 'Index Fund', amount: 4200, returns: 15.2, color: 'hsl(174 62% 40%)' },
  { name: 'HDFC Debt Fund', type: 'Debt Fund', amount: 1800, returns: 7.8, color: 'hsl(220 70% 50%)' },
  { name: 'SBI FD (1yr)', type: 'Fixed Deposit', amount: 1000, returns: 6.5, color: 'hsl(280 60% 50%)' },
];

export const DEFAULT_DESTINATION_BALANCES: Record<RuleDestination, number> = {
  Wallet: 1620,
  'Gold ETF': 1680,
  'Index Fund': 1280,
  'Debt Fund': 940,
  'Specific Goal': 680,
  'Group Fund': 310,
};

export const SPENDING_CATEGORIES = [
  { name: 'Food', amount: 4200, color: 'hsl(0 72% 55%)', percentage: 35 },
  { name: 'Transport', amount: 1800, color: 'hsl(38 92% 50%)', percentage: 15 },
  { name: 'Shopping', amount: 3600, color: 'hsl(174 62% 40%)', percentage: 30 },
  { name: 'Entertainment', amount: 1200, color: 'hsl(280 60% 50%)', percentage: 10 },
  { name: 'Groceries', amount: 800, color: 'hsl(152 60% 42%)', percentage: 7 },
  { name: 'Health', amount: 400, color: 'hsl(220 70% 50%)', percentage: 3 },
];

let txCounter = 0;

export function makeId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getDayType(timestamp: Date): (typeof DAY_OPTIONS)[number] {
  const day = timestamp.getDay();
  return day === 0 || day === 6 ? 'Weekend' : 'Weekday';
}

export function getRuleCategory(actionType: RuleActionType): RuleCategory {
  if (actionType === 'round_up') return 'round-up';
  if (actionType === 'auto_sweep') return 'auto-sweep';
  if (actionType === 'goal_allocate') return 'goal';
  if (actionType === 'group_allocate') return 'group';
  return 'invest';
}

export function createRuleDefinition(input: CreateRuleInput): Rule {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const updatedAt = input.updatedAt ?? createdAt;

  return {
    id: input.id ?? makeId('rule'),
    name: input.name,
    enabled: input.enabled ?? true,
    mode: input.mode,
    logic: input.logic,
    conditions: input.conditions,
    action: input.action,
    destination: input.destination,
    category: getRuleCategory(input.action.type),
    triggerCount: input.triggerCount ?? 0,
    lastTriggeredAt: input.lastTriggeredAt ?? null,
    totalExecutedAmount: input.totalExecutedAmount ?? 0,
    monthlyExecutedAmount: input.monthlyExecutedAmount ?? 0,
    createdAt,
    updatedAt,
  };
}

export function generateTransaction(timestamp = new Date()): Transaction {
  const merchant = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
  const amount = Math.floor(Math.random() * (merchant.range[1] - merchant.range[0])) + merchant.range[0];

  txCounter += 1;

  return {
    id: `tx-${Date.now()}-${txCounter}`,
    merchant: merchant.name,
    category: merchant.category,
    amount,
    roundUp: calculateRoundUp(amount),
    timestamp,
    icon: merchant.icon,
    ruleExecutions: [],
  };
}

export function formatCurrency(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatCondition(condition: RuleCondition): string {
  if (condition.field === 'transaction') return 'Every transaction';
  if (condition.field === 'amount') {
    const comparator = condition.operator === 'less_than' ? '<' : '>';
    return `Amount ${comparator} ${formatCurrency(Number(condition.value ?? 0))}`;
  }
  if (condition.field === 'day') return `Day = ${condition.value}`;
  if (condition.field === 'merchant') {
    const comparator = condition.operator === 'contains' ? 'contains' : '=';
    return `Merchant ${comparator} ${condition.value}`;
  }

  return `Category = ${condition.value}`;
}

export function formatRuleConditionSummary(rule: Rule): string {
  return rule.conditions.map(formatCondition).join(` ${rule.logic} `);
}

export function formatRuleActionSummary(rule: Rule): string {
  const amount = Number(rule.action.value ?? 0);

  if (rule.action.type === 'round_up') return `Round-up to ${formatCurrency(amount)} → ${rule.destination}`;
  if (rule.action.type === 'fixed_invest') return `Invest ${formatCurrency(amount)} → ${rule.destination}`;
  if (rule.action.type === 'percentage_invest') return `Invest ${amount}% → ${rule.destination}`;
  if (rule.action.type === 'auto_sweep') return `Move ${formatCurrency(amount)} to Auto-Sweep → ${rule.destination}`;
  if (rule.action.type === 'goal_allocate') return `Allocate ${formatCurrency(amount)} → ${rule.destination}`;

  return `Allocate ${formatCurrency(amount)} → ${rule.destination}`;
}

export function calculateRuleContribution(transaction: Transaction, rule: Rule): number {
  const value = Number(rule.action.value ?? 0);

  if (rule.action.type === 'round_up') return calculateRoundUp(transaction.amount, value || 10);
  if (rule.action.type === 'fixed_invest') return value;
  if (rule.action.type === 'percentage_invest') return Math.max(1, Math.round(transaction.amount * (value / 100)));
  if (rule.action.type === 'auto_sweep') return Math.max(value, calculateRoundUp(transaction.amount, 50));
  if (rule.action.type === 'goal_allocate') return value;

  return value;
}

export function buildRulePreview(rule: Pick<Rule, 'conditions' | 'logic' | 'action' | 'destination'>, sampleAmount = 350): string {
  const mockCategory =
    rule.conditions.find((condition) => condition.field === 'category')?.value?.toString() ?? 'Food';
  const mockMerchant =
    rule.conditions.find((condition) => condition.field === 'merchant')?.value?.toString() ?? 'Swiggy';

  const mockTransaction: Transaction = {
    id: 'preview',
    merchant: mockMerchant,
    category: mockCategory,
    amount: sampleAmount,
    roundUp: 0,
    timestamp: new Date(),
    icon: '✨',
    ruleExecutions: [],
  };

  const contribution = calculateRuleContribution(mockTransaction, rule as Rule);
  let verb = 'will be invested into';

  if (rule.action.type === 'round_up') verb = 'will be routed into';
  if (rule.action.type === 'auto_sweep') verb = 'will move into';
  if (rule.action.type === 'goal_allocate' || rule.action.type === 'group_allocate') verb = 'will be allocated into';

  return `When you spend ${formatCurrency(sampleAmount)} on ${mockCategory} at ${mockMerchant}, ${formatCurrency(
    contribution,
  )} ${verb} ${rule.destination}.`;
}

export function evaluateCondition(transaction: Transaction, condition: RuleCondition): boolean {
  if (condition.field === 'transaction' || condition.operator === 'always') return true;
  if (condition.field === 'category') return transaction.category === condition.value;

  if (condition.field === 'amount') {
    const amount = Number(condition.value ?? 0);
    return condition.operator === 'less_than' ? transaction.amount < amount : transaction.amount > amount;
  }

  if (condition.field === 'day') return getDayType(transaction.timestamp) === condition.value;

  const merchantValue = String(condition.value ?? '').toLowerCase();
  if (condition.operator === 'contains') return transaction.merchant.toLowerCase().includes(merchantValue);

  return transaction.merchant === condition.value;
}

export function doesRuleMatch(transaction: Transaction, rule: Rule): boolean {
  if (!rule.enabled || rule.conditions.length === 0) return false;
  const evaluations = rule.conditions.map((condition) => evaluateCondition(transaction, condition));
  return rule.logic === 'AND' ? evaluations.every(Boolean) : evaluations.some(Boolean);
}

export function createRuleExecution(transaction: Transaction, rule: Rule): RuleExecution {
  const amount = calculateRuleContribution(transaction, rule);

  return {
    id: makeId('exec'),
    transactionId: transaction.id,
    ruleId: rule.id,
    ruleName: rule.name,
    merchant: transaction.merchant,
    amount,
    destination: rule.destination,
    actionType: rule.action.type,
    description: `${formatCurrency(amount)} routed to ${rule.destination} after ${transaction.merchant}`,
    executedAt: transaction.timestamp.toISOString(),
  };
}

export function predictGrowth(
  monthlySaving: number,
  months: number,
  annualReturn: number = 12,
): { month: number; savings: number; returns: number; total: number }[] {
  const monthlyRate = annualReturn / 100 / 12;
  const data = [];
  let total = 0;

  for (let month = 1; month <= months; month += 1) {
    total = (total + monthlySaving) * (1 + monthlyRate);
    const savings = monthlySaving * month;

    data.push({
      month,
      savings,
      returns: Math.round(total - savings),
      total: Math.round(total),
    });
  }

  return data;
}

export const DEFAULT_RULE_EXECUTIONS: RuleExecution[] = [
  {
    id: 'exec-1',
    transactionId: 'seed-1',
    ruleId: 'rule-smart-roundup',
    ruleName: 'Smart Round-Up',
    merchant: 'Swiggy',
    amount: 8,
    destination: 'Wallet',
    actionType: 'round_up',
    description: '₹8 routed to Wallet after Swiggy',
    executedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'exec-2',
    transactionId: 'seed-2',
    ruleId: 'rule-weekend-food',
    ruleName: 'Weekend Food Control',
    merchant: 'Zomato',
    amount: 50,
    destination: 'Gold ETF',
    actionType: 'fixed_invest',
    description: '₹50 routed to Gold ETF after Zomato',
    executedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'exec-3',
    transactionId: 'seed-3',
    ruleId: 'rule-cab-cooloff',
    ruleName: 'Cab Cool-Off',
    merchant: 'Uber',
    amount: 42,
    destination: 'Debt Fund',
    actionType: 'percentage_invest',
    description: '₹42 routed to Debt Fund after Uber',
    executedAt: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'exec-4',
    transactionId: 'seed-4',
    ruleId: 'rule-shopping-goal',
    ruleName: 'Shopping Cooldown',
    merchant: 'Amazon',
    amount: 100,
    destination: 'Specific Goal',
    actionType: 'goal_allocate',
    description: '₹100 routed to Specific Goal after Amazon',
    executedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
];

export const DEFAULT_RULES: Rule[] = [
  createRuleDefinition({
    id: 'rule-smart-roundup',
    name: 'Smart Round-Up',
    mode: 'quick',
    logic: 'AND',
    conditions: [{ id: 'condition-smart-roundup', field: 'transaction', operator: 'always', value: 'Every transaction' }],
    action: { type: 'round_up', value: 10 },
    destination: 'Wallet',
    triggerCount: 142,
    lastTriggeredAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    totalExecutedAmount: 1620,
    monthlyExecutedAmount: 420,
    createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  }),
  createRuleDefinition({
    id: 'rule-weekend-food',
    name: 'Weekend Food Control',
    mode: 'advanced',
    logic: 'AND',
    conditions: [
      { id: 'condition-weekend-food-1', field: 'category', operator: 'equals', value: 'Food' },
      { id: 'condition-weekend-food-2', field: 'amount', operator: 'greater_than', value: 300 },
      { id: 'condition-weekend-food-3', field: 'day', operator: 'equals', value: 'Weekend' },
    ],
    action: { type: 'fixed_invest', value: 50 },
    destination: 'Gold ETF',
    triggerCount: 28,
    lastTriggeredAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    totalExecutedAmount: 1400,
    monthlyExecutedAmount: 650,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  }),
  createRuleDefinition({
    id: 'rule-cab-cooloff',
    name: 'Cab Cool-Off',
    mode: 'advanced',
    logic: 'OR',
    conditions: [
      { id: 'condition-cab-1', field: 'merchant', operator: 'equals', value: 'Uber' },
      { id: 'condition-cab-2', field: 'merchant', operator: 'equals', value: 'Ola' },
    ],
    action: { type: 'percentage_invest', value: 12 },
    destination: 'Debt Fund',
    triggerCount: 41,
    lastTriggeredAt: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(),
    totalExecutedAmount: 940,
    monthlyExecutedAmount: 320,
    createdAt: new Date(Date.now() - 39 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  }),
  createRuleDefinition({
    id: 'rule-shopping-goal',
    name: 'Shopping Cooldown',
    enabled: false,
    mode: 'advanced',
    logic: 'AND',
    conditions: [
      { id: 'condition-shopping-1', field: 'category', operator: 'equals', value: 'Shopping' },
      { id: 'condition-shopping-2', field: 'amount', operator: 'greater_than', value: 1200 },
    ],
    action: { type: 'goal_allocate', value: 100 },
    destination: 'Specific Goal',
    triggerCount: 12,
    lastTriggeredAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    totalExecutedAmount: 680,
    monthlyExecutedAmount: 140,
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  }),
];
