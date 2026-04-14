import React, { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Transaction, WalletState, Rule, generateTransaction, addToWallet, triggerInvestment, calculateRoundUp, DEFAULT_RULES, MOCK_PORTFOLIO, Investment, evaluateCondition } from '@/lib/engine';

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
}

const AppContext = createContext<AppContextType | null>(null);

const INITIAL_WALLET: WalletState = {
  balance: 187,
  threshold: 500,
  totalSaved: 3420,
  totalInvested: 9400,
};

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
      addRule, updateRule, deleteRule, duplicateRule, automationImpact
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
