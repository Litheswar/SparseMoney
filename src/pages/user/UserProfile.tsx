import { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Wallet, Bell, Shield, Calculator, TrendingUp, 
  Heart, Users, Zap, Lock, CreditCard, Activity,
  ChevronRight, ArrowUpRight, CheckCircle2, AlertCircle, Loader2, Check
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { api } from '@/lib/api';

interface Allocation {
  name: string;
  label: string;
  percentage: number;
}

const DEFAULT_ALLOCATIONS: Allocation[] = [
  { name: 'gold', label: 'Gold ETF', percentage: 30 },
  { name: 'index', label: 'Index Fund', percentage: 40 },
  { name: 'debt', label: 'Debt Fund', percentage: 20 },
  { name: 'fd', label: 'Fixed Deposit', percentage: 10 },
];

const LABEL_MAP: Record<string, string> = {
  gold: 'Gold ETF',
  index: 'Index Fund',
  debt: 'Debt Fund',
  fd: 'Fixed Deposit',
};

const CHART_COLORS: Record<string, string> = {
  gold: '#FCD34D',
  index: '#10B981',
  debt: '#6366F1',
  fd: '#94A3B8',
};

export default function UserProfile() {
  const { user } = useAuth();
  const { wallet, updateThreshold } = useApp();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [threshold, setThreshold] = useState(500);
  const [allocations, setAllocations] = useState<Allocation[]>(DEFAULT_ALLOCATIONS);
  const [settings, setSettings] = useState({
    notify_roundup: true,
    notify_investment: true,
    notify_weekly: true,
    notify_risk: false,
  });

  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    async function load() {
      try {
        const [s, a] = await Promise.all([
          api.profile.getSettings(),
          api.wallet.allocations(),
        ]);
        setThreshold(Number(s?.auto_invest_threshold) || 500);
        setSettings({
          notify_roundup: s?.notify_roundup ?? true,
          notify_investment: s?.notify_investment ?? true,
          notify_weekly: s?.notify_weekly ?? true,
          notify_risk: s?.notify_risk ?? false,
        });
        if (a && a.length > 0) {
          setAllocations(
            a.map((item: any) => ({
              name: item.name,
              label: LABEL_MAP[item.name] || item.name,
              percentage: Number(item.percentage),
            }))
          );
        }
      } catch (err) {
        console.error('Profile load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const scheduleSave = (newThreshold: number, newSettings: typeof settings) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        await api.profile.updateSettings({
          auto_invest_threshold: newThreshold,
          ...newSettings,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        console.error('Save settings error:', err);
      } finally {
        setSaving(false);
      }
    }, 700);
  };

  const handleThresholdChange = (val: number[]) => {
    const v = val[0];
    setThreshold(v);
    updateThreshold(v);
    scheduleSave(v, settings);
  };

  const handleAllocationChange = (name: string, val: number[]) => {
    setAllocations(prev => prev.map(a => a.name === name ? { ...a, percentage: val[0] } : a));
    // Allocation save would typically be a separate button in a real app or auto-save here
  };

  const handleNotificationChange = (key: keyof typeof settings, v: boolean) => {
    const next = { ...settings, [key]: v };
    setSettings(next);
    scheduleSave(threshold, next);
  };

  const chartData = useMemo(() => allocations.map(a => ({
    name: a.label,
    value: a.percentage,
    color: CHART_COLORS[a.name] || '#94A3B8'
  })), [allocations]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold font-heading">Profile & Settings</h1>
           <p className="text-sm text-muted-foreground mt-1 text-[11px] uppercase tracking-widest font-bold">Real-time Account Intelligence</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold">
          {saving && <span className="text-muted-foreground flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving Changes</span>}
          {saved && !saving && <span className="text-success flex items-center gap-1.5 bg-success/10 px-3 py-1.5 rounded-full"><Check className="w-3.5 h-3.5" /> All Settings Synced</span>}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-8 space-y-8">
          {/* Header Card */}
          <div className="glass-card p-8 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-r from-primary/5 to-transparent">
             <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center text-3xl font-bold text-white shadow-xl">
               {user?.name?.charAt(0)}
             </div>
             <div className="flex-1 text-center md:text-left">
               <h2 className="text-2xl font-bold">{user?.name}</h2>
               <div className="flex flex-wrap gap-4 text-xs font-medium text-muted-foreground mt-2">
                  <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> {user?.bankName} ({user?.maskedAccount})</span>
                  <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-success" /> Verified Account</span>
               </div>
             </div>
             <div className="glass-card bg-primary/10 border-primary/20 p-5 min-w-[200px]">
                <p className="text-[10px] font-black text-primary opacity-70 uppercase mb-1">Current Assets</p>
                <p className="text-3xl font-black">₹{(wallet.totalInvested + wallet.balance).toLocaleString('en-IN')}</p>
             </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
             {/* Rules Control */}
             <div className="glass-card p-6 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg"><Zap className="w-4 h-4 text-primary" /></div>
                  <h3 className="text-sm font-bold uppercase tracking-wider">Automation Control</h3>
                </div>
                <div className="p-4 rounded-xl bg-muted/40 space-y-4">
                   <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold">Auto-Invest Flow</p>
                        <p className="text-[10px] text-muted-foreground tracking-tight">Triggers at ₹{threshold}</p>
                      </div>
                      <Switch checked className="data-[state=checked]:bg-primary" />
                   </div>
                   <Slider value={[threshold]} onValueChange={handleThresholdChange} min={100} max={5000} step={100} />
                </div>
                <div className="p-4 rounded-xl bg-muted/20 flex items-center justify-between border border-border/10">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-success/10 rounded-full text-success"><Activity className="w-4 h-4" /></div>
                     <div>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase">Round-up Logic</p>
                       <p className="text-sm font-bold text-foreground">Standard ₹10 Multiplier</p>
                     </div>
                   </div>
                   <ArrowUpRight className="w-4 h-4 text-primary" />
                </div>
             </div>

             {/* Notifications */}
             <div className="glass-card p-6 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg"><Bell className="w-4 h-4 text-primary" /></div>
                  <h3 className="text-sm font-bold uppercase tracking-wider">Communication</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { key: 'notify_roundup' as const, label: 'Round-up Alerts', desc: 'Real-time spare change logs' },
                    { key: 'notify_investment' as const, label: 'Auto-Investments', desc: 'Execute notifications' },
                    { key: 'notify_weekly' as const, label: 'Performance Reports', desc: 'Weekly growth highlights' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-2">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-foreground">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch 
                        checked={settings[item.key]} 
                        onCheckedChange={v => handleNotificationChange(item.key, v)}
                      />
                    </div>
                  ))}
                </div>
             </div>
          </div>

          {/* Consent */}
          <div className="glass-card p-6 bg-slate-900 border-slate-800">
             <div className="flex items-center gap-3 mb-6">
               <Shield className="w-5 h-5 text-blue-500" />
               <h3 className="text-sm font-bold text-white uppercase tracking-widest">Consent & Data Security</h3>
             </div>
             <p className="text-[11px] text-slate-400 mb-6 leading-relaxed">
               Your financial data is encrypted through Account Aggregator (AA) framework. You can revoke permissions at any time, which will pause all automation engines.
             </p>
             <div className="flex gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
               <div className="flex-1">
                 <p className="text-xs font-bold text-slate-200">Financial History Access</p>
                 <p className="text-[10px] text-slate-500">Enable real-time bank transaction streaming</p>
               </div>
               <Switch checked className="data-[state=checked]:bg-blue-500" />
             </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          {/* Allocation Pie */}
          <div className="glass-card p-8 bg-gradient-to-b from-white to-primary/5">
             <h3 className="text-base font-bold text-center mb-6">Strategic Allocation</h3>
             <div className="h-52 w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={8} dataKey="value">
                      {chartData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="space-y-4">
                {allocations.map(a => (
                  <div key={a.name} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                       <span className="text-muted-foreground flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[a.name] }} />
                         {a.label}
                       </span>
                       <span className="text-foreground">{a.percentage}%</span>
                    </div>
                    <Slider value={[a.percentage]} onValueChange={v => handleAllocationChange(a.name, v)} className="h-1" />
                  </div>
                ))}
             </div>
          </div>

          {/* Tax Savings */}
          <div className="glass-card p-6 bg-slate-900 border-none relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Calculator className="w-20 h-20 text-white" /></div>
             <div className="relative z-10">
                <h3 className="text-sm font-black text-white uppercase tracking-tighter mb-4">Section 80C Summary</h3>
                <div className="space-y-4">
                   <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
                        <span>Utilization</span>
                        <span>₹{wallet.totalInvested.toLocaleString('en-IN')} / 1.5L</span>
                      </div>
                      <Progress value={(wallet.totalInvested / 150000) * 100} className="h-2 bg-slate-800" />
                   </div>
                   <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                      <p className="text-[10px] font-bold text-indigo-300">Strategy Hint</p>
                      <p className="text-[11px] text-white mt-1 leading-snug">Redirecting your ₹10 spare change into ELSS will cover this gap in 24 months.</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
