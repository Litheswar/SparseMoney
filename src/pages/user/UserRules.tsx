import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Settings2, Zap, AlertTriangle, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const categoryIcons: Record<string, typeof Zap> = {
  'round-up': Zap,
  'guilt-tax': AlertTriangle,
  'overspend': TrendingUp,
  'custom': Settings2,
};

const categoryColors: Record<string, string> = {
  'round-up': 'text-primary',
  'guilt-tax': 'text-warning',
  'overspend': 'text-risk',
  'custom': 'text-muted-foreground',
};

export default function UserRules() {
  const { rules, toggleRule } = useApp();

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Rules & Automation</h1>
          <p className="text-sm text-muted-foreground">Configure smart investment triggers</p>
        </div>
        <Button className="rounded-xl gradient-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> New Rule
        </Button>
      </div>

      <div className="space-y-3">
        {rules.map((rule, i) => {
          const Icon = categoryIcons[rule.category] || Settings2;
          return (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card p-5 transition-all ${rule.enabled ? '' : 'opacity-60'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center ${categoryColors[rule.category]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-foreground">{rule.name}</h3>
                    <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><span className="font-medium text-foreground">IF</span> {rule.condition}</p>
                    <p><span className="font-medium text-foreground">THEN</span> {rule.action}</p>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground capitalize">{rule.category}</span>
                    <span className="text-xs text-muted-foreground">Triggered {rule.triggerCount}x</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
