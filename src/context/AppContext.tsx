import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  addToWallet,
  createRuleDefinition,
  createRuleExecution,
  DEFAULT_DESTINATION_BALANCES,
  DEFAULT_RULE_EXECUTIONS,
  DEFAULT_RULES,
  doesRuleMatch,
  formatCurrency,
  generateTransaction,
  Investment,
  MOCK_PORTFOLIO,
  Rule,
  RuleDestination,
  RuleExecution,
  SuggestedRule,
  Transaction,
  triggerInvestment,
  WalletState,
} from '@/lib/automation';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: string;
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
}

const STORAGE_KEY = 'sparesmart-automation-engine-v1';

const AppContext = createContext<AppContextType | null>(null);

const INITIAL_WALLET: WalletState = {
  balance: 187,
  threshold: 500,
  totalSaved: 3420,
  totalInvested: 9400,
};

function generateInitialTransactions(count: number): Transaction[] {
  const transactions: Transaction[] = [];

  for (let index = 0; index < count; index += 1) {
    const transaction = generateTransaction(new Date(Date.now() - (count - index) * 60 * 60 * 1000));
    transaction.ruleExecutions = [];
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
        message: 'Weekend Food Control moved ?50 into Gold ETF.',
        type: 'success',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'seed-note-2',
        message: 'Smart Round-Up routed ?8 into Wallet.',
        type: 'info',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      },
    ],
    destinationBalances: DEFAULT_DESTINATION_BALANCES,
    recentExecutions: DEFAULT_RULE_EXECUTIONS,
    lastInvestment: null,
  };
}

function reviveTransaction(transaction: Transaction & { timestamp: string | Date }): Transaction {
  return {
    ...transaction,
    timestamp: transaction.timestamp instanceof Date ? transaction.timestamp : new Date(transaction.timestamp),
    ruleExecutions: transaction.ruleExecutions ?? [],
  };
}

function loadPersistedState(): PersistedAppState {
  if (typeof window === 'undefined') return createSeedState();

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return createSeedState();

    const parsed = JSON.parse(stored) as PersistedAppState & {
      transactions: Array<Transaction & { timestamp: string | Date }>;
    };

    return {
      ...createSeedState(),
      ...parsed,
      transactions: parsed.transactions.map(reviveTransaction),
      rules: parsed.rules ?? DEFAULT_RULES,
      portfolio: parsed.portfolio ?? MOCK_PORTFOLIO,
      destinationBalances: {
        ...DEFAULT_DESTINATION_BALANCES,
        ...(parsed.destinationBalances ?? {}),
      },
      recentExecutions: parsed.recentExecutions ?? DEFAULT_RULE_EXECUTIONS,
      notifications: parsed.notifications ?? [],
      lastInvestment: parsed.lastInvestment ?? null,
    };
  } catch {
    return createSeedState();
  }
}

function sortRules(rules: Rule[]): Rule[] {
  return [...rules].sort((left, right) => {
    if (left.enabled !== right.enabled) return left.enabled ? -1 : 1;
    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });
}

function incrementDestination(
  balances: Record<RuleDestination, number>,
  destination: RuleDestination,
  amount: number,
) {
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
    holding.type === targetType
      ? {
          ...holding,
          amount: holding.amount + amount,
        }
      : holding,
  );
}

function hasMatchingRule(rules: Rule[], predicate: (rule: Rule) => boolean) {
  return rules.some(predicate);
}

