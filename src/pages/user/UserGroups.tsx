import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Trophy, 
  Target, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Sparkles, 
  Share2, 
  Settings, 
  ArrowUpRight, 
  MessageSquare, 
  Zap, 
  History,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Link as LinkIcon,
  Crown,
  TrendingUp,
  PieChart as PieChartIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/AppContext';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { toast } from 'sonner';

interface GroupMember {
  name: string;
  amount: number;
  avatar?: string;
  isYou?: boolean;
}

interface ActivityItem {
  id: string;
  user: string;
  type: 'contribution' | 'joined' | 'milestone';
  amount?: number;
  timestamp: string;
}

interface Group {
  id: string;
  name: string;
  goal: number;
  collected: number;
  members: GroupMember[];
  emoji: string;
  ruleLinked?: string;
  activity: ActivityItem[];
}

const COLORS = ['#adfa1d', '#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const MOCK_GROUPS: Group[] = [
  {
    id: 'g1', 
    name: 'Goa Trip 🏖️', 
    goal: 25000, 
    collected: 14200, 
    emoji: '🏖️',
    ruleLinked: 'Round-up Engine',
    members: [
      { name: 'Arjun', amount: 5200, isYou: true },
      { name: 'Ravi', amount: 4800 },
      { name: 'Sneha', amount: 4200 },
    ],
    activity: [
      { id: 'a1', user: 'Arjun', type: 'contribution', amount: 50, timestamp: '2024-03-24T10:00:00Z' },
      { id: 'a2', user: 'Sneha', type: 'contribution', amount: 120, timestamp: '2024-03-24T09:30:00Z' },
      { id: 'a3', user: 'Group', type: 'milestone', timestamp: '2024-03-23T15:00:00Z' },
    ]
  },
  {
    id: 'g2', 
    name: 'PS5 Fund 🎮', 
    goal: 55000, 
    collected: 18500, 
    emoji: '🎮',
    members: [
      { name: 'Arjun', amount: 8500, isYou: true },
      { name: 'Ishaan', amount: 10000 },
    ],
    activity: [
      { id: 'a4', user: 'Ishaan', type: 'contribution', amount: 1000, timestamp: '2024-03-24T12:00:00Z' },
    ]
  }
];

