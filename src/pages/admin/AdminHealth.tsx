import { motion } from 'framer-motion';
import { Bell, CheckCircle2, AlertTriangle, XCircle, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const metrics = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  latency: 20 + Math.floor(Math.random() * 30),
  errors: Math.floor(Math.random() * 3),
  throughput: 150 + Math.floor(Math.random() * 100),
}));

const alerts = [
  { type: 'resolved', message: 'Investment gateway timeout resolved', time: '5m ago' },
  { type: 'warning', message: 'High memory usage on rule engine (82%)', time: '12m ago' },
  { type: 'resolved', message: 'Database connection pool restored', time: '1h ago' },
  { type: 'error', message: 'Failed to process 2 transactions (retried)', time: '2h ago' },
  { type: 'resolved', message: 'CDN cache invalidation completed', time: '3h ago' },
];

const alertIcons = { resolved: CheckCircle2, warning: AlertTriangle, error: XCircle };
const alertColors = { resolved: 'text-success', warning: 'text-warning', error: 'text-risk' };

export default function AdminHealth() {
  return (
    <div className="max-w-6xl space-y-6">
      <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
        <Bell className="w-6 h-6 text-primary" /> System Health
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Uptime', value: '99.98%', status: 'good' },
          { label: 'Avg Latency', value: '34ms', status: 'good' },
          { label: 'Error Rate', value: '0.02%', status: 'good' },
          { label: 'Active Users', value: '342', status: 'good' },
        ].map((m, i) => (
          <div key={i} className="kpi-card text-center">
            <p className="text-2xl font-bold font-heading text-foreground">{m.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
            <div className="w-2 h-2 rounded-full bg-success mx-auto mt-2" />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-base font-semibold font-heading text-foreground mb-4">Latency (24h)</h3>
          <div className="h-52">
            <ResponsiveContainer>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} unit="ms" />
                <Tooltip />
                <Line type="monotone" dataKey="latency" stroke="hsl(174 62% 40%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-base font-semibold font-heading text-foreground mb-4">Throughput (24h)</h3>
          <div className="h-52">
            <ResponsiveContainer>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} unit="/s" />
                <Tooltip />
                <Line type="monotone" dataKey="throughput" stroke="hsl(152 60% 42%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-base font-semibold font-heading text-foreground mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> Live Alerts
        </h3>
        <div className="space-y-2">
          {alerts.map((a, i) => {
            const Icon = alertIcons[a.type as keyof typeof alertIcons];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
              >
                <Icon className={`w-4 h-4 ${alertColors[a.type as keyof typeof alertColors]}`} />
                <span className="text-sm text-foreground flex-1">{a.message}</span>
                <span className="text-xs text-muted-foreground">{a.time}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
