import { motion } from 'framer-motion';
import { SPENDING_CATEGORIES } from '@/lib/engine';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, PolarRadiusAxis } from 'recharts';
import { AlertTriangle, TrendingDown, Brain, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { Slider } from '@/components/ui/slider';

const radarData = [
  { trait: 'Saving', score: 78 },
  { trait: 'Spending', score: 62 },
  { trait: 'Investing', score: 45 },
  { trait: 'Discipline', score: 70 },
  { trait: 'Risk', score: 35 },
  { trait: 'Consistency', score: 82 },
];

export default function UserInsights() {
  const [simulateMonthly, setSimulateMonthly] = useState([500]);
  const yearResult = simulateMonthly[0] * 12 * 1.12;

  const personality = radarData.find(d => d.trait === 'Saving')!.score > 70 ? 'Smart Saver 💰' : 'Balanced Spender 🎯';

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Insights & Analytics</h1>
        <p className="text-sm text-muted-foreground">Understand your financial behavior</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <div className="glass-card p-5">
          <h3 className="text-base font-semibold font-heading text-foreground mb-4">Spending by Category</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={SPENDING_CATEGORIES} layout="vertical">
                <XAxis type="number" tickFormatter={v => `₹${v}`} />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
                <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                  {SPENDING_CATEGORIES.map((c, i) => (
                    <motion.rect key={i} fill={c.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Personality */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold font-heading text-foreground">Financial Personality</h3>
          </div>
          <div className="text-center mb-3">
            <span className="text-2xl font-bold font-heading text-foreground">{personality}</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="trait" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* What-If Simulator */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-warning" />
            <h3 className="text-base font-semibold font-heading text-foreground">What-If Simulator</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">If you saved ₹{simulateMonthly[0]}/month:</p>
          <Slider
            value={simulateMonthly}
            onValueChange={setSimulateMonthly}
            min={100}
            max={5000}
            step={100}
            className="mb-6"
          />
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-muted/30 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">6 Months</p>
              <p className="text-lg font-bold text-foreground">₹{Math.round(simulateMonthly[0] * 6 * 1.06).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-accent/50 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">1 Year</p>
              <p className="text-lg font-bold text-primary">₹{Math.round(yearResult).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">2 Years</p>
              <p className="text-lg font-bold text-foreground">₹{Math.round(simulateMonthly[0] * 24 * 1.25).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Missed Opportunities + Risk */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-5 h-5 text-warning" />
              <h3 className="text-base font-semibold font-heading text-foreground">Missed Opportunities</h3>
            </div>
            <div className="space-y-2">
              {[
                { desc: '3 transactions without round-up rules', amount: '₹42' },
                { desc: 'Weekend overspend not captured', amount: '₹180' },
                { desc: 'Subscription optimization possible', amount: '₹99/mo' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-warning/5 border border-warning/20">
                  <span className="text-sm text-foreground">{item.desc}</span>
                  <span className="text-sm font-bold text-warning">{item.amount}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-risk" />
              <h3 className="text-base font-semibold font-heading text-foreground">Risk Alerts</h3>
            </div>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-risk/5 border border-risk/20 text-sm text-foreground">
                Food spending up 23% this week
              </div>
              <div className="p-3 rounded-xl bg-warning/5 border border-warning/20 text-sm text-foreground">
                Transport costs above monthly average
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
