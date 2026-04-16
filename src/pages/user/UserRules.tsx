import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format, isToday } from 'date-fns';
import {
  Activity,
  BadgeIndianRupee,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Copy,
  Flame,
  Goal,
  Layers3,
  MoreHorizontal,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Wallet2,
  Zap,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  CATEGORY_OPTIONS,
  MERCHANT_OPTIONS,
  Rule,
  RuleConditionField,
  RuleDestination,
} from '@/lib/automation';

export default function UserRules() {
  const {
    rules,
    toggleRule,
    addRule,
    updateRule,
    deleteRule,
    automationStats,
    simulateTransaction,
    loading
  } = useApp();
  
  const isMobile = useIsMobile();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [draft, setDraft] = useState<any>({
    name: '',
    condition: { type: 'all' },
    action: { type: 'round-up', destination: { type: 'Wallet', name: 'Spare Wallet' } }
  });

  const formatCurrency = (amount: number) => `₹${Math.round(amount).toLocaleString('en-IN')}`;

  const handleSave = async () => {
    await addRule(draft);
    setBuilderOpen(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="overflow-hidden rounded-[32px] border border-border/60 bg-[linear-gradient(135deg,hsl(180_20%_98%),hsl(0_0%_100%))] p-6 shadow-[0_30px_80px_hsl(180_30%_20%/.08)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-success">
              <Sparkles className="h-3.5 w-3.5" /> Programmable Finance
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">Rules & Automation</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Build conditional money flows with a no-code financial automation builder that feels like a real investing engine.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={simulateTransaction} className="rounded-2xl border-border/70 bg-white shadow-sm">
              <Flame className="mr-2 h-4 w-4 text-warning" /> Run Test
            </Button>
            <Button onClick={() => setBuilderOpen(true)} className="rounded-2xl gradient-primary px-5 text-primary-foreground shadow-lg">
              <Plus className="mr-2 h-4 w-4" /> New Rule
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[26px] border border-success/20 bg-white/80 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-success">
              <ShieldCheck className="h-4 w-4" /> Impact
            </div>
            <p className="mt-3 text-3xl font-black text-foreground">{formatCurrency(automationStats.thisMonthSaved)}</p>
          </div>
          <div className="rounded-[26px] border border-warning/20 bg-white/80 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-warning">
              <BrainCircuit className="h-4 w-4" /> Opportunity
            </div>
            <p className="mt-3 text-3xl font-black text-foreground">{formatCurrency(automationStats.inactiveOpportunity)}</p>
          </div>
          <div className="rounded-[26px] border border-border/70 bg-white/80 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Layers3 className="h-4 w-4" /> Active Rules
            </div>
            <p className="mt-3 text-3xl font-black text-foreground">{automationStats.activeRules}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {(rules || []).map((rule, index) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-[30px] border border-border/70 bg-white p-5 flex items-center justify-between gap-6 ${rule.enabled ? '' : 'opacity-60 grayscale-[0.2]'}`}
          >
            <div className="flex items-center gap-5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-muted/70 ${rule.enabled ? 'text-primary' : 'text-muted-foreground'}`}>
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{rule.name}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                   IF <span className="text-foreground font-semibold uppercase tracking-widest">{rule.conditions[0]?.field === 'transaction' ? 'Every transaction' : rule.conditions[0]?.value}</span>
                   → THEN <span className="text-foreground font-semibold uppercase tracking-widest">{rule.action.type.replace('_', ' ')}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="text-right hidden md:block border-r border-border pr-6 mr-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Triggers</p>
                  <p className="text-lg font-black text-foreground">{rule.triggerCount}</p>
               </div>
               <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-2xl"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem onClick={() => deleteRule(rule.id)} className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
          </motion.div>
        ))}
      </div>

      <Sheet open={builderOpen} onOpenChange={setBuilderOpen}>
        <SheetContent side={isMobile ? 'bottom' : 'right'} className="w-full sm:max-w-md bg-card border-l-border">
          <SheetHeader className="mb-8">
            <SheetTitle className="text-2xl font-black">Create Automation</SheetTitle>
          </SheetHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rule Name</label>
              <Input value={draft.name} onChange={e => setDraft({...draft, name: e.target.value})} placeholder="e.g. Swiggy Round-up" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Condition (IF)</label>
              <Select value={draft.condition.type} onValueChange={v => setDraft({...draft, condition: {type: v}})}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Every Transaction</SelectItem>
                  <SelectItem value="category">Specific Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Action (THEN)</label>
              <Select value={draft.action.type} onValueChange={v => setDraft({...draft, action: {...draft.action, type: v}})}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="round-up">Round-up spare change</SelectItem>
                  <SelectItem value="fixed">Invest fixed amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} className="w-full h-14 rounded-2xl gradient-primary text-white font-black text-lg shadow-xl shadow-primary/20">DEPLOY RULE</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
