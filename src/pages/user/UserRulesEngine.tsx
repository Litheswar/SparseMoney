import { type ReactNode, useMemo, useState } from 'react';
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  buildRulePreview,
  CATEGORY_OPTIONS,
  createRuleDefinition,
  DESTINATION_OPTIONS,
  formatCurrency,
  formatRuleActionSummary,
  formatRuleConditionSummary,
  getRuleCategory,
  makeId,
  MERCHANT_OPTIONS,
  Rule,
  RuleActionType,
  RuleCondition,
  RuleConditionField,
  RuleDestination,
  RuleLogic,
} from '@/lib/automation';

type BuilderIntent = 'create' | 'edit' | 'duplicate';

const quickFieldOptions: Array<{ value: RuleConditionField; label: string }> = [
  { value: 'transaction', label: 'Every transaction' },
  { value: 'category', label: 'Category = Food / Shopping / Travel' },
  { value: 'amount', label: 'Amount > ₹X' },
  { value: 'day', label: 'Day = Weekend / Weekday' },
  { value: 'merchant', label: 'Merchant = Swiggy / Uber' },
];

const actionCards: Array<{
  type: RuleActionType;
  title: string;
  description: string;
  icon: typeof BadgeIndianRupee;
  accent: string;
}> = [
  { type: 'round_up', title: 'Round-up', description: 'Sweep the spare amount from each matched transaction.', icon: BadgeIndianRupee, accent: 'text-success' },
  { type: 'fixed_invest', title: 'Invest fixed amount', description: 'Send a fixed amount when the rule condition is met.', icon: TrendingUp, accent: 'text-primary' },
  { type: 'percentage_invest', title: 'Invest percentage', description: 'Invest a percentage of the transaction amount.', icon: Activity, accent: 'text-warning' },
  { type: 'auto_sweep', title: 'Move to Auto-Sweep', description: 'Move excess cash into a sweep destination.', icon: Wallet2, accent: 'text-primary' },
  { type: 'goal_allocate', title: 'Allocate to Goal', description: 'Route money toward your active goal automatically.', icon: Goal, accent: 'text-success' },
  { type: 'group_allocate', title: 'Allocate to Group', description: 'Send funds into a shared group pool.', icon: Layers3, accent: 'text-warning' },
];

const destinationDescriptions: Record<RuleDestination, string> = {
  'Gold ETF': 'Inflation hedge with automated discipline.',
  'Index Fund': 'Long-term compounding for everyday habits.',
  'Debt Fund': 'Low-volatility parking for short-term cash.',
  Wallet: 'Keep the money in your spare wallet first.',
  'Specific Goal': 'Route it to a named financial milestone.',
  'Group Fund': 'Allocate into a shared pool or family stack.',
};

const categoryIcons: Record<string, typeof Zap> = {
  'round-up': Zap,
  invest: TrendingUp,
  'auto-sweep': Wallet2,
  goal: Goal,
  group: Layers3,
};

const categoryColors: Record<string, string> = {
  'round-up': 'text-success',
  invest: 'text-primary',
  'auto-sweep': 'text-warning',
  goal: 'text-success',
  group: 'text-warning',
};

function createCondition(field: RuleConditionField): RuleCondition {
  if (field === 'transaction') {
    return { id: makeId('condition'), field, operator: 'always', value: 'Every transaction' };
  }
  if (field === 'category') {
    return { id: makeId('condition'), field, operator: 'equals', value: 'Food' };
  }
  if (field === 'amount') {
    return { id: makeId('condition'), field, operator: 'greater_than', value: 300 };
  }
  if (field === 'day') {
    return { id: makeId('condition'), field, operator: 'equals', value: 'Weekend' };
  }
  return { id: makeId('condition'), field, operator: 'equals', value: 'Swiggy' };
}

function createBlankDraft(): Rule {
  return createRuleDefinition({
    name: 'Weekend Overspend Rule',
    mode: 'quick',
    logic: 'AND',
    conditions: [createCondition('transaction')],
    action: { type: 'round_up', value: 10 },
    destination: 'Wallet',
  });
}

function formatLastTriggered(value: string | null) {
  if (!value) return 'Never triggered';
  const date = new Date(value);
  return isToday(date) ? `Today ${format(date, 'h:mm a')}` : format(date, 'dd MMM, h:mm a');
}

