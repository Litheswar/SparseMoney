import { motion } from 'framer-motion';
import { FileText, Shield, Eye } from 'lucide-react';

const auditLogs = [
  { action: 'USER_LOGIN', user: 'arjun@email.com', details: 'Login from Chrome/MacOS', time: '2m ago', ip: '103.42.xx.xx' },
  { action: 'CONSENT_GRANTED', user: 'ravi@email.com', details: 'Bank AA consent: HDFC, 12mo duration', time: '5m ago', ip: '49.36.xx.xx' },
  { action: 'INVESTMENT_EXEC', user: 'system', details: 'Auto-invest ₹500 → Nifty 50 for U-1234', time: '8m ago', ip: 'internal' },
  { action: 'RULE_MODIFIED', user: 'admin@sparesmart.com', details: 'Guilt Tax threshold changed: ₹300 → ₹250', time: '15m ago', ip: '103.42.xx.xx' },
  { action: 'CONSENT_REVOKED', user: 'sneha@email.com', details: 'Revoked investment data access for SBI', time: '22m ago', ip: '182.73.xx.xx' },
  { action: 'DATA_EXPORT', user: 'admin@sparesmart.com', details: 'Exported transaction CSV (34,291 records)', time: '1h ago', ip: '103.42.xx.xx' },
  { action: 'USER_SIGNUP', user: 'new@email.com', details: 'New user registration, email verified', time: '2h ago', ip: '157.48.xx.xx' },
  { action: 'SYSTEM_UPDATE', user: 'system', details: 'Rule engine v2.3 deployed', time: '4h ago', ip: 'internal' },
];

const actionColors: Record<string, string> = {
  USER_LOGIN: 'bg-primary/10 text-primary',
  CONSENT_GRANTED: 'bg-success/10 text-success',
  CONSENT_REVOKED: 'bg-warning/10 text-warning',
  INVESTMENT_EXEC: 'bg-success/10 text-success',
  RULE_MODIFIED: 'bg-accent text-accent-foreground',
  DATA_EXPORT: 'bg-muted text-muted-foreground',
  USER_SIGNUP: 'bg-primary/10 text-primary',
  SYSTEM_UPDATE: 'bg-muted text-muted-foreground',
};

export default function AdminAudit() {
  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
        <FileText className="w-6 h-6 text-primary" /> Audit Logs
      </h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="kpi-card text-center">
          <FileText className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold font-heading text-foreground">1,247</p>
          <p className="text-xs text-muted-foreground">Total Logs Today</p>
        </div>
        <div className="kpi-card text-center">
          <Shield className="w-5 h-5 text-success mx-auto mb-2" />
          <p className="text-2xl font-bold font-heading text-foreground">98.2%</p>
          <p className="text-xs text-muted-foreground">Compliance Score</p>
        </div>
        <div className="kpi-card text-center">
          <Eye className="w-5 h-5 text-warning mx-auto mb-2" />
          <p className="text-2xl font-bold font-heading text-foreground">3</p>
          <p className="text-xs text-muted-foreground">Consent Changes</p>
        </div>
      </div>

      <div className="glass-card divide-y divide-border">
        {auditLogs.map((log, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 flex items-start gap-3"
          >
            <span className={`text-xs font-mono px-2 py-1 rounded-lg whitespace-nowrap ${actionColors[log.action] || 'bg-muted text-muted-foreground'}`}>
              {log.action}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{log.details}</p>
              <p className="text-xs text-muted-foreground mt-1">{log.user} · {log.ip} · {log.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
