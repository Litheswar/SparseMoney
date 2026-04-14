import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Shield } from 'lucide-react';

const anomalies = [
  { severity: 'high', user: 'U-4821', desc: 'Spending spike: ₹12,400 in 2 hours (3x normal)', time: '10m ago', category: 'Spending Spike' },
  { severity: 'medium', user: 'U-2193', desc: 'Unusual transaction pattern: 8 food orders in 1 hour', time: '25m ago', category: 'Suspicious Activity' },
  { severity: 'low', user: 'U-7734', desc: 'Transport cost 180% above weekly average', time: '1h ago', category: 'Risk Alert' },
  { severity: 'high', user: 'U-1102', desc: 'Large withdrawal followed by multiple micro-transactions', time: '2h ago', category: 'Suspicious Activity' },
  { severity: 'medium', user: 'U-5590', desc: 'Shopping spend exceeding monthly budget by 45%', time: '3h ago', category: 'Spending Spike' },
];

const severityColors = { high: 'bg-risk/10 border-risk/30 text-risk', medium: 'bg-warning/10 border-warning/30 text-warning', low: 'bg-muted border-border text-muted-foreground' };

export default function AdminAnomaly() {
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-warning" /> Anomaly Detection
      </h1>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Alerts', value: '3', icon: AlertTriangle, color: 'text-risk' },
          { label: 'Resolved Today', value: '12', icon: Shield, color: 'text-success' },
          { label: 'Flagged Users', value: '5', icon: TrendingUp, color: 'text-warning' },
        ].map((s, i) => (
          <div key={i} className="kpi-card text-center">
            <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
            <p className="text-2xl font-bold font-heading text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {anomalies.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-card p-4 border ${severityColors[a.severity as keyof typeof severityColors]}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{a.desc}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{a.category}</span>
                  <span className="text-xs text-muted-foreground">{a.user}</span>
                  <span className="text-xs text-muted-foreground">{a.time}</span>
                </div>
              </div>
              <span className={`text-xs font-medium uppercase px-2 py-1 rounded-lg ${
                a.severity === 'high' ? 'bg-risk/20 text-risk' : a.severity === 'medium' ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground'
              }`}>{a.severity}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