function normalizeCondition(condition: RuleCondition): RuleCondition {
  if (condition.field === 'transaction') {
    return { ...condition, operator: 'always', value: 'Every transaction' };
  }
  if (condition.field === 'category') {
    return { ...condition, operator: 'equals', value: condition.value || 'Food' };
  }
  if (condition.field === 'amount') {
    return {
      ...condition,
      operator: condition.operator === 'less_than' ? 'less_than' : 'greater_than',
      value: Number(condition.value || 300),
    };
  }
  if (condition.field === 'day') {
    return { ...condition, operator: 'equals', value: condition.value || 'Weekend' };
  }
  return { ...condition, operator: condition.operator === 'contains' ? 'contains' : 'equals', value: condition.value || 'Swiggy' };
}

function sanitizeDraft(draft: Rule, preserveMetrics: boolean) {
  const conditions = (draft.mode === 'quick' ? [draft.conditions[0] ?? createCondition('transaction')] : draft.conditions)
    .map(normalizeCondition)
    .filter((condition) => Boolean(condition.value) || condition.field === 'transaction');

  const baseRule = {
    name: draft.name.trim() || 'Untitled Rule',
    enabled: draft.enabled,
    mode: draft.mode,
    logic: conditions.length > 1 ? draft.logic : 'AND',
    conditions,
    action: draft.action,
    destination: draft.destination,
  };

  if (!preserveMetrics) {
    return createRuleDefinition(baseRule);
  }

  return {
    ...draft,
    ...baseRule,
    category: getRuleCategory(draft.action.type),
    updatedAt: new Date().toISOString(),
  };
}

