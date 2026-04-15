import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Wallet, Bell, Shield, Calculator, TrendingUp, 
  Heart, Users, Zap, Lock, CreditCard, Activity,
  ChevronRight, ArrowUpRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/automation';

export default function UserProfile() {
  const { user } = useAuth();
  const { 
    wallet, groups, portfolio, notificationSettings, 
    updateNotificationSettings, automationStats 
  } = useApp();
  
  const [allocation, setAllocation] = useState({ gold: 30, index: 40, debt: 20, fd: 10 });
  const [threshold, setThreshold] = useState([500]);
  const [consent, setConsent] = useState({ transactions: true, balance: true, profile: true });

  const totalGroupSavings = useMemo(() => 
    groups.reduce((sum, g) => {
      const myMember = g.members.find(m => m.userId === 'u1');
      return sum + (myMember?.totalContributed || 0);
    }, 0),
  [groups]);

  const netWorth = wallet.balance + wallet.totalInvested + totalGroupSavings;

  const chartData = useMemo(() => [
    { name: 'Gold ETF', value: allocation.gold, color: '#FCD34D' },
    { name: 'Index Fund', value: allocation.index, color: '#10B981' },
    { name: 'Debt Fund', value: allocation.debt, color: '#6366F1' },
    { name: 'Fixed Deposit', value: allocation.fd, color: '#94A3B8' },
  ], [allocation]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-6xl mx-auto space-y-8 pb-12"
    >
      {/* 1. PROFILE HEADER */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl p-1">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent animate-gradient-x" />
        <div className="glass-card relative p-8 flex flex-col md:flex-row items-center gap-8 border-none bg-background/40 backdrop-blur-xl">
          <div className="relative">
            <motion.div 
              animate={{ boxShadow: ["0 0 0 0px rgba(16, 185, 129, 0)", "0 0 0 10px rgba(16, 185, 129, 0.1)", "0 0 0 0px rgba(16, 185, 129, 0)"] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center text-4xl font-bold text-primary-foreground shadow-2xl"
            >
              {user?.name?.charAt(0)}
            </motion.div>
            <div className="absolute -bottom-2 -right-2 bg-background p-1.5 rounded-full shadow-lg border border-border">
              <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-3xl font-bold font-heading tracking-tight">{user?.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-primary" />
                {user?.bankName} ({user?.maskedAccount})
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-primary" />
                Verified Account
              </span>
            </div>
          </div>

          <div className="glass-card bg-primary/10 border-primary/20 p-6 rounded-2xl min-w-[240px]">
            <p className="text-xs uppercase tracking-wider font-bold text-primary/70 mb-1">Total Net Worth</p>
            <motion.h2 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-4xl font-black text-foreground"
            >
              {formatCurrency(netWorth)}
            </motion.h2>
            <div className="flex items-center gap-2 mt-2 text-sm font-semibold text-green-500">
              <TrendingUp className="w-4 h-4" />
              +₹3,200 (7.4%) this month
            </div>
          </div>
        </div>
      </motion.div>

      {/* 8. ANTIGRAVITY THINKING (Next Level Stats) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Financial Health', value: 'Well Balanced', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Group Impact', value: `${Math.round((totalGroupSavings / netWorth) * 100)}% of Savings`, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Automation Score', value: '94/100', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants} className="glass-card p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight">{stat.label}</p>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* 2. ASSET OVERVIEW & GROUP INTEGRATION */}
          <motion.div variants={itemVariants} className="glass-card p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-heading">Asset Distribution</h3>
              </div>
              <span className="text-sm font-medium text-muted-foreground">Portfolio Snapshot</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Main Holdings</p>
                {[
                  { label: 'Index Fund', value: wallet.totalInvested * (allocation.index / 100), color: 'bg-emerald-500' },
                  { label: 'Gold ETF', value: wallet.totalInvested * (allocation.gold / 100), color: 'bg-amber-400' },
                  { label: 'Debt Fund', value: wallet.totalInvested * (allocation.debt / 100), color: 'bg-indigo-500' },
                  { label: 'Fixed Deposits', value: wallet.totalInvested * (allocation.fd / 100), color: 'bg-slate-400' },
                ].map((asset, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-foreground">{asset.label}</span>
                      <span className="font-mono">{formatCurrency(asset.value)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(asset.value / netWorth) * 100}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={`h-full ${asset.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Group Investments</p>
                {groups.length > 0 ? (
                  <div className="space-y-5">
                    {groups.map((group, i) => {
                      const userContr = group.members.find(m => m.userId === 'u1')?.totalContributed || 0;
                      return (
                        <div key={group.id} className="p-4 rounded-xl bg-muted/30 border border-border/50 group hover:border-primary/30 transition-colors">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{group.emoji}</span>
                              <span className="font-bold">{group.name}</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-primary">{formatCurrency(userContr)}</span>
                          </div>
                          <Progress value={(group.totalSaved / group.goalAmount) * 100} className="h-1" />
                        </div>
                      );
                    })}
                    <div className="pt-2 flex justify-between items-center bg-primary/5 p-3 rounded-lg border border-primary/10">
                      <span className="text-xs font-bold text-primary italic">Total in Groups</span>
                      <span className="text-sm font-black">{formatCurrency(totalGroupSavings)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-muted/20 rounded-2xl border-2 border-dashed border-border text-muted-foreground italic text-sm">
                    No active group contributions
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* 4. AUTOMATION CONTROL CENTER */}
          <motion.div variants={itemVariants} className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-heading">Automation Control</h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3" />
                Engines Active
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-5 rounded-2xl bg-muted/40 border-2 border-transparent hover:border-primary/10 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold mb-1">Auto-Invest Flow</h4>
                    <p className="text-xs text-muted-foreground">Threshold: ₹{threshold[0]}</p>
                  </div>
                  <Switch checked className="data-[state=checked]:bg-primary" />
                </div>
                <Slider value={threshold} onValueChange={setThreshold} min={100} max={5000} step={50} />
              </div>

              <div className="p-5 rounded-2xl bg-muted/40 border-2 border-transparent hover:border-primary/10 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold mb-1">Smart Round-ups</h4>
                    <p className="text-xs text-muted-foreground">₹10 multiplier active</p>
                  </div>
                  <Switch checked className="data-[state=checked]:bg-primary" />
                </div>
                <div className="flex gap-2">
                  {['₹1', '₹5', '₹10', 'Next ₹50'].map(v => (
                    <button key={v} className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all ${v === '₹10' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Active Rules', count: automationStats.activeRules, detail: 'Dynamic filters' },
                { label: 'Monthly Saved', count: formatCurrency(automationStats.thisMonthSaved), detail: 'Projected' },
                { label: 'Triggers', count: automationStats.totalTriggers, detail: 'Past 30 days' },
              ].map((m, i) => (
                <div key={i} className="p-4 rounded-xl border border-border bg-background/50 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-black mb-1">{m.label}</p>
                  <p className="text-xl font-bold">{m.count}</p>
                  <p className="text-[10px] text-primary mt-1 font-bold">{m.detail}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 5. CONSENT & DATA CONTROL */}
          <motion.div variants={itemVariants} className="glass-card p-8 bg-slate-900 border-slate-800">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Shield className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold font-heading text-white">Consent & Data Security</h3>
            </div>

            <div className="space-y-4 mb-8">
              {[
                { id: 'transactions', label: 'Transaction History', desc: 'Allow SpareSmart to fetch real-time spend data' },
                { id: 'balance', label: 'Account Balance', desc: 'Visible for threshold-based auto-investing' },
                { id: 'profile', label: 'Identity Information', desc: 'Required for KYC and account verification' },
              ].map((c) => (
                <div key={c.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all">
                  <div>
                    <p className="text-sm font-bold text-slate-200">{c.label}</p>
                    <p className="text-[10px] text-slate-400">{c.desc}</p>
                  </div>
                  <Switch 
                    checked={consent[c.id as keyof typeof consent]} 
                    onCheckedChange={(v) => setConsent(prev => ({ ...prev, [c.id]: v }))}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>
              ))}
            </div>

            <button className="w-full py-4 rounded-xl border-2 border-dashed border-slate-700 text-slate-400 text-xs font-bold uppercase hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group">
              <Lock className="w-3 h-3 group-hover:text-rose-500 transition-colors" />
              Revoke Account Aggregator Permissions
            </button>
          </motion.div>
        </div>

        <div className="space-y-8">
          {/* 3. INVESTMENT ALLOCATION PIE */}
          <motion.div variants={itemVariants} className="glass-card p-8">
            <h3 className="text-lg font-bold mb-6 text-center">Visual Allocation</h3>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 mt-6">
              {Object.entries(allocation).map(([key, val]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="text-foreground">{val}%</span>
                  </div>
                  <Slider
                    value={[val]}
                    onValueChange={v => setAllocation(a => ({ ...a, [key]: v[0] }))}
                    className="h-1.5"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* 6. TAX & SAVINGS PLANNER */}
          <motion.div variants={itemVariants} className="glass-card p-8 bg-gradient-to-br from-indigo-900 to-slate-900 border-indigo-500/20">
            <div className="flex items-center gap-3 mb-6">
              <Calculator className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">Tax Savings Hub</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>SECTION 80C</span>
                  <span>₹94,000 / ₹1.5L</span>
                </div>
                <Progress value={(94000/150000)*100} className="h-1.5 bg-slate-800" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>SECTION 80D (Health)</span>
                  <span>₹0 / ₹25k</span>
                </div>
                <Progress value={0} className="h-1.5 bg-slate-800" />
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs">
                <div className="flex gap-2 font-bold mb-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Action Suggested
                </div>
                Invest ₹56,000 more in ELSS to maximize Section 80C benefits before March 31.
              </div>
              
              <Sheet>
                <SheetTrigger asChild>
                  <button className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20">
                    Explore Tax Saving Instruments
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[400px] sm:w-[540px] border-l border-border bg-background p-0 overflow-hidden flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />
                  
                  <div className="p-8 pb-4 relative">
                    <SheetHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-indigo-500/20 rounded-xl">
                          <Calculator className="w-6 h-6 text-indigo-500" />
                        </div>
                        <SheetTitle className="text-2xl font-bold font-heading">Tax Instruments</SheetTitle>
                      </div>
                      <SheetDescription className="text-muted-foreground text-sm">
                        Explore and allocate funds into highly rated Section 80C instruments to maximize your tax savings.
                      </SheetDescription>
                    </SheetHeader>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 pt-2 space-y-6 scrollbar-none relative">
                    {[
                      { name: 'Equity Linked Savings Scheme (ELSS)', desc: 'Mutual funds investing primarily in stocks.', returns: '12-15% p.a.', lockIn: '3 Years', risk: 'High', color: 'indigo' },
                      { name: 'Public Provident Fund (PPF)', desc: 'Government-backed low-risk savings scheme.', returns: '7.1% p.a.', lockIn: '15 Years', risk: 'Low', color: 'emerald' },
                      { name: 'National Pension System (NPS)', desc: 'Voluntary retirement savings scheme.', returns: '9-12% p.a.', lockIn: 'Till Age 60', risk: 'Moderate', color: 'blue' },
                      { name: '5-Year Tax Saver FD', desc: 'Fixed deposits provided by registered banks.', returns: '6-7.5% p.a.', lockIn: '5 Years', risk: 'Low', color: 'amber' },
                    ].map((inst, i) => (
                      <div key={i} className="group relative overflow-hidden rounded-2xl border border-border bg-muted/20 p-5 hover:border-indigo-500/30 hover:bg-muted/40 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-foreground pr-4 leading-tight">{inst.name}</h4>
                          <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-${inst.color}-500/10 text-${inst.color}-500 whitespace-nowrap`}>
                            {inst.lockIn}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">
                          {inst.desc}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Expected Returns</p>
                            <p className="font-mono font-bold text-sm text-foreground">{inst.returns}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold text-right">Risk Factor</p>
                            <p className="text-sm font-bold text-right text-foreground">{inst.risk}</p>
                          </div>
                        </div>

                        <button className="w-full mt-5 py-2.5 rounded-lg bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 transition-colors opacity-90 group-hover:opacity-100 flex items-center justify-center gap-2">
                          Invest Now <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-6 border-t border-border bg-muted/10">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 text-amber-500 text-xs font-medium">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p>Investments are subject to market risks. Read all scheme related documents carefully before investing.</p>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </motion.div>

          {/* 7. NOTIFICATIONS & ALERTS */}
          <motion.div variants={itemVariants} className="glass-card p-8">
            <div className="flex items-center gap-3 mb-8">
              <Bell className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Preferences</h3>
            </div>

            <div className="space-y-6">
              {[
                { key: 'thresholdAlerts', label: 'Investment Alerts', icon: Activity },
                { key: 'lowBalanceAlerts', label: 'Risk & Safety', icon: Shield },
                { key: 'streakNotifications', label: 'Group activity', icon: Users },
                { key: 'insightNotifications', label: 'Financial Reports', icon: TrendingUp },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                      <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {item.label}
                    </span>
                  </div>
                  <Switch 
                    checked={notificationSettings[item.key as keyof typeof notificationSettings]} 
                    onCheckedChange={v => updateNotificationSettings({ [item.key]: v })} 
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              <button className="w-full flex items-center justify-between text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group">
                Advanced Security Settings
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
