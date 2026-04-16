import { Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { WalletHero } from '@/components/wallet/WalletHero';
import { InteractivePortfolio } from '@/components/wallet/InteractivePortfolio';
import { HoldingsList } from '@/components/wallet/HoldingsList';
import { TransactionFeed } from '@/components/wallet/TransactionFeed';
import { MoneyFlow } from '@/components/wallet/MoneyFlow';

export default function UserWallet() {
  const {
    wallet,
    transactions,
    portfolio,
    automationStats,
    growthPercent,
    loading,
  } = useApp();

  const totalPortfolio = (portfolio || []).reduce((sum, h) => sum + h.amount, 0);
  const totalWealth = wallet.balance + totalPortfolio;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">

      {/* 1. WALLET HERO — Net Worth Overview */}
      <WalletHero
        walletBalance={wallet.balance}
        investedAmount={wallet.totalInvested}
        totalWealth={totalWealth}
        automationRouted={automationStats.totalRouted}
        growthPercent={growthPercent}
      />

      {/* 2. PORTFOLIO CHART + MONEY FLOW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <InteractivePortfolio portfolio={portfolio} />
        </div>
        <div className="lg:col-span-1">
          <MoneyFlow />
        </div>
      </div>

      {/* 3. HOLDINGS + LIVE FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <HoldingsList portfolio={portfolio} />
        </div>
        <div className="lg:col-span-1">
          <TransactionFeed transactions={transactions} />
        </div>
      </div>

    </div>
  );
}