function BuilderSection({
  step,
  title,
  description,
  children,
}: {
  step: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-border/70 bg-white/80 p-5 shadow-[0_24px_60px_hsl(200_20%_10%/.05)] backdrop-blur-xl">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-xs font-bold text-primary">
          {step}
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function UserRulesEngine() {
  const {
    rules,
    toggleRule,
    createRule,
    updateRule,
    deleteRule,
    recentExecutions,
    highlightedRuleIds,
    suggestedRules,
    automationStats,
    simulateTransaction,
  } = useApp();
  const isMobile = useIsMobile();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderIntent, setBuilderIntent] = useState<BuilderIntent>('create');
  const [draft, setDraft] = useState<Rule>(() => createBlankDraft());
  const [saveState, setSaveState] = useState<'idle' | 'success'>('idle');
  const [deleteCandidate, setDeleteCandidate] = useState<Rule | null>(null);

  const orderedRules = useMemo(() => rules, [rules]);
  const activeRules = orderedRules.filter((rule) => rule.enabled).length;

  const previewAmount = useMemo(() => {
    const amountCondition = draft.conditions.find((condition) => condition.field === 'amount');
    return Math.max(Number(amountCondition?.value || 350), 350);
  }, [draft.conditions]);

  const previewText = useMemo(() => buildRulePreview(draft, previewAmount), [draft, previewAmount]);
  const quickCondition = draft.conditions[0] ?? createCondition('transaction');

  const openBuilder = (nextDraft: Rule, intent: BuilderIntent) => {
    setBuilderIntent(intent);
    setDraft(nextDraft);
    setSaveState('idle');
    setBuilderOpen(true);
  };

  const handleNewRule = () => {
    openBuilder(createBlankDraft(), 'create');
  };

  const handleEditRule = (rule: Rule) => {
    openBuilder({ ...rule, conditions: rule.conditions.map((condition) => ({ ...condition })) }, 'edit');
  };

  const handleDuplicateRule = (rule: Rule) => {
    openBuilder(
      createRuleDefinition({
        name: `${rule.name} Copy`,
        enabled: rule.enabled,
        mode: rule.mode,
        logic: rule.logic,
        conditions: rule.conditions.map((condition) => ({ ...condition, id: makeId('condition') })),
        action: { ...rule.action },
        destination: rule.destination,
      }),
      'duplicate',
    );
  };

  const handleUseSuggestion = (rule: Rule) => {
    openBuilder(
      createRuleDefinition({
        name: rule.name,
        enabled: true,
        mode: rule.mode,
        logic: rule.logic,
        conditions: rule.conditions.map((condition) => ({ ...condition, id: makeId('condition') })),
        action: { ...rule.action },
        destination: rule.destination,
      }),
      'create',
    );
  };

  const setQuickField = (field: RuleConditionField) => {
    setDraft((current) => ({
      ...current,
      mode: 'quick',
      conditions: [createCondition(field)],
    }));
  };

  const updateQuickCondition = (patch: Partial<RuleCondition>) => {
    setDraft((current) => ({
      ...current,
      conditions: [{ ...normalizeCondition(current.conditions[0] ?? createCondition('transaction')), ...patch }],
    }));
  };

  const updateAdvancedCondition = (index: number, patch: Partial<RuleCondition>) => {
    setDraft((current) => ({
      ...current,
      conditions: current.conditions.map((condition, conditionIndex) =>
        conditionIndex === index
          ? normalizeCondition({
              ...condition,
              ...patch,
              ...(patch.field ? createCondition(patch.field) : {}),
            })
          : condition,
      ),
    }));
  };

  const addAdvancedCondition = () => {
    setDraft((current) => ({
      ...current,
      mode: 'advanced',
      conditions: [...current.conditions, createCondition('category')],
    }));
  };

  const removeAdvancedCondition = (index: number) => {
    setDraft((current) => ({
      ...current,
      conditions: current.conditions.filter((_, conditionIndex) => conditionIndex !== index),
    }));
  };

  const handleSaveRule = () => {
    const nextRule = sanitizeDraft(draft, builderIntent === 'edit');

    if (builderIntent === 'edit') {
      updateRule(nextRule);
      toast.success('Rule Updated Successfully', {
        description: 'Automation logic has been refreshed across SpareSmart.',
      });
    } else {
      createRule(nextRule);
      toast.success('Rule Created Successfully', {
        description: 'Your automation is now live inside the SpareSmart engine.',
      });
    }

    setSaveState('success');
    window.setTimeout(() => {
      setBuilderOpen(false);
      setSaveState('idle');
    }, 450);
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[32px] border border-border/60 bg-[radial-gradient(circle_at_top_right,hsl(152_60%_42%/.16),transparent_34%),radial-gradient(circle_at_bottom_left,hsl(38_92%_50%/.12),transparent_26%),linear-gradient(135deg,hsl(180_20%_98%),hsl(0_0%_100%))] p-6 shadow-[0_30px_80px_hsl(180_30%_20%/.08)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-success"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Programmable Finance
            </motion.div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">Rules & Automation</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Build conditional money flows with a no-code financial automation builder that feels like a real investing engine.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={simulateTransaction}
              className="rounded-2xl border-border/70 bg-white/70 px-4 shadow-sm hover:-translate-y-0.5"
            >
              <Flame className="mr-2 h-4 w-4 text-warning" />
              Run Test Transaction
            </Button>
            <Button
              onClick={handleNewRule}
              className="rounded-2xl gradient-primary px-5 text-primary-foreground shadow-[0_20px_40px_hsl(174_62%_40%/.28)] hover:-translate-y-0.5"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Rule
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <motion.div whileHover={{ y: -4 }} className="rounded-[26px] border border-success/20 bg-white/80 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-success">
              <ShieldCheck className="h-4 w-4" />
              Automation Impact
            </div>
            <p className="mt-3 text-3xl font-black text-foreground">{formatCurrency(automationStats.thisMonthSaved)}</p>
            <p className="mt-2 text-sm text-muted-foreground">Your active rules have saved this much this month.</p>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="rounded-[26px] border border-warning/20 bg-white/80 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-warning">
              <BrainCircuit className="h-4 w-4" />
              Inactive Opportunity
            </div>
            <p className="mt-3 text-3xl font-black text-foreground">{formatCurrency(automationStats.inactiveOpportunity)}</p>
            <p className="mt-2 text-sm text-muted-foreground">You could save more monthly by enabling new behavior-based rules.</p>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="rounded-[26px] border border-border/70 bg-white/80 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Layers3 className="h-4 w-4" />
              Engine Status
            </div>
            <p className="mt-3 text-3xl font-black text-foreground">{activeRules}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Active rules routing to <span className="font-semibold text-foreground">{automationStats.topDestination}</span>.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Suggested Rules</h2>
          <p className="text-sm text-muted-foreground">Behavioral nudges generated from recent spending patterns.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <AnimatePresence>
            {suggestedRules.length > 0 ? (
              suggestedRules.map((suggestion, index) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="rounded-[28px] border border-border/70 bg-[linear-gradient(180deg,hsl(0_0%_100%),hsl(174_20%_97%))] p-5 shadow-[0_18px_45px_hsl(180_15%_20%/.06)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                        Suggested Rule
                      </div>
                      <h3 className="mt-3 text-lg font-semibold text-foreground">{suggestion.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{suggestion.description}</p>
                    </div>
                    <Target className="mt-1 h-5 w-5 text-primary" />
                  </div>
                  <div className="mt-4 rounded-2xl border border-success/20 bg-success/5 p-3 text-sm text-foreground">
                    <p className="font-medium">{suggestion.insight}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-success">
                      Potential impact {formatCurrency(suggestion.estimatedMonthlySavings)}/month
                    </p>
                  </div>
                  <Button
                    onClick={() => handleUseSuggestion(suggestion.template)}
                    className="mt-4 w-full rounded-2xl gradient-primary text-primary-foreground"
                  >
                    Use Template
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </motion.div>
              ))
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-[28px] border border-border/70 bg-white/80 p-5 text-sm text-muted-foreground lg:col-span-3">
                Your automation engine already covers the biggest behavior gaps. Run a few more test transactions to refresh suggestions.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.85fr]">
        <div className="space-y-4">
          {orderedRules.map((rule, index) => {
            const Icon = categoryIcons[rule.category] || Zap;
            const isTriggered = highlightedRuleIds.includes(rule.id);

            return (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: isTriggered ? 1.01 : 1,
                  boxShadow: isTriggered
                    ? '0 0 0 1px hsl(152 60% 42% / 0.25), 0 24px 60px hsl(152 60% 42% / 0.16)'
                    : '0 20px 50px hsl(200 20% 10% / 0.05)',
                }}
                transition={{ delay: index * 0.04, duration: 0.24 }}
                whileHover={{ y: -4 }}
                className={`rounded-[30px] border border-border/70 bg-white/85 p-5 transition-all ${rule.enabled ? '' : 'opacity-70 grayscale-[0.12]'}`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/70 ${categoryColors[rule.category]}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-foreground">{rule.name}</h3>
                          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${rule.enabled ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                            {rule.enabled ? 'Active' : 'Disabled'}
                          </span>
                          <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            {rule.category}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{formatRuleConditionSummary(rule)}</p>
                        <p className="mt-1 text-sm font-medium text-foreground">{formatRuleActionSummary(rule)}</p>
                      </div>

                      <div className="flex items-center gap-2 self-start">
                        <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-2xl">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-2xl">
                            <DropdownMenuItem onClick={() => handleEditRule(rule)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Rule
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateRule(rule)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate Rule
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteCandidate(rule)} className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Rule
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Triggered</p>
                        <p className="mt-2 text-2xl font-black text-foreground">{rule.triggerCount}</p>
                        <p className="text-xs text-muted-foreground">times</p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Last Triggered</p>
                        <p className="mt-2 text-sm font-semibold text-foreground">{formatLastTriggered(rule.lastTriggeredAt)}</p>
                        <p className="text-xs text-muted-foreground">Execution visibility in real time</p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Routed Value</p>
                        <p className="mt-2 text-2xl font-black text-foreground">{formatCurrency(rule.totalExecutedAmount)}</p>
                        <p className="text-xs text-muted-foreground">Lifetime automation flow</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="rounded-[30px] border border-border/70 bg-[linear-gradient(180deg,hsl(0_0%_100%),hsl(174_20%_97%))] p-5 shadow-[0_20px_50px_hsl(200_20%_10%/.05)]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Activity className="h-4 w-4" />
              Live Engine Activity
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Recent automation executions from the SpareSmart rule engine.</p>
            <div className="mt-5 space-y-3">
              <AnimatePresence>
                {recentExecutions.map((execution) => (
                  <motion.div
                    key={execution.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="rounded-2xl border border-border/70 bg-white/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{execution.ruleName}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{execution.description}</p>
                      </div>
                      <div className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                        {formatCurrency(execution.amount)}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{execution.merchant}</span>
                      <span>{formatLastTriggered(execution.executedAt)}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="rounded-[30px] border border-border/70 bg-white/85 p-5 shadow-[0_20px_50px_hsl(200_20%_10%/.05)]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-success">
              <ShieldCheck className="h-4 w-4" />
              Engine Summary
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                <span className="text-sm text-muted-foreground">Projected monthly contribution</span>
                <span className="text-sm font-semibold text-foreground">{formatCurrency(automationStats.projectedMonthlyContribution)}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                <span className="text-sm text-muted-foreground">Total triggers processed</span>
                <span className="text-sm font-semibold text-foreground">{automationStats.totalTriggers}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                <span className="text-sm text-muted-foreground">Total routed by automations</span>
                <span className="text-sm font-semibold text-foreground">{formatCurrency(automationStats.totalRouted)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Sheet open={builderOpen} onOpenChange={setBuilderOpen}>
        <SheetContent
          side={isMobile ? 'bottom' : 'right'}
          className="w-full border-border/70 bg-[linear-gradient(180deg,hsl(180_22%_98%),white)] p-0 sm:max-w-3xl"
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-border/70 px-6 py-5">
              <SheetHeader className="text-left">
                <SheetTitle className="text-2xl font-bold text-foreground">
                  {builderIntent === 'edit' ? 'Edit Automation Rule' : 'Create Automation Rule'}
                </SheetTitle>
                <SheetDescription>
                  Build programmable finance logic with beginner-friendly quick rules or advanced multi-condition workflows.
                </SheetDescription>
              </SheetHeader>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
              <BuilderSection step="01" title="Rule Name" description="Give your automation a clear, human-readable label.">
                <Input
                  value={draft.name}
                  onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Weekend Overspend Rule"
                  className="h-12 rounded-2xl border-border/70 bg-white"
                />
              </BuilderSection>

              <BuilderSection step="02" title="Condition (IF)" description="Choose quick-select for guided setup or advanced mode for multi-condition logic.">
                <div className="mb-4 inline-flex rounded-full border border-border/70 bg-white p-1">
                  {(['quick', 'advanced'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          mode,
                          conditions: mode === 'quick' ? [current.conditions[0] ?? createCondition('transaction')] : current.conditions,
                        }))
                      }
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                        draft.mode === mode ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
                      }`}
                    >
                      {mode === 'quick' ? 'Quick Select' : 'Advanced Mode'}
                    </button>
                  ))}
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  <AnimatePresence>
                    {draft.conditions.map((condition) => (
                      <motion.div
                        key={condition.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
                      >
                        {condition.field === 'transaction' ? 'Every transaction' : formatRuleConditionSummary({ ...draft, conditions: [condition] })}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {draft.mode === 'quick' ? (
                  <div className="grid gap-3 md:grid-cols-3">
                    <Select value={quickCondition.field} onValueChange={(value: RuleConditionField) => setQuickField(value)}>
                      <SelectTrigger className="h-12 rounded-2xl border-border/70 bg-white">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {quickFieldOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {quickCondition.field === 'category' && (
                      <Select value={String(quickCondition.value)} onValueChange={(value) => updateQuickCondition({ value })}>
                        <SelectTrigger className="h-12 rounded-2xl border-border/70 bg-white">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORY_OPTIONS.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {quickCondition.field === 'amount' && (
                      <Input
                        type="number"
                        min={50}
                        value={String(quickCondition.value ?? 300)}
                        onChange={(event) => updateQuickCondition({ value: Number(event.target.value) })}
                        className="h-12 rounded-2xl border-border/70 bg-white"
                      />
                    )}

                    {quickCondition.field === 'day' && (
                      <Select value={String(quickCondition.value)} onValueChange={(value) => updateQuickCondition({ value })}>
                        <SelectTrigger className="h-12 rounded-2xl border-border/70 bg-white">
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Weekend">Weekend</SelectItem>
                          <SelectItem value="Weekday">Weekday</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    {quickCondition.field === 'merchant' && (
                      <Select value={String(quickCondition.value)} onValueChange={(value) => updateQuickCondition({ value })}>
                        <SelectTrigger className="h-12 rounded-2xl border-border/70 bg-white">
                          <SelectValue placeholder="Merchant" />
                        </SelectTrigger>
                        <SelectContent>
                          {MERCHANT_OPTIONS.map((merchant) => (
                            <SelectItem key={merchant} value={merchant}>
                              {merchant}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-white px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Condition Logic</p>
                        <p className="text-xs text-muted-foreground">Combine your conditions using AND / OR logic.</p>
                      </div>
                      <div className="inline-flex rounded-full border border-border/70 bg-muted/40 p-1">
                        {(['AND', 'OR'] as RuleLogic[]).map((logic) => (
                          <button
                            key={logic}
                            onClick={() => setDraft((current) => ({ ...current, logic }))}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                              draft.logic === logic ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
                            }`}
                          >
                            {logic}
                          </button>
                        ))}
                      </div>
                    </div>

                    <AnimatePresence>
                      {draft.conditions.map((condition, index) => (
                        <motion.div
                          key={condition.id}
                          layout
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          className="grid gap-3 rounded-2xl border border-border/70 bg-white p-4 md:grid-cols-[1.2fr_1fr_1fr_auto]"
                        >
                          <Select
                            value={condition.field}
                            onValueChange={(value: RuleConditionField) => updateAdvancedCondition(index, { field: value })}
                          >
                            <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="category">Category</SelectItem>
                              <SelectItem value="amount">Amount</SelectItem>
                              <SelectItem value="day">Day</SelectItem>
                              <SelectItem value="merchant">Merchant</SelectItem>
                              <SelectItem value="transaction">Every transaction</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select
                            value={condition.operator}
                            onValueChange={(value: RuleCondition['operator']) => updateAdvancedCondition(index, { operator: value })}
                          >
                            <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {condition.field === 'amount' ? (
                                <>
                                  <SelectItem value="greater_than">Greater than</SelectItem>
                                  <SelectItem value="less_than">Less than</SelectItem>
                                </>
                              ) : condition.field === 'merchant' ? (
                                <>
                                  <SelectItem value="equals">Equals</SelectItem>
                                  <SelectItem value="contains">Contains</SelectItem>
                                </>
                              ) : (
                                <>
                                  <SelectItem value="equals">Equals</SelectItem>
                                  <SelectItem value="always">Always</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>

                          {condition.field === 'category' && (
                            <Select value={String(condition.value)} onValueChange={(value) => updateAdvancedCondition(index, { value })}>
                              <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORY_OPTIONS.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          {condition.field === 'day' && (
                            <Select value={String(condition.value)} onValueChange={(value) => updateAdvancedCondition(index, { value })}>
                              <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Weekend">Weekend</SelectItem>
                                <SelectItem value="Weekday">Weekday</SelectItem>
                              </SelectContent>
                            </Select>
                          )}

                          {condition.field === 'merchant' && (
                            <Select value={String(condition.value)} onValueChange={(value) => updateAdvancedCondition(index, { value })}>
                              <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {MERCHANT_OPTIONS.map((merchant) => (
                                  <SelectItem key={merchant} value={merchant}>
                                    {merchant}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          {condition.field === 'amount' && (
                            <Input
                              type="number"
                              min={50}
                              value={String(condition.value ?? 300)}
                              onChange={(event) => updateAdvancedCondition(index, { value: Number(event.target.value) })}
                              className="h-11 rounded-2xl border-border/70 bg-white"
                            />
                          )}

                          {condition.field === 'transaction' && (
                            <div className="flex h-11 items-center rounded-2xl border border-border/70 bg-muted/20 px-4 text-sm text-muted-foreground">
                              Applies on every transaction
                            </div>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAdvancedCondition(index)}
                            disabled={draft.conditions.length === 1}
                            className="rounded-2xl text-muted-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <Button variant="outline" onClick={addAdvancedCondition} className="rounded-2xl border-dashed border-border/70">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Condition
                    </Button>
                  </div>
                )}
              </BuilderSection>

              <BuilderSection step="03" title="Action (THEN)" description="Choose how the engine should react when the condition matches.">
                <div className="grid gap-3 md:grid-cols-2">
                  {actionCards.map((actionCard) => {
                    const Icon = actionCard.icon;
                    const selected = draft.action.type === actionCard.type;

                    return (
                      <motion.button
                        key={actionCard.type}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            action: {
                              type: actionCard.type,
                              value:
                                actionCard.type === 'round_up'
                                  ? 10
                                  : actionCard.type === 'percentage_invest'
                                    ? 10
                                    : current.action.value || 50,
                            },
                            destination:
                              actionCard.type === 'goal_allocate'
                                ? 'Specific Goal'
                                : actionCard.type === 'group_allocate'
                                  ? 'Group Fund'
                                  : current.destination,
                          }))
                        }
                        className={`rounded-[24px] border p-4 text-left transition-all ${
                          selected
                            ? 'border-primary bg-primary/5 shadow-[0_18px_36px_hsl(174_62%_40%/.14)]'
                            : 'border-border/70 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{actionCard.title}</p>
                            <p className="mt-2 text-sm text-muted-foreground">{actionCard.description}</p>
                          </div>
                          <div className={`rounded-2xl bg-muted/70 p-2.5 ${selected ? actionCard.accent : 'text-muted-foreground'}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-2xl border border-border/70 bg-white p-4">
                  {draft.action.type === 'round_up' && (
                    <div>
                      <p className="text-sm font-semibold text-foreground">Round-up multiple</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[10, 50, 100].map((value) => (
                          <button
                            key={value}
                            onClick={() => setDraft((current) => ({ ...current, action: { ...current.action, value } }))}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                              draft.action.value === value ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {formatCurrency(value)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {draft.action.type === 'percentage_invest' && (
                    <div>
                      <p className="text-sm font-semibold text-foreground">Percentage to invest</p>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={String(draft.action.value)}
                        onChange={(event) => setDraft((current) => ({ ...current, action: { ...current.action, value: Number(event.target.value) } }))}
                        className="mt-3 h-12 rounded-2xl border-border/70 bg-white"
                      />
                    </div>
                  )}

                  {draft.action.type !== 'round_up' && draft.action.type !== 'percentage_invest' && (
                    <div>
                      <p className="text-sm font-semibold text-foreground">Amount</p>
                      <Input
                        type="number"
                        min={25}
                        value={String(draft.action.value)}
                        onChange={(event) => setDraft((current) => ({ ...current, action: { ...current.action, value: Number(event.target.value) } }))}
                        className="mt-3 h-12 rounded-2xl border-border/70 bg-white"
                      />
                    </div>
                  )}
                </div>
              </BuilderSection>

              <BuilderSection step="04" title="Destination (WHERE MONEY GOES)" description="Choose the destination where matched money should move.">
                <div className="grid gap-3 md:grid-cols-2">
                  {DESTINATION_OPTIONS.map((destination) => (
                    <motion.button
                      key={destination}
                      whileHover={{ y: -2 }}
                      onClick={() => setDraft((current) => ({ ...current, destination }))}
                      className={`rounded-[24px] border p-4 text-left transition-all ${
                        draft.destination === destination
                          ? 'border-success bg-success/5 shadow-[0_18px_36px_hsl(152_60%_42%/.14)]'
                          : 'border-border/70 bg-white'
                      }`}
                    >
                      <p className="text-sm font-semibold text-foreground">{destination}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{destinationDescriptions[destination]}</p>
                    </motion.button>
                  ))}
                </div>
              </BuilderSection>

              <BuilderSection step="05" title="Preview" description="Watch the engine explain the rule in plain language before you save it.">
                <motion.div
                  key={previewText}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[26px] border border-primary/20 bg-[linear-gradient(135deg,hsl(174_62%_40%/.08),white)] p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-primary/10 p-2.5 text-primary">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Live Preview</p>
                      <p className="mt-2 text-base font-medium leading-7 text-foreground">{previewText}</p>
                    </div>
                  </div>
                </motion.div>
              </BuilderSection>
            </div>

            <div className="border-t border-border/70 px-6 py-5">
              <Button
                onClick={handleSaveRule}
                className={`h-12 w-full rounded-2xl text-base font-semibold ${
                  saveState === 'success' ? 'bg-success text-success-foreground' : 'gradient-primary text-primary-foreground'
                }`}
              >
                {saveState === 'success' ? (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Rule Saved
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-5 w-5" />
                    {builderIntent === 'edit' ? 'Save Rule' : 'Create Rule'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={Boolean(deleteCandidate)} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <AlertDialogContent className="rounded-[28px] border-border/70">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete rule?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteCandidate?.name} will be removed from the automation engine. This does not undo past executions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-2xl bg-destructive text-destructive-foreground"
              onClick={() => {
                if (deleteCandidate) {
                  deleteRule(deleteCandidate.id);
                  toast.success('Rule deleted', {
                    description: 'The automation has been removed from SpareSmart.',
                  });
                }
                setDeleteCandidate(null);
              }}
            >
              Delete Rule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
