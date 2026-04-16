import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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
  DEFAULT_DESTINATION_BALANCES,
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
  
  // Portfolio & Automation Fields
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
  marketPrices: Record<string, { price: number; changePercent: number; updatedAt: string }>;
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
  
  // Live portfolio state — starts empty, gets populated from API
  const [portfolio, setPortfolio] = useState<Investment[]>([]);
  const [recentExecutions, setRecentExecutions] = useState<RuleExecution[]>([]);
  const [destinationBalances, setDestinationBalances] = useState<Record<RuleDestination, number>>(DEFAULT_DESTINATION_BALANCES);
  const [marketPrices, setMarketPrices] = useState<Record<string, { price: number; changePercent: number; updatedAt: string }>>({});

  // ─── Market data: fetch live prices + holdings portfolio ────────────────────
  const refreshMarketData = useCallback(async () => {
    try {
      // 1. Get live market prices (GOLDBEES.NS, ^NSEI)
      let priceMap: Record<string, { price: number; changePercent: number; updatedAt: string }> = {};
      try {
        const prices = await api.market.prices();
        (prices || []).forEach((p: any) => {
          if (p.symbol && p.price != null) {
            priceMap[p.symbol] = { price: p.price, changePercent: p.changePercent ?? 0, updatedAt: p.updatedAt };
          }
        });
        setMarketPrices(priceMap);
      } catch {
        // prices unavailable — continue with holdings anyway
      }

      // 2. Fetch holdings from the EXISTING working endpoint
      const rawHoldings: any[] = await api.wallet.holdings();
      console.log('[AppContext] rawHoldings from API:', rawHoldings);
      
      if (!rawHoldings || rawHoldings.length === 0) {
        console.warn('[AppContext] No holdings found for this user.');
        return;
      }

      // Map from DB schema (type: GOLD/INDEX/DEBT/FD, amount, returns_percent, color)
      // to the Investment type the UI expects
      const TYPE_LABEL: Record<string, Investment['type']> = {
        GOLD:  'Gold ETF',
        INDEX: 'Index Fund',
        DEBT:  'Debt Fund',
        FD:    'Fixed Deposit',
        ETF:   'Gold ETF',
      };
      const TYPE_SYMBOL: Record<string, string> = {
        GOLD:  'GOLDBEES.NS',
        INDEX: '^NSEI',
      };

      const mapped: Investment[] = rawHoldings.map((h: any) => {
        const investedAmount = Number(h.amount || 0);
        const baseReturns    = Number(h.returns_percent || 10);
        const symbol         = TYPE_SYMBOL[h.type];
        const marketData     = symbol ? priceMap[symbol] : null;

        // For live assets apply daily market change on top of invested amount
        let currentAmount = investedAmount;
        let displayReturns = baseReturns;
        if (marketData) {
          currentAmount  = investedAmount * (1 + (marketData.changePercent / 100));
          displayReturns = baseReturns; // keep long-term return % from DB
        }

        return {
          name:    h.name || 'Unknown Asset',
          type:    (TYPE_LABEL[h.type] ?? 'Index Fund') as Investment['type'],
          amount:  Math.round(currentAmount * 100) / 100,
          returns: displayReturns,
          color:   h.color || '#10B981',
        };
      });

      setPortfolio(mapped);

      // Build destination balances from real holdings
      const totalPortfolioLive = mapped.reduce((s, h) => s + h.amount, 0);
      const balances: Partial<Record<RuleDestination, number>> = {};
      mapped.forEach(h => {
        const dest = h.type as RuleDestination;
        balances[dest] = (balances[dest] || 0) + h.amount;
      });
      setDestinationBalances(prev => ({ ...prev, ...balances }));

      // 3. Fetch real execution history for the Insights Timeline
      try {
        const history = await api.market.history();
        setRecentExecutions(history || []);
      } catch {
        // history unavailable
      }

    } catch (err) {
      console.error('[AppContext] refreshMarketData failed:', err);
    }
  }, []);


  const refreshDashboard = useCallback(async () => {
    try {
      const data = await api.dashboard.getSummary();
      setWallet(data.wallet);
      setWeeklySpare(data.weeklySpare);
      setGrowthPercent(prev => data.growthPercent || prev); // keep portfolio-derived value if present
      setAutomationImpact(data.automationImpact || 0);
      
      // Map Transactions
      setTransactions(
        (data.transactions || []).map((t: any) => ({
          id:         t.id,
          merchant:   t.merchant || 'Unknown',
          category:   t.category || 'Other',
          amount:     Number(t.amount),
          roundUp:    Number(t.spare || 0),
          icon:       t.icon || '💳',
          timestamp:  new Date(t.created_at),
          ruleExecutions: []
        }))
      );

      // Map Notifications
      setNotifications(
        (data.notifications || []).map((n: any) => ({
          id:          n.id,
          title:       n.title || (n.type === 'ROUNDUP' ? 'Round-up Generated' : 'System Alert'),
          description: n.message,
          type:        n.type === 'ROUNDUP' ? 'success' : n.type === 'ALERT' ? 'warning' : 'info',
          timestamp:   new Date(n.created_at),
        }))
      );
    } catch (err) {
      console.error('Dashboard refresh error:', err);
    }
  }, []);

  const refreshRules = useCallback(async () => {
    try {
      const data = await api.rules.list();
      setRules(data.map((r: any) => ({
        id:         r.id,
        name:       r.name,
        enabled:    r.is_active,
        mode:       'quick',
        logic:      'AND',
        conditions: [{ id: 'c1', field: r.condition === 'all' ? 'transaction' : 'category', operator: r.condition === 'all' ? 'always' : 'equals', value: r.condition }],
        action:     { type: r.action === 'round-up' ? 'round_up' : 'fixed_invest', value: 10 },
        destination: (r.target || 'Wallet') as RuleDestination,
        category:   r.target === 'WALLET' ? 'round-up' : 'invest',
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
    const init = async () => {
      try {
        setLoading(true);
        // Load initial state
        await Promise.all([
          refreshDashboard(),
          refreshGroups(),
          refreshRules(),
          refreshMarketData(),
        ]);
      } catch (err) {
        console.error('[AppContext] Initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    init();

    // Refresh market prices every 3 minutes to stay in sync with cron
    const marketInterval = setInterval(refreshMarketData, 3 * 60 * 1000);
    return () => clearInterval(marketInterval);
  }, [refreshDashboard, refreshGroups, refreshRules, refreshMarketData]);

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
        name:      rule.name,
        condition: rule.condition.type,
        action:    rule.action.type,
        target:    rule.action.destination.type,
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
        id:         result.transaction.id,
        merchant:   result.transaction.merchant || 'Unknown',
        category:   result.transaction.category || 'Other',
        amount:     Number(result.transaction.amount),
        roundUp:    Number(result.transaction.spare || 0),
        icon:       result.transaction.icon || '💳',
        timestamp:  new Date(result.transaction.created_at),
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
        // Refresh market/portfolio data after an investment fires
        refreshMarketData();
      }

      return tx;
    } catch (err) {
      console.error('Simulation error:', err);
      return null;
    }
  }, [refreshMarketData]);

  const automationStats = {
    thisMonthSaved:               automationImpact,
    totalRouted:                  wallet.totalSaved,
    activeRules:                  rules.filter(r => r.enabled).length,
    totalTriggers:                rules.reduce((acc, r) => acc + (r.triggerCount || 0), 0),
    topDestination:               portfolio.length > 0 ? portfolio.sort((a,b) => b.amount - a.amount)[0].name : 'Wallet',
    projectedMonthlyContribution: weeklySpare * 4 || automationImpact * 1.2 || 0,
    inactiveOpportunity:          rules.filter(r => !r.enabled).length * 150, // Simple estimate: ₹150 per inactive rule
  };

  return (
    <AppContext.Provider value={{
      wallet, transactions, notifications, rules,
      weeklySpare, growthPercent, isStreaming, setIsStreaming,
      simulateTransaction, lastInvestment, loading, refreshDashboard,
      updateThreshold: (v) => setWallet(p => ({ ...p, threshold: v })),
      groups, refreshGroups, automationImpact,
      portfolio, automationStats, recentExecutions, suggestedRules: [],
      destinationBalances, marketPrices,
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
