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
  children: React.ReactNode;
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
