import { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Wallet, Bell, Shield, Calculator, TrendingUp, 
  Heart, Users, Zap, Lock, CreditCard, Activity,
  ChevronRight, ArrowUpRight, CheckCircle2, AlertCircle, Loader2, Check,
  Target, Award, Fingerprint, RefreshCcw, Info, Star, Flame, Trophy
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReChartsTooltip } from 'recharts';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// Custom components
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass-card p-6 hover-lift bg-white/80 backdrop-blur-xl ${className}`}
  >
    {children}
  </motion.div>
);

const SectionHeader = ({ icon: Icon, title, description }: { icon: any; title: string; description?: string }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
      <Icon size={20} strokeWidth={2.5} />
    </div>
    <div>
      <h3 className="text-base font-bold tracking-tight text-foreground leading-tight">{title}</h3>
      {description && <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">{description}</p>}
    </div>
  </div>
);

const CHART_COLORS = {
  gold: '#FCD34D', // Gold
  etf: '#6366F1',  // Blue/Indigo
  index: '#10B981', // Green
  debt: '#94A3B8',  // Grey/Slate
};

const STRATEGY_PRESETS = {
  safe: { gold: 10, etf: 20, index: 20, debt: 50 },
  balanced: { gold: 20, etf: 30, index: 30, debt: 20 },
  growth: { gold: 20, etf: 50, index: 20, debt: 10 },
};

export default function UserProfile() {
  const { user } = useAuth();
  const { wallet, updateThreshold, portfolio, automationStats, groups } = useApp();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- Core Settings State ---
  const [roundUpEnabled, setRoundUpEnabled] = useState(true);
  const [roundUpLevel, setRoundUpLevel] = useState(10);
  const [minRoundUp, setMinRoundUp] = useState(2);
  const [maxDailyCap, setMaxDailyCap] = useState(500);

  const [allocations, setAllocations] = useState({ gold: 30, etf: 30, index: 30, debt: 10 });
  const [activeSlider, setActiveSlider] = useState<string | null>(null);
  const [threshold, setThreshold] = useState(500);
  const [autoInvestEnabled, setAutoInvestEnabled] = useState(true);
  const [ruleEngineEnabled, setRuleEngineEnabled] = useState(true);
  
  const [notifications, setNotifications] = useState({
    roundup: true,
    investment: true,
    risk: true,
    groups: true,
    frequency: 'daily'
  });

  const [groupSettings, setGroupSettings] = useState({
    contribution: 5,
    activeGroupId: groups[0]?.id || ''
  });

  const [goals, setGoals] = useState({
    target: 50000,
    type: 'Trip ✈️',
    horizon: '12'
  });

  const [privacy, setPrivacy] = useState({
    dataSharing: true,
    historyAccess: true
  });

  useEffect(() => {
    // Initial data load simulation
    setTimeout(() => setLoading(false), 800);
  }, []);

  const handleSave = async (silent = true) => {
    if (!silent) setSaving(true);
    try {
      await api.profile.updateSettings({
        roundUpEnabled, roundUpLevel, minRoundUp, maxDailyCap,
        allocations, threshold, autoInvestEnabled, ruleEngineEnabled,
        notifications, groupSettings, goals, privacy
      });
      if (!silent) toast.success("Settings saved successfully");
    } catch (err) {
      if (!silent) toast.error("Failed to save settings");
    } finally {
      if (!silent) setSaving(false);
    }
  };

  const applyPreset = (preset: keyof typeof STRATEGY_PRESETS) => {
    setAllocations(STRATEGY_PRESETS[preset]);
    toast.info(`Applied ${preset.charAt(0).toUpperCase() + preset.slice(1)} strategy`);
  };

  const handleAllocationChange = (key: string, newValue: number) => {
    const keys = Object.keys(allocations) as Array<keyof typeof allocations>;
    const oldValue = allocations[key as keyof typeof allocations];
    const delta = newValue - oldValue;
    
    const otherKeys = keys.filter(k => k !== key);
    const sumOthers = otherKeys.reduce((sum, k) => sum + allocations[k], 0);

    let newAllocations = { ...allocations, [key]: newValue };

    if (sumOthers > 0) {
      otherKeys.forEach(k => {
        const proportion = allocations[k] / sumOthers;
        newAllocations[k] = Math.max(0, allocations[k] - (delta * proportion));
      });
    } else {
      const share = delta / otherKeys.length;
      otherKeys.forEach(k => {
        newAllocations[k] = Math.max(0, allocations[k] - share);
      });
    }

    // Precision and summing check
    const currentSum = Object.values(newAllocations).reduce((a, b) => a + b, 0);
    const error = 100 - currentSum;
    if (error !== 0) {
      const targetKey = otherKeys.sort((a, b) => newAllocations[b] - newAllocations[a])[0];
      newAllocations[targetKey] = Math.max(0, newAllocations[targetKey] + error);
    }

    // Final rounding to integers for clean UI if needed, or keep 1 decimal
    keys.forEach(k => {
      newAllocations[k] = Math.round(newAllocations[k] * 10) / 10;
    });

    setAllocations(newAllocations);
  };

  const chartData = useMemo(() => [
    { name: 'Gold', value: allocations.gold, color: CHART_COLORS.gold },
    { name: 'ETF', value: allocations.etf, color: CHART_COLORS.etf },
    { name: 'Index', value: allocations.index, color: CHART_COLORS.index },
    { name: 'Debt', value: allocations.debt, color: CHART_COLORS.debt },
  ], [allocations]);

  const healthScore = 78; // Calculated based on user data in a real app

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-sm font-bold text-muted-foreground animate-pulse">SYNCING SECURE DATA...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-8 px-4 sm:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground font-heading">Control Center</h1>
          <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
            Managing your automated financial identity <ChevronRight size={14} className="opacity-40" /> Settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="rounded-xl border-border/50 font-bold text-xs"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCcw className="w-3 h-3 mr-2" />}
            Sync Now
          </Button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success text-[10px] font-black uppercase tracking-widest border border-success/20">
            <CheckCircle2 size={12} />
            HDFC Synced
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section 1: Profile Header Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card overflow-hidden p-0 bg-white"
          >
            <div className="h-2 bg-gradient-to-r from-primary via-blue-500 to-amber-500 w-full" />
            <div className="p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                <div className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center text-3xl font-bold text-white shadow-2xl group-hover:scale-105 transition-transform">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-white shadow-lg flex items-center justify-center border border-border">
                  <Star size={16} className="text-amber-500 fill-amber-500" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <h2 className="text-3xl font-black tracking-tight">{user?.name || "Premium User"}</h2>
                  <div className="p-1 rounded-full bg-blue-500 text-white success-breathing">
                    <Check size={12} strokeWidth={4} />
                  </div>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold text-muted-foreground mt-2 uppercase tracking-wide">
                  <span className="flex items-center gap-1.5 bg-muted/30 px-3 py-1.5 rounded-xl"><CreditCard size={14} /> HDFC XXXX-9941</span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border">Member Since: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
              <div className="glass-card bg-primary/5 border-primary/20 p-6 min-w-[220px] shadow-none">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 opacity-70">Total Net Worth</p>
                <p className="text-3xl font-black tracking-tight">₹{((wallet?.totalInvested || 0) + (wallet?.balance || 0)).toLocaleString('en-IN')}</p>
                <div className="mt-2 flex items-center gap-1.5 text-success text-[10px] font-bold">
                  <ArrowUpRight size={12} /> +12.4% vs last month
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 3: Saving & Round-Up Settings */}
          <Card>
            <div className="flex items-center justify-between mb-8">
              <SectionHeader icon={Zap} title="Round-Up Engine" description="Real-time Spare Change Management" />
              <Switch checked={roundUpEnabled} onCheckedChange={setRoundUpEnabled} className="data-[state=checked]:bg-primary scale-110" />
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className={`space-y-8 ${!roundUpEnabled && 'opacity-40 grayscale pointer-events-none transition-all'}`}>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <span>Round-up Level</span>
                    <span className="text-primary font-black">₹{roundUpLevel} Multiplier</span>
                  </div>
                  <div className="flex gap-2">
                    {[5, 10, 20, 50].map(level => (
                      <button 
                        key={level}
                        onClick={() => setRoundUpLevel(level)}
                        className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${roundUpLevel === level ? 'gradient-primary text-white shadow-lg' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'}`}
                      >
                        ₹{level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <span>Minimum Flow</span>
                    <span className="text-foreground">₹{minRoundUp} Spare</span>
                  </div>
                  <Slider value={[minRoundUp]} max={10} min={1} step={1} onValueChange={(v) => setMinRoundUp(v[0])} />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <span>Maximum Daily Cap</span>
                    <span className="text-foreground">₹{maxDailyCap} Limit</span>
                  </div>
                  <Slider value={[maxDailyCap]} max={1000} min={100} step={100} onValueChange={(v) => setMaxDailyCap(v[0])} />
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] scale-95 group-hover:scale-100 transition-transform duration-500" />
                <div className="relative p-8 space-y-6 flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center text-primary mb-2">
                    <Calculator size={32} />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Logic Visualization</p>
                    <div className="flex items-center gap-4 justify-center">
                       <span className="text-2xl font-black opacity-30">₹243</span>
                       <ChevronRight className="text-primary opacity-50" />
                       <span className="text-3xl font-black text-foreground">₹{Math.ceil(243 / roundUpLevel) * roundUpLevel}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-2xl bg-success/10 text-success text-sm font-black mt-4">
                      +₹{Math.ceil(243 / roundUpLevel) * roundUpLevel - 243} SAVED
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center font-medium max-w-[200px] leading-relaxed">
                    Based on your transactions, you will save approximately ₹{(45 * (roundUpLevel / 5)).toLocaleString()} more this month.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Section 4: Investment Settings */}
          <Card>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <SectionHeader icon={TrendingUp} title="Strategic Allocation" description="Global Asset Distribution" />
              <div className="flex gap-1.5 p-1 bg-muted/30 rounded-2xl">
                 {(['safe', 'balanced', 'growth'] as const).map(type => (
                   <button 
                     key={type}
                     onClick={() => applyPreset(type)}
                     className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white hover:shadow-sm"
                   >
                     {type}
                   </button>
                 ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                {chartData.map((item) => (
                  <div key={item.name} className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className={`flex items-center gap-2 transition-colors ${activeSlider === item.name.toLowerCase() ? 'text-primary' : 'text-muted-foreground'}`}>
                        <div className={`w-2.5 h-2.5 rounded-full transition-transform ${activeSlider === item.name.toLowerCase() ? 'scale-125 shadow-sm' : ''}`} style={{ background: item.color }} />
                        {item.name} Fund
                      </span>
                      <span className={`font-black tabular-nums transition-all ${activeSlider === item.name.toLowerCase() ? 'text-primary scale-110' : 'text-foreground'}`}>
                        {item.value}%
                      </span>
                    </div>
                    <Slider 
                      value={[item.value]} 
                      max={100} 
                      min={0} 
                      step={0.5} 
                      onValueChange={(v) => handleAllocationChange(item.name.toLowerCase(), v[0])}
                      onPointerDown={() => setActiveSlider(item.name.toLowerCase())}
                      onPointerUp={() => setActiveSlider(null)}
                      className={`h-1.5 transition-all ${activeSlider && activeSlider !== item.name.toLowerCase() ? 'opacity-50' : ''}`}
                    />
                  </div>
                ))}
                
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4 mt-8">
                   <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                     <Info size={20} />
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-primary uppercase">Auto-Rebalancing</p>
                     <p className="text-xs text-foreground/80 font-medium">Smart engine aligns offsets once every 30 days.</p>
                   </div>
                   <Switch checked className="ml-auto" />
                </div>
              </div>

              <div className="h-64 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={chartData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={60} 
                      outerRadius={90} 
                      paddingAngle={8} 
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <ReChartsTooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontWeight: 'bold' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <p className="text-xs font-bold text-muted-foreground uppercase">Target</p>
                   <p className="text-2xl font-black">100%</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Section 5: Automation Settings */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-l-4 border-l-blue-500">
               <div className="flex items-center justify-between mb-6">
                 <SectionHeader icon={Zap} title="Invest Flow" description="Threshold Trigger" />
                 <Switch checked={autoInvestEnabled} onCheckedChange={setAutoInvestEnabled} />
               </div>
               <div className="space-y-6">
                  <div className="p-5 rounded-3xl bg-blue-50/50 space-y-4">
                     <div className="flex justify-between items-center text-xs font-black uppercase text-blue-600">
                        <span>Threshold Limit</span>
                        <span>₹{threshold}</span>
                     </div>
                     <Slider value={[threshold]} max={5000} min={100} step={100} onValueChange={(v) => {
                       setThreshold(v[0]);
                       updateThreshold(v[0]);
                     }} />
                  </div>
                  <div className="flex items-center gap-3 p-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <p className="text-[11px] font-bold text-muted-foreground">Invests automatically when wallet hits ₹{threshold}.</p>
                  </div>
               </div>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
               <div className="flex items-center justify-between mb-6">
                 <SectionHeader icon={Activity} title="Rule Engine" description="Behavioral Logic" />
                 <Switch checked={ruleEngineEnabled} onCheckedChange={setRuleEngineEnabled} />
               </div>
               <div className="space-y-6">
                  <div className="p-5 rounded-3xl bg-amber-50/50 flex flex-col items-center justify-center text-center">
                     <p className="text-[10px] font-black text-amber-600 uppercase mb-2">Simulated Impact</p>
                     <p className="text-2xl font-black">₹{(automationStats?.projectedMonthlyContribution || 0).toLocaleString()} <span className="text-xs opacity-50">/ mo</span></p>
                     <p className="text-[10px] text-muted-foreground mt-2 font-medium">Based on current rule parameters.</p>
                  </div>
                  <Button variant="outline" className="w-full rounded-2xl border-amber-200 text-amber-700 font-bold text-xs h-10 hover:bg-amber-50">
                    Audit Active Rules
                  </Button>
               </div>
            </Card>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Section 2: Financial Intelligence Section */}
          <Card className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-none shadow-indigo-200">
            <h3 className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <Fingerprint size={14} /> Intelligence Profile
            </h3>
            
            <div className="flex flex-col items-center gap-8 py-4">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full rotate-[-90deg]">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/10" />
                  <circle 
                    cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" 
                    className="text-white"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * healthScore) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black">{healthScore}</span>
                  <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase mt-1">Health Score</span>
                </div>
                <div className="absolute top-0 right-0 w-8 h-8 rounded-full bg-white text-indigo-700 flex items-center justify-center shadow-lg animate-progress-ripple">
                  <Award size={18} />
                </div>
              </div>

              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-xs font-black uppercase tracking-tighter backdrop-blur-md">
                   Smart Saver 💎
                </div>
                <p className="text-white/60 text-[11px] font-medium max-w-[240px] leading-relaxed mx-auto">
                  "Increasing your round-up by ₹5 can add ₹2,400 to your wealth annually."
                </p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
               <div>
                  <p className="text-[9px] font-black text-white/40 uppercase mb-1">Efficiency</p>
                  <p className="font-bold">Top 5%</p>
               </div>
               <div>
                  <p className="text-[9px] font-black text-white/40 uppercase mb-1">Risk Profile</p>
                  <p className="font-bold">Moderate</p>
               </div>
            </div>
          </Card>

          {/* Section 6: Notification Settings */}
          <Card>
            <SectionHeader icon={Bell} title="Pulse Alerts" description="Communications Engine" />
            <div className="space-y-4">
              {[
                { id: 'roundup', label: 'Round-up Alerts', desc: 'Real-time spare change logs' },
                { id: 'investment', label: 'Investment Alerts', desc: 'Threshold & buy confirmations' },
                { id: 'risk', label: 'Market Risk Alerts', desc: 'Volatility & rebalance pings' },
                { id: 'groups', label: 'Group Contribution', desc: 'Team goals & leaderboard' },
              ].map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/5">
                  <div>
                    <p className="text-xs font-black text-foreground">{item.label}</p>
                    <p className="text-[9px] text-muted-foreground font-medium">{item.desc}</p>
                  </div>
                  <Switch 
                    checked={(notifications as any)[item.id]} 
                    onCheckedChange={(v) => setNotifications(prev => ({ ...prev, [item.id]: v }))}
                  />
                </div>
              ))}
              
              <div className="pt-4 space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-2">Sync Frequency</label>
                <Select value={notifications.frequency} onValueChange={(v) => setNotifications(prev => ({ ...prev, frequency: v }))}>
                  <SelectTrigger className="w-full rounded-2xl border-border/50 h-11 font-bold text-xs bg-muted/20">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/50 shadow-xl overflow-hidden backdrop-blur-xl">
                    <SelectItem value="instant">Instant Real-time</SelectItem>
                    <SelectItem value="daily">Daily Summary</SelectItem>
                    <SelectItem value="weekly">Weekly Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Section 10: Achievements & Progress */}
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
             <div className="flex items-center justify-between mb-8">
               <SectionHeader icon={Star} title="Rewards" description="Financial Milestones" />
               <div className="flex -space-x-2">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-amber-500 flex items-center justify-center text-white shadow-sm">
                     <Trophy size={14} />
                   </div>
                 ))}
               </div>
             </div>
             
             <div className="space-y-6">
                <div className="p-5 rounded-3xl bg-white/60 border border-amber-200 shadow-sm flex items-center gap-5">
                   <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white">
                        <Flame size={28} />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white">
                        HOT
                      </div>
                   </div>
                   <div>
                      <p className="text-2xl font-black text-amber-900 tracking-tighter">12 Days Active</p>
                      <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Savings Streak</p>
                   </div>
                </div>

                <div className="space-y-4 px-2">
                  <div className="flex justify-between text-[10px] font-black uppercase text-amber-800">
                    <span>Next Milestone: 1k Project</span>
                    <span>78%</span>
                  </div>
                  <Progress value={78} className="h-2 bg-white/50" color="#D97706" />
                </div>
             </div>
          </Card>

          {/* Section 8: Privacy & Security (Dark Card) */}
          <Card className="glass-card-dark text-white p-8">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                 <Lock size={24} />
               </div>
               <div>
                 <h3 className="text-lg font-black tracking-tight leading-tight">Security Protocol</h3>
                 <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">Last synced: 2 mins ago</p>
               </div>
            </div>

            <div className="space-y-5 mb-8">
               <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-xs font-bold">Encrypted Data Sharing</p>
                    <p className="text-[9px] text-white/40">Enable 256-bit AES protection</p>
                  </div>
                  <Switch checked={privacy.dataSharing} onCheckedChange={(v) => setPrivacy(prev => ({ ...prev, dataSharing: v }))} />
               </div>
               <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-xs font-bold">Transaction History Stream</p>
                    <p className="text-[9px] text-white/40">Live bank sync via AA</p>
                  </div>
                  <Switch checked={privacy.historyAccess} onCheckedChange={(v) => setPrivacy(prev => ({ ...prev, historyAccess: v }))}/>
               </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-white/30 px-2 pt-4 border-t border-white/5">
               <span className="flex items-center gap-1.5"><Shield size={14} className="text-success" /> RBI AA Compliant</span>
               <span className="flex items-center gap-1.5"><Shield size={14} className="text-blue-400" /> AES-256</span>
            </div>
          </Card>

        </div>
      </div>

      {/* FOOTER SECTIONS (Groups & Goals) */}
      <div className="grid lg:grid-cols-2 gap-8">
         {/* Section 7: Group Settings */}
         <Card>
            <div className="flex items-center justify-between mb-8">
              <SectionHeader icon={Users} title="Social Wealth" description="Community Contribution" />
              <Button variant="ghost" className="rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-muted text-primary">
                View All Groups
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-10">
               <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-black uppercase text-muted-foreground">
                      <span>Default Contribution</span>
                      <span className="text-primary">{groupSettings.contribution}% of Spare</span>
                    </div>
                    <Slider 
                      value={[groupSettings.contribution]} max={25} min={1} step={1} 
                      onValueChange={(v) => setGroupSettings(prev => ({ ...prev, contribution: v[0] }))}
                    />
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/10">
                     <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Active Goal Focus</p>
                     <p className="text-sm font-bold truncate">{groups.find(g => g.id === groupSettings.activeGroupId)?.name || "Europe Adventure ✈️"}</p>
                  </div>
               </div>
               <div className="flex flex-col justify-center items-center text-center p-6 bg-primary/5 rounded-[2.5rem] border border-primary/10">
                  <Users className="text-primary mb-4" size={32} />
                  <p className="text-xs font-bold text-muted-foreground mb-4 leading-relaxed">Join thousands in collaborative saving goals with top creators.</p>
                  <Button className="w-full rounded-2xl gradient-primary text-white shadow-lg h-11 font-black text-xs uppercase tracking-widest">
                    Explore Hub
                  </Button>
               </div>
            </div>
         </Card>

         {/* Section 9: Goals & Planning */}
         <Card>
            <SectionHeader icon={Target} title="Future Projection" description="Personalized Goal Targets" />
            <div className="grid md:grid-cols-2 gap-8">
               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-2">Current Focus</label>
                    <Select value={goals.type} onValueChange={(v) => setGoals(prev => ({ ...prev, type: v }))}>
                      <SelectTrigger className="w-full rounded-2xl border-border/50 h-11 font-bold text-xs bg-muted/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border/50 shadow-xl overflow-hidden backdrop-blur-xl">
                        <SelectItem value="Emergency Fund 🛡️">Emergency Fund 🛡️</SelectItem>
                        <SelectItem value="Trip ✈️">Trip ✈️</SelectItem>
                        <SelectItem value="Big Buy 🏎️">Big Buy 🏎️</SelectItem>
                        <SelectItem value="Freedom 🕊️">Financial Freedom 🕊️</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-2">Time Horizon</label>
                    <div className="flex gap-2">
                       {['3', '6', '12', '24'].map(m => (
                         <button 
                           key={m}
                           onClick={() => setGoals(prev => ({ ...prev, horizon: m }))}
                           className={`flex-1 py-3 rounded-2xl text-[10px] font-black transition-all ${goals.horizon === m ? 'bg-foreground text-white shadow-lg' : 'bg-muted/30 text-muted-foreground shadow-sm hover:bg-muted/50'}`}
                         >
                           {m}M
                         </button>
                       ))}
                    </div>
                  </div>
               </div>
               <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-foreground text-white rounded-[2.5rem]">
                   <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                     <div className="text-2xl font-bold">?</div>
                   </div>
                   <div className="text-center">
                      <p className="text-2xl font-black">₹{(goals.target).toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Target for {goals.horizon} months</p>
                   </div>
                   <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-white w-1/3" />
                   </div>
               </div>
            </div>
         </Card>
      </div>
    </div>
  );
}
