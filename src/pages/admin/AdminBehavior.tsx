import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, PolarRadiusAxis, PieChart, Pie, Cell } from 'recharts';

const spendingPatterns = [
  { day: 'Mon', amount: 2400 },
  { day: 'Tue', amount: 1800 },
  { day: 'Wed', amount: 3200 },
  { day: 'Thu', amount: 2100 },
  { day: 'Fri', amount: 4500 },
  { day: 'Sat', amount: 5200 },
  { day: 'Sun', amount: 3800 },
];

const segments = [
  { name: 'Smart Savers', value: 42, color: 'hsl(152 60% 42%)' },
  { name: 'Balanced', value: 35, color: 'hsl(174 62% 40%)' },
  { name: 'Spenders', value: 23, color: 'hsl(38 92% 50%)' },
];

const behaviorRadar = [
  { trait: 'Consistency', score: 75 },
  { trait: 'Saving Rate', score: 68 },
  { trait: 'Investment', score: 52 },
  { trait: 'Discipline', score: 80 },
  { trait: 'Risk Mgmt', score: 65 },
];

export default function AdminBehavior() {
  return (
    <div className="max-w-6xl space-y-6">
      <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
        <Activity className="w-6 h-6 text-primary" /> User Behavior Analytics
      </h1>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-base font-semibold font-heading text-foreground mb-4">Spending by Day</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={spendingPatterns}>
                <XAxis dataKey="day" />
                <YAxis tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={(v: number) => `₹${v}`} />
                <Bar dataKey="amount" fill="hsl(174 62% 40%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-base font-semibold font-heading text-foreground mb-4">User Segmentation</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={segments} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={4}>
                  {segments.map((s, i) => <Cell key={i} fill={s.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {segments.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-muted-foreground">{s.name} ({s.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-base font-semibold font-heading text-foreground mb-4">Behavior Radar</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <RadarChart data={behaviorRadar}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="trait" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar dataKey="score" stroke="hsl(174 62% 40%)" fill="hsl(174 62% 40%)" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-base font-semibold font-heading text-foreground mb-4">Key Trends</h3>
          <div className="space-y-3">
            {[
              { label: 'Avg round-up per user', value: '₹7.2', trend: '+5%' },
              { label: 'Active rule usage', value: '68%', trend: '+12%' },
              { label: 'Investment conversion rate', value: '34%', trend: '+8%' },
              { label: 'Weekly retention', value: '87%', trend: '+2%' },
              { label: 'Avg wallet threshold', value: '₹480', trend: '-3%' },
            ].map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-sm text-foreground">{t.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{t.value}</span>
                  <span className={`text-xs ${t.trend.startsWith('+') ? 'text-success' : 'text-risk'}`}>{t.trend}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
