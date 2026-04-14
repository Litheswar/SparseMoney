import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, PieChart, ArrowUpRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { PieChart as RPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function UserWallet() {
  const { wallet, portfolio } = useApp();
  const totalPortfolio = portfolio.reduce((s, p) => s + p.amount, 0);
  const netWorth = wallet.balance + totalPortfolio;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Wallet & Investments</h1>
        <p className="text-sm text-muted-foreground">Track your spare change and portfolio</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="kpi-card">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Wallet Balance</span>
          </div>
          <p className="text-2xl font-bold font-heading text-foreground">₹{wallet.balance.toLocaleString('en-IN')}</p>
          <Progress value={(wallet.balance / wallet.threshold) * 100} className="h-2 mt-2 rounded-full" />
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
            {((portfolio.reduce((s, p) => s + p.amount * p.returns / 100, 0) / totalPortfolio) * 100).toFixed(1)}% returns
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
        {/* Portfolio Pie */}
        <div className="glass-card p-5">
          <h3 className="text-base font-semibold font-heading text-foreground mb-4">Portfolio Allocation</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <RPieChart>
                <Pie data={portfolio} dataKey="amount" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}>
                  {portfolio.map((p, i) => (
                    <Cell key={i} fill={p.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
              </RPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Holdings */}
        <div className="glass-card p-5">
          <h3 className="text-base font-semibold font-heading text-foreground mb-4">Holdings</h3>
          <div className="space-y-3">
            {portfolio.map((inv, i) => (
              <motion.div
                key={inv.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
              >
                <div className="w-3 h-3 rounded-full" style={{ background: inv.color }} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{inv.name}</p>
                  <p className="text-xs text-muted-foreground">{inv.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">₹{inv.amount.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-success">+{inv.returns}%</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
