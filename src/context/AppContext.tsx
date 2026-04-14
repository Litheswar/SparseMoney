import React, { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Transaction, WalletState, Rule, generateTransaction, addToWallet, triggerInvestment, calculateRoundUp, DEFAULT_RULES, MOCK_PORTFOLIO, Investment, evaluateCondition, Group, GroupMember, GroupContribution } from '@/lib/engine';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: Date;
}

interface AppState {
  wallet: WalletState;
  transactions: Transaction[];
  rules: Rule[];
  portfolio: Investment[];
  notifications: Notification[];
  weeklySpare: number;
  growthPercent: number;
  groups: Group[];
  groupContributions: GroupContribution[];
}

interface AppContextType extends AppState {
  simulateTransaction: () => Transaction;
  addRule: (rule: Omit<Rule, 'id' | 'triggerCount'>) => void;
  updateRule: (id: string, updates: Partial<Rule>) => void;
  deleteRule: (id: string) => void;
  duplicateRule: (id: string) => void;
  toggleRule: (id: string) => void;
  clearNotification: (id: string) => void;
  isStreaming: boolean;
  setIsStreaming: (v: boolean) => void;
  lastInvestment: { amount: number; timestamp: Date; ruleName: string } | null;
  automationImpact: number;
  createGroup: (group: Omit<Group, 'id' | 'totalSaved' | 'members' | 'inviteCode' | 'createdAt'>) => void;
  addContributionToGroup: (groupId: string, amount: number, source: 'roundup' | 'manual') => void;
}

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

