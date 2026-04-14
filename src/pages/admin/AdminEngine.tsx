import { motion } from 'framer-motion';
import { Cpu, CheckCircle2, XCircle, Clock } from 'lucide-react';

const logs = [
  { type: 'round-up', message: 'Round-up ₹7 applied for tx-1234', status: 'success', time: '2s ago' },
  { type: 'rule', message: 'Guilt Tax triggered: Food > ₹300 → Invest ₹50', status: 'success', time: '15s ago' },
  { type: 'invest', message: 'Auto-invest ₹500 → Nifty 50 Index Fund', status: 'success', time: '1m ago' },
  { type: 'round-up', message: 'Round-up ₹3 applied for tx-1230', status: 'success', time: '2m ago' },
  { type: 'invest', message: 'Investment gateway timeout', status: 'error', time: '5m ago' },
  { type: 'rule', message: 'Weekend Spender rule evaluated — no trigger', status: 'info', time: '8m ago' },
  { type: 'round-up', message: 'Round-up ₹2 applied for tx-1228', status: 'success', time: '10m ago' },
  { type: 'invest', message: 'Retry: Auto-invest ₹500 → Nifty 50', status: 'success', time: '5m ago' },
  { type: 'rule', message: 'Spare Overflow triggered: spare > ₹25', status: 'success', time: '12m ago' },
  { type: 'round-up', message: 'Round-up ₹9 applied for tx-1225', status: 'success', time: '15m ago' },
];

const statusIcon = { success: CheckCircle2, error: XCircle, info: Clock };
const statusColor = { success: 'text-success', error: 'text-risk', info: 'text-muted-foreground' };

export default function AdminEngine() {
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
        <Cpu className="w-6 h-6 text-primary" /> Engine Logs
      </h1>

      <div className="flex gap-2 flex-wrap">
        {['all', 'round-up', 'rule', 'invest'].map(f => (
          <span key={f} className="px-3 py-1 text-xs rounded-full bg-muted text-muted-foreground capitalize cursor-pointer hover:bg-accent transition-colors">
            {f === 'all' ? 'All Logs' : f}
          </span>
        ))}
      </div>

      <div className="glass-card divide-y divide-border">
        {logs.map((log, i) => {
          const Icon = statusIcon[log.status as keyof typeof statusIcon];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-4"
            >
              <Icon className={`w-4 h-4 mt-0.5 ${statusColor[log.status as keyof typeof statusColor]}`} />
              <div className="flex-1">
                <p className="text-sm text-foreground">{log.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground capitalize">{log.type}</span>
                  <span className="text-xs text-muted-foreground">{log.time}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
