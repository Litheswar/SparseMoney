import React, { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { 
  Transaction, WalletState, Rule, generateTransaction, addToWallet, 
  triggerInvestment, calculateRoundUp, DEFAULT_RULES, MOCK_PORTFOLIO, 
  Investment, evaluateCondition, Group, GroupMember, GroupContribution 
} from '@/lib/engine';
import {
  createRuleDefinition,
  createRuleExecution,
  DEFAULT_DESTINATION_BALANCES,
  DEFAULT_RULE_EXECUTIONS,
  doesRuleMatch,
  formatCurrency,
  RuleDestination,
  RuleExecution,
  SuggestedRule,
} from '@/lib/automation';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: string;
}

interface AutomationStats {
  thisMonthSaved: number;
  inactiveOpportunity: number;
  projectedMonthlyContribution: number;
  activeRules: number;
  totalTriggers: number;
  totalRouted: number;
  topDestination: RuleDestination;
}

interface PersistedAppState {
  wallet: WalletState;
  transactions: Transaction[];
  rules: Rule[];
  portfolio: Investment[];
  notifications: Notification[];
  destinationBalances: Record<RuleDestination, number>;
  recentExecutions: RuleExecution[];
  lastInvestment: { amount: number; timestamp: string } | null;
  groups: Group[];
  groupContributions: GroupContribution[];
}

interface AppState extends PersistedAppState {
  weeklySpare: number;
  growthPercent: number;
  automationStats: AutomationStats;
  suggestedRules: SuggestedRule[];
  highlightedRuleIds: string[];
}

interface AppContextType extends AppState {
  simulateTransaction: () => Transaction;
  toggleRule: (id: string) => void;
  createRule: (rule: Rule) => void;
  updateRule: (rule: Rule) => void;
  deleteRule: (id: string) => void;
  clearNotification: (id: string) => void;
  isStreaming: boolean;
  setIsStreaming: (value: boolean) => void;
  lastInvestment: { amount: number; timestamp: string } | null;
  automationImpact: number;
  createGroup: (group: Omit<Group, 'id' | 'totalSaved' | 'members' | 'inviteCode' | 'createdAt'>) => void;
  addContributionToGroup: (groupId: string, amount: number, source: 'roundup' | 'manual') => void;
  addNotification: (message: string, type: 'info' | 'success' | 'warning') => void;
}

const STORAGE_KEY = 'sparesmart-automation-engine-v1';

const AppContext = createContext<AppContextType | null>(null);

const INITIAL_WALLET: WalletState = {
  balance: 187,
  threshold: 500,
  totalSaved: 3420,
  totalInvested: 9400,
};

const INITIAL_GROUPS: Group[] = [
  {
    id: 'g-1',
    name: 'Goa Trip 🏖️',
    goalAmount: 25000,
    totalSaved: 14200,
    category: 'Trip ✈️',
    emoji: '🏖️',
    targetDate: new Date(Date.now() + 45 * 86400000).toISOString(),
    contributionMode: 'Equal contribution',
    inviteCode: 'GOA123',
    members: [
      { userId: 'u1', name: 'Arjun', totalContributed: 5200, contributionShare: 36, lastActive: new Date().toISOString(), badges: ['Top Contributor', 'Consistent Saver'] },
      { userId: 'u2', name: 'Ravi', totalContributed: 4800, contributionShare: 34, lastActive: new Date(Date.now() - 3600000).toISOString(), badges: ['Consistent Saver'] },
      { userId: 'u3', name: 'Sneha', totalContributed: 4200, contributionShare: 30, lastActive: new Date(Date.now() - 7200000).toISOString(), badges: [] },
    ],
    createdBy: 'u1',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    energyScore: 88,
    urgencyStatus: 'On track',
    trendData: [100, 250, 400, 300, 600, 800, 450],
    smartOptions: { autoRoundUp: true, weeklyFixed: true, penaltyNudge: true }
  },
  {
    id: 'g-2',
    name: 'Emergency Fund 🛡️',
    goalAmount: 50000,
    totalSaved: 12400,
    category: 'Emergency 🛡️',
    emoji: '🛡️',
    targetDate: new Date(Date.now() + 180 * 86400000).toISOString(),
    contributionMode: 'Custom contribution',
    inviteCode: 'SAFE456',
    members: [
      { userId: 'u1', name: 'Arjun', totalContributed: 12400, contributionShare: 100, lastActive: new Date().toISOString(), badges: ['Top Contributor'] },
    ],
    createdBy: 'u1',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    energyScore: 45,
    urgencyStatus: 'Slight delay',
    trendData: [50, 120, 80, 200, 150, 300, 100],
    smartOptions: { autoRoundUp: true, weeklyFixed: false, penaltyNudge: false }
  }
];

