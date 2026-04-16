import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Wallet, Coins, ArrowUpRight, Zap, Bell, Play, Pause, Loader2, CheckCircle2, AlertCircle, Lightbulb, Workflow, Sparkles, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';

function CountUp({ value, prefix = '₹' }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 800;
    const start = display;
    const diff = value - start;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= duration) { setDisplay(value); return; }
      setDisplay(Math.round(start + diff * (elapsed / duration)));
      requestAnimationFrame(tick);
    };
    tick();
  }, [value, display]);
  return <span>{prefix}{display.toLocaleString('en-IN')}</span>;
}

export default function UserHome() {
  const { 
    wallet, 
    transactions, 
    weeklySpare, 
    growthPercent, 
    simulateTransaction, 
    isStreaming, 
    setIsStreaming, 
    notifications, 
    lastInvestment, 
    loading,
    automationStats
  } = useApp();
  
  const [simulating, setSimulating] = useState(false);

  const handleSimulate = async () => {
    setSimulating(true);
    await simulateTransaction();
    setSimulating(false);
  };

  const kpis = [
    { label: 'Total Saved', value: wallet.totalSaved, icon: Coins, gradient: 'gradient-primary' },
    { label: 'Total Invested', value: wallet.totalInvested, icon: TrendingUp, gradient: 'gradient-success' },
    { label: 'Weekly Spare', value: weeklySpare, icon: Wallet, gradient: 'gradient-primary' },
    { label: 'Growth', value: growthPercent, icon: ArrowUpRight, prefix: '', suffix: '%', gradient: 'gradient-success' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-3">
              <Sparkles className="w-3 h-3" /> System Operational
           </motion.div>
           <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight">Financial Command Center</h1>
           <p className="text-sm text-muted-foreground mt-1">Real-time monitoring of your programmable finance engine</p>
        </div>
        <div className="flex items-center gap-3">
           <Button onClick={handleSimulate} disabled={simulating} className="rounded-xl gradient-primary text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
              {simulating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
              Test Engine
           </Button>
           <Button
              variant={isStreaming ? 'destructive' : 'outline'}
              onClick={() => setIsStreaming(!isStreaming)}
              className="rounded-xl border-border/60"
           >
              {isStreaming ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isStreaming ? 'Pause Stream' : 'Live Mode'}
           </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="kpi-card"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{kpi.label}</span>
              <div className={`w-8 h-8 rounded-lg ${kpi.gradient} flex items-center justify-center shadow-md`}>
                <kpi.icon className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
            <p className="text-2xl font-black font-heading text-foreground tracking-tight">
              <CountUp value={kpi.value} prefix={kpi.prefix ?? '₹'} />
              {kpi.suffix || ''}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Transaction Feed */}
        <div className="lg:col-span-8 glass-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-base font-bold font-heading text-foreground flex items-center gap-2">
               <Workflow className="w-4 h-4 text-primary" /> Live Transaction Engine
             </h3>
             <span className="text-[10px] font-bold text-success uppercase tracking-[0.2em] animate-pulse">● System Live</span>
          </div>
          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2 scrollbar-hide">
            <AnimatePresence>
              {(transactions || []).map((tx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border/5 hover:bg-muted/40 transition-all group"
                >
                  <span className="text-2xl group-hover:scale-125 transition-transform duration-300">{tx.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{tx.merchant}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{tx.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-foreground">₹{tx.amount}</p>
                    <p className="text-[10px] text-success font-black uppercase tracking-tighter">+₹{tx.roundUp} Spare</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {(transactions || []).length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
                 <Loader2 className="w-8 h-8 animate-spin mb-4" />
                 <p className="text-sm font-medium">Waiting for transaction triggers...</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Engine Status */}
          <div className="glass-card p-6 border-t-4 border-t-primary">
            <div className="flex items-center gap-2 mb-4">
               <div className="p-1.5 bg-primary/10 rounded-lg"><Activity className="w-4 h-4 text-primary" /></div>
               <h3 className="text-sm font-bold uppercase tracking-widest">Engine Status</h3>
            </div>
            <div className="space-y-4">
               <div className="text-center py-2">
                  <p className="text-4xl font-black font-heading text-foreground">
                    <CountUp value={wallet.balance} />
                  </p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Wallet Overflow Reservoir</p>
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase opacity-70">
                     <span>Fill Progress</span>
                     <span>{Math.round((wallet.balance / (wallet.threshold || 500)) * 100)}%</span>
                  </div>
                  <Progress value={(wallet.balance / (wallet.threshold || 500)) * 100} className="h-2.5 rounded-full" />
               </div>
               <p className="text-[11px] text-muted-foreground text-center leading-snug">
                  ₹{Math.max(0, wallet.threshold - wallet.balance).toLocaleString()} remaining until <span className="text-primary font-bold">Auto-Investment</span> trigger.
               </p>
            </div>
          </div>

          {/* Quick Insights */}
          <div className="glass-card p-6 bg-gradient-to-br from-primary/5 to-transparent">
             <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-4 h-4 text-warning" />
                <h3 className="text-sm font-bold uppercase tracking-widest">NUDGE AI</h3>
             </div>
             <div className="space-y-4">
                {notifications.slice(0, 3).map(n => (
                   <motion.div 
                     key={n.id} 
                     initial={{ opacity: 0, x: 10 }} 
                     animate={{ opacity: 1, x: 0 }}
                     className="p-3 rounded-xl bg-white/40 border border-white/60"
                   >
                      <p className="text-[11px] font-bold text-foreground leading-tight">{n.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{n.description}</p>
                   </motion.div>
                ))}
                {notifications.length === 0 && <p className="text-xs text-muted-foreground italic text-center py-4">Scanning behavior for insights...</p>}
             </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {lastInvestment && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 gradient-success text-success-foreground px-8 py-4 rounded-3xl shadow-2xl z-50 flex items-center gap-4 border border-white/20"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center"><CheckCircle2 className="w-6 h-6" /></div>
            <div>
               <p className="font-black text-lg">Auto-Invested ₹{lastInvestment.amount}!</p>
               <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Portfolio engine successfully deployed funds</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
