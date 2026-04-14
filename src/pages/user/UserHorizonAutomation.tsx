import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Compass, ShieldCheck, Sparkles, Target, TrendingUp, Wallet } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/automation';

type RiskProfile = 'Conservative' | 'Balanced' | 'Aggressive';
type Strategy = 'Gold ETF' | 'Index Fund' | 'Debt Fund';

export default function UserHorizonAutomation() {
  const { automationStats, rules } = useApp();
  const [months, setMonths] = useState([12]);
  const [monthly, setMonthly] = useState([1500]);
  const [riskProfile, setRiskProfile] = useState<RiskProfile>('Balanced');
  const [strategy, setStrategy] = useState<Strategy>('Index Fund');

  const returnsMap: Record<Strategy, Record<RiskProfile, number>> = {
    'Gold ETF': { Conservative: 8, Balanced: 10, Aggressive: 11 },
    'Index Fund': { Conservative: 10, Balanced: 13, Aggressive: 16 },
    'Debt Fund': { Conservative: 7, Balanced: 8, Aggressive: 9 },
  };

  const chartData = useMemo(() => {
    const annualReturn = returnsMap[strategy][riskProfile];
    const monthlyRate = annualReturn / 100 / 12;
    const automationBoost = automationStats.projectedMonthlyContribution;
    const data = [];
    let currentOnly = 0;
    let programmable = 0;

    for (let month = 1; month <= months[0]; month += 1) {
      currentOnly = (currentOnly + monthly[0]) * (1 + monthlyRate);
      programmable = (programmable + monthly[0] + automationBoost) * (1 + monthlyRate);

      data.push({
        label: `M${month}`,
        currentOnly: Math.round(currentOnly),
        programmable: Math.round(programmable),
      });
    }

    return data;
  }, [automationStats.projectedMonthlyContribution, months, monthly, returnsMap, riskProfile, strategy]);

  const finalPoint = chartData[chartData.length - 1];
  const programmableDelta = finalPoint.programmable - finalPoint.currentOnly;

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8 bg-[radial-gradient(ellipse_at_top,hsl(220_30%_92%),hsl(180_10%_98%))]">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Financial Intelligence
            </motion.div>
            <h1 className="flex items-center gap-3 text-3xl font-bold font-heading text-foreground">
              <Compass className="h-8 w-8 text-primary" /> Horizon Predictor
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Project how your live automation engine changes future wealth, not just one-off savings.
            </p>
          </div>

          <div className="glass-card px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Programmable finance boost</p>
            <p className="mt-2 text-xl font-black text-foreground">{formatCurrency(automationStats.projectedMonthlyContribution)}/month</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <div className="glass-card p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Monthly investment</p>
              <p className="mt-2 text-3xl font-black text-foreground">{formatCurrency(monthly[0])}</p>
              <Slider value={monthly} onValueChange={setMonthly} min={500} max={25000} step={500} className="mt-5" />
            </div>

            <div className="glass-card p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Time horizon</p>
              <p className="mt-2 text-3xl font-black text-foreground">{months[0]} months</p>
              <Slider value={months} onValueChange={setMonths} min={6} max={60} step={1} className="mt-5" />
            </div>

            <div className="glass-card p-6 space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Strategy</p>
                <div className="mt-3 grid grid-cols-1 gap-2">
                  {(['Gold ETF', 'Index Fund', 'Debt Fund'] as Strategy[]).map((item) => (
                    <button
                      key={item}
                      onClick={() => setStrategy(item)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
                        strategy === item ? 'border-primary bg-primary/5 text-primary' : 'border-border/70 bg-white text-foreground'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Risk appetite</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {(['Conservative', 'Balanced', 'Aggressive'] as RiskProfile[]).map((item) => (
                    <button
                      key={item}
                      onClick={() => setRiskProfile(item)}
                      className={`rounded-2xl border px-3 py-3 text-xs font-bold transition-all ${
                        riskProfile === item ? 'border-primary bg-primary text-primary-foreground' : 'border-border/70 bg-white text-foreground'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <ShieldCheck className="h-4 w-4 text-success" /> Rule Engine Impact
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Active automations</span>
                  <span className="font-semibold text-foreground">{rules.filter((rule) => rule.enabled).length}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Projected auto contribution</span>
                  <span className="font-semibold text-foreground">{formatCurrency(automationStats.projectedMonthlyContribution)}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Incremental future wealth</span>
                  <span className="font-semibold text-success">{formatCurrency(programmableDelta)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-8">
            <div className="glass-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold font-heading text-foreground">Projection Analysis</h3>
                  <p className="text-xs text-muted-foreground">Current manual investing versus programmable finance mode.</p>
                </div>
                <div className="rounded-xl bg-success/10 px-3 py-2 text-sm font-semibold text-success">
                  +{formatCurrency(programmableDelta)} with automation
                </div>
              </div>

              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="currentGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(220 10% 45%)" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="hsl(220 10% 45%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="programmableGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(152 60% 42%)" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="hsl(152 60% 42%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Area type="monotone" dataKey="currentOnly" stroke="hsl(220 10% 45%)" fill="url(#currentGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="programmable" stroke="hsl(152 60% 42%)" fill="url(#programmableGrad)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Wallet className="h-4 w-4 text-primary" /> Manual path
                </div>
                <p className="mt-3 text-2xl font-black text-foreground">{formatCurrency(finalPoint.currentOnly)}</p>
                <p className="mt-1 text-sm text-muted-foreground">If you only keep investing manually.</p>
              </div>

              <div className="glass-card p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-success" /> Programmable path
                </div>
                <p className="mt-3 text-2xl font-black text-foreground">{formatCurrency(finalPoint.programmable)}</p>
                <p className="mt-1 text-sm text-muted-foreground">With your rule engine contributing every month.</p>
              </div>

              <div className="glass-card p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Target className="h-4 w-4 text-warning" /> Automation delta
                </div>
                <p className="mt-3 text-2xl font-black text-success">{formatCurrency(programmableDelta)}</p>
                <p className="mt-1 text-sm text-muted-foreground">Additional wealth created by rule-driven finance.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
