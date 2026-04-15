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
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600/20 via-primary/10 to-transparent border border-white/10 p-8"
    >
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/10 blur-[100px] rounded-full" />

      <div className="relative flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Total Wealth</p>
          <h1 className="text-5xl font-bold font-heading text-foreground flex items-baseline gap-2">
            <Counter value={totalWealth} />
            <motion.span 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={growthPercent}
              className="text-base font-medium text-success flex items-center gap-0.5 bg-success/10 px-2 py-0.5 rounded-full"
            >
              <ArrowUpRight className="w-3 h-3" />
              {growthPercent}%
            </motion.span>
          </h1>
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <Zap className="w-3 h-3 text-yellow-500" />
              Money Velocity: 18x
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full xl:w-auto">
          <div className="glass-card p-4 min-w-[160px] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Wallet className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Wallet</span>
            </div>
            <p className="text-xl font-bold font-heading text-foreground">
              <Counter value={walletBalance} />
            </p>
            <div className="h-1 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (walletBalance / 500) * 100)}%` }}
                className="h-full bg-primary"
              />
            </div>
          </div>

          <div className="glass-card p-4 min-w-[160px] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-success/10">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Portfolio Value</span>
            </div>
            <p className="text-xl font-bold font-heading text-foreground">
              <Counter value={investedAmount} />
            </p>
            <div className="h-1 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                className="h-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]"
              />
            </div>
          </div>

          <div className="glass-card p-4 min-w-[160px] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-yellow-500/10">
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Automation Routed</span>
            </div>
            <p className="text-xl font-bold font-heading text-foreground">
              <Counter value={automationRouted} />
            </p>
            <div className="h-1 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '60%' }}
                className="h-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
