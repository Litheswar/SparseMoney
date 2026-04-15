import React from 'react';
import { motion } from 'framer-motion';
import { Rule, formatCurrency } from '@/lib/automation';
import { Power, Zap, AlertTriangle, Target } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface AutomationStatusProps {
  rules: Rule[];
  onToggleRule: (id: string) => void;
}

export const AutomationStatus: React.FC<AutomationStatusProps> = ({ rules, onToggleRule }) => {
  const activeRules = rules.filter(r => r.enabled);
  const totalSaved = activeRules.reduce((sum, r) => sum + r.monthlyExecutedAmount, 0);

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold font-heading text-foreground">Automation Engine</h3>
          <p className="text-xs text-muted-foreground">Managing {activeRules.length} active rules</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xl font-bold text-primary">{formatCurrency(totalSaved)}</span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Saved this month</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rules.map((rule) => (
          <motion.div
            key={rule.id}
            whileHover={{ y: -2 }}
            className={`p-4 rounded-2xl border transition-all ${
              rule.enabled 
                ? 'bg-primary/5 border-primary/20 shadow-lg' 
                : 'bg-white/5 border-white/5 opacity-60'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 rounded-lg ${rule.enabled ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                {rule.category === 'round-up' ? <Zap className="w-4 h-4" /> : <Target className="w-4 h-4" />}
              </div>
              <Switch 
                checked={rule.enabled} 
                onCheckedChange={() => onToggleRule(rule.id)}
              />
            </div>
            
            <h4 className="text-sm font-bold text-foreground mb-1">{rule.name}</h4>
            <div className="space-y-2 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">Impact</span>
                <span className={`text-[10px] font-bold ${rule.enabled ? 'text-primary' : 'text-muted-foreground'}`}>
                  {formatCurrency(rule.totalExecutedAmount)} total
                </span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (rule.monthlyExecutedAmount / 1000) * 100)}%` }}
                  className={`h-full ${rule.enabled ? 'bg-primary' : 'bg-muted-foreground'}`}
                />
              </div>
              <p className="text-[10px] text-muted-foreground italic truncate">
                {rule.enabled ? `Active since ${new Date(rule.createdAt).toLocaleDateString()}` : 'Paused'}
              </p>
            </div>
          </motion.div>
        ))}
        
        {/* Missed Potential Alert */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-2xl border border-destructive/20 bg-destructive/5 flex flex-col justify-center items-center text-center group cursor-help"
        >
          <AlertTriangle className="w-6 h-6 text-destructive mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-[11px] font-bold text-destructive uppercase tracking-widest">Missed Potential</h4>
          <p className="text-lg font-bold text-foreground mt-1">₹120</p>
          <p className="text-[9px] text-muted-foreground max-w-[120px]">Lost this week due to inactive rules</p>
        </motion.div>
      </div>
    </div>
  );
};
