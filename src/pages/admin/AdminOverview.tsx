import { motion } from 'framer-motion';
import { Users, ArrowLeftRight, Coins, TrendingUp, Activity, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const stats = [
  { label: 'Total Users', value: '2,847', change: '+12%', icon: Users, gradient: 'gradient-primary' },
  { label: 'Transactions', value: '34,291', change: '+8%', icon: ArrowLeftRight, gradient: 'gradient-success' },
  { label: 'Spare Collected', value: '₹4,82,100', change: '+15%', icon: Coins, gradient: 'gradient-primary' },
  { label: 'Total Invested', value: '₹12,34,000', change: '+22%', icon: TrendingUp, gradient: 'gradient-success' },
];

const chartData = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`,
  users: 2000 + Math.floor(Math.random() * 800 + i * 30),
  transactions: 800 + Math.floor(Math.random() * 400 + i * 15),
  spare: 10000 + Math.floor(Math.random() * 5000 + i * 500),
}));

export default function AdminOverview() {
  return (
    <div className="max-w-6xl space-y-6">
      <h1 className="text-2xl font-bold font-heading text-foreground">Admin Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="kpi-card"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg ${s.gradient} flex items-center justify-center`}>
                <s.icon className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
            <p className="text-xl font-bold font-heading text-foreground">{s.value}</p>
            <p className="text-xs text-success mt-1">{s.change} this month</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-base font-semibold font-heading text-foreground mb-4">User Growth (30d)</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="hsl(174 62% 40%)" fill="hsl(174 62% 40% / 0.15)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-base font-semibold font-heading text-foreground mb-4">System Health</h3>
          <div className="space-y-3">
            {[
              { name: 'Round-Up Engine', status: 'Healthy', uptime: '99.98%' },
              { name: 'Investment Gateway', status: 'Healthy', uptime: '99.95%' },
              { name: 'Rule Engine', status: 'Healthy', uptime: '100%' },
              { name: 'Transaction Processor', status: 'Healthy', uptime: '99.99%' },
              { name: 'Notification Service', status: 'Healthy', uptime: '99.97%' },
            ].map(s => (
              <div key={s.name} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-sm text-foreground">{s.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{s.uptime}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
