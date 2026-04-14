import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  Compass, TrendingUp, TrendingDown, Target, Brain, 
  Lightbulb, AlertCircle, Clock, ShieldCheck, 
  Wallet, Plane, Headphones, Key, AlertTriangle, Sparkles, Plus
} from 'lucide-react';

type RiskProfile = 'Conservative' | 'Balanced' | 'Aggressive';
type InvestType = 'Gold ETF' | 'Hybrid' | 'Index Fund';

export default function UserHorizon() {
  // === CORE STATES ===
  const [months, setMonths] = useState([12]);
  const [monthly, setMonthly] = useState([1000]);
  const [riskProfile, setRiskProfile] = useState<RiskProfile>('Balanced');
  const [investType, setInvestType] = useState<InvestType>('Index Fund');
  const [roundupMult, setRoundupMult] = useState([1]);
  
  // === BEHAVIORAL STATES ===
  const [futureSelfMode, setFutureSelfMode] = useState(false);
  const [inflationAdjusted, setInflationAdjusted] = useState(false);
  const [whatIfActive, setWhatIfActive] = useState<string | null>(null);

  // Apply What-Ifs
  const effectiveMonthly = whatIfActive === '+500_saving' ? monthly[0] + 500 : monthly[0];
  const effectiveRoundup = whatIfActive === '2x_roundup' ? Math.max(roundupMult[0], 2) : roundupMult[0];
  const effectiveMonths = futureSelfMode ? 60 : months[0];

  // === CALCULATIONS ===
  const chartData = useMemo(() => {
    // Logic Configuration
    const baselineReturn = 4; // 4% savings account
    
    // Determine Optimized Return
    const typeBase = investType === 'Gold ETF' ? 9 : investType === 'Hybrid' ? 11 : 14;
    const riskMod = riskProfile === 'Conservative' ? 0.8 : riskProfile === 'Balanced' ? 1.0 : 1.3;
    const optimizedReturn = typeBase * riskMod;

    // Monthly flat round-ups based on multiplier (simulated average)
    const baseRoundup = 350; 
    const optimizedMonthly = effectiveMonthly + (baseRoundup * effectiveRoundup);
    const baselineMonthly = effectiveMonthly + baseRoundup; // Baseline assumes 1x default

    const baselineMonthlyRate = baselineReturn / 100 / 12;
    const optimizedMonthlyRate = optimizedReturn / 100 / 12;
    const inflationRate = inflationAdjusted ? 0.05 / 12 : 0;

    const data = [];
    let bTotal = 0;
    let oTotal = 0;

    for (let m = 1; m <= effectiveMonths; m++) {
      // Compound total
      bTotal = (bTotal + baselineMonthly) * (1 + baselineMonthlyRate - inflationRate);
      oTotal = (oTotal + optimizedMonthly) * (1 + optimizedMonthlyRate - inflationRate);
      
      data.push({
        month: m,
        label: `Mo ${m}`,
        baseline: Math.round(bTotal),
        optimized: Math.round(oTotal),
      });
    }
    return { data, optimizedReturn, baselineReturn };
  }, [effectiveMonthly, effectiveMonths, riskProfile, investType, effectiveRoundup, inflationAdjusted]);

  const finalData = chartData.data[chartData.data.length - 1];
  const deltaExtra = finalData.optimized - finalData.baseline;
  const deltaPercent = (deltaExtra / finalData.baseline) * 100;

  // === GOAL MAPPING ===
  const goalMap = useMemo(() => {
    if (finalData.optimized > 150000) return { icon: Key, title: 'Car Down Payment', desc: 'Accelerate to hit this faster' };
    if (finalData.optimized > 60000) return { icon: Plane, title: 'International Trip', desc: 'Perfect for a vacation' };
    if (finalData.optimized > 20000) return { icon: Wallet, title: 'Emergency Fund', desc: 'Secure 3 months expenses' };
    return { icon: Headphones, title: 'Tech Gadget', desc: 'Treat yourself to quality audio' };
  }, [finalData.optimized]);

  // === INSIGHT ENGINE ===
  const insights = useMemo(() => {
    const list = [];
    
    // Dynamic calculation parsing
    if (deltaExtra > 0) {
      if (effectiveRoundup > 1) {
        list.push({
          alert: false,
          obs: 'Round-up multiplier is compounding effectively.',
          action: `Keep your multiplier at ${effectiveRoundup}x.`,
          impact: `You are generating an extra ₹${Math.round(deltaExtra).toLocaleString('en-IN')} over your baseline.`,
        });
      } else {
        list.push({
          alert: true,
          obs: 'Your returns could be optimized further.',
          action: 'Increase round-up intensity to 2x or 3x.',
          impact: `You can gain up to ₹${Math.round(deltaExtra * 1.5).toLocaleString('en-IN')} more in ${effectiveMonths}mo.`,
        });
      }
    }

    if (effectiveMonthly < 2500) {
      list.push({
        alert: true,
        obs: 'Savings rate is below optimal threshold.',
        action: 'Increase monthly savings by ₹500.',
        impact: `This simple shift will boost final projection by ₹${Math.round(500 * effectiveMonths * (1 + chartData.optimizedReturn/100/12)).toLocaleString('en-IN')}.`,
      });
    }

    if (riskProfile === 'Conservative' && effectiveMonths >= 24) {
      list.push({
        alert: false,
        obs: 'Long time horizon detected with conservative risk.',
        action: 'Consider switching to a Balanced profile.',
        impact: `Unlocks higher yield for long term stability.`,
      });
    }

    if (list.length === 0) {
      list.push({
        alert: false,
        obs: 'Your current strategy is mathematically sound.',
        action: 'Maintain strict consistency.',
        impact: `Guarantees hitting your projected target of ₹${finalData.optimized.toLocaleString('en-IN')}.`,
      });
    }

    return list;
  }, [effectiveMonthly, effectiveRoundup, riskProfile, investType, effectiveMonths, deltaExtra, finalData.optimized, chartData.optimizedReturn]);


  // === CUSTOM TOOLTIP ===
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const b = payload.find((p: any) => p.dataKey === 'baseline')?.value;
      const o = payload.find((p: any) => p.dataKey === 'optimized')?.value;
      return (
        <div className="glass-card bg-white/95 p-3 rounded-lg border border-border/50 shadow-xl min-w-[200px]">
          <p className="text-xs font-bold text-foreground mb-2">{label}</p>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-medium text-success">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-success"/> Optimized Strategy</span>
              <span>₹{o.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-muted-foreground/50"/> Current Behavior</span>
              <span>₹{b.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-border/50">
            <p className="text-[10px] font-bold text-success/80">+ ₹{(o - b).toLocaleString('en-IN')} Extra Wealth</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`min-h-[calc(100vh-4rem)] p-4 md:p-8 transition-colors duration-1000 ${futureSelfMode ? 'bg-[radial-gradient(ellipse_at_top,hsl(220_30%_90%),hsl(180_10%_98%))] dark:bg-[radial-gradient(ellipse_at_top,hsl(220_25%_12%),hsl(200_25%_6%))]' : ''}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Financial Intelligence
            </motion.div>
            <h1 className="text-3xl font-bold font-heading text-foreground flex items-center gap-3 w-[800px]">
              <Compass className="w-8 h-8 text-primary" /> Horizon Predictor
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">Simulate your future, uncover hidden wealth gaps, and optimize your financial behavior.</p>
          </div>
          
          <div className="flex gap-3">
            <div className="glass-card px-4 py-2 flex items-center gap-2 group cursor-help relative">
              <Brain className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-xs font-semibold text-foreground">Confidence: <span className="text-success">High</span></span>
            </div>
            {inflationAdjusted && (
              <div className="glass-card px-4 py-2 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-warning" />
                <span className="text-xs font-semibold text-foreground">Inflation Adjusted</span>
              </div>
            )}
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* LEFT PANEL: ADVANCED INPUTS */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* SMART SUMMARY CARD */}
            <motion.div layout className="glass-card p-6 overflow-hidden relative group border-t-4 border-t-primary shadow-[0_8px_30px_hsl(174_62%_40%/.15)]">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Target className="w-24 h-24 text-primary" />
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Projected Future Wealth</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-black font-heading text-foreground">₹{finalData.optimized.toLocaleString('en-IN')}</span>
                <span className="text-sm font-semibold text-muted-foreground">in {effectiveMonths}mo</span>
              </div>
              
              {/* DELTA IMPACT CARD */}
              <div className="mt-5 p-3.5 rounded-xl bg-[linear-gradient(135deg,hsl(152_60%_42%/.1),transparent)] border border-success/20 flex items-start gap-3">
                <div className="p-1.5 bg-success/20 text-success rounded-md mt-0.5"><TrendingUp className="w-4 h-4" /></div>
                <div>
                  <p className="text-sm font-bold text-success">+₹{deltaExtra.toLocaleString('en-IN')} extra generated</p>
                  <p className="text-[11px] font-medium text-success/80 leading-tight mt-0.5">+{deltaPercent.toFixed(1)}% improvement vs baseline behavior</p>
                </div>
              </div>
            </motion.div>

            {/* CONTROLS */}
            <div className="glass-card p-6 space-y-7">
              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="text-sm font-bold text-foreground">Monthly Investment</label>
                  <span className="text-lg font-bold text-primary font-heading">₹{monthly[0].toLocaleString('en-IN')}</span>
                </div>
                <Slider value={monthly} onValueChange={setMonthly} min={500} max={25000} step={500} className="[&>span:first-child]:bg-primary/20 [&_[role=slider]]:border-primary" />
              </div>

              {!futureSelfMode && (
                <div>
                   <div className="flex justify-between items-end mb-3">
                    <label className="text-sm font-bold text-foreground">Time Horizon</label>
                    <span className="text-lg font-bold text-foreground font-heading">{months[0]} Months</span>
                  </div>
                  <Slider value={months} onValueChange={setMonths} min={3} max={36} step={1} />
                </div>
              )}

              <div className="space-y-4 pt-5 border-t border-border/50">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Strategy Type</label>
                  <div className="flex bg-muted/50 p-1 rounded-lg">
                    {['Gold ETF', 'Hybrid', 'Index Fund'].map(type => (
                      <button 
                        key={type}
                        onClick={() => setInvestType(type as InvestType)}
                        className={`flex-1 text-[11px] font-bold py-2 rounded-md transition-all ${investType === type ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:bg-white/50'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                   <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Risk Appetite</label>
                   <div className="grid grid-cols-3 gap-2">
                     {(['Conservative', 'Balanced', 'Aggressive'] as RiskProfile[]).map(r => (
                       <div 
                        key={r}
                        onClick={() => setRiskProfile(r)}
                        className={`cursor-pointer border py-2 text-center rounded-lg text-xs font-bold transition-all ${riskProfile === r ? 'border-primary bg-primary/5 text-primary' : 'border-border/50 text-muted-foreground hover:border-primary/50'}`}
                       >
                         {r}
                       </div>
                     ))}
                   </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Round-up Intensity</label>
                    <span className="text-xs font-bold text-foreground">{roundupMult[0]}x Multiplier</span>
                  </div>
                  <Slider value={roundupMult} onValueChange={setRoundupMult} min={1} max={5} step={1} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: GRAPH + INSIGHTS */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* OVERLAY MODE FLAG */}
            {futureSelfMode && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-bold">Future Self Mode Active</p>
                    <p className="text-xs font-medium opacity-80">Projecting 5 years assuming strict consistency.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setFutureSelfMode(false)} className="h-8 text-xs border-indigo-500/30 hover:bg-indigo-500/10">Exit Mode</Button>
              </motion.div>
            )}

            {/* CHART */}
            <div className="glass-card p-6 flex-1 min-h-[400px] flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-start mb-6 z-10 relative">
                <div>
                  <h3 className="text-lg font-bold font-heading text-foreground">Projection Analysis</h3>
                  <div className="mt-2 flex gap-4">
                     <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><div className="w-2.5 h-2.5 rounded-sm bg-muted-foreground/30 border border-muted-foreground/50"/> Current Behavior</span>
                     <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground"><div className="w-2.5 h-2.5 rounded-sm bg-success/80 border border-success"/> Optimized Strategy</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Switch checked={inflationAdjusted} onCheckedChange={setInflationAdjusted} id="inflation-switch" />
                    <label htmlFor="inflation-switch" className="cursor-pointer">Inflation Adj</label>
                  </div>
                  <div className="px-2 py-1 bg-muted/50 rounded flex items-center gap-1.5 border border-border/50">
                    CAGR: <span className="text-foreground">{chartData.optimizedReturn.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="optGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(152 60% 42%)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(152 60% 42%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(200 10% 45%)" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="hsl(200 10% 45%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} dy={10} minTickGap={30} />
                    <YAxis 
                      tickFormatter={v => v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : v >= 1000 ? `₹${(v/1000).toFixed(1)}k` : `₹${v}`} 
                      tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area 
                      type="monotone" dataKey="baseline" stroke="hsl(200 10% 45%)" strokeWidth={2} fill="url(#baseGrad)" 
                      animationDuration={1500} activeDot={{ r: 4, fill: 'hsl(200 10% 45%)' }}
                    />
                    <Area 
                       type="monotone" dataKey="optimized" stroke="hsl(152 60% 42%)" strokeWidth={3} fill="url(#optGrad)" 
                       animationDuration={1500} activeDot={{ r: 6, fill: 'hsl(152 60% 42%)', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* LOWER SECTION: INSIGHTS & GOALS */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* INSIGHT ENGINE */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/50 pb-2">
                  <ShieldCheck className="w-4 h-4 text-primary" /> Insight Engine
                </h4>
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {insights.map((ins, i) => (
                      <motion.div 
                        key={i} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} 
                        className={`p-4 rounded-xl border relative shadow-sm transition-all hover:shadow-md ${ins.alert ? 'bg-orange-50/50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/50' : 'bg-primary/5 border-primary/10'}`}
                      >
                        <div className="flex gap-3">
                          <div className={`mt-0.5 ${ins.alert ? 'text-orange-500' : 'text-primary'}`}>
                            {ins.alert ? <AlertTriangle className="w-4 h-4" /> : <Lightbulb className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Observation</p>
                            <p className="text-sm font-bold text-foreground leading-tight">{ins.obs}</p>
                            
                            <div className="mt-3 pl-3 border-l-2 border-border space-y-1.5">
                              <p className="text-[12px] font-medium text-foreground"><span className="text-muted-foreground">Action:</span> {ins.action}</p>
                              <p className={`text-[12px] font-bold ${ins.alert ? 'text-orange-600 dark:text-orange-400' : 'text-primary'}`}><span className="text-muted-foreground font-medium">Impact:</span> {ins.impact}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* MISSED OPPORTUNITY (Behavioral Nudge) */}
                    {effectiveRoundup === 1 && (
                      <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl border border-risk/30 bg-risk/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><AlertCircle className="w-16 h-16 text-risk" /></div>
                        <div className="flex gap-3 relative z-10">
                          <div className="mt-0.5 text-risk animate-pulse"><AlertCircle className="w-4 h-4" /></div>
                          <div>
                            <p className="text-sm font-bold text-risk">Missed Opportunity Detect</p>
                            <p className="text-[12px] font-medium text-foreground mt-1 leading-snug">
                              You are potentially losing <span className="font-bold">₹{Math.round(chartData.data[chartData.data.length-1].optimized * 0.12).toLocaleString('en-IN')}</span> due to low round-up behavior. Increase multiplier to capture this gap.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* DYNAMIC GOAL & WHAT-IFS */}
              <div className="space-y-6">
                
                {/* WHAT-IF PANEL */}
                <div>
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/50 pb-2 mb-3">
                     <Target className="w-4 h-4 text-primary" /> What-If Scenarios
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setWhatIfActive(whatIfActive === '+500_saving' ? null : '+500_saving')}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${whatIfActive === '+500_saving' ? 'bg-primary text-white border-primary shadow-md' : 'bg-white hover:bg-muted border-border/70 text-foreground'}`}
                    >
                      <Plus className="w-3.5 h-3.5" /> Save ₹500 more
                    </button>
                    <button 
                      onClick={() => setWhatIfActive(whatIfActive === '2x_roundup' ? null : '2x_roundup')}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${whatIfActive === '2x_roundup' ? 'bg-primary text-white border-primary shadow-md' : 'bg-white hover:bg-muted border-border/70 text-foreground'}`}
                    >
                      <Plus className="w-3.5 h-3.5" /> Force 2X Roundups
                    </button>
                    <button 
                      onClick={() => setFutureSelfMode(!futureSelfMode)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${futureSelfMode ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white hover:bg-muted border-border/70 text-foreground'}`}
                    >
                      <Clock className="w-3.5 h-3.5" /> Force 5 Years
                    </button>
                  </div>
                </div>

                {/* DYNAMIC GOAL MAPPING */}
                <div>
                   <h4 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/50 pb-2 mb-3">
                     <Target className="w-4 h-4 text-primary" /> Goal Projection
                  </h4>
                  <motion.div 
                    key={goalMap.title} 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
                    className="glass-card p-5 border-border/50 bg-gradient-to-br from-white to-primary/5 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <goalMap.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">This funds a</p>
                      <p className="text-base font-bold font-heading text-foreground">{goalMap.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{goalMap.desc}</p>
                    </div>
                  </motion.div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
