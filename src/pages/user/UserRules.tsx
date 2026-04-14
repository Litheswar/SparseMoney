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
  'Rule Type',
  'Triggers',
  'Actions',
  'Destination',
  'Preview',
  'Success'
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
  const [direction, setDirection] = useState(0); // 1 for next, -1 for back
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  
  // Builder State
  const [ruleName, setRuleName] = useState('');
  const [ruleType, setRuleType] = useState<string>('custom');
  const [conditionType, setConditionType] = useState<any>('all');
  const [conditionValue, setConditionValue] = useState<string | number>('');
  const [conditionOperator, setConditionOperator] = useState<any>('>');
  const [actionType, setActionType] = useState<any>('round-up');
  const [actionValue, setActionValue] = useState<number>(0);
  const [destinationType, setDestinationType] = useState<any>('Wallet');
  const [destinationName, setDestinationName] = useState('Spare Wallet');

  // Intelligence: Suggestions
  const suggestions = useMemo(() => {
    const foodSpend = transactions.filter(t => t.category === 'Food').reduce((s, t) => s + t.amount, 0);
    const suggestionsList = [];
    
    if (foodSpend > 2000) {
      suggestionsList.push({
        id: 's1',
        title: 'Food Control Rule',
        desc: `You spent ₹${foodSpend} on food this week. Add a guilt tax?`,
        icon: <Zap className="w-4 h-4" />,
        color: 'text-warning',
        action: () => {
          handleOpenBuilder();
          setRuleType('guilt-tax');
          setConditionType('category');
          setConditionValue('Food');
          setRuleName('Food Control Rule');
        }
      });
    }

    const weekendSpend = transactions.filter(t => [0, 6].includes(new Date(t.timestamp).getDay())).length;
    if (weekendSpend > 5) {
      suggestionsList.push({
        id: 's2',
        title: 'Weekend Warrior',
        desc: 'Frequent weekend spending detected. Auto-sweep spare change?',
        icon: <Target className="w-4 h-4" />,
        color: 'text-risk',
        action: () => {
          handleOpenBuilder();
          setRuleType('overspend');
          setConditionType('day');
          setConditionValue('weekend');
          setRuleName('Weekend Warrior Rule');
        }
      });
    }

    return suggestionsList;
  }, [transactions]);

  const handleOpenBuilder = (rule?: Rule) => {
    if (rule) {
      setEditingRuleId(rule.id);
      setRuleName(rule.name);
      setConditionType(rule.condition.type);
      setConditionValue(rule.condition.value || '');
      setConditionOperator(rule.condition.operator || '>');
      setActionType(rule.action.type);
      setActionValue(rule.action.value || 0);
      setDestinationType(rule.action.destination?.type || 'Wallet');
      setDestinationName(rule.action.destination?.name || 'Spare Wallet');
      setRuleType(rule.category === 'round-up' ? 'round-up' : 'custom');
      setCurrentStep(1);
    } else {
      setEditingRuleId(null);
      setRuleName('');
      setConditionType('all');
      setConditionValue('');
      setConditionOperator('>');
      setActionType('round-up');
      setActionValue(0);
      setDestinationType('Wallet');
      setDestinationName('Spare Wallet');
      setRuleType('custom');
      setCurrentStep(1);
    }
    setIsBuilderOpen(true);
  };

  const handleNext = () => {
    if (currentStep < 6) {
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
    const newRuleData: Omit<Rule, 'id' | 'triggerCount'> = {
      name: ruleName || 'Untitled Rule',
      condition: {
        type: conditionType,
        operator: conditionOperator,
        value: conditionValue,
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
    handleNext(); // Move to success step
  };

  const getRulePreview = () => {
    let ifPart = "Every transaction";
    if (conditionType === 'category') ifPart = `Spend on ${conditionValue || 'Category'}`;
    if (conditionType === 'amount') ifPart = `Transaction > ₹${conditionValue || '0'}`;
    if (conditionType === 'day') ifPart = `Spend on ${conditionValue || 'Day'}`;

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

  // Variants for slide animation
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
        {/* IMPACT CARD */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 border-l-4 border-l-success relative overflow-hidden group">
          <div className="absolute right-[-10%] top-[-10%] opacity-5 group-hover:scale-110 transition-transform">
             <TrendingUp className="w-24 h-24 text-success" />
          </div>
          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1">Automation Impact</p>
          <p className="text-2xl font-black text-foreground">₹{automationImpact.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">Saved automatically this month</p>
        </motion.div>

        {/* SUGGESTIONS */}
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
                  {/* ICON BLOCK */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm ${CATEGORY_COLORS[rule.category || 'custom']}`}>
                    {rule.category === 'round-up' ? <Zap className="w-6 h-6" /> : rule.category === 'overspend' ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                  </div>

                  {/* INFO BLOCK */}
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

                  {/* STATS BLOCK */}
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
                    <div className="flex flex-col items-center">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Last Run</p>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                        <Clock className="w-3 h-3 opacity-40" />
                        {rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CONTROLS */}
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
            {/* BACKDROP */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBuilderOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xl"
            />

            {/* MODAL CARD */}
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
              {/* STICKY HEADER AREA */}
              <div className={`sticky top-0 z-30 bg-card transition-shadow duration-300 ${scrolled ? 'shadow-lg border-b border-border/10' : ''}`}>
                {/* PROGRESS BAR */}
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

                {/* HEADER CONTENT */}
                <div className="px-6 md:px-10 pt-6 pb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black underline underline-offset-4 decoration-primary text-primary tracking-[0.2em] mb-1">Step {currentStep} of 6</p>
                    <h2 className="text-xl font-bold font-heading tracking-tight">{STEP_TITLES[currentStep - 1]}</h2>
                  </div>
                  <button 
                    onClick={() => setIsBuilderOpen(false)}
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-risk/10 hover:text-risk transition-all group active:scale-95"
                  >
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  </button>
                </div>
              </div>

              {/* SCROLLABLE STEP CONTENT */}
              <div 
                className="flex-1 overflow-y-auto scroll-smooth scrollbar-hide pb-24"
                onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 10)}
              >
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
                      {/* STEP 1: RULE TYPE */}
                      {currentStep === 1 && (
                        <div className="space-y-6">
                          <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-bold">What do you want to automate?</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">Choose a strategic path for your intelligent capital movement.</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                              { id: 'round-up', title: 'Smart Round-Up', icon: <Zap />, desc: 'Invest spare change from every spend automatically' },
                              { id: 'guilt-tax', title: 'Spending Control', icon: <PieChart />, desc: 'Auto-invest a penalty when you overspend categories' },
                              { id: 'overspend', title: 'Investment Rule', icon: <TrendingUp />, desc: 'Strategic capital moves on specific triggers' },
                              { id: 'custom', title: 'Custom Builder', icon: <Settings2 />, desc: 'Build logic from scratch for advanced scenarios' }
                            ].map(t => (
                              <button
                                key={t.id}
                                onClick={() => {
                                  setRuleType(t.id);
                                  if (t.id === 'round-up') setConditionType('all');
                                  handleNext();
                                }}
                                className={`p-6 rounded-2xl border-2 text-left transition-all group flex flex-col gap-4 active:scale-[0.98] ${ruleType === t.id ? 'border-primary bg-primary/5 ring-4 ring-primary/5' : 'border-border/50 hover:border-primary/20 hover:bg-muted/30'}`}
                              >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${ruleType === t.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                  {t.icon}
                                </div>
                                <div className="space-y-1">
                                  <h4 className="font-bold text-sm tracking-tight">{t.title}</h4>
                                  <p className="text-[10px] text-muted-foreground leading-snug">{t.desc}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* STEP 2: CONDITION */}
                      {currentStep === 2 && (
                        <div className="space-y-8">
                          <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-bold text-foreground">When should this rule trigger?</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">Define the precise moment your rule spring into action.</p>
                          </div>
                          
                          <div className="space-y-6">
                            <div className="flex flex-wrap gap-2.5">
                              {[
                                { id: 'all', label: 'Every transaction' },
                                { id: 'category', label: 'By Category' },
                                { id: 'amount', label: 'Threshold' },
                                { id: 'day', label: 'Weekends/Weekdays' },
                                { id: 'merchant', label: 'Merchant' }
                              ].map(opt => (
                                <button
                                  key={opt.id}
                                  onClick={() => setConditionType(opt.id)}
                                  className={`px-5 py-3 rounded-xl border-2 text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 ${conditionType === opt.id ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'border-border/50 hover:border-primary/30 hover:bg-muted'}`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>

                            <AnimatePresence mode="wait">
                              {conditionType !== 'all' && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  className="p-8 bg-muted/20 rounded-[2rem] border border-border/30 space-y-5"
                                >
                                  {conditionType === 'amount' && (
                                    <div className="flex items-center gap-4">
                                      <Select value={conditionOperator} onValueChange={setConditionOperator}>
                                        <SelectTrigger className="w-32 h-14 rounded-2xl font-black bg-card border-2">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="glass-card">
                                          <SelectItem value=">">Above ₹</SelectItem>
                                          <SelectItem value="<">Below ₹</SelectItem>
                                          <SelectItem value="==">Exact ₹</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Input 
                                        type="number"
                                        placeholder="0.00" 
                                        value={conditionValue}
                                        onChange={(e) => setConditionValue(e.target.value)}
                                        className="rounded-2xl h-14 font-black text-xl border-2 focus:ring-primary bg-card"
                                      />
                                    </div>
                                  )}
                                  {(conditionType === 'category' || conditionType === 'day' || conditionType === 'merchant') && (
                                    <Input 
                                      placeholder={conditionType === 'category' ? 'Food, Entertainment, Transport...' : conditionType === 'day' ? 'weekend or weekday' : 'Amazon, Starbucks, Zomato...'} 
                                      value={conditionValue}
                                      onChange={(e) => setConditionValue(e.target.value)}
                                      className="rounded-2xl h-16 font-black text-lg border-2 focus:ring-primary bg-card px-6"
                                    />
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* DIFFICULTY INDICATOR */}
                          <div className="flex items-center justify-between p-5 bg-muted/40 rounded-2xl border border-border/20">
                             <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                 <ShieldCheck className="w-4 h-4 text-primary" />
                               </div>
                               <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">Intelligence Check</span>
                             </div>
                             <div className="flex items-center gap-2">
                               <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Logic Level:</span>
                               <span className={`text-[10px] font-black px-3 py-1 rounded-full ${conditionType === 'all' ? 'bg-success/10 text-success border border-success/30' : 'bg-warning/10 text-warning border border-warning/30'}`}>
                                 {conditionType === 'all' ? 'FOUNDATIONAL' : 'CALCULATED'}
                               </span>
                             </div>
                          </div>
                        </div>
                      )}

                      {/* STEP 3: ACTION */}
                      {currentStep === 3 && (
                        <div className="space-y-6">
                          <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-bold">What should happen?</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">Specify the financial counter-move for this automation.</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                              { id: 'round-up', label: 'Intelligent Round-up', icon: <Zap className="w-5 h-5" />, desc: 'Capture change to nearest ₹10/₹50' },
                              { id: 'fixed', label: 'Fixed Capital move', icon: <Target className="w-5 h-5" />, desc: 'Move a specific flat ₹ amount' },
                              { id: 'percent', label: 'Proportional move', icon: <Repeat className="w-5 h-5" />, desc: 'Move % of the transaction value' },
                              { id: 'auto-sweep', label: 'Auto-Sweep Sweep', icon: <ArrowRight className="w-5 h-5" />, desc: 'Clear idle balance from wallet' }
                            ].map(act => (
                              <button
                                key={act.id}
                                onClick={() => setActionType(act.id)}
                                className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col gap-4 group active:scale-[0.98] ${actionType === act.id ? 'border-primary bg-primary/5 ring-4 ring-primary/5' : 'border-border/50 hover:bg-muted/40'}`}
                              >
                                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${actionType === act.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'bg-muted text-muted-foreground'}`}>
                                   {act.icon}
                                 </div>
                                 <div className="space-y-1">
                                   <h4 className="font-bold text-xs tracking-tight">{act.label}</h4>
                                   <p className="text-[9px] text-muted-foreground leading-snug">{act.desc}</p>
                                 </div>
                              </button>
                            ))}
                          </div>
                          {actionType !== 'round-up' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 p-4 bg-muted/20 rounded-2xl border border-border/20">
                               <div className="w-14 h-14 flex items-center justify-center bg-card rounded-xl font-black text-2xl text-primary border-2">
                                  {actionType === 'percent' ? '%' : '₹'}
                               </div>
                               <Input 
                                 type="number" 
                                 placeholder="0" 
                                 value={actionValue} 
                                 onChange={(e) => setActionValue(Number(e.target.value))}
                                 className="rounded-xl h-14 font-black text-2xl border-2 focus:ring-primary bg-card px-6"
                               />
                            </motion.div>
                          )}
                        </div>
                      )}

                      {/* STEP 4: DESTINATION */}
                      {currentStep === 4 && (
                        <div className="space-y-8">
                          <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-bold">Where should the money go?</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">Direct the captured capital to a specific destination.</p>
                          </div>
                          <div className="grid gap-3 mb-4">
                            {[
                              { id: 'Gold ETF', name: 'Nippon Gold ETF', icon: '🏆', meta: 'Commodity Asset' },
                              { id: 'Index Fund', name: 'Nifty 50 Index', icon: '📈', meta: 'Equity Growth' },
                              { id: 'Wallet', name: 'Spare Wallet', icon: '💳', meta: 'Liquid Cash' },
                              { id: 'Goal', name: 'Personal Savings Goal', icon: '🎯', meta: 'Target Saving' },
                            ].map(dest => (
                               <button
                                  key={dest.id}
                                  onClick={() => {
                                    setDestinationType(dest.id);
                                    setDestinationName(dest.name);
                                  }}
                                  className={`p-5 rounded-2xl border-2 flex items-center gap-5 transition-all group active:scale-[0.98] ${destinationType === dest.id ? 'border-primary bg-primary/5 shadow-inner' : 'border-border/50 hover:bg-muted/40 hover:border-primary/20'}`}
                               >
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${destinationType === dest.id ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-card shadow-sm group-hover:bg-primary/5'}`}>
                                    {dest.icon}
                                  </div>
                                  <div className="text-left">
                                    <p className="font-bold text-sm tracking-tight">{dest.name}</p>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">{dest.meta}</p>
                                  </div>
                                  {destinationType === dest.id && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                      <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                                    </motion.div>
                                  )}
                               </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* STEP 5: PREVIEW */}
                      {currentStep === 5 && (
                        <div className="space-y-8">
                          <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-bold">Final system Review</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">Activate your strategic logic engine by confirming the summary below.</p>
                          </div>
                          
                          <div className="glass-card p-10 border-4 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden ring-1 ring-primary/20 group">
                             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 pointer-events-none">
                               <Sparkles className="w-32 h-32 text-primary" />
                             </div>
                             <p className="text-[10px] font-black uppercase text-primary tracking-[0.4em] mb-6">Execution logic Summary</p>
                             <h4 className="text-2xl font-black text-foreground leading-[1.3] tracking-tight">
                               "{getRulePreview()}"
                             </h4>
                          </div>

                          {/* SAVINGS ESTIMATE CARD */}
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-6 bg-success/5 rounded-[1.5rem] border border-success/20 flex flex-col gap-3">
                               <p className="text-[10px] font-black uppercase text-success tracking-widest leading-none">Monthly Estimate</p>
                               <p className="text-2xl font-black text-success">₹950.00 <span className="text-xs font-bold opacity-70">avg</span></p>
                               <div className="mt-2 h-1.5 w-full bg-success/10 rounded-full overflow-hidden">
                                 <motion.div initial={{ width: 0 }} animate={{ width: "65%" }} className="h-full bg-success rounded-full" />
                               </div>
                            </div>
                            <div className="p-6 bg-muted/50 rounded-[1.5rem] border border-border/50 flex flex-col gap-3">
                               <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">Security check</p>
                               <div className="flex items-center gap-2">
                                 <ShieldCheck className="w-4 h-4 text-primary" />
                                 <span className="text-xs font-bold">Encrypted Storage</span>
                               </div>
                               <div className="flex items-center gap-2">
                                 <CheckCircle2 className="w-4 h-4 text-success" />
                                 <span className="text-xs font-bold">Verified Destination</span>
                               </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                             <label className="text-xs font-black uppercase text-muted-foreground tracking-widest px-1 ml-0.5">Automation Handle (Rule Name)</label>
                             <Input 
                              value={ruleName} 
                              onChange={(e) => setRuleName(e.target.value)} 
                              placeholder="e.g., Lifestyle Tax Logic"
                              className="rounded-2xl h-16 font-black text-lg px-8 border-2 border-border/50 bg-card shadow-sm focus:ring-primary"
                             />
                          </div>
                        </div>
                      )}

                      {/* STEP 6: SUCCESS */}
                      {currentStep === 6 && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-8">
                          <div className="relative">
                            <motion.div 
                              initial={{ scale: 0, rotate: -45 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                              className="w-40 h-40 rounded-[2.5rem] bg-success/20 flex items-center justify-center relative z-10 shadow-lg shadow-success/10"
                            >
                              <CheckCircle2 className="w-20 h-20 text-success" />
                            </motion.div>
                            {/* PREMIUM PARTICLE BURST */}
                            {[...Array(16)].map((_, i) => (
                               <motion.div
                                  key={i}
                                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                                  animate={{ 
                                    x: Math.cos(i * 22.5 * Math.PI / 180) * 140,
                                    y: Math.sin(i * 22.5 * Math.PI / 180) * 140,
                                    opacity: 0,
                                    scale: 0.3
                                  }}
                                  transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                                  className={`absolute inset-0 m-auto w-3.5 h-3.5 rounded-full ${i % 4 === 0 ? 'bg-primary' : i % 4 === 1 ? 'bg-success' : i % 4 === 2 ? 'bg-warning' : 'bg-blue-400'}`}
                               />
                            ))}
                          </div>

                          <div className="space-y-3">
                             <h2 className="text-4xl font-black font-heading tracking-tighter">SUCCESS!</h2>
                             <p className="text-muted-foreground max-w-xs mx-auto leading-relaxed">Your capital is now working for you automatically. Logic active.</p>
                          </div>

                          <Button 
                            onClick={() => setIsBuilderOpen(false)} 
                            variant="outline" 
                            className="rounded-[1.25rem] px-14 h-14 font-black transition-all hover:bg-muted hover:scale-105 active:scale-95 border-2"
                          >
                             Return to Dashboard
                          </Button>
                        </div>
                      )}

                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* STICKY FOOTER NAVIGATION */}
              <AnimatePresence>
                {currentStep < 6 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="sticky bottom-0 z-30 px-6 md:px-10 py-6 border-t border-border/30 flex items-center justify-between bg-card/80 backdrop-blur-xl"
                  >
                    <Button 
                      onClick={handleBack} 
                      disabled={currentStep === 1}
                      variant="ghost" 
                      className="rounded-2xl font-black h-14 px-8 gap-3 text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-5 h-5" /> Back
                    </Button>
                    
                    {currentStep === 5 ? (
                      <Button onClick={handleSaveRule} className="rounded-2xl gradient-primary text-primary-foreground font-black px-12 h-14 shadow-2xl shadow-primary/30 hover:scale-105 transition-all active:scale-95 ring-4 ring-primary/5">
                        DEPLOY ENGINE <Sparkles className="w-5 h-5 ml-2" />
                      </Button>
                    ) : (
                      <Button onClick={handleNext} className="rounded-2xl bg-primary text-primary-foreground font-black px-12 h-14 hover:bg-primary/90 shadow-xl shadow-primary/20 active:scale-95">
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
