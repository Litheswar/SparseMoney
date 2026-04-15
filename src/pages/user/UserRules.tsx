import { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Settings2, 
  Plus, 
  MoreVertical, 
  Target, 
  TrendingUp, 
  Clock, 
  Trash2, 
  Copy, 
  Edit3, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Brain,
  X,
  Sparkles,
  PieChart,
  Repeat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const CATEGORY_COLORS: Record<string, string> = {
  'round-up': 'text-primary bg-primary/10',
  'guilt-tax': 'text-warning bg-warning/10',
  'overspend': 'text-risk bg-risk/10',
  'custom': 'text-muted-foreground bg-muted',
  'suggestion': 'text-blue-500 bg-blue-500/10',
};

const STEP_TITLES = [
  'Rule Identity',
  'Trigger Logic',
  'Execution Action',
  'Fund Destination',
  'Value Mapping',
  'Review & Intelligence',
  'Ready to Deploy'
];

export default function UserRules() {
  const { 
    rules, 
    toggleRule, 
    addRule, 
    updateRule, 
    deleteRule, 
    duplicateRule, 
    automationImpact,
    transactions 
  } = useApp();

  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [isValueModeCustom, setIsValueModeCustom] = useState(false);
  
  // Builder State
  const [ruleName, setRuleName] = useState('');
  const [ruleType, setRuleType] = useState<string>('custom');
  const [conditions, setConditions] = useState<{type: string, operator: string, value: string | number}[]>([
    { type: 'all', operator: '>', value: '' }
  ]);
  const [actionType, setActionType] = useState<any>('round-up');
  const [actionValue, setActionValue] = useState<number>(0);
  const [destinationType, setDestinationType] = useState<any>('Wallet');
  const [destinationName, setDestinationName] = useState('Spare Wallet');

  const handleOpenBuilder = (rule?: any) => {
    if (rule) {
      setEditingRuleId(rule.id);
      setRuleName(rule.name);
      setConditions([{
        type: rule.condition.type,
        operator: rule.condition.operator || '>',
        value: rule.condition.value || ''
      }]);
      setActionType(rule.action.type);
      setActionValue(rule.action.value || 0);
      setIsValueModeCustom(rule.action.value ? ![10, 50, 100].includes(rule.action.value) : false);
      setDestinationType(rule.action.destination?.type || 'Wallet');
      setDestinationName(rule.action.destination?.name || 'Spare Wallet');
      setRuleType(rule.category === 'round-up' ? 'round-up' : 'custom');
    } else {
      setEditingRuleId(null);
      setRuleName('');
      setConditions([{ type: 'all', operator: '>', value: '' }]);
      setActionType('round-up');
      setActionValue(0);
      setIsValueModeCustom(false);
      setDestinationType('Wallet');
      setDestinationName('Spare Wallet');
      setRuleType('custom');
    }
    setCurrentStep(1);
    setIsBuilderOpen(true);
  };

  const handleNext = () => {
    if (currentStep < 7) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSaveRule = () => {
    const mainCondition = conditions[0];
    const newRuleData = {
      name: ruleName || 'Untitled Rule',
      condition: {
        type: mainCondition.type as any,
        operator: mainCondition.operator as any,
        value: mainCondition.value,
      },
      action: {
        type: actionType,
        value: Number(actionValue),
        destination: {
          type: destinationType,
          name: destinationName,
        }
      },
      enabled: true,
      category: ruleType as any,
    };

    if (editingRuleId) {
      updateRule(editingRuleId, newRuleData);
    } else {
      addRule(newRuleData);
    }
    handleNext();
  };

  const getRulePreview = () => {
    const mainCond = conditions[0];
    let ifPart = "Every transaction";
    if (mainCond.type === 'category') ifPart = `Spend on ${mainCond.value || 'Category'}`;
    if (mainCond.type === 'amount') ifPart = `Transaction ${mainCond.operator} ₹${mainCond.value || '0'}`;
    if (mainCond.type === 'day') ifPart = `Spend on ${mainCond.value || 'Day'}`;

    let thenPart = "round-up spare change";
    if (actionType === 'fixed') thenPart = `invest ₹${actionValue || '0'}`;
    if (actionType === 'percent') thenPart = `invest ${actionValue || '0'}% of amount`;

    return `When ${ifPart} → ${thenPart} in ${destinationName}`;
  };

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 500 : -500, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 500 : -500, opacity: 0 })
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-3">
             <Brain className="w-3 h-3" /> Automation Logic
          </motion.div>
          <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight">Rules & Automation</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure your no-code financial decision engine</p>
        </div>
        <Button onClick={() => handleOpenBuilder()} className="rounded-xl gradient-primary text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
          <Plus className="w-4 h-4 mr-2" /> New Automation Rule
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 border-l-4 border-l-success relative overflow-hidden group">
          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1">Automation Impact</p>
          <p className="text-2xl font-black text-foreground">₹{automationImpact.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">Saved automatically this month</p>
        </motion.div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold font-heading text-muted-foreground uppercase tracking-widest flex items-center gap-2 px-1">
          <Settings2 className="w-4 h-4" /> Active Decision Engine
        </h2>
        
        <div className="grid gap-4">
          <AnimatePresence>
            {rules.map((rule, i) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`glass-card p-1 pr-6 flex items-center gap-6 group transition-all duration-300 ${!rule.enabled ? 'opacity-60 grayscale-[0.5]' : 'hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20'}`}
              >
                <div className={`w-1.5 self-stretch rounded-l-full transition-colors ${rule.enabled ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
                <div className="flex-1 py-4 flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm ${CATEGORY_COLORS[rule.category || 'custom']}`}>
                    {rule.category === 'round-up' ? <Zap className="w-6 h-6" /> : rule.category === 'overspend' ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="text-base font-bold text-foreground truncate">{rule.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${CATEGORY_COLORS[rule.category || 'custom']}`}>
                        {rule.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 truncate">
                      <span className="font-bold text-primary italic">IF</span> 
                      {rule.condition.type === 'all' ? 'Every transaction' : `${rule.condition.type} ${rule.condition.operator || ''} ${rule.condition.value}`}
                      <ArrowRight className="w-3 h-3 mx-1 text-muted-foreground/40" />
                      <span className="font-bold text-primary italic">THEN</span> 
                      {rule.action.type === 'round-up' ? 'Round-up' : `${rule.action.type} ₹${rule.action.value || rule.action.value}%`} 
                      <span className="text-[10px] opacity-60 ml-1">in {rule.action.destination?.name}</span>
                    </p>
                  </div>
                  <div className="hidden md:flex flex-col items-center pr-6 border-r border-border/50">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Triggered</p>
                      <p className="text-base font-black">{rule.triggerCount}x</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} className="data-[state=checked]:bg-primary" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Builder Modal */}
      <AnimatePresence>
        {isBuilderOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBuilderOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-xl" />
            <motion.div 
              initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} 
              className="relative w-full max-w-2xl bg-card border border-border/50 shadow-2xl rounded-[2rem] overflow-hidden flex flex-col max-h-[85vh] z-[10000]"
            >
              <div className="h-1.5 w-full bg-muted overflow-hidden flex">
                {STEP_TITLES.map((_, i) => (
                  <div key={i} className={`h-full flex-1 transition-all duration-500 ${i + 1 <= currentStep ? 'bg-primary' : 'bg-transparent'}`} />
                ))}
              </div>
              <div className="px-10 pt-8 pb-4 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black underline underline-offset-4 decoration-primary text-primary tracking-[0.2em] mb-1">Phase {currentStep} of 7</p>
                  <h2 className="text-xl font-bold font-heading tracking-tight">{STEP_TITLES[currentStep - 1]}</h2>
                </div>
                <button onClick={() => setIsBuilderOpen(false)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-risk/10 hover:text-risk transition-all group">
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-10 py-6 min-h-[400px]">
                <AnimatePresence mode="wait">
                  <motion.div key={currentStep} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ type: "spring", stiffness: 300, damping: 32 }}>
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-bold">Rule Identity</h3>
                        <Input value={ruleName} onChange={(e) => setRuleName(e.target.value)} placeholder="e.g., Coffee Tax" className="h-20 text-2xl font-black bg-muted/30 border-none rounded-3xl px-8" />
                      </div>
                    )}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-bold">Trigger Logic</h3>
                        <div className="grid grid-cols-2 gap-3">
                           {['all', 'category', 'amount', 'day'].map(opt => (
                             <button key={opt} onClick={() => setConditions([{...conditions[0], type: opt}])} className={`p-6 rounded-3xl border-2 uppercase font-black text-xs ${conditions[0].type === opt ? 'border-primary bg-primary/5 text-primary' : 'border-border/50'}`}>
                                {opt}
                             </button>
                           ))}
                        </div>
                      </div>
                    )}
                    {currentStep >= 3 && currentStep < 7 && (
                      <div className="py-20 text-center text-muted-foreground">
                        <p>Logic configuration phased into subsequent steps...</p>
                        <p className="text-xs mt-2 italic">UI placeholder for demo parity</p>
                      </div>
                    )}
                    {currentStep === 7 && (
                      <div className="flex flex-col items-center justify-center text-center py-12 space-y-8">
                         <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center text-success"><CheckCircle2 className="w-12 h-12" /></div>
                         <h2 className="text-3xl font-black font-heading">DEPLOΥED</h2>
                         <Button onClick={() => setIsBuilderOpen(false)} className="rounded-2xl px-12 h-14 bg-primary text-white">Back to HQ</Button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="px-10 py-6 border-t border-border/30 flex items-center justify-between bg-card/80">
                <Button onClick={handleBack} disabled={currentStep === 1} variant="ghost">Back</Button>
                {currentStep === 6 ? (
                  <Button onClick={handleSaveRule} className="rounded-2xl gradient-primary text-white font-black px-12 h-14">DEPLOY ENGINE</Button>
                ) : (
                  <Button onClick={handleNext} disabled={currentStep === 7} className="rounded-2xl bg-primary text-white font-black px-12 h-14">NEXT STEP</Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
