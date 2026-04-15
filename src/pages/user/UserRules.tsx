import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Settings2, Zap, AlertTriangle, TrendingUp, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface Rule {
  id: string;
  name: string;
  condition: string;
  action: string;
  target: string;
  is_active: boolean;
  trigger_count: number;
}

const targetIcons: Record<string, typeof Zap> = {
  'WALLET': Zap,
  'GOLD': AlertTriangle,
  'INDEX': TrendingUp,
};

const targetColors: Record<string, string> = {
  'WALLET': 'text-primary',
  'GOLD': 'text-warning',
  'INDEX': 'text-success',
};

export default function UserRules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.rules.list();
        setRules(data || []);
      } catch (err) {
        console.error('Rules load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleToggle = async (ruleId: string) => {
    try {
      const updated = await api.rules.toggle(ruleId);
      setRules(prev => prev.map(r => r.id === ruleId ? { ...r, is_active: updated.is_active } : r));
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

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
          const Icon = targetIcons[rule.target] || Settings2;
          const color = targetColors[rule.target] || 'text-muted-foreground';
          return (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card p-5 transition-all ${rule.is_active ? '' : 'opacity-60'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-foreground">{rule.name}</h3>
                    <Switch checked={rule.is_active} onCheckedChange={() => handleToggle(rule.id)} />
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><span className="font-medium text-foreground">IF</span> {rule.condition}</p>
                    <p><span className="font-medium text-foreground">THEN</span> {rule.action}</p>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{rule.target}</span>
                    <span className="text-xs text-muted-foreground">Triggered {rule.trigger_count}x</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
        {rules.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No rules configured yet. They'll be seeded when onboarding completes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