// Generate initial transactions
function generateInitialTransactions(count: number): Transaction[] {
  const txs: Transaction[] = [];
  for (let i = 0; i < count; i++) {
    const tx = generateTransaction();
    tx.timestamp = new Date(Date.now() - (count - i) * 3600000);
    txs.push(tx);
  }
  return txs;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>(INITIAL_WALLET);
  const [transactions, setTransactions] = useState<Transaction[]>(() => generateInitialTransactions(20));
  const [rules, setRules] = useState<Rule[]>(DEFAULT_RULES);
  const [portfolio] = useState<Investment[]>(MOCK_PORTFOLIO);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [groupContributions, setGroupContributions] = useState<GroupContribution[]>(INITIAL_CONTRIBUTIONS);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastInvestment, setLastInvestment] = useState<{ amount: number; timestamp: Date; ruleName: string } | null>(null);
  const streamRef = useRef<ReturnType<typeof setInterval>>();

  const addNotification = useCallback((message: string, type: Notification['type'] = 'info') => {
    setNotifications(prev => [{
      id: `n-${Date.now()}`,
      message,
      type,
      timestamp: new Date(),
    }, ...prev].slice(0, 20));
  }, []);

  // Calculate automation impact (total saved via rules)
  const automationImpact = useMemo(() => {
    return rules.reduce((acc, rule) => {
      let ruleValue = 0;
      if (rule.action.type === 'fixed') ruleValue = (rule.action.value || 0) * rule.triggerCount;
      if (rule.action.type === 'round-up') ruleValue = 5 * rule.triggerCount; // Estimated 5 per round up
      return acc + ruleValue;
    }, 0);
  }, [rules]);

  const simulateTransaction = useCallback(() => {
    const tx = generateTransaction();
    setTransactions(prev => [tx, ...prev]);

    let totalSavedInTx = 0;
    let triggeredRuleName = '';

    // Process Rules
    setRules(prevRules => prevRules.map(rule => {
      if (!rule.enabled) return rule;
      
      const isTriggered = evaluateCondition(tx, rule.condition);
      if (isTriggered) {
        let savedAmount = 0;
        if (rule.action.type === 'round-up') {
          savedAmount = tx.roundUp;
        } else if (rule.action.type === 'fixed') {
          savedAmount = rule.action.value || 0;
        } else if (rule.action.type === 'percent') {
          savedAmount = Math.round(tx.amount * (rule.action.value || 0) / 100);
        }

        totalSavedInTx += savedAmount;
        triggeredRuleName = rule.name;
        
        return { 
          ...rule, 
          triggerCount: rule.triggerCount + 1,
          lastTriggered: new Date().toISOString()
        };
      }
      return rule;
    }));

    if (totalSavedInTx > 0) {
      setWallet(prev => ({
        ...prev,
        balance: prev.balance + totalSavedInTx,
        totalSaved: prev.totalSaved + totalSavedInTx,
      }));
      
      setLastInvestment({ 
        amount: totalSavedInTx, 
        timestamp: new Date(), 
        ruleName: triggeredRuleName 
      });

      addNotification(`Rule "${triggeredRuleName}" triggered: +₹${totalSavedInTx}`, 'success');
      
      // Auto-invest if threshold reached
      setWallet(currentWallet => {
        const result = triggerInvestment(currentWallet);
        if (result.invested) {
          addNotification(`🎉 Wallet threshold reached! ₹${result.amount} auto-invested`, 'success');
          return result.wallet;
        }
        return currentWallet;
      });
    }

    return tx;
  }, [addNotification]);

  const addRule = useCallback((rule: Omit<Rule, 'id' | 'triggerCount'>) => {
    const newRule: Rule = {
      ...rule,
      id: `r-${Date.now()}`,
      triggerCount: 0,
    };
    setRules(prev => [...prev, newRule]);
    addNotification(`Rule "${newRule.name}" created successfully`, 'success');
  }, [addNotification]);

  const updateRule = useCallback((id: string, updates: Partial<Rule>) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    addNotification('Rule updated successfully', 'success');
  }, [addNotification]);

  const deleteRule = useCallback((id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    addNotification('Rule deleted', 'warning');
  }, [addNotification]);

  const duplicateRule = useCallback((id: string) => {
    const ruleToDup = rules.find(r => r.id === id);
    if (ruleToDup) {
      const newRule: Rule = {
        ...ruleToDup,
        id: `r-${Date.now()}`,
        name: `${ruleToDup.name} (Copy)`,
        triggerCount: 0,
      };
      setRules(prev => [...prev, newRule]);
      addNotification(`Duplicated "${ruleToDup.name}"`, 'success');
    }
  }, [rules, addNotification]);

  const toggleRule = useCallback((id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const createGroup = useCallback((groupData: Omit<Group, 'id' | 'totalSaved' | 'members' | 'inviteCode' | 'createdAt'>) => {
    const newGroup: Group = {
      ...groupData,
      id: `g-${Date.now()}`,
      totalSaved: 0,
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdAt: new Date().toISOString(),
      members: [
        { userId: 'u1', name: 'Arjun', totalContributed: 0, lastActive: new Date().toISOString(), badges: [] }
      ]
    };
    setGroups(prev => [newGroup, ...prev]);
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
    setGroupContributions(prev => [contribution, ...prev].slice(0, 50));
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          totalSaved: g.totalSaved + amount,
          members: g.members.map(m => m.userId === 'u1' ? { ...m, totalContributed: m.totalContributed + amount, lastActive: new Date().toISOString() } : m)
        };
      }
      return g;
    }));
  }, []);

  // Streaming mode
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

  // Group Simulation logic
  useEffect(() => {
    const interval = setInterval(() => {
      const luckyGroup = groups[Math.floor(Math.random() * groups.length)];
      if (!luckyGroup) return;
      
      const luckyMember = luckyGroup.members[Math.floor(Math.random() * luckyGroup.members.length)];
      if (!luckyMember) return;
      
      const amount = Math.floor(Math.random() * 50) + 10;
      
      setGroups(prev => prev.map(g => {
        if (g.id === luckyGroup.id) {
          return {
            ...g,
            totalSaved: g.totalSaved + amount,
            lastActivity: {
              userName: luckyMember.name,
              amount,
              timestamp: new Date()
            },
            energyScore: Math.min(100, g.energyScore + 2),
            members: g.members.map(m => m.userId === luckyMember.userId ? {
              ...m,
              totalContributed: m.totalContributed + amount,
              lastActive: new Date().toISOString()
            } : m)
          };
        }
        return g;
      }));
    }, 8000); // Simulate every 8s

    return () => clearInterval(interval);
  }, [groups]);

  const weeklySpare = transactions
    .filter(t => t.timestamp > new Date(Date.now() - 7 * 86400000))
    .reduce((sum, t) => sum + t.roundUp, 0);

  const growthPercent = wallet.totalInvested > 0
    ? Math.round((portfolio.reduce((s, p) => s + p.amount * p.returns / 100, 0) / wallet.totalInvested) * 100) / 10
    : 0;

  return (
    <AppContext.Provider value={{
      wallet, transactions, rules, portfolio, notifications,
      weeklySpare, growthPercent, isStreaming, setIsStreaming,
      simulateTransaction, toggleRule, clearNotification, lastInvestment,
      addRule, updateRule, deleteRule, duplicateRule, automationImpact,
      groups, groupContributions, createGroup, addContributionToGroup
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
