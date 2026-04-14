import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, BrainCircuit, Lightbulb, ShieldCheck, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/automation';

const barPalette = ['hsl(174 62% 40%)', 'hsl(0 72% 55%)', 'hsl(38 92% 50%)', 'hsl(220 70% 50%)'];

export default function UserInsightsAutomation() {
  const { transactions, automationStats, suggestedRules, recentExecutions, rules } = useApp();

  const spendByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>();
    transactions.slice(0, 40).forEach((transaction) => {
      categoryMap.set(transaction.category, (categoryMap.get(transaction.category) ?? 0) + transaction.amount);
    });

    return Array.from(categoryMap.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((left, right) => right.amount - left.amount)
      .slice(0, 4);
  }, [transactions]);

  const activeRules = rules.filter((rule) => rule.enabled);
  const automationScore = Math.min(98, 55 + activeRules.length * 8 + Math.round(automationStats.thisMonthSaved / 250));

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8 bg-[radial-gradient(circle_at_top_right,hsl(180_15%_96%),transparent_40%),linear-gradient(180deg,hsl(180_10%_98%),white)]">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Activity className="h-3.5 w-3.5" /> Behavior Intelligence
          </motion.div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Insights & Analytics</h1>
          <p className="mt-2 text-sm text-muted-foreground">See how your programmable finance engine is shaping behavior and savings.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="glass-card lg:col-span-4 p-6">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <ShieldCheck className="h-4 w-4 text-success" /> Automation Health
            </div>
            <div className="mt-6 flex items-end gap-3">
              <span className="text-5xl font-black text-foreground">{automationScore}</span>
              <span className="pb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">out of 100</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Your active rules are contributing {formatCurrency(automationStats.thisMonthSaved)} this month with {activeRules.length} live automations.
            </p>
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3 text-sm">
                <span className="text-muted-foreground">Projected monthly contribution</span>
                <span className="font-semibold text-foreground">{formatCurrency(automationStats.projectedMonthlyContribution)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3 text-sm">
                <span className="text-muted-foreground">Total triggers processed</span>
                <span className="font-semibold text-foreground">{automationStats.totalTriggers}</span>
              </div>
            </div>
          </motion.div>

          <div className="space-y-4 lg:col-span-8">
            <div className="grid gap-4 md:grid-cols-2">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card border-l-4 border-l-success p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-success">Automation Impact</p>
                    <p className="mt-3 text-3xl font-black text-foreground">{formatCurrency(automationStats.thisMonthSaved)}</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Your rules saved this amount without manual action.</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }} className="glass-card border-l-4 border-l-warning p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-warning">Inactive Opportunity</p>
                    <p className="mt-3 text-3xl font-black text-foreground">{formatCurrency(automationStats.inactiveOpportunity)}</p>
                  </div>
                  <TrendingDown className="h-6 w-6 text-warning" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">You could capture this much more with suggested rules.</p>
              </motion.div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-base font-bold font-heading text-foreground">Smart Spending Analysis</h3>
              <p className="mb-5 text-xs text-muted-foreground">Top categories by recent spend, paired against your live automation stack.</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spendByCategory} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="amount" radius={[10, 10, 0, 0]}>
                      {spendByCategory.map((entry, index) => (
                        <Cell key={entry.name} fill={barPalette[index % barPalette.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="glass-card lg:col-span-7 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <h3 className="text-base font-bold font-heading text-foreground">Suggested Next Moves</h3>
            </div>
            <div className="space-y-3">
              {suggestedRules.length > 0 ? (
                suggestedRules.map((suggestion) => (
                  <div key={suggestion.id} className="rounded-2xl border border-border/60 bg-white/60 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{suggestion.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{suggestion.description}</p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {formatCurrency(suggestion.estimatedMonthlySavings)}/mo
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-foreground">{suggestion.insight}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-border/60 bg-white/60 p-4 text-sm text-muted-foreground">
                  No major gaps detected right now. Your current automations already cover the strongest patterns in your recent behavior.
                </div>
              )}
            </div>
          </div>

          <div className="glass-card lg:col-span-5 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Target className="h-4 w-4 text-success" />
              <h3 className="text-base font-bold font-heading text-foreground">Execution Timeline</h3>
            </div>
            <div className="space-y-3">
              {recentExecutions.slice(0, 5).map((execution) => (
                <div key={execution.id} className="rounded-2xl border border-border/60 bg-white/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{execution.ruleName}</p>
                    <span className="text-xs font-semibold text-success">{formatCurrency(execution.amount)}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{execution.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{format(new Date(execution.executedAt), 'dd MMM, h:mm a')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
