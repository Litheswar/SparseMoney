import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  Compass, TrendingUp, TrendingDown, Target, Brain, 
  Lightbulb, AlertCircle, Clock, ShieldCheck, 
  Wallet, Plane, Headphones, Key, AlertTriangle, Sparkles, Plus, Loader2
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';

type RiskProfile = 'Conservative' | 'Balanced' | 'Aggressive';
type InvestType = 'Gold ETF' | 'Hybrid' | 'Index Fund';

export default function UserHorizon() {
  const { wallet, weeklySpare } = useApp();
  const [loading, setLoading] = useState(true);
  
  // === CORE STATES ===
  const [months, setMonths] = useState([12]);
  const [monthly, setMonthly] = useState([1000]); // Flat monthly contribution slider
  const [riskProfile, setRiskProfile] = useState<RiskProfile>('Balanced');
  const [investType, setInvestType] = useState<InvestType>('Index Fund');
  const [roundupMult, setRoundupMult] = useState([1]);
  
  // === BEHAVIORAL STATES ===
  const [futureSelfMode, setFutureSelfMode] = useState(false);
  const [inflationAdjusted, setInflationAdjusted] = useState(false);
  const [whatIfActive, setWhatIfActive] = useState<string | null>(null);

  useEffect(() => {
    // Initial load just to simulate data readiness
    setTimeout(() => setLoading(false), 500);
  }, []);

  // Apply What-Ifs
  const effectiveMonthly = whatIfActive === '+500_saving' ? monthly[0] + 500 : monthly[0];
  const effectiveRoundup = whatIfActive === '2x_roundup' ? Math.max(roundupMult[0], 2) : roundupMult[0];
  const effectiveMonths = futureSelfMode ? 60 : months[0];

  // === CALCULATIONS (Driven by AppContext Data) ===
  const chartData = useMemo(() => {
    const baselineReturn = 4; // Standard savings
    
    // Determine Optimized Return based on selection
    const typeBase = investType === 'Gold ETF' ? 9 : investType === 'Hybrid' ? 11 : 14;
    const riskMod = riskProfile === 'Conservative' ? 0.8 : riskProfile === 'Balanced' ? 1.0 : 1.3;
    const optimizedReturn = typeBase * riskMod;

    // Monthly round-ups based on ACTUAL user performance (weeklySpare * 4)
    const baseRoundup = (weeklySpare * 4) || 400; 
    const optimizedMonthly = effectiveMonthly + (baseRoundup * effectiveRoundup);
    const baselineMonthly = effectiveMonthly + baseRoundup;

    const baselineMonthlyRate = baselineReturn / 100 / 12;
    const optimizedMonthlyRate = optimizedReturn / 100 / 12;
    const inflationRate = inflationAdjusted ? 0.05 / 12 : 0;

    const data = [];
    // Start from current real portfolio + wallet balance
    let bTotal = wallet.totalInvested + wallet.balance;
    let oTotal = wallet.totalInvested + wallet.balance;

    for (let m = 1; m <= effectiveMonths; m++) {
      bTotal = (bTotal + baselineMonthly) * (1 + baselineMonthlyRate - inflationRate);
      oTotal = (oTotal + optimizedMonthly) * (1 + optimizedMonthlyRate - inflationRate);
      
      data.push({
        month: m,
        label: `Month ${m}`,
        baseline: Math.round(bTotal),
        optimized: Math.round(oTotal),
      });
    }
    return { data, optimizedReturn, baselineReturn };
  }, [wallet, weeklySpare, effectiveMonthly, effectiveMonths, riskProfile, investType, effectiveRoundup, inflationAdjusted]);

  const finalData = chartData.data[chartData.data.length - 1];
  const deltaExtra = finalData.optimized - finalData.baseline;
  const deltaPercent = (deltaExtra / (finalData.baseline || 1)) * 100;

  const goalMap = useMemo(() => {
    if (finalData.optimized > 500000) return { icon: Key, title: 'Real Estate Deposit', desc: 'Heading towards massive goals' };
    if (finalData.optimized > 150000) return { icon: Plane, title: 'Luxury Trip', desc: 'Fully funded international travel' };
    if (finalData.optimized > 50000) return { icon: Wallet, title: 'Emergency Safety Net', desc: 'Peace of mind established' };
    return { icon: Headphones, title: 'Premium Gear', desc: 'Treat yourself to quality tech' };
  }, [finalData.optimized]);

  const insights = useMemo(() => {
    const list = [];
    if (effectiveRoundup === 1) {
      list.push({
        alert: true,
        obs: 'Passive rounding is limiting your growth.',
        action: 'Try increasing intensity to 2x.',
        impact: `This simple switch gains you extra ₹${Math.round(deltaExtra * 0.4).toLocaleString('en-IN')}.`,
      });
    }
    if (riskProfile === 'Conservative' && effectiveMonths > 18) {
      list.push({
        alert: false,
        obs: 'Stable long-term horizon detected.',
        action: 'Consider Balanced risk profile.',
        impact: 'Unlocks ₹' + Math.round(finalData.optimized * 0.15).toLocaleString('en-IN') + ' in potential compounding.',
      });
    }
    return list.slice(0, 2);
  }, [effectiveRoundup, riskProfile, effectiveMonths, deltaExtra, finalData.optimized]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const b = payload.find((p: any) => p.dataKey === 'baseline')?.value;
      const o = payload.find((p: any) => p.dataKey === 'optimized')?.value;
      return (
        <div className="glass-card bg-white/95 p-3 rounded-lg border border-border/50 shadow-xl min-w-[180px]">
          <p className="text-xs font-bold text-foreground mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-primary font-bold">
              <span>Optimized</span>
              <span>₹{o.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Current</span>
              <span>₹{b.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className={`transition-colors duration-1000 ${futureSelfMode ? 'bg-primary/5' : ''}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-2">
              <Sparkles className="w-3 h-3" /> Predictive Insights
            </div>
            <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
              <Compass className="w-6 h-6 text-primary" /> Horizon Predictor
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Simulating growth based on your actual ₹{weeklySpare} weekly spare change.</p>
          </div>
          <div className="flex gap-2">
             <div className="glass-card px-3 py-1.5 flex items-center gap-2 text-[11px] font-bold">
               <Clock className="w-3.5 h-3.5 text-primary" />
               Current Assets: ₹{(wallet.totalInvested + wallet.balance).toLocaleString('en-IN')}
             </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-4 space-y-4">
            <motion.div layout className="glass-card p-6 border-t-4 border-t-primary">
              <p className="text-xs font-bold text-muted-foreground uppercase opacity-70">Projected Future Wealth</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-4xl font-black font-heading text-foreground">₹{finalData.optimized.toLocaleString('en-IN')}</span>
              </div>
              <div className="mt-4 p-3 rounded-xl bg-success/10 border border-success/20 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-success" />
                <div className="text-xs font-bold text-success">
                  +₹{deltaExtra.toLocaleString('en-IN')} ({deltaPercent.toFixed(1)}%) Extra Wealth Hidden in your spending
                </div>
              </div>
            </motion.div>

            <div className="glass-card p-6 space-y-6">
              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Monthly Contribution</label>
                  <span className="text-sm font-black text-primary font-heading">₹{monthly[0]}</span>
                </div>
                <Slider value={monthly} onValueChange={setMonthly} min={0} max={25000} step={500} />
              </div>

              {!futureSelfMode && (
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Time Horizon</label>
                    <span className="text-sm font-black text-foreground font-heading">{months[0]} Months</span>
                  </div>
                  <Slider value={months} onValueChange={setMonths} min={3} max={36} step={1} />
                </div>
              )}

              <div className="pt-4 border-t border-border space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">Risk Profile</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['Conservative', 'Balanced', 'Aggressive'] as RiskProfile[]).map(r => (
                      <button 
                        key={r} onClick={() => setRiskProfile(r)}
                        className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${riskProfile === r ? 'bg-primary text-white' : 'bg-muted/50 text-muted-foreground'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">Round-up Intensity</label>
                  <Slider value={roundupMult} onValueChange={setRoundupMult} min={1} max={5} step={1} />
                </div>
              </div>
            </div>
          </div>

          {/* Visualization */}
          <div className="lg:col-span-8 space-y-6">
            <div className="glass-card p-6 h-80 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground"><div className="w-2 h-2 rounded-full bg-muted"/> Baseline</span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-primary"><div className="w-2 h-2 rounded-full bg-primary"/> Optimized Strategy</span>
                </div>
                <div className="flex items-center gap-3">
                   <span className="text-[10px] font-bold text-muted-foreground">Inflation Adjusted</span>
                   <Switch checked={inflationAdjusted} onCheckedChange={setInflationAdjusted} />
                </div>
              </div>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.data}>
                    <defs>
                      <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" hide />
                    <YAxis hide domain={['dataMin', 'auto']} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="baseline" stroke="#94a3b8" fill="transparent" strokeDasharray="5 5" />
                    <Area type="monotone" dataKey="optimized" stroke="hsl(var(--primary))" fill="url(#pGrad)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="glass-card p-4 space-y-3">
                <h4 className="text-xs font-black uppercase text-muted-foreground flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5" /> Intelligence Center
                </h4>
                {insights.map((ins, i) => (
                  <div key={i} className={`p-3 rounded-xl border ${ins.alert ? 'bg-orange-50 border-orange-200 dark:bg-orange-950/20' : 'bg-primary/5 border-primary/10'}`}>
                    <p className="text-[11px] font-black text-foreground mb-1">{ins.obs}</p>
                    <p className="text-[10px] text-muted-foreground">Action: {ins.action}</p>
                    <p className="text-[10px] text-primary font-bold mt-1">{ins.impact}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="glass-card p-4 flex items-center gap-4 bg-gradient-to-br from-white to-primary/5">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <goalMap.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-foreground">{goalMap.title}</p>
                    <p className="text-[10px] text-muted-foreground">Goal Projection Status</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" variant={whatIfActive === '2x_roundup' ? 'default' : 'outline'}
                    onClick={() => setWhatIfActive(whatIfActive === '2x_roundup' ? null : '2x_roundup')}
                    className="flex-1 text-[10px] h-8"
                  >
                    🔥 Force 2X Roundups
                  </Button>
                  <Button 
                    size="sm" variant={futureSelfMode ? 'default' : 'outline'}
                    onClick={() => setFutureSelfMode(!futureSelfMode)}
                    className="flex-1 text-[10px] h-8"
                  >
                    🚀 Switch to 5Yr Plan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
