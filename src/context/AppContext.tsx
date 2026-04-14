import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Transaction, WalletState, Rule, generateTransaction, addToWallet, triggerInvestment, calculateRoundUp, DEFAULT_RULES, MOCK_PORTFOLIO, Investment } from '@/lib/engine';

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
  toggleRule: (id: string) => void;
  clearNotification: (id: string) => void;
  isStreaming: boolean;
  setIsStreaming: (v: boolean) => void;
  lastInvestment: { amount: number; timestamp: Date } | null;
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
  const [lastInvestment, setLastInvestment] = useState<{ amount: number; timestamp: Date } | null>(null);
  const streamRef = useRef<ReturnType<typeof setInterval>>();

  const addNotification = useCallback((message: string, type: Notification['type'] = 'info') => {
    setNotifications(prev => [{
      id: `n-${Date.now()}`,
      message,
      type,
      timestamp: new Date(),
    }, ...prev].slice(0, 20));
  }, []);

  const simulateTransaction = useCallback(() => {
    const tx = generateTransaction();
    setTransactions(prev => [tx, ...prev]);

    // Round up to wallet
    const newWallet = addToWallet(wallet, tx.roundUp);
    setWallet(newWallet);
    addNotification(`+₹${tx.roundUp} spare from ${tx.merchant}`, 'success');

    // Check threshold
    const result = triggerInvestment(newWallet);
    if (result.invested) {
      setWallet(result.wallet);
      setLastInvestment({ amount: result.amount, timestamp: new Date() });
      addNotification(`🎉 ₹${result.amount} auto-invested!`, 'success');
    }

    return tx;
  }, [wallet, addNotification]);

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
