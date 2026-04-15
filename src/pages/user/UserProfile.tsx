import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { Bell, Shield, Wallet, Calculator, Loader2, CreditCard, Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
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

export default function UserProfile() {
  const { user } = useAuth();
  const { updateThreshold } = useApp();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [threshold, setThreshold] = useState(500);
  const [allocations, setAllocations] = useState<Allocation[]>(DEFAULT_ALLOCATIONS);
  const [totalInvested, setTotalInvested] = useState(0);
  const [settings, setSettings] = useState({
    notify_roundup: true,
    notify_investment: true,
    notify_weekly: true,
    notify_risk: false,
  });

  // Debounce timer ref for auto-save
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    async function load() {
      try {
        const [s, a, w] = await Promise.all([
          api.profile.getSettings(),
          api.wallet.allocations(),
          api.wallet.get(),
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
        setTotalInvested(w?.totalInvested || 0);
      } catch (err) {
        console.error('Profile load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // --- Debounced save to backend ---
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
    updateThreshold(v); // propagate instantly to wallet progress bar on dashboard
    scheduleSave(v, settings);
  };

  const handleAllocationChange = (name: string, val: number[]) => {
    setAllocations(prev => prev.map(a => a.name === name ? { ...a, percentage: val[0] } : a));
  };

  const handleNotificationChange = (key: keyof typeof settings, v: boolean) => {
    const next = { ...settings, [key]: v };
    setSettings(next);
    scheduleSave(threshold, next);
  };

  const totalAllocation = allocations.reduce((s, a) => s + a.percentage, 0);

  const generateUPI = () => {
    if (!user?.name) return '';
    return `${user.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10)}@sparesmart`;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Save Indicator */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading text-foreground">Profile & Settings</h1>
        <div className="flex items-center gap-2 text-sm">
          {saving && <span className="text-muted-foreground flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving...</span>}
          {saved && !saving && <span className="text-success flex items-center gap-1"><Check className="w-3 h-3" /> Saved</span>}
        </div>
      </div>

      {/* Profile Card */}
      <div className="glass-card p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
          {user?.name?.charAt(0)}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">{user?.name}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {user?.bankName} · {user?.maskedAccount}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-lg px-3 py-2">
          <CreditCard className="w-4 h-4 text-primary" />
          <div>
            <p className="text-[10px] text-muted-foreground">UPI ID</p>
            <p className="text-xs font-bold font-mono text-primary">{user?.upiId || generateUPI()}</p>
          </div>
        </div>
      </div>

      {/* Investment Allocation */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold font-heading text-foreground">Investment Allocation</h3>
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${totalAllocation === 100 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
            {totalAllocation}% / 100%
          </span>
        </div>
        <div className="space-y-5">
          {allocations.map(a => (
            <div key={a.name}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-foreground font-medium">{a.label}</span>
                <span className="text-primary font-bold">{a.percentage}%</span>
              </div>
              <Slider
                value={[a.percentage]}
                onValueChange={(val) => handleAllocationChange(a.name, val)}
                min={0}
                max={100}
                step={5}
                className="cursor-pointer"
              />
            </div>
          ))}
        </div>
        {totalAllocation !== 100 && (
          <p className="text-xs text-warning mt-3">⚠ Total allocation should equal 100%. Adjust sliders accordingly.</p>
        )}
      </div>

      {/* Auto-Invest Threshold */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-base font-semibold font-heading text-foreground">Auto-Invest Threshold</h3>
        </div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground">Invest automatically when wallet reaches</p>
          <span className="text-lg font-bold text-primary">₹{threshold.toLocaleString('en-IN')}</span>
        </div>
        <Slider
          value={[threshold]}
          onValueChange={handleThresholdChange}
          min={100}
          max={5000}
          step={50}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>₹100</span>
          <span>₹5,000</span>
        </div>
      </div>

      {/* Tax Planner */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-primary" />
          <h3 className="text-base font-semibold font-heading text-foreground">Tax Planner</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/30 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">Section 80C</p>
            <p className="text-lg font-bold text-foreground">₹{totalInvested.toLocaleString('en-IN')}</p>
            <p className="text-xs text-muted-foreground">of ₹1,50,000</p>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full gradient-primary rounded-full transition-all"
                style={{ width: `${Math.min((totalInvested / 150000) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className="bg-muted/30 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">Section 80D</p>
            <p className="text-lg font-bold text-foreground">₹0</p>
            <p className="text-xs text-muted-foreground">of ₹25,000</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-base font-semibold font-heading text-foreground">Notifications</h3>
        </div>
        <div className="space-y-4">
          {([
            { key: 'notify_roundup' as const, label: 'Round-up alerts', desc: 'Get notified on every round-up' },
            { key: 'notify_investment' as const, label: 'Investment triggers', desc: 'Alert when auto-invest fires' },
            { key: 'notify_weekly' as const, label: 'Weekly reports', desc: 'Weekly savings summary' },
            { key: 'notify_risk' as const, label: 'Risk warnings', desc: 'Unusual activity alerts' },
          ]).map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
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
  );
}