const INITIAL_CONTRIBUTIONS: GroupContribution[] = [
  { id: 'c1', groupId: 'g-1', userId: 'u2', userName: 'Ravi', amount: 20, source: 'roundup', timestamp: new Date(Date.now() - 120000) },
  { id: 'c2', groupId: 'g-1', userId: 'u1', userName: 'Arjun', amount: 50, source: 'manual', timestamp: new Date(Date.now() - 300000) },
  { id: 'c3', groupId: 'g-1', userId: 'u3', userName: 'Sneha', amount: 30, source: 'manual', timestamp: new Date(Date.now() - 600000) },
];

function generateInitialTransactions(count: number): Transaction[] {
  const transactions: Transaction[] = [];
  for (let index = 0; index < count; index += 1) {
    const transaction = generateTransaction();
    transaction.timestamp = new Date(Date.now() - (count - index) * 60 * 60 * 1000);
    transactions.push(transaction);
  }
  return transactions;
}

function createSeedState(): PersistedAppState {
  return {
    wallet: INITIAL_WALLET,
    transactions: generateInitialTransactions(20),
    rules: DEFAULT_RULES,
    portfolio: MOCK_PORTFOLIO,
    notifications: [
      {
        id: 'seed-note-1',
        message: 'Weekend Food Control moved ₹50 into Gold ETF.',
        type: 'success',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'seed-note-2',
        message: 'Smart Round-Up routed ₹8 into Wallet.',
        type: 'info',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      },
    ],
    destinationBalances: DEFAULT_DESTINATION_BALANCES,
    recentExecutions: DEFAULT_RULE_EXECUTIONS,
    lastInvestment: null,
    groups: INITIAL_GROUPS,
    groupContributions: INITIAL_CONTRIBUTIONS,
  };
}

function reviveTransaction(transaction: Transaction & { timestamp: string | Date }): Transaction {
  return {
    ...transaction,
    timestamp: transaction.timestamp instanceof Date ? transaction.timestamp : new Date(transaction.timestamp),
    ruleExecutions: (transaction as any).ruleExecutions ?? [],
  };
}

function loadPersistedState(): PersistedAppState {
  if (typeof window === 'undefined') return createSeedState();
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return createSeedState();
    const parsed = JSON.parse(stored);
    return {
      ...createSeedState(),
      ...parsed,
      transactions: (parsed.transactions || []).map(reviveTransaction),
      groups: parsed.groups || INITIAL_GROUPS,
      groupContributions: (parsed.groupContributions || []).map((c: any) => ({ ...c, timestamp: new Date(c.timestamp) })),
    };
  } catch {
    return createSeedState();
  }
}

function sortRules(rules: Rule[]): Rule[] {
  return [...rules].sort((left, right) => {
    if (left.enabled !== right.enabled) return left.enabled ? -1 : 1;
    return new Date(right.updatedAt || 0).getTime() - new Date(left.updatedAt || 0).getTime();
  });
}

