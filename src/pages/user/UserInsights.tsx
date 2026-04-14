import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import { 
  AlertTriangle, TrendingDown, TrendingUp, Brain, CheckCircle2, 
  Lightbulb, ShieldCheck, Activity, Target, Zap, Clock, ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function UserInsights() {
  // === MOCK DATA SETUP ===
  const [timelineVisible, setTimelineVisible] = useState(false);
  const [roundUpEnabled, setRoundUpEnabled] = useState(false);
  const [autoSweepEnabled, setAutoSweepEnabled] = useState(false);
  
  useEffect(() => {
    // Staggered load for timeline
    setTimeout(() => setTimelineVisible(true), 300);
  }, []);

  const handleEnableRoundup = () => {
    setRoundUpEnabled(true);
    toast.success('Smart Rounding Enabled Successfully', {
      description: 'Your spare change will now be invested automatically.'
    });
  };

  const handleEnableAutoSweep = () => {
    setAutoSweepEnabled(true);
    toast.success('Auto-Sweep Active', {
      description: 'Idle cash will be swept to higher-yielding funds.'
    });
  };

  const healthMetrics = {
    spendingControl: 65,
    savingConsistency: 85,
    investmentBehavior: 90
  };

  const currentScore = Math.round((healthMetrics.spendingControl * 0.4) + (healthMetrics.savingConsistency * 0.3) + (healthMetrics.investmentBehavior * 0.3));
  const previousScore = 70;

  // Derive Color based on Score
  const scoreColor = currentScore > 75 ? 'hsl(152 60% 42%)' : currentScore > 50 ? 'hsl(38 92% 50%)' : 'hsl(0 72% 55%)';
  const scoreColorStr = currentScore > 75 ? 'text-success' : currentScore > 50 ? 'text-warning' : 'text-risk';
  const scoreRingColor = currentScore > 75 ? 'stroke-success' : currentScore > 50 ? 'stroke-warning' : 'stroke-risk';

  // Smart Spending Data
  const SPENDING_DATA = [
    { name: 'Food', current: 5200, average: 4000, icon: '🍔' },
    { name: 'Shopping', current: 3600, average: 3200, icon: '🛍️' },
    { name: 'Transport', current: 1800, average: 1800, icon: '🚗' },
    { name: 'Subscriptions', current: 1200, average: 800, icon: '🎬' },
  ];

  const totalSpend = SPENDING_DATA.reduce((acc, curr) => acc + curr.current, 0);

  const spendingWithInsights = SPENDING_DATA.map(cat => {
    const percent = Math.round((cat.current / totalSpend) * 100);
    const trend = cat.current > (cat.average * 1.25) ? 'high' : cat.current > cat.average ? 'up' : 'stable';
    return { ...cat, percent, trend };
  });

  // Derived Personality
  const personality = useMemo(() => {
    const spendingHigh = healthMetrics.spendingControl < 70;
    const savingHigh = healthMetrics.savingConsistency > 80;
    
    if (spendingHigh && !savingHigh) return { title: 'Impulse Spender 💸', desc: 'You tend to spend frequently on lifestyle categories but lack active saving discipline.' };
    if (savingHigh && !spendingHigh) return { title: 'Smart Saver 🎯', desc: 'Highly disciplined with savings, maintaining strict control over discretionary spending.' };
    return { title: 'Balanced Builder ⚖️', desc: 'You balance enjoying life today while maintaining moderate saving discipline for tomorrow.' };
  }, [healthMetrics]);

  // Behavior Timeline
  const timeline = [
    { day: "Mon", event: "Food Overspend Detected (+24%)", type: "risk", amount: 1250 },
    { day: "Wed", event: "Salary received & 10% auto-saved", type: "positive", amount: 4000 },
    { day: "Thu", event: "3 transactions without round-ups", type: "warning", amount: 42 },
    { day: "Fri", event: "Weekend shopping spike expected", type: "risk", amount: null }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8 bg-[radial-gradient(circle_at_top_right,hsl(180_15%_96%),transparent_40%),linear-gradient(180deg,hsl(180_10%_98%),white)] dark:bg-[radial-gradient(circle_at_top_right,hsl(200_20%_12%),transparent_40%),linear-gradient(180deg,hsl(200_25%_6%),hsl(200_25%_8%))]">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
            <Activity className="w-3.5 h-3.5" /> Behavior Intelligence
          </motion.div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Insights & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-2">Diagnosing your past and present money habits</p>
        </div>

        {/* TOP LAYER: HEALTH SCORE & OPPORTUNITIES */}
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* 1. FINANCIAL HEALTH SCORE (HERO) */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-4 glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_8px_30px_hsl(200_10%_80%/.2)] dark:shadow-none">
            <h3 className="text-sm font-bold font-heading text-foreground absolute top-6 left-6 flex items-center gap-2">
               <ShieldCheck className={`w-4 h-4 ${scoreColorStr}`} /> Health Score
            </h3>
            
            <div className="relative w-48 h-48 mt-8 mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
                <motion.circle 
                  cx="50" cy="50" r="40" 
                  stroke={scoreColor} 
                  strokeWidth="8" 
                  fill="none" 
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 251.2" }}
                  animate={{ strokeDasharray: `${(currentScore / 100) * 251.2} 251.2` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                  className="text-5xl font-black font-heading text-foreground tracking-tighter"
                >
                  {currentScore}
                </motion.span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1">out of 100</span>
              </div>
            </div>

            <div className="w-full space-y-3 mt-2 px-2">
               <div className="flex justify-between items-center text-xs font-semibold">
                 <span className="text-muted-foreground">Spending Control</span>
                 <span className={healthMetrics.spendingControl > 70 ? 'text-success' : 'text-warning'}>{healthMetrics.spendingControl}%</span>
               </div>
               <div className="flex justify-between items-center text-xs font-semibold">
                 <span className="text-muted-foreground">Saving Consistency</span>
                 <span className={healthMetrics.savingConsistency > 70 ? 'text-success' : 'text-warning'}>{healthMetrics.savingConsistency}%</span>
               </div>
            </div>
          </motion.div>

          {/* 4. MISSED OPPORTUNITY ENGINE */}
          <div className="lg:col-span-8 space-y-4 flex flex-col">
            <h3 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-risk" /> Immediate Action Required
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4 flex-1">
              <motion.div layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className={`glass-card p-5 border-l-4 relative group shadow-sm hover:shadow-md transition-all ${roundUpEnabled ? 'border-l-success bg-success/5' : 'border-l-risk'}`}>
                 <div className="absolute top-4 right-4">{roundUpEnabled ? <CheckCircle2 className="w-5 h-5 text-success" /> : <Zap className="w-5 h-5 text-risk/30 group-hover:text-risk transition-colors animate-pulse" />}</div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${roundUpEnabled ? 'text-success' : 'text-risk'}`}>{roundUpEnabled ? 'Optimization Active' : 'Missed Opportunity'}</p>
                <p className="text-sm font-bold text-foreground leading-snug mb-4">
                  {roundUpEnabled ? 'Smart rounding is now active — savings optimized' : <>You missed <span className="text-risk">₹420</span> this week due to disabled round-up rules.</>}
                </p>
                {!roundUpEnabled ? (
                  <Button size="sm" onClick={handleEnableRoundup} className="w-full bg-risk hover:bg-risk/90 text-white shadow-lg shadow-risk/20 hover:-translate-y-0.5 transition-all">Enable Smart Rounding</Button>
                ) : (
                  <Button size="sm" variant="outline" className="w-full border-success text-success bg-success/10 cursor-default hover:bg-success/10 scale-100 transition-all"><CheckCircle2 className="w-4 h-4 mr-2" /> Smart Rounding Enabled</Button>
                )}
              </motion.div>

              <motion.div layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className={`glass-card p-5 border-l-4 relative group shadow-sm hover:shadow-md transition-all ${autoSweepEnabled ? 'border-l-success bg-success/5' : 'border-l-warning'}`}>
                 <div className="absolute top-4 right-4">{autoSweepEnabled ? <CheckCircle2 className="w-5 h-5 text-success" /> : <AlertTriangle className="w-5 h-5 text-warning/30 group-hover:text-warning transition-colors" />}</div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${autoSweepEnabled ? 'text-success' : 'text-warning'}`}>Optimization Alert</p>
                <p className="text-sm font-bold text-foreground leading-snug mb-4">
                  {autoSweepEnabled ? 'Auto-sweep activated — idle cash optimized' : <>Your ₹15,000 idle cash is losing <span className="text-warning">₹75/month</span> to inflation.</>}
                </p>
                {!autoSweepEnabled ? (
                  <Button size="sm" onClick={handleEnableAutoSweep} className="w-full bg-warning hover:bg-warning/90 text-white shadow-lg shadow-warning/20 hover:-translate-y-0.5 transition-all">Move to Auto-Sweep</Button>
                ) : (
                  <Button size="sm" variant="outline" className="w-full border-success text-success bg-success/10 cursor-default hover:bg-success/10 scale-100 transition-all"><CheckCircle2 className="w-4 h-4 mr-2" /> Auto-Sweep Active</Button>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* MIDDLE LAYER: BEHAVIOR & ANALYSIS */}
        <div className="grid lg:grid-cols-12 gap-6 pt-2">
          
          {/* 6. WEEKLY BEHAVIOR TIMELINE */}
          <div className="lg:col-span-4 glass-card p-6">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-base font-bold font-heading text-foreground">Behavior Timeline</h3>
               <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 border border-border/50 text-xs font-bold rounded-lg">
                 Score: {currentScore}
                 {currentScore >= previousScore ? <TrendingUp className="w-3 h-3 text-success" /> : <TrendingDown className="w-3 h-3 text-risk" />}
               </div>
            </div>

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/80 before:to-transparent">
               <AnimatePresence>
                 {timelineVisible && timeline.map((item, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: index * 0.15 }}
                      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-card shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10 ${item.type === 'positive' ? 'bg-success/20 text-success' : item.type === 'risk' ? 'bg-risk/20 text-risk' : 'bg-warning/20 text-warning'}`}>
                        {item.type === 'positive' ? <CheckCircle2 className="w-4 h-4" /> : item.type === 'risk' ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card p-3 rounded-xl border border-border/50 shadow-sm ml-4 md:ml-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground">{item.day}</span>
                          {item.amount && <span className={`text-[10px] font-bold ${item.type === 'positive' ? 'text-success' : 'text-risk'}`}>₹{item.amount}</span>}
                        </div>
                        <p className="text-xs font-medium text-foreground leading-tight">{item.event}</p>
                      </div>
                    </motion.div>
                 ))}
               </AnimatePresence>
            </div>
          </div>

          {/* 2 & 5. SMART SPENDING & RISK ALERTS */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* SPENDING ANALYSIS */}
            <div className="glass-card p-6">
              <h3 className="text-base font-bold font-heading text-foreground mb-1">Smart Spending Analysis</h3>
              <p className="text-xs text-muted-foreground mb-6">Comparing current footprint against your historical averages</p>
              
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={spendingWithInsights} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.3)' }} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', fontSize: '12px' }} />
                      <Bar dataKey="current" radius={[0, 4, 4, 0]} barSize={20}>
                        {spendingWithInsights.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.trend === 'high' ? 'hsl(0 72% 55%)' : entry.trend === 'up' ? 'hsl(38 92% 50%)' : 'hsl(174 62% 40%)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-3">
                  {spendingWithInsights.map((cat, i) => (
                    <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg border ${cat.trend === 'high' ? 'bg-risk/5 border-risk/20' : cat.trend === 'up' ? 'bg-warning/5 border-warning/20' : 'bg-muted/30 border-transparent'}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{cat.icon}</span>
                        <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-foreground">₹{cat.current.toLocaleString('en-IN')}</span>
                        <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${cat.trend === 'high' ? 'bg-risk/10 text-risk' : cat.trend === 'up' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                          {cat.trend === 'high' ? <><AlertTriangle className="w-3 h-3" /> HIGH</> : cat.trend === 'up' ? <><TrendingUp className="w-3 h-3" /> UP</> : <><CheckCircle2 className="w-3 h-3" /> OK</>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* LOWER STATS GRID */}
            <div className="grid md:grid-cols-2 gap-6 flex-1">
              
              {/* 3. FINANCIAL PERSONALITY */}
              <div className="glass-card p-5 border-t-2 border-t-primary relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform"><Brain className="w-32 h-32 text-primary" /></div>
                <h3 className="text-sm font-bold font-heading text-foreground mb-1">Financial Personality</h3>
                <p className="text-lg font-black text-primary mb-2">{personality.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{personality.desc}</p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 px-1.5 py-0.5 bg-success/10 text-success rounded text-[9px] font-bold uppercase tracking-wider">Strength</div>
                    <p className="text-xs font-semibold text-foreground">Consistent automated savings.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 px-1.5 py-0.5 bg-risk/10 text-risk rounded text-[9px] font-bold uppercase tracking-wider">Weakness</div>
                    <p className="text-xs font-semibold text-foreground">High lifestyle category creep.</p>
                  </div>
                </div>
              </div>

               {/* 7. ANTIGRAVITY THINKING: BEHAVIOR IMPACT */}
              <div className="glass-card p-5 border border-border/80 bg-[linear-gradient(135deg,hsl(200_25%_12%),hsl(200_25%_8%))] dark:bg-[linear-gradient(135deg,hsl(200_20%_8%),hsl(200_20%_4%))] relative overflow-hidden ring-1 ring-white/10 shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(0_72%_55%/.15),transparent_60%)] pointer-events-none" />
                <h3 className="text-sm font-bold font-heading text-white/90 mb-1 flex items-center gap-2 relative z-10">
                  <TrendingDown className="w-4 h-4 text-risk" /> Behavior Impact Mode
                </h3>
                
                <div className="mt-4 relative z-10">
                  <p className="text-[11px] font-semibold text-white/60 mb-1">Your habits are costing you</p>
                  <p className="text-3xl font-black tracking-tight text-white mb-3">₹3,200<span className="text-sm text-white/50 font-medium">/month</span></p>
                  
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-[10px] font-bold uppercase text-white/70 mb-2 border-b border-white/10 pb-1">What's Driving Your Drain?</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-white/90"><span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-risk"/> Food Deliveries</span> <span className="font-bold">42%</span></div>
                      <div className="flex justify-between text-xs text-white/90"><span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-warning"/> Impulse Shopping</span> <span className="font-bold">28%</span></div>
                      <div className="flex justify-between text-xs text-white/90"><span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"/> Unused Subscriptions</span> <span className="font-bold">12%</span></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
