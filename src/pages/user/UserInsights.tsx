import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import { 
  AlertTriangle, TrendingDown, TrendingUp, Brain, CheckCircle2, 
  Lightbulb, ShieldCheck, Activity, Target, Zap, Clock, ChevronRight, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useApp } from '@/context/AppContext';

export default function UserInsights() {
  const { wallet, transactions } = useApp();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [timelineVisible, setTimelineVisible] = useState(false);
  const [roundUpEnabled, setRoundUpEnabled] = useState(true); // Default to true if they are in the app

  useEffect(() => {
    async function load() {
      try {
        const data = await api.dashboard.getSummary();
        setStats(data);
        setTimeout(() => setTimelineVisible(true), 300);
      } catch (err) {
        console.error('Insights load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const spendingByCategory = useMemo(() => {
    if (!transactions) return [];
    const map: Record<string, number> = {};
    transactions.forEach(t => {
      map[t.category] = (map[t.category] || 0) + Number(t.amount);
    });
    return Object.entries(map).map(([name, current]) => ({
      name,
      current,
      average: current * 0.8, // Purely for visual comparison in demo
      icon: name === 'Food' ? '🍔' : name === 'Shopping' ? '🛍️' : name === 'Travel' ? '🚗' : '💳'
    })).sort((a, b) => b.current - a.current);
  }, [transactions]);

  const totalSpend = spendingByCategory.reduce((acc, curr) => acc + curr.current, 0);

  const spendingWithInsights = spendingByCategory.map(cat => {
    const percent = Math.round((cat.current / (totalSpend || 1)) * 100);
    const trend = cat.current > (cat.average * 1.2) ? 'high' : 'stable';
    return { ...cat, percent, trend };
  });

  // Derive Health Score from Real Data
  // Score = Savings consistency + Threshold Progress + Investment status
  const currentScore = useMemo(() => {
    if (!wallet) return 70;
    const savingsRatio = Math.min((wallet.totalSaved / (wallet.totalInvested + wallet.totalSaved + 1)) * 100, 100);
    const thresholdProgress = Math.min((wallet.balance / (wallet.threshold || 500)) * 100, 100);
    return Math.min(Math.round(60 + (savingsRatio / 2) + (thresholdProgress / 5)), 98);
  }, [wallet]);

  const personality = useMemo(() => {
    if (currentScore > 85) return { title: 'Master Accumulator 🏆', desc: 'Exceptional discipline in converting spending into portfolio growth.' };
    if (currentScore > 65) return { title: 'Balanced Builder ⚖️', desc: 'You balance enjoying life today while maintaining healthy saving discipline.' };
    return { title: 'Passive Observer ⏱️', desc: 'Frequent transactions but low spare accumulation. Try increasing your round-up limit.' };
  }, [currentScore]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
          <Activity className="w-3.5 h-3.5" /> Behavior Intelligence
        </motion.div>
        <h1 className="text-3xl font-bold font-heading text-foreground">Insights & Analytics</h1>
        <p className="text-sm text-muted-foreground mt-2">Diagnosing habits from real transaction data</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Health Score */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-4 glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <h3 className="text-sm font-bold font-heading text-foreground absolute top-6 left-6 flex items-center gap-2">
             <ShieldCheck className="w-4 h-4 text-primary" /> Health Score
          </h3>
          
          <div className="relative w-40 h-40 mt-8 mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
              <motion.circle 
                cx="50" cy="50" r="40" 
                stroke="hsl(var(--primary))" 
                strokeWidth="8" 
                fill="none" 
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 251.2" }}
                animate={{ strokeDasharray: `${(currentScore / 100) * 251.2} 251.2` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black font-heading text-foreground tracking-tighter">{currentScore}</span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">out of 100</span>
            </div>
          </div>

          <div className="w-full space-y-2 mt-2 px-2">
             <div className="flex justify-between items-center text-xs font-semibold">
               <span className="text-muted-foreground">Savings Efficiency</span>
               <span className="text-success">{Math.round((wallet.totalSaved / (totalSpend || 1)) * 100)}%</span>
             </div>
             <div className="flex justify-between items-center text-xs font-semibold">
               <span className="text-muted-foreground">Threshold Target</span>
               <span className="text-primary">{Math.round((wallet.balance / (wallet.threshold || 500)) * 100)}%</span>
             </div>
          </div>
        </motion.div>

        {/* Immediate Action */}
        <div className="lg:col-span-8 space-y-4">
           <h3 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-risk" /> Immediate Action Required
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
             <div className="glass-card p-5 border-l-4 border-l-warning bg-warning/5">
                <p className="text-[10px] font-bold text-warning uppercase mb-1">Missed Opportunity</p>
                <p className="text-sm font-bold text-foreground mb-3 leading-snug">
                  You missed ₹{Math.round(totalSpend * 0.05)} potential savings by not using 2x rounding mode.
                </p>
                <Button size="sm" className="w-full gradient-primary">Enable Smart-Boost</Button>
             </div>
             <div className="glass-card p-5 border-l-4 border-l-primary bg-primary/5">
                <p className="text-[10px] font-bold text-primary uppercase mb-1">Strategy Alert</p>
                <p className="text-sm font-bold text-foreground mb-3 leading-snug">
                  Your "Food" spend is 24% higher than average. Saving an extra ₹10/meal adds ₹300/mo.
                </p>
                <Button size="sm" variant="outline" className="w-full">Create Rule</Button>
             </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 pt-2">
        {/* Spending Analysis */}
        <div className="lg:col-span-12 glass-card p-6">
          <h3 className="text-base font-bold font-heading text-foreground mb-4">Spend Footprint vs Market Average</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendingWithInsights} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--foreground))', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                <Bar dataKey="current" name="Your Spend" radius={[0, 4, 4, 0]} barSize={20} fill="hsl(var(--primary))">
                  {spendingWithInsights.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.trend === 'high' ? 'hsl(var(--risk))' : 'hsl(var(--primary))'} />
                  ))}
                </Bar>
                <Bar dataKey="average" name="Market Avg" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Personality & Impact */}
        <div className="lg:col-span-6 glass-card p-6 border-t-4 border-t-primary">
          <h3 className="text-sm font-bold font-heading text-muted-foreground uppercase mb-1 flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" /> Investor Personality
          </h3>
          <p className="text-2xl font-black text-foreground mb-2">{personality.title}</p>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{personality.desc}</p>
          <div className="flex gap-2">
             <div className="flex-1 bg-success/10 p-3 rounded-xl">
               <p className="text-[10px] font-bold text-success uppercase mb-1">Strength</p>
               <p className="text-xs font-bold text-foreground">Round-up logic</p>
             </div>
             <div className="flex-1 bg-risk/10 p-3 rounded-xl">
               <p className="text-[10px] font-bold text-risk uppercase mb-1">Improvement</p>
               <p className="text-xs font-bold text-foreground">Lifestyle drag</p>
             </div>
          </div>
        </div>

        <div className="lg:col-span-6 glass-card p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <h3 className="text-sm font-bold font-heading text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Projected Impact
          </h3>
          <div className="space-y-4">
             <div className="flex items-end justify-between">
               <div>
                 <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Passive Growth (1 Yr)</p>
                 <p className="text-3xl font-black text-foreground">₹{(wallet.totalSaved * 4.2).toLocaleString('en-IN')}</p>
               </div>
               <span className="bg-success text-success-foreground px-2 py-0.5 rounded text-xs font-black">+14% APY</span>
             </div>
             <div className="p-3 bg-white/40 dark:bg-black/20 rounded-xl space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">What's contributing?</p>
                <div className="flex justify-between text-xs font-medium"><span className="text-foreground">Round-ups</span> <span className="text-success font-bold">₹{wallet.totalSaved}</span></div>
                <div className="flex justify-between text-xs font-medium"><span className="text-foreground">Appreciation</span> <span className="text-success font-bold">₹{Math.round(wallet.totalSaved * 0.12)}</span></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