function buildSuggestedRules(transactions: Transaction[], rules: Rule[]): SuggestedRule[] {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentTransactions = transactions.filter((transaction) => transaction.timestamp.getTime() >= weekAgo);

  const foodSpend = recentTransactions
    .filter((transaction) => transaction.category === 'Food')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const shoppingSpend = recentTransactions
    .filter((transaction) => transaction.category === 'Shopping')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const transportSpend = recentTransactions
    .filter((transaction) => transaction.category === 'Transport')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const suggestions: SuggestedRule[] = [];

  if (
    foodSpend >= 1200 &&
    !hasMatchingRule(
      rules,
      (rule) => rule.enabled && rule.conditions.some((condition) => condition.field === 'category' && condition.value === 'Food'),
    )
  ) {
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

  if (
    shoppingSpend >= 2000 &&
    !hasMatchingRule(
      rules,
      (rule) => rule.conditions.some((condition) => condition.field === 'category' && condition.value === 'Shopping'),
    )
  ) {
    suggestions.push({
      id: 'suggested-shopping',
      title: 'Shopping Cooldown Rule',
      description: `You spent ${formatCurrency(shoppingSpend)} on shopping this week.`,
      insight: 'Capture post-purchase discipline by routing a fixed amount into a goal every time you shop above budget.',
      estimatedMonthlySavings: 620,
      template: createRuleDefinition({
        name: 'Shopping Cooldown Rule',
        mode: 'advanced',
        logic: 'AND',
        conditions: [
          { id: 'suggested-shopping-1', field: 'category', operator: 'equals', value: 'Shopping' },
          { id: 'suggested-shopping-2', field: 'amount', operator: 'greater_than', value: 1000 },
        ],
        action: { type: 'goal_allocate', value: 100 },
        destination: 'Specific Goal',
      }),
    });
  }

  if (
    transportSpend >= 900 &&
    !hasMatchingRule(
      rules,
      (rule) => rule.conditions.some((condition) => condition.field === 'merchant' && ['Uber', 'Ola'].includes(String(condition.value))),
    )
  ) {
    suggestions.push({
      id: 'suggested-transport',
      title: 'Commute Buffer Rule',
      description: `Ride-hailing spend is at ${formatCurrency(transportSpend)}/week.`,
      insight: 'Sweeping a small percentage into Debt Fund creates a soft brake on recurring cab usage.',
      estimatedMonthlySavings: 480,
      template: createRuleDefinition({
        name: 'Commute Buffer Rule',
        mode: 'advanced',
        logic: 'OR',
        conditions: [
          { id: 'suggested-transport-1', field: 'merchant', operator: 'equals', value: 'Uber' },
          { id: 'suggested-transport-2', field: 'merchant', operator: 'equals', value: 'Ola' },
        ],
        action: { type: 'percentage_invest', value: 10 },
        destination: 'Debt Fund',
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

  useEffect(() => () => clearTimeout(flashTimeoutRef.current), []);

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
        nextWallet = {
          ...nextWallet,
          totalSaved: nextWallet.totalSaved + execution.amount,
        };

        if (rule.destination === 'Gold ETF' || rule.destination === 'Index Fund' || rule.destination === 'Debt Fund') {
          nextWallet = {
            ...nextWallet,
            totalInvested: nextWallet.totalInvested + execution.amount,
          };
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

    transaction.ruleExecutions = ruleExecutions;
    transaction.roundUp = ruleExecutions
      .filter((execution) => execution.destination === 'Wallet')
      .reduce((sum, execution) => sum + execution.amount, 0);

    const thresholdResult = triggerInvestment(nextWallet);
    let lastInvestment = current.lastInvestment;

    if (thresholdResult.invested) {
      nextWallet = thresholdResult.wallet;
      nextPortfolio = addAmountToPortfolio(nextPortfolio, 'Index Fund', thresholdResult.amount);
      lastInvestment = {
        amount: thresholdResult.amount,
        timestamp: new Date().toISOString(),
      };
    }

    const newNotifications = [
      ...ruleExecutions.map((execution) => ({
        id: execution.id,
        message: `${execution.ruleName}: ${formatCurrency(execution.amount)} ? ${execution.destination}`,
        type: 'success' as const,
        timestamp: execution.executedAt,
      })),
      ...(thresholdResult.invested
        ? [
            {
              id: `invest-${transaction.id}`,
              message: `Wallet threshold reached. ${formatCurrency(thresholdResult.amount)} auto-invested.`,
              type: 'success' as const,
              timestamp: new Date().toISOString(),
            },
          ]
        : []),
      ...current.notifications,
    ].slice(0, 20);

    const nextState: PersistedAppState = {
      ...current,
      wallet: nextWallet,
      portfolio: nextPortfolio,
      rules: sortRules(nextRules),
      transactions: [transaction, ...current.transactions].slice(0, 60),
      destinationBalances: nextDestinationBalances,
      notifications: newNotifications,
      recentExecutions: [...ruleExecutions, ...current.recentExecutions].slice(0, 12),
      lastInvestment,
    };

    setState(nextState);
    setHighlightedRuleIds(triggeredRuleIds);
    clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = setTimeout(() => setHighlightedRuleIds([]), 1800);

    return transaction;
  }, []);

  const createRule = useCallback((rule: Rule) => {
    setState((current) => ({
      ...current,
      rules: sortRules([{ ...rule, updatedAt: new Date().toISOString() }, ...current.rules]),
    }));
  }, []);

  const updateRule = useCallback((rule: Rule) => {
    setState((current) => ({
      ...current,
      rules: sortRules(
        current.rules.map((existingRule) =>
          existingRule.id === rule.id
            ? {
                ...rule,
                createdAt: existingRule.createdAt,
                triggerCount: rule.triggerCount,
                totalExecutedAmount: rule.totalExecutedAmount,
                monthlyExecutedAmount: rule.monthlyExecutedAmount,
                lastTriggeredAt: rule.lastTriggeredAt,
                updatedAt: new Date().toISOString(),
              }
            : existingRule,
        ),
      ),
    }));
  }, []);

  const deleteRule = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      rules: current.rules.filter((rule) => rule.id !== id),
      recentExecutions: current.recentExecutions.filter((execution) => execution.ruleId !== id),
    }));
  }, []);

  const toggleRule = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      rules: sortRules(
        current.rules.map((rule) =>
          rule.id === id
            ? {
                ...rule,
                enabled: !rule.enabled,
                updatedAt: new Date().toISOString(),
              }
            : rule,
        ),
      ),
    }));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      notifications: current.notifications.filter((notification) => notification.id !== id),
    }));
  }, []);

  useEffect(() => {
    if (isStreaming) {
      streamRef.current = setInterval(() => {
        simulateTransaction();
      }, 3000);
    } else {
      clearInterval(streamRef.current);
    }

    return () => clearInterval(streamRef.current);
  }, [isStreaming, simulateTransaction]);

  const suggestedRules = useMemo(() => buildSuggestedRules(state.transactions, state.rules), [state.transactions, state.rules]);

  const weeklySpare = useMemo(
    () =>
      state.transactions
        .filter((transaction) => transaction.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .reduce((sum, transaction) => sum + transaction.roundUp, 0),
    [state.transactions],
  );

  const growthPercent = useMemo(() => {
    if (state.wallet.totalInvested <= 0) return 0;
    const returns = state.portfolio.reduce((sum, investment) => sum + investment.amount * (investment.returns / 100), 0);
    return Math.round((returns / state.wallet.totalInvested) * 1000) / 10;
  }, [state.portfolio, state.wallet.totalInvested]);

  const automationStats = useMemo<AutomationStats>(() => {
    const enabledRules = state.rules.filter((rule) => rule.enabled);
    const projectedMonthlyContribution = enabledRules.reduce((sum, rule) => sum + rule.monthlyExecutedAmount, 0);
    const totalTriggers = state.rules.reduce((sum, rule) => sum + rule.triggerCount, 0);
    const totalRouted = Object.values(state.destinationBalances).reduce((sum, amount) => sum + amount, 0);
    const topDestination = (Object.entries(state.destinationBalances).sort((left, right) => right[1] - left[1])[0]?.[0] ??
      'Wallet') as RuleDestination;

    return {
      thisMonthSaved: projectedMonthlyContribution,
      inactiveOpportunity: suggestedRules.reduce((sum, suggestion) => sum + suggestion.estimatedMonthlySavings, 0),
      projectedMonthlyContribution,
      activeRules: enabledRules.length,
      totalTriggers,
      totalRouted,
      topDestination,
    };
  }, [state.destinationBalances, state.rules, suggestedRules]);

  const value = useMemo<AppContextType>(
    () => ({
      ...state,
      weeklySpare,
      growthPercent,
      automationStats,
      suggestedRules,
      highlightedRuleIds,
      simulateTransaction,
      toggleRule,
      createRule,
      updateRule,
      deleteRule,
      clearNotification,
      isStreaming,
      setIsStreaming,
    }),
    [
      state,
      weeklySpare,
      growthPercent,
      automationStats,
      suggestedRules,
      highlightedRuleIds,
      simulateTransaction,
      toggleRule,
      createRule,
      updateRule,
      deleteRule,
      clearNotification,
      isStreaming,
      setIsStreaming,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
