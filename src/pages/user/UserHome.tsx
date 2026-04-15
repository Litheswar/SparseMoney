import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Wallet, Coins, ArrowUpRight, Zap, Bell, Play, Pause, Loader2 } from 'lucide-react';
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
  }, [value]);
  return <span>{prefix}{display.toLocaleString('en-IN')}</span>;
}

export default function UserHome() {
  const { wallet, transactions, weeklySpare, growthPercent, simulateTransaction, isStreaming, setIsStreaming, notifications, lastInvestment, loading } = useApp();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
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
              <span className="text-xs font-medium text-muted-foreground">{kpi.label}</span>
              <div className={`w-8 h-8 rounded-lg ${kpi.gradient} flex items-center justify-center`}>
                <kpi.icon className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
            <p className="text-2xl font-bold font-heading text-foreground">
              <CountUp value={kpi.value} prefix={kpi.prefix ?? '₹'} />
              {kpi.suffix || ''}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Demo Controls */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSimulate} disabled={simulating} className="rounded-xl gradient-primary text-primary-foreground">
          {simulating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
          Simulate Transaction
        </Button>
        <Button
          variant={isStreaming ? 'destructive' : 'outline'}
          onClick={() => setIsStreaming(!isStreaming)}
          className="rounded-xl"
        >
          {isStreaming ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {isStreaming ? 'Stop Stream' : 'Live Stream'}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Transaction Feed */}
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="text-base font-semibold font-heading text-foreground mb-4">Live Transaction Feed</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            <AnimatePresence>
              {transactions.slice(0, 10).map((tx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-xl">{tx.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{tx.merchant}</p>
                    <p className="text-xs text-muted-foreground">{tx.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">₹{tx.amount}</p>
                    <p className="text-xs text-success font-medium">+₹{tx.roundUp} spare</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {transactions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No transactions yet. Click "Simulate Transaction" to start!</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Wallet Progress */}
          <div className="glass-card p-5">
            <h3 className="text-base font-semibold font-heading text-foreground mb-3">Wallet</h3>
            <div className="text-center mb-3">
              <p className="text-3xl font-bold font-heading text-foreground">
                <CountUp value={wallet.balance} />
              </p>
              <p className="text-xs text-muted-foreground">of ₹{wallet.threshold} threshold</p>
            </div>
            <Progress value={wallet.threshold > 0 ? (wallet.balance / wallet.threshold) * 100 : 0} className="h-3 rounded-full" />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              ₹{Math.max(0, wallet.threshold - wallet.balance)} to auto-invest
            </p>
          </div>

          {/* Round-Up Visualizer */}
          <div className="glass-card p-5">
            <h3 className="text-base font-semibold font-heading text-foreground mb-3">Round-Up Engine</h3>
            {transactions.slice(0, 3).map(tx => (
              <div key={tx.id} className="flex items-center gap-2 text-sm py-1.5">
                <span className="text-muted-foreground">₹{tx.amount}</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-foreground font-medium">₹{tx.amount + tx.roundUp}</span>
                <span className="text-muted-foreground">→</span>
                <motion.span
                  key={tx.id + '-spare'}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-success font-bold animate-coin-drop"
                >
                  +₹{tx.roundUp}
                </motion.span>
              </div>
            ))}
            {transactions.length === 0 && <p className="text-xs text-muted-foreground">No round-ups yet</p>}
          </div>

          {/* Notifications */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-primary" />
              <h3 className="text-base font-semibold font-heading text-foreground">Alerts</h3>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {notifications.slice(0, 5).map(n => (
                <div key={n.id} className="text-xs p-2 rounded-lg bg-muted/30">
                  <span className={n.type === 'success' ? 'text-success' : n.type === 'warning' ? 'text-warning' : 'text-foreground'}>
                    {n.message}
                  </span>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-xs text-muted-foreground">No alerts yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Investment trigger toast */}
      <AnimatePresence>
        {lastInvestment && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 gradient-success text-success-foreground p-4 rounded-2xl shadow-xl z-50"
          >
            <p className="font-bold">🎉 Auto-Invested ₹{lastInvestment.amount}!</p>
            <p className="text-xs opacity-80">Threshold reached → funds deployed</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
