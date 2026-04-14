import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, PieChart, ShieldCheck, TrendingUp, Wallet, Workflow } from 'lucide-react';
import { PieChart as RPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useApp } from '@/context/AppContext';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/automation';

export default function UserWalletAutomation() {
  const { wallet, portfolio, automationStats, destinationBalances, recentExecutions } = useApp();
  const totalPortfolio = portfolio.reduce((sum, holding) => sum + holding.amount, 0);
  const netWorth = wallet.balance + totalPortfolio;

  const topDestinations = useMemo(
    () =>
      Object.entries(destinationBalances)
        .sort((left, right) => right[1] - left[1])
        .slice(0, 4),
    [destinationBalances],
  );

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Wallet & Investments</h1>
        <p className="text-sm text-muted-foreground">Track your spare wallet, portfolio, and automation cashflows.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="kpi-card">
          <div className="mb-2 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Wallet Balance</span>
          </div>
          <p className="text-2xl font-bold font-heading text-foreground">{formatCurrency(wallet.balance)}</p>
          <Progress value={(wallet.balance / wallet.threshold) * 100} className="mt-2 h-2 rounded-full" />
          <p className="mt-1 text-xs text-muted-foreground">Auto-invest at {formatCurrency(wallet.threshold)}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="kpi-card">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-xs text-muted-foreground">Portfolio Value</span>
          </div>
          <p className="text-2xl font-bold font-heading text-foreground">{formatCurrency(totalPortfolio)}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-success">
            <ArrowUpRight className="h-3 w-3" />
            {totalPortfolio > 0 
              ? ((portfolio.reduce((sum, holding) => sum + holding.amount * holding.returns / 100, 0) / totalPortfolio) * 100).toFixed(1)
              : '0'}% returns
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="kpi-card">
          <div className="mb-2 flex items-center gap-2">
            <Workflow className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Automation Routed</span>
          </div>
          <p className="text-2xl font-bold font-heading text-foreground">{formatCurrency(automationStats.totalRouted)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{automationStats.activeRules} active rules funding real destinations</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="kpi-card">
          <div className="mb-2 flex items-center gap-2">
            <PieChart className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Net Worth</span>
          </div>
          <p className="text-2xl font-bold font-heading text-foreground">{formatCurrency(netWorth)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Top automation destination: {automationStats.topDestination}</p>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h3 className="mb-4 text-base font-semibold font-heading text-foreground">Portfolio Allocation</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <RPieChart>
                <Pie data={portfolio} dataKey="amount" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}>
                  {portfolio.map((holding, index) => (
                    <Cell key={index} fill={holding.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </RPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="mb-4 text-base font-semibold font-heading text-foreground">Automation Routes</h3>
          <div className="space-y-3">
            {topDestinations.map(([destination, amount], index) => (
              <motion.div
                key={destination}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-xl bg-muted/30 p-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{destination}</p>
                    <p className="text-xs text-muted-foreground">Routed by active automations</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{formatCurrency(amount)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h3 className="mb-4 text-base font-semibold font-heading text-foreground">Holdings</h3>
          <div className="space-y-3">
            {portfolio.map((holding, index) => (
              <motion.div
                key={holding.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="flex items-center gap-3 rounded-xl bg-muted/30 p-3"
              >
                <div className="h-3 w-3 rounded-full" style={{ background: holding.color }} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{holding.name}</p>
                  <p className="text-xs text-muted-foreground">{holding.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{formatCurrency(holding.amount)}</p>
                  <p className="text-xs text-success">+{holding.returns}%</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-success" />
            <h3 className="text-base font-semibold font-heading text-foreground">Recent Automation Deposits</h3>
          </div>
          <div className="space-y-3">
            {recentExecutions.slice(0, 5).map((execution) => (
              <div key={execution.id} className="rounded-xl border border-border/60 bg-white/60 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{execution.ruleName}</p>
                    <p className="text-xs text-muted-foreground">{execution.destination}</p>
                  </div>
                  <p className="text-sm font-semibold text-success">{formatCurrency(execution.amount)}</p>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{execution.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
