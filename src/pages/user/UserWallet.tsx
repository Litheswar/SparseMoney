import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, PieChart, ArrowUpRight, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { PieChart as RPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { api } from '@/lib/api';

interface Holding {
  id: string;
  name: string;
  type: string;
  amount: number;
  returns_percent: number;
  color: string;
}

export default function UserWallet() {
  const [wallet, setWallet] = useState({ balance: 0, threshold: 500, totalSaved: 0, totalInvested: 0 });
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [w, h] = await Promise.all([api.wallet.get(), api.wallet.holdings()]);
        setWallet(w);
        setHoldings(h || []);
      } catch (err) {
        console.error('Wallet load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalPortfolio = holdings.reduce((s, h) => s + Number(h.amount), 0);
  const netWorth = wallet.balance + totalPortfolio;
  const avgReturn = totalPortfolio > 0
    ? (holdings.reduce((s, h) => s + Number(h.amount) * Number(h.returns_percent) / 100, 0) / totalPortfolio * 100).toFixed(1)
    : '0.0';

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Wallet & Investments</h1>
        <p className="text-sm text-muted-foreground">Track your spare change and portfolio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="kpi-card">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Wallet Balance</span>
          </div>
          <p className="text-2xl font-bold font-heading text-foreground">₹{wallet.balance.toLocaleString('en-IN')}</p>
          <Progress value={wallet.threshold > 0 ? (wallet.balance / wallet.threshold) * 100 : 0} className="h-2 mt-2 rounded-full" />
          <p className="text-xs text-muted-foreground mt-1">Auto-invest at ₹{wallet.threshold}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="kpi-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">Portfolio Value</span>
          </div>
          <p className="text-2xl font-bold font-heading text-foreground">₹{totalPortfolio.toLocaleString('en-IN')}</p>
          <p className="text-xs text-success mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            {avgReturn}% returns
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="kpi-card">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Net Worth</span>
          </div>
          <p className="text-2xl font-bold font-heading text-foreground">₹{netWorth.toLocaleString('en-IN')}</p>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-base font-semibold font-heading text-foreground mb-4">Portfolio Allocation</h3>
          {holdings.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer>
                <RPieChart>
                  <Pie data={holdings} dataKey="amount" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}>
                    {holdings.map((h, i) => (
                      <Cell key={i} fill={h.color || `hsl(${i * 60} 60% 50%)`} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
                </RPieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">No holdings yet. Simulate transactions to trigger auto-invest!</p>
          )}
        </div>

        <div className="glass-card p-5">
          <h3 className="text-base font-semibold font-heading text-foreground mb-4">Holdings</h3>
          <div className="space-y-3">
            {holdings.map((h, i) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
              >
                <div className="w-3 h-3 rounded-full" style={{ background: h.color || `hsl(${i * 60} 60% 50%)` }} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{h.name}</p>
                  <p className="text-xs text-muted-foreground">{h.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">₹{Number(h.amount).toLocaleString('en-IN')}</p>
                  <p className="text-xs text-success">+{h.returns_percent}%</p>
                </div>
              </motion.div>
            ))}
            {holdings.length === 0 && <p className="text-xs text-muted-foreground">No holdings yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