function incrementDestination(balances: Record<RuleDestination, number>, destination: RuleDestination, amount: number) {
  balances[destination] = (balances[destination] ?? 0) + amount;
}

function addAmountToPortfolio(portfolio: Investment[], destination: RuleDestination, amount: number): Investment[] {
  const portfolioTypeMap: Partial<Record<RuleDestination, Investment['type']>> = {
    'Gold ETF': 'Gold ETF',
    'Index Fund': 'Index Fund',
    'Debt Fund': 'Debt Fund',
  };
  const targetType = portfolioTypeMap[destination];
  if (!targetType) return portfolio;
  return portfolio.map((holding) =>
    holding.type === targetType ? { ...holding, amount: holding.amount + amount } : holding
  );
}

function hasMatchingRule(rules: Rule[], predicate: (rule: Rule) => boolean) {
  return rules.some(predicate);
}

function buildSuggestedRules(transactions: Transaction[], rules: Rule[]): SuggestedRule[] {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentTransactions = transactions.filter((transaction) => transaction.timestamp.getTime() >= weekAgo);
  const foodSpend = recentTransactions.filter((t) => t.category === 'Food').reduce((sum, t) => sum + t.amount, 0);
  const shoppingSpend = recentTransactions.filter((t) => t.category === 'Shopping').reduce((sum, t) => sum + t.amount, 0);
  const transportSpend = recentTransactions.filter((t) => t.category === 'Transport').reduce((sum, t) => sum + t.amount, 0);
  const suggestions: SuggestedRule[] = [];

  if (foodSpend >= 1200 && !hasMatchingRule(rules, (r) => r.enabled && r.conditions?.some((c) => c.field === 'category' && c.value === 'Food'))) {
    suggestions.push({
      id: 'suggested-food',
      title: 'Food Control Rule',
      description: `You spend ${formatCurrency(foodSpend)}/week on food.`,
      insight: 'Create a friction layer for weekend food splurges and redirect small amounts into Gold ETF.',
      estimatedMonthlySavings: 800,
      template: createRuleDefinition({
        name: 'Food Control Rule',
        mode: 'advanced',
        logic: 'AND',
        conditions: [
          { id: 'suggested-food-1', field: 'category', operator: 'equals', value: 'Food' },
          { id: 'suggested-food-2', field: 'amount', operator: 'greater_than', value: 300 },
        ],
        action: { type: 'fixed_invest', value: 50 },
        destination: 'Gold ETF',
      }),
    });
  }
  return suggestions.slice(0, 3);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedAppState>(() => loadPersistedState());
  const [isStreaming, setIsStreaming] = useState(false);
  const [highlightedRuleIds, setHighlightedRuleIds] = useState<string[]>([]);
  const streamRef = useRef<ReturnType<typeof setInterval>>();
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const addNotification = useCallback((message: string, type: 'info' | 'success' | 'warning') => {
    const id = Math.random().toString(36).substring(7);
    setState(prev => ({
      ...prev,
      notifications: [{ id, message, type, timestamp: new Date().toISOString() }, ...prev.notifications].slice(0, 20)
    }));
  }, []);

  const simulateTransaction = useCallback(() => {
    const current = stateRef.current;
    const transaction = generateTransaction();
    let nextWallet = current.wallet;
    let nextPortfolio = current.portfolio;
    const nextDestinationBalances = { ...current.destinationBalances };
    const triggeredRuleIds: string[] = [];
    const ruleExecutions: RuleExecution[] = [];

    const nextRules = current.rules.map((rule) => {
      if (!doesRuleMatch(transaction, rule)) return rule;
      const execution = createRuleExecution(transaction, rule);
      triggeredRuleIds.push(rule.id);
      ruleExecutions.push(execution);
      incrementDestination(nextDestinationBalances, rule.destination, execution.amount);
      if (rule.destination === 'Wallet') {
        nextWallet = addToWallet(nextWallet, execution.amount);
      } else {
        nextWallet = { ...nextWallet, totalSaved: nextWallet.totalSaved + execution.amount };
        if (rule.destination === 'Gold ETF' || rule.destination === 'Index Fund' || rule.destination === 'Debt Fund') {
          nextWallet = { ...nextWallet, totalInvested: nextWallet.totalInvested + execution.amount };
          nextPortfolio = addAmountToPortfolio(nextPortfolio, rule.destination, execution.amount);
        }
      }
      return {
        ...rule,
        triggerCount: rule.triggerCount + 1,
        lastTriggeredAt: execution.executedAt,
        totalExecutedAmount: rule.totalExecutedAmount + execution.amount,
        monthlyExecutedAmount: rule.monthlyExecutedAmount + execution.amount,
        updatedAt: execution.executedAt,
      };
    });

    const thresholdResult = triggerInvestment(nextWallet);
    let lastInvestment = current.lastInvestment;
    if (thresholdResult.invested) {
      nextWallet = thresholdResult.wallet;
      nextPortfolio = addAmountToPortfolio(nextPortfolio, 'Index Fund', thresholdResult.amount);
      lastInvestment = { amount: thresholdResult.amount, timestamp: new Date().toISOString() };
    }

    setState(prev => ({
      ...prev,
      wallet: nextWallet,
      portfolio: nextPortfolio,
      rules: sortRules(nextRules),
      transactions: [transaction, ...prev.transactions].slice(0, 60),
      destinationBalances: nextDestinationBalances,
      recentExecutions: [...ruleExecutions, ...prev.recentExecutions].slice(0, 12),
      lastInvestment,
    }));
    setHighlightedRuleIds(triggeredRuleIds);
    clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = setTimeout(() => setHighlightedRuleIds([]), 1800);
    return transaction;
  }, []);

  const createGroup = useCallback((groupData: Omit<Group, 'id' | 'totalSaved' | 'members' | 'inviteCode' | 'createdAt'>) => {
    const newGroup: Group = {
      ...groupData,
      id: `g-${Date.now()}`,
      totalSaved: 0,
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdAt: new Date().toISOString(),
      energyScore: 50,
      urgencyStatus: 'On track',
      trendData: [0, 0, 0, 0, 0, 0, 0],
      members: [
        { userId: 'u1', name: 'Arjun', totalContributed: 0, contributionShare: 100, lastActive: new Date().toISOString(), badges: [] }
      ]
    };
    setState(prev => ({ ...prev, groups: [newGroup, ...prev.groups] }));
    addNotification(`Group "${newGroup.name}" created!`, 'success');
  }, [addNotification]);

  const addContributionToGroup = useCallback((groupId: string, amount: number, source: 'roundup' | 'manual') => {
    const contribution: GroupContribution = {
      id: `c-${Date.now()}`,
      groupId,
      userId: 'u1',
      userName: 'Arjun',
      amount,
      source,
      timestamp: new Date()
    };
    setState(prev => ({
      ...prev,
      groupContributions: [contribution, ...prev.groupContributions].slice(0, 50),
      groups: prev.groups.map(g => {
        if (g.id === groupId) {
          const newTotal = g.totalSaved + amount;
          return {
            ...g,
            totalSaved: newTotal,
            members: g.members.map(m => m.userId === 'u1' ? { 
              ...m, 
              totalContributed: m.totalContributed + amount, 
              lastActive: new Date().toISOString(),
              contributionShare: Math.round(((m.totalContributed + amount) / newTotal) * 100)
            } : m)
          };
        }
        return g;
      })
    }));
  }, []);

  // Simulation Effects
  useEffect(() => {
    if (isStreaming) {
      streamRef.current = setInterval(() => simulateTransaction(), 3000);
    } else {
      clearInterval(streamRef.current);
    }
    return () => clearInterval(streamRef.current);
  }, [isStreaming, simulateTransaction]);

  useEffect(() => {
    const interval = setInterval(() => {
      const luckyGroup = state.groups[Math.floor(Math.random() * state.groups.length)];
      if (!luckyGroup) return;
      const luckyMember = luckyGroup.members[Math.floor(Math.random() * luckyGroup.members.length)];
      if (!luckyMember) return;
      const amount = Math.floor(Math.random() * 50) + 10;
      
      setState(prev => ({
        ...prev,
        groups: prev.groups.map(g => {
          if (g.id === luckyGroup.id) {
            const newTotal = g.totalSaved + amount;
            return {
              ...g,
              totalSaved: newTotal,
              lastActivity: { userName: luckyMember.name, amount, timestamp: new Date() },
              energyScore: Math.min(100, g.energyScore + 2),
              members: g.members.map(m => m.userId === luckyMember.userId ? {
                ...m,
                totalContributed: m.totalContributed + amount,
                lastActive: new Date().toISOString(),
                contributionShare: Math.round(((m.totalContributed + amount) / newTotal) * 100)
              } : m)
            };
          }
          return g;
        })
      }));
    }, 8000);
    return () => clearInterval(interval);
  }, [state.groups.length]);

  const weeklySpare = useMemo(() => 
    state.transactions.filter(t => t.timestamp > new Date(Date.now() - 7 * 86400000)).reduce((sum, t) => sum + t.roundUp, 0),
    [state.transactions]
  );

  const growthPercent = useMemo(() => {
    if (state.wallet.totalInvested <= 0) return 0;
    const returns = state.portfolio.reduce((sum, inv) => sum + inv.amount * (inv.returns / 100), 0);
    return Math.round((returns / state.wallet.totalInvested) * 1000) / 10;
  }, [state.portfolio, state.wallet.totalInvested]);

  const automationStats = useMemo<AutomationStats>(() => {
    const enabledRules = state.rules.filter(r => r.enabled);
    const projected = enabledRules.reduce((sum, r) => sum + r.monthlyExecutedAmount, 0);
    return {
      thisMonthSaved: projected,
      inactiveOpportunity: 0,
      projectedMonthlyContribution: projected,
      activeRules: enabledRules.length,
      totalTriggers: state.rules.reduce((sum, r) => sum + r.triggerCount, 0),
      totalRouted: Object.values(state.destinationBalances).reduce((sum, amt) => sum + amt, 0),
      topDestination: 'Wallet' as RuleDestination
    };
  }, [state.rules, state.destinationBalances]);

  const value = useMemo<AppContextType>(() => ({
    ...state,
    weeklySpare,
    growthPercent,
    automationStats,
    suggestedRules: buildSuggestedRules(state.transactions, state.rules),
    highlightedRuleIds,
    isStreaming,
    setIsStreaming,
    automationImpact: 85,
    simulateTransaction,
    toggleRule: (id) => setState(prev => ({ ...prev, rules: prev.rules.map(r => r.id === id ? { ...r, enabled: !r.enabled, updatedAt: new Date().toISOString() } : r) })),
    createRule: (rule) => setState(prev => ({ ...prev, rules: sortRules([{ ...rule, updatedAt: new Date().toISOString() }, ...prev.rules]) })),
    updateRule: (rule) => setState(prev => ({ ...prev, rules: sortRules(prev.rules.map(r => r.id === rule.id ? { ...rule, updatedAt: new Date().toISOString() } : r)) })),
    deleteRule: (id) => setState(prev => ({ ...prev, rules: prev.rules.filter(r => r.id !== id) })),
    clearNotification: (id) => setState(prev => ({ ...prev, notifications: prev.notifications.filter(n => n.id !== id) })),
    createGroup,
    addContributionToGroup,
    addNotification
  }), [state, weeklySpare, growthPercent, automationStats, highlightedRuleIds, isStreaming, simulateTransaction, createGroup, addContributionToGroup, addNotification]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