export default function UserGroups() {
  const { rules } = useApp();
  const [groups, setGroups] = useState<Group[]>(MOCK_GROUPS);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [creationStep, setCreationStep] = useState(1);
  
  // Creation state
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupGoal, setNewGroupGoal] = useState('');
  const [newGroupEmoji, setNewGroupEmoji] = useState('💰');
  const [linkedRuleId, setLinkedRuleId] = useState<string>('');

  const selectedGroup = useMemo(() => 
    groups.find(g => g.id === selectedGroupId), 
  [groups, selectedGroupId]);

  const chartData = useMemo(() => {
    if (!selectedGroup) return [];
    return selectedGroup.members.map(m => ({
      name: m.name,
      value: m.amount
    }));
  }, [selectedGroup]);

  const handleCreateGroup = () => {
    const newGroup: Group = {
      id: `g${Date.now()}`,
      name: newGroupName,
      goal: Number(newGroupGoal),
      collected: 0,
      emoji: newGroupEmoji,
      ruleLinked: rules.find(r => r.id === linkedRuleId)?.name,
      members: [{ name: 'Arjun', amount: 0, isYou: true }],
      activity: [{ id: `a${Date.now()}`, user: 'Arjun', type: 'joined', timestamp: new Date().toISOString() }]
    };
    setGroups([...groups, newGroup]);
    setCreationStep(4);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`https://sparsemoney.app/join/${selectedGroupId}`);
    toast.success("Invite link copied to clipboard!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <AnimatePresence mode="wait">
        {!selectedGroupId ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* LIST HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-3">
                   <Users className="w-3 h-3" /> Social Saving Hub
                </motion.div>
                <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight">Investment Groups</h1>
                <p className="text-sm text-muted-foreground mt-1">Pool resources, automate contributions, and grow together.</p>
              </div>
              <Button onClick={() => { setIsCreating(true); setCreationStep(1); }} className="rounded-xl gradient-primary text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
                <Plus className="w-4 h-4 mr-2" /> Start New Group
              </Button>
            </div>

            {/* GROUPS GRID */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group, i) => (
                <motion.div
                  key={group.id}
                  layoutId={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedGroupId(group.id)}
                  className="glass-card p-6 cursor-pointer group hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                    <Users className="w-16 h-16" />
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-card flex items-center justify-center text-3xl shadow-sm border border-border/50 group-hover:scale-110 transition-transform">
                      {group.emoji}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-heading text-foreground tracking-tight">{group.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                        <Users className="w-3 h-3" /> {group.members.length} members
                        {group.ruleLinked && <span className="flex items-center gap-1 text-primary"><Zap className="w-3 h-3" /> Auto</span>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">
                      <span>Saved: ₹{group.collected.toLocaleString()}</span>
                      <span>Goal: ₹{group.goal.toLocaleString()}</span>
                    </div>
                    <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(group.collected / group.goal) * 100}%` }}
                        className="absolute inset-0 bg-primary"
                      />
                    </div>
                    <p className="text-[10px] font-bold text-center text-muted-foreground">
                      {Math.round((group.collected / group.goal) * 100)}% to milestone
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex -space-x-2">
                      {group.members.slice(0, 3).map((m, idx) => (
                        <div key={idx} className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-bold">
                          {m.name[0]}
                        </div>
                      ))}
                      {group.members.length > 3 && (
                        <div className="w-7 h-7 rounded-full bg-primary/10 border-2 border-card flex items-center justify-center text-[10px] font-bold text-primary">
                          +{group.members.length - 3}
                        </div>
                      )}
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </motion.div>
              ))}

              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => { setIsCreating(true); setCreationStep(1); }}
                className="glass-card border-dashed border-2 border-border/50 flex flex-col items-center justify-center p-8 gap-4 hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold font-heading">Empower a New Group</span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* GROUP DETAIL HUB */
          <motion.div 
            key="hub"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* HUB HEADER */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setSelectedGroupId(null)} className="rounded-full">
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <div className="flex items-center gap-4">
                <div className="text-4xl">{selectedGroup?.emoji}</div>
                <div>
                  <h1 className="text-2xl font-black font-heading tracking-tight">{selectedGroup?.name}</h1>
                  <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    <Target className="w-4 h-4" /> Goal: ₹{selectedGroup?.goal.toLocaleString()}
                    {selectedGroup?.ruleLinked && <span className="text-primary font-bold flex items-center gap-1 ml-2"><Zap className="w-3 h-3" /> {selectedGroup.ruleLinked} Active</span>}
                  </p>
                </div>
              </div>
              <div className="ml-auto flex gap-2">
                <Button variant="outline" size="icon" onClick={copyInviteLink} className="rounded-xl border-2 hover:bg-primary/5 hover:text-primary transition-all">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-xl border-2">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* LEFT COLUMN: ANALYTICS */}
              <div className="lg:col-span-2 space-y-8">
                {/* PROGRESS CARD */}
                <div className="glass-card p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5"><TrendingUp className="w-32 h-32" /></div>
                  <div className="flex items-end justify-between mb-6">
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-2">Social Pool Status</p>
                      <h2 className="text-4xl font-black text-foreground tracking-tighter">₹{selectedGroup?.collected.toLocaleString()} <span className="text-lg font-medium text-muted-foreground ml-2">collected</span></h2>
                    </div>
                    <div className="text-right">
                       <p className="text-3xl font-black text-primary leading-none">{Math.round((selectedGroup!.collected / selectedGroup!.goal) * 100)}%</p>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Consistency Score</p>
                    </div>
                  </div>
                  <Progress value={(selectedGroup!.collected / selectedGroup!.goal) * 100} className="h-4 rounded-full bg-muted" />
                  <div className="mt-8 grid grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/30 rounded-2xl text-center">
                      <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Avg Contribution</p>
                      <p className="text-sm font-bold">₹{(selectedGroup!.collected / selectedGroup!.members.length).toFixed(0)}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-2xl text-center">
                      <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Active Rules</p>
                      <p className="text-sm font-bold">02</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-2xl text-center">
                      <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Est. Completion</p>
                      <p className="text-sm font-bold">May '24</p>
                    </div>
                  </div>
                </div>

                {/* DISTRIBUTION & LEADERBOARD GRID */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* CONTRIBUTION PIE */}
                  <div className="glass-card p-6">
                    <h3 className="text-sm font-black font-heading uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                       <PieChartIcon className="w-4 h-4" /> Share of Pool
                    </h3>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {chartData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* LEADERBOARD */}
                  <div className="glass-card p-6">
                    <h3 className="text-sm font-black font-heading uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                       <Trophy className="w-4 h-4" /> Rank Hierarchy
                    </h3>
                    <div className="space-y-4">
                      {selectedGroup?.members.sort((a, b) => b.amount - a.amount).map((m, i) => (
                        <motion.div 
                          key={m.name}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`flex items-center gap-4 p-3 rounded-2xl ${m.isYou ? 'bg-primary/5 border border-primary/20 shadow-sm' : 'bg-muted/20'}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-warning text-warning-foreground' : 'bg-muted-foreground/10 text-muted-foreground'}`}>
                            {i === 0 ? <Crown className="w-4 h-4" /> : i + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold">{m.name} {m.isYou && <span className="text-[9px] text-primary italic ml-1">(You)</span>}</p>
                            <p className="text-[10px] text-muted-foreground tracking-tight">₹{m.amount.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-primary italic">{((m.amount / selectedGroup!.collected) * 100).toFixed(0)}%</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: FEED & CHAT */}
              <div className="space-y-8">
                {/* ACTIVITY FEED */}
                <div className="glass-card p-6 flex flex-col h-[500px]">
                  <h3 className="text-sm font-black font-heading uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                     <History className="w-4 h-4" /> Real-time Nodes
                  </h3>
                  <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide">
                    {selectedGroup?.activity.map((act, i) => (
                      <div key={act.id} className="relative pl-6 pb-6 border-l border-border/50 last:pb-0">
                        <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-primary shadow-sm shadow-primary/40" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-foreground">
                            {act.user} {act.type === 'contribution' ? `added ₹${act.amount}` : act.type === 'milestone' ? 'reached 1st Milestone! 🚀' : 'joined this Hub'}
                          </p>
                          <p className="text-[10px] text-muted-foreground tracking-tighter italic">
                            {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-border/50">
                    <Button className="w-full rounded-xl bg-card border-2 hover:bg-muted text-foreground gap-2 h-11 shadow-sm">
                      <MessageSquare className="w-4 h-4" /> Group Discussion
                    </Button>
                  </div>
                </div>

                {/* INVITE BOX */}
                <div className="glass-card p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                   <h4 className="text-sm font-bold mb-2">Expansion Protocol</h4>
                   <p className="text-[10px] text-muted-foreground leading-relaxed mb-4">Invite trusted nodes to pool capital and accelerate growth rates.</p>
                   <div className="relative">
                     <Input readOnly value={`sparse.link/${selectedGroup?.id}`} className="h-10 bg-card rounded-xl text-xs font-medium pr-10 border-2" />
                     <button onClick={copyInviteLink} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-lg transition-colors">
                        <Copy className="w-4 h-4 text-muted-foreground" />
                     </button>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATION WIZARD MODAL */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreating(false)} className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
             <motion.div 
                initial={{ y: "100%", opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                exit={{ y: "100%", opacity: 0 }}
                className="relative w-full max-w-xl bg-card border border-border/50 shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col"
              >
                {/* WIZARD HEADER */}
                <div className="px-8 pt-8 pb-4 flex items-center justify-between">
                  <div className="w-1.5 h-10 bg-primary rounded-full mr-4" />
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em] mb-1">Formation Phase {creationStep}</p>
                    <h2 className="text-xl font-bold font-heading">
                      {creationStep === 1 ? 'Core Essence' : creationStep === 2 ? 'Intelligence Hub' : creationStep === 3 ? 'Node Network' : 'Initialization Success'}
                    </h2>
                  </div>
                  <button onClick={() => setIsCreating(false)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-risk/10 hover:text-risk transition-all group">
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  </button>
                </div>

                <div className="p-8 pb-12">
                   <AnimatePresence mode="wait">
                     {creationStep === 1 && (
                       <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                          <div className="space-y-4 text-center pb-4">
                             <div className="w-24 h-24 mx-auto bg-muted rounded-[2rem] flex items-center justify-center text-5xl shadow-inner cursor-pointer hover:scale-105 active:scale-95 transition-transform border-4 border-transparent hover:border-primary/20">
                                {newGroupEmoji}
                             </div>
                             <p className="text-[10px] font-bold text-muted-foreground uppercase">Tap to randomize emoji</p>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">Goal Designation</label>
                             <Input 
                                value={newGroupName} 
                                onChange={(e) => setNewGroupName(e.target.value)} 
                                placeholder="e.g. Dream Loft, European Summer..." 
                                className="rounded-2xl h-14 border-2 font-bold px-6 bg-muted/20 focus:bg-card transition-all"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">Fiscal Milestone (Target)</label>
                             <div className="relative">
                               <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-xl opacity-30">₹</span>
                               <Input 
                                  value={newGroupGoal} 
                                  onChange={(e) => setNewGroupGoal(e.target.value)} 
                                  type="number" 
                                  placeholder="0.00" 
                                  className="rounded-2xl h-14 border-2 font-black text-xl pl-12 pr-6 bg-muted/20 focus:bg-card transition-all"
                               />
                             </div>
                          </div>
                       </motion.div>
                     )}

                     {creationStep === 2 && (
                       <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                          <div className="p-6 bg-primary/5 rounded-[2rem] border-2 border-primary/10 flex items-start gap-4">
                             <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                                <Zap className="w-5 h-5" />
                             </div>
                             <div className="flex-1">
                                <h3 className="text-sm font-bold text-foreground">Linked Automation</h3>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">Connecting an automation rule allows your logic engine to contribute to this hub automatically.</p>
                             </div>
                          </div>
                          <div className="space-y-3">
                             <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">Choose Engine Link</p>
                             <div className="grid gap-2">
                                {rules.map(rule => (
                                  <button 
                                    key={rule.id}
                                    onClick={() => setLinkedRuleId(rule.id)}
                                    className={`p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${linkedRuleId === rule.id ? 'border-primary bg-primary/5' : 'border-border/50 hover:bg-muted'}`}
                                  >
                                     <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center shadow-sm">
                                           <Settings className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                           <p className="text-xs font-bold">{rule.name}</p>
                                           <p className="text-[9px] text-muted-foreground uppercase opacity-60">IF {rule.condition.type} -> THEN INVEST</p>
                                        </div>
                                     </div>
                                     {linkedRuleId === rule.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                  </button>
                                ))}
                             </div>
                             <button className="w-full py-4 border-2 border-dashed border-border rounded-2xl text-[10px] font-black uppercase text-muted-foreground hover:border-primary/40 hover:text-primary transition-all">
                                Skip for now (Manual Contribution Only)
                             </button>
                          </div>
                       </motion.div>
                     )}

                     {creationStep === 3 && (
                       <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 text-center pb-4">
                          <div className="space-y-3">
                            <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center text-success">
                               <ShieldCheck className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-black font-heading">Protocol Verified</h3>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">Group details and logic integration are ready for deployment.</p>
                          </div>
                          
                          <div className="p-6 bg-muted/40 rounded-3xl border-2 border-border/50">
                             <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase text-muted-foreground">Encryption Status</span>
                                <span className="text-[10px] font-black text-primary italic uppercase">Active</span>
                             </div>
                             <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-muted-foreground">Public Access</span>
                                <span className="text-[10px] font-black text-risk italic uppercase">Node Limited</span>
                             </div>
                          </div>

                          <Button onClick={handleCreateGroup} className="w-full h-16 rounded-2xl gradient-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/30">
                             DEPLOY GROUP HUB <Sparkles className="w-5 h-5 ml-2" />
                          </Button>
                       </motion.div>
                     )}

                     {creationStep === 4 && (
                       <motion.div key="step4" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center text-center space-y-8 py-4">
                          <div className="w-32 h-32 rounded-[2rem] bg-success/20 flex items-center justify-center shadow-2xl shadow-success/10 rotate-12">
                             <CheckCircle2 className="w-16 h-16 text-success" />
                          </div>
                          <div className="space-y-2">
                             <h3 className="text-3xl font-black font-heading tracking-tight">INITIALIZED</h3>
                             <p className="text-muted-foreground text-sm max-w-xs font-medium italic">"{newGroupName}" hub is now active on the SparseMoney network.</p>
                          </div>
                          <Button onClick={() => setIsCreating(false)} variant="outline" className="rounded-2xl px-12 h-12 border-2 font-black hover:bg-muted">
                             Enter Command Center
                          </Button>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>

                {/* MODAL FOOTER */}
                {creationStep < 4 && (
                  <div className="px-10 py-8 border-t border-border/10 flex items-center justify-between bg-card">
                     <Button variant="ghost" disabled={creationStep === 1} onClick={() => setCreationStep(prev => prev - 1)} className="rounded-xl font-bold gap-2 text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="w-4 h-4" /> Go Back
                     </Button>
                     {creationStep < 3 && (
                       <Button onClick={() => setCreationStep(prev => prev + 1)} className="rounded-xl bg-primary text-primary-foreground font-black px-10 h-12 shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                          Next Stage <ChevronRight className="w-4 h-4 ml-2" />
                       </Button>
                     )}
                  </div>
                )}
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
