import React, { useState, useMemo } from 'react';
import { 
  Wallet, Bell, Shield, Calculator, TrendingUp, 
  Users, Zap, Lock, CreditCard, Activity,
  ChevronRight, ArrowUpRight, CheckCircle2, Check,
  Target, Award, Fingerprint, Star, Flame, Trophy, Info,
  LogOut, Settings as SettingsIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import BrandLogo from '@/components/BrandLogo';
import { Button } from '@/components/ui/button';

/**
 * ProfileSettings Component
 * A comprehensive fintech-style profile and financial control center.
 * Features: Proportional Asset Balancing, Saving Streaks, and AI Insights.
 */
export default function ProfileSettings() {
  const { user, logout } = useAuth();
  const { wallet } = useApp();

  // --- Profile State (Derived from Auth) ---
  const userData = {
    name: user?.name || "Alex Thompson",
    bank: "HDFC Bank", // This should ideally be from onboarding/bank state
    account: "XXXX-9941",
    assets: wallet.totalSaved || 125400,
    memberSince: "March 2024"
  };

  // --- Settings State ---
  const [roundUpEnabled, setRoundUpEnabled] = useState(true);
  const [roundUpLevel, setRoundUpLevel] = useState(10);
  const [minRoundUp, setMinRoundUp] = useState(2);
  const [maxDailyCap, setMaxDailyCap] = useState(500);

  // --- Investment Allocation State (Total must equal 100%) ---
  const [allocations, setAllocations] = useState({
    gold: 30,
    etf: 30,
    index: 30,
    debt: 10
  });
  const [activeSlider, setActiveSlider] = useState(null);

  // --- Automation & Notifications ---
  const [autoInvestEnabled, setAutoInvestEnabled] = useState(true);
  const [threshold, setThreshold] = useState(500);
  const [notifications, setNotifications] = useState({
    roundup: true,
    investment: true,
    risk: true,
    groups: true,
    frequency: 'daily'
  });

  const [privacy, setPrivacy] = useState({
    dataSharing: true,
    historyAccess: true
  });

  // --- Strategy Presets ---
  const STRATEGY_PRESETS = {
    safe: { gold: 10, etf: 20, index: 20, debt: 50 },
    balanced: { gold: 25, etf: 25, index: 25, debt: 25 },
    growth: { gold: 15, etf: 45, index: 30, debt: 10 },
  };

  /**
   * PROPORTIONAL BALANCING ALGORITHM
   * When one asset is adjusted, others scale proportionally to maintain a 100% total.
   */
  const handleAllocationChange = (key, newValue) => {
    const keys = Object.keys(allocations);
    const oldValue = allocations[key];
    const delta = newValue - oldValue;
    
    const otherKeys = keys.filter(k => k !== key);
    const sumOthers = otherKeys.reduce((sum, k) => sum + allocations[k], 0);

    let newAllocations = { ...allocations, [key]: newValue };

    if (sumOthers > 0) {
      // Proportional distribution
      otherKeys.forEach(k => {
        const proportion = allocations[k] / sumOthers;
        newAllocations[k] = Math.max(0, allocations[k] - (delta * proportion));
      });
    } else {
      // Equal distribution if others were zero
      const share = delta / otherKeys.length;
      otherKeys.forEach(k => {
        newAllocations[k] = Math.max(0, allocations[k] - share);
      });
    }

    // Rounding & Sum Correction (ensuring total is exactly 100)
    const currentSum = Object.values(newAllocations).reduce((a, b) => a + b, 0);
    const error = 100 - currentSum;
    if (error !== 0) {
      const targetKey = otherKeys.sort((a, b) => newAllocations[b] - newAllocations[a])[0];
      newAllocations[targetKey] = Math.max(0, newAllocations[targetKey] + error);
    }

    // Standardize decimals for clean UI
    keys.forEach(k => {
      newAllocations[k] = Math.round(newAllocations[k] * 10) / 10;
    });

    setAllocations(newAllocations);
  };

  const applyPreset = (preset) => {
    setAllocations(STRATEGY_PRESETS[preset]);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF5] p-4 md:p-8 text-[#1E2937] font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">Control Center</h1>
            <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
              Alex Thompson <ChevronRight size={14} /> Profile & Settings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
              <CheckCircle2 size={12} />
              Bank Synced
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. Profile Header Card */}
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-100">
              <div className="h-2 bg-gradient-to-r from-emerald-500 via-blue-500 to-amber-500" />
              <div className="p-8 flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-3xl bg-emerald-600 flex items-center justify-center text-3xl font-bold text-white shadow-2xl">
                    {user.name.charAt(0)}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-white shadow-lg flex items-center justify-center border border-slate-100">
                    <Star size={16} className="text-amber-500 fill-amber-500" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <h2 className="text-3xl font-black tracking-tight">{userData.name}</h2>
                    <div className="p-1 rounded-full bg-blue-500 text-white shadow-sm ring-4 ring-blue-500/10">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">
                    <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl"><CreditCard size={14} /> {userData.bank} {userData.account}</span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-100">{userData.memberSince}</span>
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-3xl p-6 min-w-[220px]">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 opacity-70">Total Assets</p>
                  <p className="text-3xl font-black tracking-tight">₹{userData.assets.toLocaleString()}</p>
                  <div className="mt-2 flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold">
                    <ArrowUpRight size={12} /> +12.4% this month
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Saving & Round-Up Settings */}
            <div className="bg-white rounded-[2rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Zap size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-bold">Round-Up Engine</h3>
                </div>
                <input 
                  type="checkbox" 
                  checked={roundUpEnabled} 
                  onChange={(e) => setRoundUpEnabled(e.target.checked)}
                  className="w-12 h-6 rounded-full bg-slate-200 checked:bg-emerald-500 appearance-none transition-colors relative cursor-pointer before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-6 before:transition-transform"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className={`space-y-8 ${!roundUpEnabled && 'opacity-30 pointer-events-none'}`}>
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs font-black uppercase text-slate-400 tracking-widest">
                      <span>Multiplier Level</span>
                      <span className="text-emerald-600 font-black">₹{roundUpLevel}</span>
                    </div>
                    <div className="flex gap-2">
                      {[5, 10, 20, 50].map(val => (
                        <button 
                          key={val}
                          onClick={() => setRoundUpLevel(val)}
                          className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${roundUpLevel === val ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                        >
                          ₹{val}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs font-black uppercase text-slate-400 tracking-widest">
                      <span>Minimum Spare</span>
                      <span>₹{minRoundUp}</span>
                    </div>
                    <input type="range" min="1" max="10" value={minRoundUp} onChange={(e) => setMinRoundUp(Number(e.target.value))} className="w-full accent-emerald-600" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs font-black uppercase text-slate-400 tracking-widest">
                      <span>Daily Cap</span>
                      <span>₹{maxDailyCap}</span>
                    </div>
                    <input type="range" min="100" max="2000" step="100" value={maxDailyCap} onChange={(e) => setMaxDailyCap(Number(e.target.value))} className="w-full accent-emerald-600" />
                  </div>
                </div>

                <div className="bg-slate-50/50 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-emerald-600">
                    <Calculator size={32} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Live Flow Preview</p>
                    <div className="flex items-center gap-4 justify-center">
                       <span className="text-2xl font-black opacity-20">₹243</span>
                       <ChevronRight className="text-emerald-300" />
                       <span className="text-3xl font-black">₹{Math.ceil(243 / roundUpLevel) * roundUpLevel}</span>
                    </div>
                    <div className="inline-flex px-6 py-2 rounded-2xl bg-emerald-500/10 text-emerald-600 text-sm font-black mt-2">
                      +₹{Math.ceil(243 / roundUpLevel) * roundUpLevel - 243} SAVED
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Investment Allocation Section */}
            <div className="bg-white rounded-[2rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <TrendingUp size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-bold">Strategic Allocation</h3>
                </div>
                <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl">
                   {['safe', 'balanced', 'growth'].map(mode => (
                     <button 
                       key={mode}
                       onClick={() => applyPreset(mode)}
                       className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white hover:shadow-sm"
                     >
                       {mode}
                     </button>
                   ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  {[
                    { key: 'gold', label: 'Gold Fund', color: '#FCD34D' },
                    { key: 'etf', label: 'ETF Fund', color: '#6366F1' },
                    { key: 'index', label: 'Index Fund', color: '#10B981' },
                    { key: 'debt', label: 'Debt Fund', color: '#94A3B8' }
                  ].map(asset => (
                    <div key={asset.key} className="space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className={`flex items-center gap-2 ${activeSlider === asset.key ? 'text-emerald-600' : 'text-slate-400'}`}>
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: asset.color }} />
                          {asset.label}
                        </span>
                        <span>{allocations[asset.key]}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="0.5"
                        value={allocations[asset.key]} 
                        onChange={(e) => handleAllocationChange(asset.key, Number(e.target.value))}
                        onMouseDown={() => setActiveSlider(asset.key)}
                        onMouseUp={() => setActiveSlider(null)}
                        className="w-full accent-emerald-600 h-1"
                      />
                    </div>
                  ))}
                  <div className="p-4 rounded-2xl bg-emerald-50 flex items-center gap-4 mt-6">
                     <Info size={16} className="text-emerald-600" />
                     <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">Proportional Balancing Active</p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      {/* Simple SVG Donut Logic */}
                      <circle cx="50" cy="50" r="40" stroke="#F1F5F9" strokeWidth="8" fill="transparent" />
                      <circle 
                        cx="50" cy="50" r="40" 
                        stroke="#FCD34D" strokeWidth="8" fill="transparent" 
                        strokeDasharray={`${allocations.gold * 2.51} 251.2`}
                      />
                      <circle 
                        cx="50" cy="50" r="40" 
                        stroke="#10B981" strokeWidth="8" fill="transparent" 
                        strokeDasharray={`${allocations.index * 2.51} 251.2`}
                        strokeDashoffset={`-${allocations.gold * 2.51}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-[10px] font-black text-slate-400 uppercase">Target</span>
                       <span className="text-2xl font-black">100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* 2. Financial Intelligence Section */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-200">
               <div className="flex items-center gap-2 mb-8 opacity-60">
                 <Fingerprint size={16} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Financial Identity</span>
               </div>
               <div className="flex flex-col items-center py-6">
                 <div className="relative w-32 h-32 flex items-center justify-center">
                   <svg className="absolute inset-0 w-full h-full -rotate-90">
                     <circle cx="64" cy="64" r="58" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="transparent" />
                     <circle 
                        cx="64" cy="64" r="58" stroke="white" strokeWidth="8" fill="transparent" 
                        strokeDasharray={`${78 * 3.64} 364.5`} // 78 score
                        strokeLinecap="round"
                     />
                   </svg>
                   <span className="text-4xl font-black">78</span>
                 </div>
                 <h4 className="mt-6 text-lg font-bold">Smart Saver 💎</h4>
                 <p className="mt-2 text-indigo-200 text-xs text-center leading-relaxed">
                   "Increasing round-up by ₹5 can add ₹2,400 to your wealth annually."
                 </p>
               </div>
            </div>

            {/* 6. Automation Settings */}
            <div className="bg-white rounded-[2rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-100">
               <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                     <Zap size={20} />
                   </div>
                   <h3 className="text-base font-bold">Auto-Invest</h3>
                 </div>
                 <input 
                  type="checkbox" 
                  checked={autoInvestEnabled} 
                  onChange={(e) => setAutoInvestEnabled(e.target.checked)}
                  className="w-12 h-6 rounded-full bg-slate-200 checked:bg-blue-500 appearance-none transition-colors relative cursor-pointer before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-6 before:transition-transform"
                />
               </div>
               <div className="space-y-6">
                  <div className="bg-blue-50/50 p-6 rounded-3xl space-y-4 text-center">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Threshold Trigger</p>
                    <p className="text-2xl font-black">₹{threshold}</p>
                    <input type="range" min="100" max="1000" step="100" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-full accent-blue-600" />
                  </div>
                  <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-wide leading-tight">
                    You will invest ₹{Math.round(threshold * 1.8)}/month based on current spend behavior.
                  </p>
               </div>
            </div>

            {/* 7. Notification Settings */}
            <div className="bg-white rounded-[2rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-100">
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
                    <Bell size={20} />
                  </div>
                  <h3 className="text-base font-bold">Alert Pulse</h3>
               </div>
               <div className="space-y-5">
                  {[
                    { key: 'roundup', label: 'Round-up logs' },
                    { key: 'investment', label: 'Invest success' },
                    { key: 'risk', label: 'Risk exposure' }
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between">
                       <span className="text-xs font-bold text-slate-600">{item.label}</span>
                       <input 
                        type="checkbox" 
                        defaultChecked={notifications[item.key]} 
                        className="w-10 h-5 rounded-full bg-slate-200 checked:bg-emerald-500 appearance-none transition-colors relative cursor-pointer before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-transform"
                      />
                    </div>
                  ))}
                  <select className="w-full mt-4 p-3 rounded-2xl bg-slate-50 border-none text-xs font-bold focus:ring-2 focus:ring-emerald-500/20">
                     <option>Instant Alerts</option>
                     <option>Daily Summary</option>
                     <option>Weekly Report</option>
                  </select>
               </div>
            </div>

            {/* 9. Achievements Section */}
            <div className="bg-amber-100/50 rounded-[2rem] p-8 border border-amber-200">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg">
                      <Star size={20} />
                    </div>
                    <h3 className="text-base font-bold text-amber-900">Achievements</h3>
                  </div>
                  <Flame className="text-orange-500 animate-pulse" />
               </div>
               <div className="space-y-4">
                  <div className="bg-white p-5 rounded-3xl flex items-center gap-4 border border-amber-200/50">
                     <Trophy className="text-amber-500" />
                     <div>
                        <p className="text-sm font-black text-amber-900">7 Day Streak</p>
                        <p className="text-[10px] font-bold text-amber-600 uppercase">Consistent Saver</p>
                     </div>
                  </div>
                  <div className="px-2 space-y-2">
                     <div className="flex justify-between text-[10px] font-black text-amber-700 uppercase">
                        <span>Milestone: ₹1k Saved</span>
                        <span>82%</span>
                     </div>
                     <div className="h-1.5 w-full bg-amber-200/50 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: '82%' }} />
                     </div>
                  </div>
               </div>
            </div>

            {/* 8. Privacy & Security Section (Dark Theme Card) */}
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl">
               <div className="flex items-center gap-3 mb-8">
                  <Shield size={20} className="text-emerald-400" />
                  <h3 className="font-bold">Privacy Core</h3>
               </div>
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <div className="space-y-0.5">
                        <p className="text-xs font-bold">Data Sharing</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Last synced: 2m ago</p>
                     </div>
                     <input type="checkbox" defaultChecked className="w-8 h-4 rounded-full bg-slate-800 checked:bg-emerald-500 appearance-none transition-colors relative cursor-pointer before:absolute before:w-3 before:h-3 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4" />
                  </div>
                  <div className="pt-6 border-t border-slate-800 flex justify-between">
                     <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 text-[9px] font-black uppercase text-slate-400 border border-slate-700">
                        <Lock size={12} /> Encrypted
                     </div>
                     <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 text-[9px] font-black uppercase text-slate-400 border border-slate-700">
                        <Wallet size={12} /> RBI AA
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
