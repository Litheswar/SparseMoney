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
import { Rule, RuleCondition, RuleAction } from '@/lib/engine';
import { toast } from 'sonner';

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

  // Intelligence
  const suggestions = useMemo(() => {
    const foodSpend = transactions.filter(t => t.category === 'Food').reduce((s, t) => s + t.amount, 0);
    const suggestionsList = [];
    
    if (foodSpend > 2000) {
      suggestionsList.push({
        id: 's1',
        title: 'Food Control Rule',
        desc: `Save ₹5 every time you spend on Food.`,
        icon: <Zap className="w-4 h-4" />,
        color: 'text-warning',
        action: () => {
          handleOpenBuilder();
          setRuleType('guilt-tax');
          setConditions([{ type: 'category', operator: '==', value: 'Food' }]);
          setRuleName('Food Control Rule');
          setActionType('fixed');
          setActionValue(5);
        }
      });
    }

    return suggestionsList;
  }, [transactions]);

  const handleOpenBuilder = (rule?: Rule) => {
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
    const newRuleData: Omit<Rule, 'id' | 'triggerCount'> = {
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
      updateRule(editingRuleId, newRuleData as any);
    } else {
      addRule(newRuleData as any);
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

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsBuilderOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const [scrolled, setScrolled] = useState(false);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 500 : -500,
      opacity: 0
    })
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* HEADER SECTION */}
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

      {/* INTELLIGENCE BAR */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 border-l-4 border-l-success relative overflow-hidden group">
          <div className="absolute right-[-10%] top-[-10%] opacity-5 group-hover:scale-110 transition-transform">
             <TrendingUp className="w-24 h-24 text-success" />
          </div>
          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1">Automation Impact</p>
          <p className="text-2xl font-black text-foreground">₹{automationImpact.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">Saved automatically this month</p>
        </motion.div>

        {suggestions.map((s, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 * (i + 1) }}
            onClick={s.action}
            className="glass-card p-5 border-l-4 border-l-blue-500 relative flex items-start gap-4 hover:shadow-lg transition-transform hover:scale-[1.02] cursor-pointer group"
          >
            <div className={`w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center ${s.color}`}>
              {s.icon}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-foreground mb-0.5">{s.title}</p>
              <p className="text-[10px] text-muted-foreground leading-snug">{s.desc}</p>
            </div>
            <Sparkles className="w-4 h-4 text-blue-500 opacity-30 group-hover:opacity-100 transition-opacity mt-1" />
          </motion.div>
        ))}
        
        {suggestions.length < 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 border border-dashed border-border/50 flex items-center justify-center text-center">
             <p className="text-xs text-muted-foreground font-medium italic opacity-60">Scanning behavior patterns...</p>
          </motion.div>
        )}
      </div>

      {/* RULES LIST */}
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
                transition={{ delay: i * 0.05 }}
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
                      {JSON.stringify(rule.condition.type) === '"all"' ? 'Every transaction' : `${rule.condition.type} ${rule.condition.operator || ''} ${rule.condition.value}`}
                      <ArrowRight className="w-3 h-3 mx-1 text-muted-foreground/40" />
                      <span className="font-bold text-primary italic">THEN</span> 
                      {rule.action.type === 'round-up' ? 'Round-up' : `${rule.action.type} ₹${rule.action.value || rule.action.value}%`} 
                      <span className="text-[10px] opacity-60 ml-1">in {rule.action.destination?.name}</span>
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-10 pr-6 border-r border-border/50">
                    <div className="flex flex-col items-center">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Triggered</p>
                      <motion.p 
                        key={rule.triggerCount}
                        initial={{ scale: 1.5, color: 'hsl(var(--primary))' }}
                        animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
                        className="text-base font-black"
                      >
                        {rule.triggerCount}x
                      </motion.p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} className="data-[state=checked]:bg-primary" />
                  <Select onValueChange={(val) => {
                    if (val === 'edit') handleOpenBuilder(rule);
                    if (val === 'duplicate') duplicateRule(rule.id);
                    if (val === 'delete') deleteRule(rule.id);
                  }}>
                    <SelectTrigger className="w-10 h-10 p-0 border-none bg-transparent hover:bg-muted rounded-full transition-colors flex items-center justify-center">
                      <MoreVertical className="w-5 h-5 text-muted-foreground" />
                    </SelectTrigger>
                    <SelectContent align="end" className="glass-card">
                      <SelectItem value="edit" className="flex items-center gap-2 py-2.5 cursor-pointer"><Edit3 className="w-4 h-4" /> Edit Rule</SelectItem>
                      <SelectItem value="duplicate" className="flex items-center gap-2 py-2.5 cursor-pointer"><Copy className="w-4 h-4" /> Duplicate</SelectItem>
                      <SelectItem value="delete" className="text-risk focus:text-risk flex items-center gap-2 py-2.5 cursor-pointer"><Trash2 className="w-4 h-4" /> Delete Rule</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* FULL-SCREEN IMMERSIVE MODAL */}
      <AnimatePresence>
        {isBuilderOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBuilderOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ y: "100%", opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "100%", opacity: 0, scale: 0.95 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) setIsBuilderOpen(false);
              }}
              className="relative w-full max-w-2xl bg-card border border-border/50 shadow-2xl rounded-none sm:rounded-[2rem] overflow-hidden flex flex-col h-full max-h-screen sm:max-h-[85vh] z-[10000]"
            >
              <div className={`sticky top-0 z-30 bg-card transition-shadow duration-300 ${scrolled ? 'shadow-lg border-b border-border/10' : ''}`}>
                <div className="h-1.5 w-full bg-muted overflow-hidden flex">
                  {STEP_TITLES.map((_, i) => (
                    <motion.div 
                      key={i}
                      className={`h-full flex-1 border-r border-background/20 transition-all duration-500`}
                      style={{ 
                        backgroundColor: i + 1 <= currentStep ? 'hsl(var(--primary))' : 'transparent',
                        opacity: i + 1 < currentStep ? 1 : i + 1 === currentStep ? 0.6 : 0
                      }}
                    />
                  ))}
                </div>
                <div className="px-6 md:px-10 pt-6 pb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black underline underline-offset-4 decoration-primary text-primary tracking-[0.2em] mb-1">Phase {currentStep} of 7</p>
                    <h2 className="text-xl font-bold font-heading tracking-tight">{STEP_TITLES[currentStep - 1]}</h2>
                  </div>
                  <button onClick={() => setIsBuilderOpen(false)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-risk/10 hover:text-risk transition-all group active:scale-95">
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scroll-smooth pb-24" onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 10)}>
                <div className="relative min-h-[400px]">
                  <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                      key={currentStep}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ type: "spring", stiffness: 300, damping: 32 }}
                      className="px-6 md:px-10 py-6 flex flex-col gap-8"
                    >
                      {/* STEP 1: RULE IDENTITY */}
                      {currentStep === 1 && (
                        <div className="space-y-6">
                           <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-bold">Give your rule a identity</h3>
                            <p className="text-sm text-muted-foreground font-medium italic">"Weekend Saver", "Coffee Tax", "Guilt Tax"...</p>
                          </div>
                          <div className="relative">
                            <Input 
                              value={ruleName}
                              onChange={(e) => setRuleName(e.target.value)}
                              placeholder="e.g., Weekend Spender Logic"
                              autoFocus
                              className="h-20 text-2xl font-black bg-muted/30 border-none rounded-3xl px-8 focus:ring-4 focus:ring-primary/20 transition-all placeholder:opacity-30"
                            />
                            {ruleName && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-6 top-1/2 -translate-y-1/2">
                                <CheckCircle2 className="w-8 h-8 text-primary" />
                              </motion.div>
                            )}
                          </div>
                          <div className="flex gap-2 flex-wrap">
                             {['Weekend Saver', 'Coffee Tax', 'Guilt Tax', 'Night Out'].map(n => (
                               <button key={n} onClick={() => setRuleName(n)} className="px-4 py-2 rounded-full border border-border bg-card text-xs font-bold hover:bg-muted transition-colors">
                                 {n}
                               </button>
                             ))}
                          </div>
                        </div>
                      )}

                      {/* STEP 2: TRIGGER LOGIC */}
                      {currentStep === 2 && (
                        <div className="space-y-8">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                              <h3 className="text-lg font-bold text-foreground">Trigger Pattern</h3>
                              <p className="text-sm text-muted-foreground">Select when SparseMoney should scan.</p>
                            </div>
                            <div className="flex items-center gap-2 bg-muted p-1 rounded-xl">
                              <button onClick={() => setIsAdvancedMode(false)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${!isAdvancedMode ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'}`}>Quick</button>
                              <button onClick={() => setIsAdvancedMode(true)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${isAdvancedMode ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'}`}>Advanced</button>
                            </div>
                          </div>
                          
                          <div className="space-y-6">
                            {!isAdvancedMode ? (
                              <div className="grid grid-cols-2 gap-3">
                                {[
                                  { id: 'all', label: 'Every Transact', icon: <Repeat /> },
                                  { id: 'category', label: 'By Category', icon: <PieChart /> },
                                  { id: 'amount', label: 'Above Amount', icon: <TrendingUp /> },
                                  { id: 'day', label: 'On Weekends', icon: <Zap /> }
                                ].map(opt => (
                                  <button
                                    key={opt.id}
                                    onClick={() => setConditions([{...conditions[0], type: opt.id}])}
                                    className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all group hover:scale-[1.02] active:scale-[0.98] ${conditions[0].type === opt.id ? 'border-primary bg-primary/5 shadow-md' : 'border-border/50 hover:bg-muted'}`}
                                  >
                                    <div className={`w-12 h-12 mb-3 transition-colors ${conditions[0].type === opt.id ? 'text-primary' : 'text-muted-foreground opacity-60'}`}>{opt.icon}</div>
                                    <span className={`text-xs font-black uppercase tracking-tight ${conditions[0].type === opt.id ? 'text-primary' : 'text-muted-foreground'}`}>{opt.label}</span>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                  {conditions.map((c, i) => (
                                    <motion.div key={i} initial={{ scale: 0, x: -10 }} animate={{ scale: 1, x: 0 }} exit={{ scale: 0, x: 10 }} className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold border border-primary/20">
                                      {c.type} {c.operator} {c.value || '...'}
                                      <X className="w-3 h-3 cursor-pointer hover:rotate-90 transition-transform" onClick={() => setConditions(conditions.filter((_, idx) => idx !== i))} />
                                    </motion.div>
                                  ))}
                                  <button className="px-4 py-2 rounded-full border border-dashed border-primary/40 text-primary text-xs font-bold hover:bg-primary/5 transition-colors" onClick={() => setConditions([...conditions, {type: 'category', operator: '==', value: ''}])}>+ Add Logic</button>
                                </div>
                              </div>
                            )}

                            <AnimatePresence mode="wait">
                              {conditions[0].type !== 'all' && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 bg-muted/20 border-2 border-primary/10 rounded-[2rem] gap-4 flex flex-col shadow-inner">
                                   {conditions[0].type === 'amount' && (
                                     <div className="flex items-center gap-3">
                                       <Select value={conditions[0].operator} onValueChange={(v) => setConditions([{...conditions[0], operator: v}])}>
                                         <SelectTrigger className="w-24 border-none bg-card h-12 rounded-xl font-bold shadow-sm"><SelectValue /></SelectTrigger>
                                         <SelectContent className="glass-card"><SelectItem value=">">Above</SelectItem><SelectItem value="<">Below</SelectItem></SelectContent>
                                       </Select>
                                       <Input type="number" placeholder="₹ Value..." value={conditions[0].value} onChange={(e) => setConditions([{...conditions[0], value: e.target.value}])} className="h-12 rounded-xl border-none bg-card font-black text-xl px-6 shadow-sm" />
                                     </div>
                                   )}
                                   {conditions[0].type === 'category' && (
                                     <Select value={conditions[0].value as string} onValueChange={(v) => setConditions([{...conditions[0], value: v}])}>
                                       <SelectTrigger className="h-14 border-none bg-card rounded-2xl font-black text-lg px-6 shadow-sm"><SelectValue placeholder="Select Category" /></SelectTrigger>
                                       <SelectContent className="glass-card">
                                         {['Shopping', 'Food', 'Transport', 'Entertainment', 'Health'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                       </SelectContent>
                                     </Select>
                                   )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}

                      {/* STEP 3: EXECUTION ACTION */}
                      {currentStep === 3 && (
                        <div className="space-y-6">
                           <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-bold">Execution Pattern</h3>
                            <p className="text-sm text-muted-foreground">Specify the financial counter-move.</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { id: 'round-up', label: 'Round-up', icon: <Zap />, desc: 'Capture spare change from every spend' },
                              { id: 'fixed', label: 'Invest Fixed', icon: <Target />, desc: 'Move a specific flat ₹ amount' },
                              { id: 'percent', label: 'Percent %', icon: <Repeat />, desc: 'Move % of transaction value' },
                              { id: 'auto-sweep', label: 'Auto-Sweep', icon: <ArrowRight />, desc: 'Zero balance wallet sweeps' }
                            ].map(act => (
                              <button
                                key={act.id}
                                onClick={() => setActionType(act.id)}
                                className={`p-6 rounded-3xl border-2 text-left transition-all flex flex-col gap-4 group hover:scale-[1.02] active:scale-[0.98] ${actionType === act.id ? 'border-primary bg-primary/5 ring-4 ring-primary/5 shadow-lg' : 'border-border/50 hover:border-primary/20'}`}
                              >
                                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${actionType === act.id ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-muted text-muted-foreground'}`}>
                                   {act.icon}
                                 </div>
                                 <div className="space-y-1">
                                   <h4 className="font-bold text-sm">{act.label}</h4>
                                   <p className="text-[10px] text-muted-foreground leading-tight">{act.desc}</p>
                                 </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* STEP 4: FUND DESTINATION */}
                      {currentStep === 4 && (
                        <div className="space-y-8">
                          <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-bold tracking-tight">Deployment Sector</h3>
                            <p className="text-sm text-muted-foreground">Direct your capital into chosen asset clusters.</p>
                          </div>
                          <div className="grid gap-3">
                            {[
                              { id: 'Gold ETF', name: 'Gold ETF', icon: '🏆', meta: 'Asset Backed' },
                              { id: 'Index Fund', name: 'Nifty 50 Index', icon: '📈', meta: 'Equity Growth' },
                              { id: 'Wallet', name: 'Spare Wallet', icon: '💳', meta: 'Liquid Cash' },
                              { id: 'Goal', name: 'Goal Fund', icon: '🎯', meta: 'Milestone' }
                            ].map(dest => (
                               <button
                                  key={dest.id}
                                  onClick={() => {
                                    setDestinationType(dest.id);
                                    setDestinationName(dest.name);
                                  }}
                                  className={`p-6 rounded-3xl border-2 flex items-center gap-6 transition-all group hover:scale-[1.01] active:scale-[0.99] ${destinationType === dest.id ? 'border-primary bg-primary/5 shadow-inner' : 'border-border/50 hover:bg-muted'}`}
                               >
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-all shadow-sm ${destinationType === dest.id ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                                    {dest.icon}
                                  </div>
                                  <div className="flex-1 text-left">
                                    <p className="font-black text-sm">{dest.name}</p>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">{dest.meta}</p>
                                  </div>
                                  {destinationType === dest.id && <CheckCircle2 className="w-6 h-6 text-primary" />}
                               </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* STEP 5: VALUE MAPPING */}
                      {currentStep === 5 && (
                        <div className="space-y-8">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                              <h3 className="text-lg font-bold">Capital Allocation</h3>
                              <p className="text-sm text-muted-foreground leading-relaxed">Choose precise mapping for your automation.</p>
                            </div>
                            <div className="flex items-center gap-2 bg-muted p-1 rounded-xl shadow-inner">
                              <button onClick={() => setIsValueModeCustom(false)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${!isValueModeCustom ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'}`}>Presets</button>
                              <button onClick={() => setIsValueModeCustom(true)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${isValueModeCustom ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'}`}>Custom</button>
                            </div>
                          </div>

                          <AnimatePresence mode="wait">
                            {!isValueModeCustom ? (
                              <motion.div key="preset" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-3 gap-4">
                                {[10, 50, 100].map(v => (
                                  <button key={v} onClick={() => setActionValue(v)} className={`p-8 rounded-[2rem] border-2 flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.05] active:scale-[0.95] ${actionValue === v ? 'border-primary bg-primary text-primary-foreground shadow-2xl shadow-primary/30' : 'border-border/50 hover:bg-muted font-bold'}`}>
                                    <span className="text-2xl font-black">₹{v}</span>
                                    {actionValue === v && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckCircle2 className="w-5 h-5" /></motion.div>}
                                  </button>
                                ))}
                              </motion.div>
                            ) : (
                              <motion.div key="custom" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="p-8 bg-muted/20 border-2 border-primary/10 rounded-[2.5rem] flex items-center gap-6 shadow-inner">
                                <motion.div initial={{ rotate: -10 }} animate={{ rotate: 0 }} className="w-20 h-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black text-3xl shadow-lg shadow-primary/20">₹</motion.div>
                                <Input autoFocus type="number" value={actionValue} onChange={(e) => setActionValue(Number(e.target.value))} placeholder="Amount..." className="h-20 text-4xl font-black bg-transparent border-none focus:ring-0 placeholder:opacity-20 flex-1" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* STEP 6: REVIEW & INTELLIGENCE */}
                      {currentStep === 6 && (
                        <div className="space-y-8">
                          <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-bold">Review System Logic</h3>
                            <p className="text-sm text-muted-foreground">Natural language summary of your automation engine.</p>
                          </div>
                          
                          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-10 rounded-[3rem] border-4 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden group shadow-2xl shadow-primary/5">
                             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-all duration-1000 pointer-events-none"><Sparkles className="w-40 h-40 text-primary" /></div>
                             <p className="text-[10px] font-black uppercase text-primary tracking-[0.4em] mb-6">Execution Pattern Hub</p>
                             <motion.h4 key={getRulePreview()} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-black text-foreground leading-[1.3] tracking-tight">
                               "{getRulePreview()}"
                             </motion.h4>
                          </motion.div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="p-6 bg-success/5 rounded-3xl border border-success/20 flex flex-col gap-2">
                               <p className="text-[10px] font-black uppercase text-success tracking-widest leading-none">Simulated Impact</p>
                               <p className="text-2xl font-black text-success">₹1,450 <span className="text-xs font-bold opacity-70"> / month</span></p>
                            </motion.div>
                            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="p-6 bg-muted/50 rounded-3xl border border-border/50 flex flex-col gap-2">
                               <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">Deployment Status</p>
                               <div className="flex items-center gap-2 text-primary font-bold text-xs"><div className="w-2 h-2 rounded-full bg-primary animate-pulse" /> ENGINE CONFIGURED</div>
                            </motion.div>
                          </div>
                        </div>
                      )}

                      {/* STEP 7: READY TO DEPLOY */}
                      {currentStep === 7 && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-8">
                          <div className="relative">
                            <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }} className="w-48 h-48 rounded-[3rem] bg-success/20 flex items-center justify-center relative z-10 shadow-2xl shadow-success/20">
                              <CheckCircle2 className="w-24 h-24 text-success" />
                            </motion.div>
                            {[...Array(20)].map((_, i) => (
                               <motion.div key={i} initial={{ x: 0, y: 0, opacity: 1, scale: 1 }} animate={{ x: Math.cos(i * 18 * Math.PI / 180) * 180, y: Math.sin(i * 18 * Math.PI / 180) * 180, opacity: 0, scale: 0.3 }} transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }} className={`absolute inset-0 m-auto w-4 h-4 rounded-full ${i % 3 === 0 ? 'bg-primary' : i % 3 === 1 ? 'bg-success' : i % 3 === 2 ? 'bg-warning' : 'bg-blue-400'}`} />
                            ))}
                          </div>
                          <div className="space-y-3">
                             <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="text-5xl font-black font-heading tracking-tighter">DEPLOΥED</motion.h2>
                             <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="text-muted-foreground max-w-xs mx-auto font-medium leading-relaxed">Automation engine initialized. Logic active across all transaction clusters.</p>
                          </div>
                          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.6 }}>
                            <Button onClick={() => setIsBuilderOpen(false)} variant="outline" className="rounded-3xl px-16 h-16 font-black border-2 hover:bg-muted hover:scale-105 active:scale-95 transition-all shadow-xl">Back to HQ</Button>
                          </motion.div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* STICKY FOOTER */}
              <AnimatePresence>
                {currentStep < 7 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="sticky bottom-0 z-30 px-6 md:px-10 py-6 border-t border-border/30 flex items-center justify-between bg-card/80 backdrop-blur-xl">
                    <Button onClick={handleBack} disabled={currentStep === 1} variant="ghost" className="rounded-2xl font-black h-14 px-8 gap-3 text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 disabled:opacity-30">
                      <ChevronLeft className="w-5 h-5" /> Back
                    </Button>
                    {currentStep === 6 ? (
                      <Button onClick={handleSaveRule} className="rounded-2xl gradient-primary text-primary-foreground font-black px-12 h-14 shadow-2xl shadow-primary/30 hover:scale-[1.05] transition-all active:scale-95">
                        DEPLOY ENGINE <Sparkles className="w-5 h-5 ml-2" />
                      </Button>
                    ) : (
                      <Button onClick={handleNext} className="rounded-2xl bg-primary text-primary-foreground font-black px-12 h-14 hover:bg-primary/90 shadow-xl shadow-primary/20 active:scale-95 transition-all">
                        NEXT STEP <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
