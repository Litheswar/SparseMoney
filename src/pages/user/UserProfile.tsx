import { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function UserProfile() {
  const { user } = useAuth();
  const { notificationSettings, updateNotificationSettings } = useApp();
  const [threshold, setThreshold] = useState([500]);
  const [allocation, setAllocation] = useState({ gold: 30, index: 40, debt: 20, fd: 10 });

  const settingLabels: Record<keyof typeof notificationSettings, string> = {
    thresholdAlerts: 'Investment Success Alerts',
    lowBalanceAlerts: 'Low Balance Warnings',
    failedDeductions: 'Failed Deduction Alerts',
    streakNotifications: 'Streak & Habits',
    insightNotifications: 'Smart Financial Insights',
  };

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
        <div>
          <h2 className="text-lg font-semibold text-foreground">{user?.name}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {user?.bankName} · {user?.maskedAccount}
          </p>
        </div>
      </div>

      {/* Allocation */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-primary" />
          <h3 className="text-base font-semibold font-heading text-foreground">Investment Allocation</h3>
        </div>
        {Object.entries(allocation).map(([key, val]) => (
          <div key={key} className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-foreground capitalize">{key === 'fd' ? 'Fixed Deposit' : key === 'index' ? 'Index Fund' : key === 'gold' ? 'Gold ETF' : 'Debt Fund'}</span>
              <span className="text-muted-foreground">{val}%</span>
            </div>
            <Slider
              value={[val]}
              onValueChange={v => setAllocation(a => ({ ...a, [key]: v[0] }))}
              min={0}
              max={100}
              step={5}
            />
          </div>
        ))}
      </div>

      {/* Threshold */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-base font-semibold font-heading text-foreground">Auto-Invest Threshold</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">Invest automatically when wallet reaches ₹{threshold[0]}</p>
        <Slider value={threshold} onValueChange={setThreshold} min={100} max={5000} step={50} />
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
            <p className="text-lg font-bold text-foreground">₹9,400</p>
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
          <h3 className="text-base font-semibold font-heading text-foreground">Notification Preferences</h3>
        </div>
        <div className="space-y-4">
          {Object.entries(notificationSettings).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-foreground">
                  {settingLabels[key as keyof typeof notificationSettings]}
                </span>
                <p className="text-[10px] text-muted-foreground">
                  {key === 'thresholdAlerts' ? 'Get notified when your savings hit the goal' :
                   key === 'lowBalanceAlerts' ? 'Alert when your account is running low' :
                   key === 'failedDeductions' ? 'Alerts for failed automated transactions' :
                   key === 'streakNotifications' ? 'Encouragement for your saving streaks' :
                   'Personalized tips based on your spending'}
                </p>
              </div>
              <Switch 
                checked={val} 
                onCheckedChange={v => updateNotificationSettings({ [key]: v })} 
                className="data-[state=checked]:bg-primary"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
