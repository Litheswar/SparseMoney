import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Rule, 
  Transaction, 
  WalletState, 
  Investment, 
  RuleExecution, 
  SuggestedRule, 
  RuleDestination,
  MOCK_PORTFOLIO,
  DEFAULT_DESTINATION_BALANCES,
  DEFAULT_RULE_EXECUTIONS
} from '@/lib/automation';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'insight';

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info';
  timestamp: Date;
}

interface AppContextType {
  wallet: WalletState;
  transactions: Transaction[];
  notifications: Notification[];
  rules: Rule[];
  weeklySpare: number;
  growthPercent: number;
  simulateTransaction: () => Promise<Transaction | null>;
  isStreaming: boolean;
  setIsStreaming: (v: boolean) => void;
  lastInvestment: { amount: number; timestamp: Date } | null;
  loading: boolean;
  refreshDashboard: () => Promise<void>;
  updateThreshold: (threshold: number) => void;
  
  // Rule handlers
  toggleRule: (id: string) => Promise<void>;
  addRule: (rule: any) => Promise<void>;
  updateRule: (id: string, rule: any) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  duplicateRule: (id: string) => Promise<void>;
  
  // New "Automation" Fields for Lithesh UI
  portfolio: Investment[];
  automationStats: {
    thisMonthSaved: number;
    totalRouted: number;
    activeRules: number;
    totalTriggers: number;
    topDestination: string;
    projectedMonthlyContribution: number;
    inactiveOpportunity: number;
  };
  recentExecutions: RuleExecution[];
  suggestedRules: SuggestedRule[];
  destinationBalances: Record<RuleDestination, number>;
  
  groups: any[];
  refreshGroups: () => Promise<void>;
  automationImpact: number;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({ balance: 0, threshold: 500, totalSaved: 0, totalInvested: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [weeklySpare, setWeeklySpare] = useState(0);
  const [growthPercent, setGrowthPercent] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastInvestment, setLastInvestment] = useState<{ amount: number; timestamp: Date } | null>(null);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<any[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [automationImpact, setAutomationImpact] = useState(0);
  
  // New State for Automation UI
  const [portfolio, setPortfolio] = useState<Investment[]>(MOCK_PORTFOLIO);
  const [recentExecutions, setRecentExecutions] = useState<RuleExecution[]>(DEFAULT_RULE_EXECUTIONS);
  const [destinationBalances, setDestinationBalances] = useState<Record<RuleDestination, number>>(DEFAULT_DESTINATION_BALANCES);

  const refreshDashboard = useCallback(async () => {
    try {
      const data = await api.dashboard.getSummary();
      setWallet(data.wallet);
      setWeeklySpare(data.weeklySpare);
      setGrowthPercent(data.growthPercent);
      setAutomationImpact(data.automationImpact || 0);
      
      // Map Transactions
      setTransactions(
        (data.transactions || []).map((t: any) => ({
          id: t.id,
          merchant: t.merchant || 'Unknown',
          category: t.category || 'Other',
          amount: Number(t.amount),
          roundUp: Number(t.spare || 0),
          icon: t.icon || '💳',
          timestamp: new Date(t.created_at),
          ruleExecutions: []
        }))
      );

      // Map Notifications
      setNotifications(
        (data.notifications || []).map((n: any) => ({
          id: n.id,
          title: n.title || (n.type === 'ROUNDUP' ? 'Round-up Generated' : 'System Alert'),
          description: n.message,
          type: n.type === 'ROUNDUP' ? 'success' : n.type === 'ALERT' ? 'warning' : 'info',
          timestamp: new Date(n.created_at),
        }))
      );
    } catch (err) {
      console.error('Dashboard refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshRules = useCallback(async () => {
    try {
      const data = await api.rules.list();
      setRules(data.map((r: any) => ({
        id: r.id,
        name: r.name,
        enabled: r.is_active,
        mode: 'quick',
        logic: 'AND',
        conditions: [{ id: 'c1', field: r.condition === 'all' ? 'transaction' : 'category', operator: r.condition === 'all' ? 'always' : 'equals', value: r.condition }],
        action: { type: r.action === 'round-up' ? 'round_up' : 'fixed_invest', value: 10 },
        destination: (r.target || 'Wallet') as RuleDestination,
        category: r.target === 'WALLET' ? 'round-up' : 'invest',
        triggerCount: r.trigger_count || 0,
        lastTriggeredAt: null,
        totalExecutedAmount: 0,
        monthlyExecutedAmount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })));
    } catch (err) {
      console.error('Rules load error:', err);
    }
  }, []);

  const refreshGroups = useCallback(async () => {
    try {
      const data = await api.groups.list();
      setGroups(data || []);
    } catch (err) {
      console.error('Groups refresh error:', err);
    }
  }, []);

  useEffect(() => {
    refreshDashboard();
    refreshGroups();
    refreshRules();
  }, [refreshDashboard, refreshGroups, refreshRules]);

  const toggleRule = async (id: string) => {
    try {
      const updated = await api.rules.toggle(id);
      setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: updated.is_active } : r));
    } catch (err) {
      toast.error('Failed to toggle rule');
    }
  };

  const addRule = async (rule: any) => {
    try {
      await api.rules.create({
        name: rule.name,
        condition: rule.condition.type,
        action: rule.action.type,
        target: rule.action.destination.type,
      });
      await refreshRules();
      toast.success('Automation rule deployed!');
    } catch (err) {
      toast.error('Failed to create rule');
    }
  };

  const simulateTransaction = useCallback(async () => {
    try {
      const result = await api.transactions.simulate();
      const tx: Transaction = {
        id: result.transaction.id,
        merchant: result.transaction.merchant || 'Unknown',
        category: result.transaction.category || 'Other',
        amount: Number(result.transaction.amount),
        roundUp: Number(result.transaction.spare || 0),
        icon: result.transaction.icon || '💳',
        timestamp: new Date(result.transaction.created_at),
        ruleExecutions: []
      };

      setTransactions(prev => [tx, ...prev].slice(0, 50));

      if (result.wallet) {
        setWallet(prev => ({ ...prev, balance: Number(result.wallet.balance), totalSaved: Number(result.wallet.total_saved) }));
      }

      if (result.investment?.invested) {
        setLastInvestment({ amount: result.investment.amount, timestamp: new Date() });
        setTimeout(() => setLastInvestment(null), 5000);
        toast.success(`🎉 Auto-Invested ₹${result.investment.amount}!`);
      }

      return tx;
    } catch (err) {
      console.error('Simulation error:', err);
      return null;
    }
  }, []);

  const automationStats = {
    thisMonthSaved: automationImpact,
    totalRouted: wallet.totalSaved,
    activeRules: rules.filter(r => r.enabled).length,
    totalTriggers: rules.reduce((acc, r) => acc + r.triggerCount, 0),
    topDestination: 'Index Fund',
    projectedMonthlyContribution: automationImpact * 1.2 || 1200,
    inactiveOpportunity: 450,
  };

  return (
    <AppContext.Provider value={{
      wallet, transactions, notifications, rules,
      weeklySpare, growthPercent, isStreaming, setIsStreaming,
      simulateTransaction, lastInvestment, loading, refreshDashboard,
      updateThreshold: (v) => setWallet(p => ({ ...p, threshold: v })),
      groups, refreshGroups, automationImpact,
      portfolio, automationStats, recentExecutions, suggestedRules: [],
      destinationBalances,
      toggleRule, addRule, updateRule: async () => {}, deleteRule: async () => {}, duplicateRule: async () => {}
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
