import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { api } from '@/lib/api';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: Date;
}

interface WalletState {
  balance: number;
  threshold: number;
  totalSaved: number;
  totalInvested: number;
}

interface Transaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  roundUp: number;
  icon: string;
  timestamp: Date;
}

interface AppContextType {
  wallet: WalletState;
  transactions: Transaction[];
  notifications: Notification[];
  weeklySpare: number;
  growthPercent: number;
  simulateTransaction: () => Promise<Transaction | null>;
  isStreaming: boolean;
  setIsStreaming: (v: boolean) => void;
  lastInvestment: { amount: number; timestamp: Date } | null;
  loading: boolean;
  refreshDashboard: () => Promise<void>;
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
  const streamRef = useRef<ReturnType<typeof setInterval>>();

  const refreshDashboard = useCallback(async () => {
    try {
      const data = await api.dashboard.getSummary();
      setWallet(data.wallet);
      setWeeklySpare(data.weeklySpare);
      setGrowthPercent(data.growthPercent);
      setTransactions(
        (data.transactions || []).map((t: any) => ({
          id: t.id,
          merchant: t.merchant || 'Unknown',
          category: t.category || 'Other',
          amount: Number(t.amount),
          roundUp: Number(t.spare || 0),
          icon: t.icon || '💳',
          timestamp: new Date(t.created_at),
        }))
      );
      setNotifications(
        (data.notifications || []).map((n: any) => ({
          id: n.id,
          message: n.message,
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

  // Load dashboard on mount
  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

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
      };

      setTransactions(prev => [tx, ...prev].slice(0, 50));

      if (result.wallet) {
        // Refresh full wallet state
        try {
          const walletData = await api.wallet.get();
          setWallet(walletData);
        } catch {
          setWallet(prev => ({ ...prev, balance: Number(result.wallet.balance) }));
        }
      }

      if (result.investment?.invested) {
        setLastInvestment({ amount: result.investment.amount, timestamp: new Date() });
        setTimeout(() => setLastInvestment(null), 5000);
      }

      // Add notifications from simulation
      if (result.notifications?.length) {
        setNotifications(prev => [
          ...result.notifications.map((n: any) => ({
            id: n.id,
            message: n.message,
            type: 'success' as const,
            timestamp: new Date(n.created_at),
          })),
          ...prev,
        ].slice(0, 20));
      }

      return tx;
    } catch (err) {
      console.error('Simulation error:', err);
      return null;
    }
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

  return (
    <AppContext.Provider value={{
      wallet, transactions, notifications,
      weeklySpare, growthPercent, isStreaming, setIsStreaming,
      simulateTransaction, lastInvestment, loading, refreshDashboard,
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
