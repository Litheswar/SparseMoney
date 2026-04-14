import { useState } from 'react';
import { motion } from 'framer-motion';
import { predictGrowth } from '@/lib/engine';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Slider } from '@/components/ui/slider';
import { Compass, TrendingUp, Coins } from 'lucide-react';

export default function UserHorizon() {
  const [months, setMonths] = useState([12]);
  const [monthly, setMonthly] = useState([800]);
  const data = predictGrowth(monthly[0], months[0]);
  const final = data[data.length - 1];

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
          <Compass className="w-6 h-6 text-primary" /> Horizon Predictor
        </h1>
        <p className="text-sm text-muted-foreground">See your financial future</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="glass-card p-5 space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Monthly Saving: ₹{monthly[0]}</label>
            <Slider value={monthly} onValueChange={setMonthly} min={100} max={5000} step={100} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Time Horizon: {months[0]} months</label>
            <Slider value={months} onValueChange={setMonths} min={3} max={24} step={1} />
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <motion.div key={final?.total} initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="text-center">
              <p className="text-xs text-muted-foreground">Projected Total</p>
              <p className="text-3xl font-bold font-heading text-gradient">₹{final?.total.toLocaleString('en-IN')}</p>
            </motion.div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-muted/30 rounded-xl p-3">
                <Coins className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Savings</p>
                <p className="text-sm font-bold text-foreground">₹{final?.savings.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-success/5 rounded-xl p-3">
                <TrendingUp className="w-4 h-4 text-success mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Returns</p>
                <p className="text-sm font-bold text-success">₹{final?.returns.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="text-base font-semibold font-heading text-foreground mb-4">Growth Projection</h3>
          <div className="h-80">
            <ResponsiveContainer>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(174 62% 40%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(174 62% 40%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(152 60% 42%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(152 60% 42%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tickFormatter={v => `M${v}`} />
                <YAxis tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
                <Area type="monotone" dataKey="total" stroke="hsl(174 62% 40%)" fill="url(#gradTotal)" strokeWidth={2} />
                <Area type="monotone" dataKey="savings" stroke="hsl(152 60% 42%)" fill="url(#gradSavings)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
