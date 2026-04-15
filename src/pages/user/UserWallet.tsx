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
        className="glass-card p-8 bg-gradient-to-r from-[#4A9A6E]/5 via-[#D4A017]/5 to-transparent border-[#4A9A6E]/10"
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-[#4A9A6E]/10 flex items-center justify-center">
              <Users className="w-8 h-8 text-[#4A9A6E]" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-heading text-foreground">Wealth Synergy</h3>
              <p className="text-sm text-muted-foreground">You've pooled {formatCurrency(myGroupContributions)} across {groups.length} intelligence groups this month.</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <button className="px-6 py-3 rounded-xl bg-[#4A9A6E] text-white font-bold text-sm shadow-lg shadow-[#4A9A6E]/20 hover:bg-[#3d835d] transition-all flex items-center gap-2 group">
              Global Strategy
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

