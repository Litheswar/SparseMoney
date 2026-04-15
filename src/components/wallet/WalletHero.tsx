import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';
import { Wallet, TrendingUp, ArrowUpRight, Zap } from 'lucide-react';
import { formatCurrency } from '@/lib/automation';

interface WalletHeroProps {
  walletBalance: number;
  investedAmount: number;
  totalWealth: number;
  automationRouted: number;
  growthPercent: number;
}

function Counter({ value, prefix = "₹" }: { value: number; prefix?: string }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 1,
      onUpdate: (latest) => setDisplayValue(latest)
    });
    return () => controls.stop();
  }, [value]);

  return <>{prefix}{Math.round(displayValue).toLocaleString('en-IN')}</>;
}

export const WalletHero: React.FC<WalletHeroProps> = ({
  walletBalance,
  investedAmount,
  totalWealth,
  automationRouted,
  growthPercent
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#4A9A6E]/10 via-[#F8FAF5] to-transparent border border-[#4A9A6E]/10 p-10 wealth-card"
    >
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#4A9A6E]/10 blur-[120px] rounded-full" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#D4A017]/5 blur-[120px] rounded-full" />

      <div className="relative flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
        <div>
          <p className="text-xs font-bold text-[#64748B] mb-2 uppercase tracking-[0.2em]">Total Strategic Wealth</p>
          <h1 className="text-6xl font-black font-heading text-[#1E2937] flex items-baseline gap-3">
            <Counter value={totalWealth} />
            <motion.span 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={growthPercent}
              className="text-sm font-bold text-[#10B981] flex items-center gap-0.5 bg-[#10B981]/10 px-3 py-1 rounded-full"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              {growthPercent}%
            </motion.span>
          </h1>
          <div className="flex items-center gap-4 mt-8">
            <div className="flex items-center gap-2 text-xs font-bold text-[#4A9A6E] bg-[#4A9A6E]/5 px-4 py-2 rounded-xl border border-[#4A9A6E]/10">
              <Zap className="w-3.5 h-3.5 text-[#D4A017]" />
              Capital Efficiency: 1.8x
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full xl:w-auto">
          <div className="glass-card p-5 min-w-[180px] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#4A9A6E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-[#4A9A6E]/10">
                <Wallet className="w-4 h-4 text-[#4A9A6E]" />
              </div>
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Liquidity</span>
            </div>
            <p className="text-2xl font-black font-heading text-[#1E2937]">
              <Counter value={walletBalance} />
            </p>
            <div className="h-1.5 w-full bg-[#4A9A6E]/5 rounded-full mt-3 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (walletBalance / 500) * 100)}%` }}
                className="h-full bg-[#4A9A6E] shadow-[0_0_10px_rgba(74,154,110,0.3)]"
              />
            </div>
          </div>

          <div className="glass-card p-5 min-w-[180px] relative overflow-hidden group border-[#D4A017]/20">
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4A017]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-[#D4A017]/10">
                <TrendingUp className="w-4 h-4 text-[#D4A017]" />
              </div>
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Portfolio</span>
            </div>
            <p className="text-2xl font-black font-heading text-[#1E2937]">
              <Counter value={investedAmount} />
            </p>
            <div className="h-1.5 w-full bg-[#D4A017]/5 rounded-full mt-3 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                className="h-full bg-[#D4A017] shadow-[0_0_10px_rgba(212,160,23,0.3)]"
              />
            </div>
          </div>

          <div className="glass-card p-5 min-w-[180px] relative overflow-hidden group border-[#5B21B6]/20">
            <div className="absolute inset-0 bg-gradient-to-br from-[#5B21B6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-[#5B21B6]/10">
                <Zap className="w-4 h-4 text-[#5B21B6]" />
              </div>
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Routed</span>
            </div>
            <p className="text-2xl font-black font-heading text-[#1E2937]">
              <Counter value={automationRouted} />
            </p>
            <div className="h-1.5 w-full bg-[#5B21B6]/5 rounded-full mt-3 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '60%' }}
                className="h-full bg-[#5B21B6] shadow-[0_0_10px_rgba(91,33,182,0.3)]"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
