import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { UserCircle, Bell, Shield, Wallet, Calculator, Loader2, CreditCard } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function UserProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    auto_invest_threshold: 500,
    notify_roundup: true,
    notify_investment: true,
    notify_weekly: true,
    notify_risk: false,
  });
  const [allocations, setAllocations] = useState<{ name: string; percentage: number }[]>([]);
  const [totalInvested, setTotalInvested] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [s, a, w] = await Promise.all([
          api.profile.getSettings(),
          api.wallet.allocations(),
          api.wallet.get(),
        ]);
        setSettings({
          auto_invest_threshold: Number(s.auto_invest_threshold) || 500,
          notify_roundup: s.notify_roundup ?? true,
          notify_investment: s.notify_investment ?? true,
          notify_weekly: s.notify_weekly ?? true,
          notify_risk: s.notify_risk ?? false,
        });
        setAllocations(a || []);
        setTotalInvested(w.totalInvested || 0);
      } catch (err) {
        console.error('Profile load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const generateUPI = () => {
    if (!user?.name) return '';
    return `${user.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10)}@sparesmart`;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Profile & Settings</h1>
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
        {user?.upiId && (
          <div className="hidden sm:flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-lg px-3 py-2">
            <CreditCard className="w-4 h-4 text-primary" />
            <div>
              <p className="text-[10px] text-muted-foreground">UPI ID</p>
              <p className="text-xs font-bold font-mono text-primary">{user.upiId || generateUPI()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Allocation */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-primary" />
          <h3 className="text-base font-semibold font-heading text-foreground">Investment Allocation</h3>
        </div>
        {allocations.length > 0 ? (
          allocations.map(a => (
            <div key={a.name} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground capitalize">{a.name}</span>
                <span className="text-muted-foreground">{a.percentage}%</span>
              </div>
              <Slider value={[a.percentage]} min={0} max={100} step={5} disabled />
            </div>
          ))
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {[{ key: 'gold', label: 'Gold ETF', val: 30 }, { key: 'index', label: 'Index Fund', val: 40 }, { key: 'debt', label: 'Debt Fund', val: 20 }, { key: 'fd', label: 'Fixed Deposit', val: 10 }].map(a => (
              <div key={a.key} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground">{a.label}</span>
                  <span className="text-muted-foreground">{a.val}%</span>
                </div>
                <Slider value={[a.val]} min={0} max={100} step={5} disabled />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Threshold */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-base font-semibold font-heading text-foreground">Auto-Invest Threshold</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">Invest automatically when wallet reaches ₹{settings.auto_invest_threshold}</p>
        <Slider value={[settings.auto_invest_threshold]} min={100} max={5000} step={50} disabled />
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
        <div className="space-y-3">
          {([
            { key: 'notify_roundup', label: 'Round-up alerts' },
            { key: 'notify_investment', label: 'Investment triggers' },
            { key: 'notify_weekly', label: 'Weekly reports' },
            { key: 'notify_risk', label: 'Risk warnings' },
          ] as const).map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-sm text-foreground">{item.label}</span>
              <Switch checked={settings[item.key]} onCheckedChange={v => setSettings(s => ({ ...s, [item.key]: v }))} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
