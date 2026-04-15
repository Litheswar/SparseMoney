import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { WalletHero } from '@/components/wallet/WalletHero';
import { MoneyFlow } from '@/components/wallet/MoneyFlow';
import { InteractivePortfolio } from '@/components/wallet/InteractivePortfolio';
import { HoldingsList } from '@/components/wallet/HoldingsList';
import { AutomationStatus } from '@/components/wallet/AutomationStatus';
import { ThresholdEngine } from '@/components/wallet/ThresholdEngine';
import { TransactionFeed } from '@/components/wallet/TransactionFeed';
import { Users, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/automation';

export default function UserWallet() {
  const { 
    wallet, 
    portfolio, 
    transactions, 
    rules, 
    toggleRule,
    groups,
    growthPercent,
    automationStats
  } = useApp();

  const totalPortfolio = portfolio.reduce((s, p) => s + p.amount, 0);
  const totalWealth = wallet.balance + totalPortfolio;

  // Group Contribution Logic
  const myGroupContributions = groups.reduce((sum, group) => {
    const me = group.members.find(m => m.userId === 'u1');
    return sum + (me?.totalContributed || 0);
  }, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* 🔝 1️⃣ WALLET HERO */}
      <WalletHero 
        walletBalance={wallet.balance} 
        investedAmount={totalPortfolio} 
        totalWealth={totalWealth}
        automationRouted={automationStats.totalRouted}
        growthPercent={growthPercent}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 📊 3️⃣ INTERACTIVE PORTFOLIO */}
        <div className="lg:col-span-2">
          <InteractivePortfolio portfolio={portfolio} />
        </div>

        {/* 🧠 6️⃣ WALLET THRESHOLD ENGINE */}
        <div className="lg:col-span-1">
          <ThresholdEngine balance={wallet.balance} threshold={wallet.threshold} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 🧾 4️⃣ HOLDINGS */}
        <div className="lg:col-span-2">
          <HoldingsList portfolio={portfolio} />
        </div>

        {/* 📜 7️⃣ LIVE TRANSACTION / INVESTMENT FEED */}
        <div className="lg:col-span-1">
          <TransactionFeed transactions={transactions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 💸 2️⃣ LIVE MONEY FLOW */}
        <div className="lg:col-span-1">
          <MoneyFlow />
        </div>

        {/* ⚡ 5️⃣ AUTOMATION ENGINE */}
        <div className="lg:col-span-2">
          <AutomationStatus rules={rules} onToggleRule={toggleRule} />
        </div>
      </div>

      {/* 🧩 8️⃣ GROUP WALLET INTEGRATION */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card p-8 bg-gradient-to-r from-teal-500/5 via-primary/5 to-transparent border-teal-500/20"
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 flex items-center justify-center">
              <Users className="w-8 h-8 text-teal-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-heading text-foreground">Group Power</h3>
              <p className="text-sm text-muted-foreground">You've contributed {formatCurrency(myGroupContributions)} across {groups.length} groups this month.</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <button className="px-6 py-3 rounded-xl bg-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all flex items-center gap-2 group">
              Manage Groups
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

