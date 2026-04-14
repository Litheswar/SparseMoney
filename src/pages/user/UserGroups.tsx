import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Plus, Trophy, Target, Calendar, ArrowRight, Check, 
  Copy, Share2, Info, Flame, Shield, PartyPopper, Zap, 
  Clock, TrendingUp, MoreVertical, ExternalLink, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/context/AppContext';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger 
} from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Group } from '@/lib/engine';

// --- Sub Components ---

function CountUp({ value, prefix = '₹' }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 1000;
    const start = display;
    const diff = value - start;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= duration) { setDisplay(value); return; }
      setDisplay(Math.round(start + diff * (elapsed / duration)));
      requestAnimationFrame(tick);
    };
    tick();
  }, [value]);
  return <span>{prefix}{display.toLocaleString('en-IN')}</span>;
}

function GroupCard({ group }: { group: Group }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const progress = (group.totalSaved / group.goalAmount) * 100;
  const daysLeft = Math.ceil((new Date(group.targetDate).getTime() - Date.now()) / 86400000);
  const remaining = group.goalAmount - group.totalSaved;

  const statusColor = group.urgencyStatus === 'On track' ? 'text-success' 
                    : group.urgencyStatus === 'Slight delay' ? 'text-warning' 
                    : 'text-risk';

  const statusBg = group.urgencyStatus === 'On track' ? 'bg-success/10' 
                 : group.urgencyStatus === 'Slight delay' ? 'bg-warning/10' 
                 : 'bg-risk/10';

  const statusShadow = group.urgencyStatus === 'On track' ? 'shadow-success-glow' 
                     : group.urgencyStatus === 'Slight delay' ? 'shadow-warning-glow' 
                     : 'shadow-risk-glow';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="glass-card p-0 overflow-hidden group relative flex flex-col h-full"
    >
      {/* 1. Identity + Activity Chip */}
      <div className="p-5 flex items-start justify-between border-b border-border/10">
        <div className="flex items-center gap-3">
          <div className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">
            {group.emoji}
          </div>
          <div>
            <h3 className="text-lg font-bold font-heading text-foreground tracking-tight">{group.name}</h3>
            <div className="h-6 mt-0.5 overflow-hidden">
              <AnimatePresence mode="wait">
                {group.lastActivity ? (
                  <motion.div
                    key={`${group.lastActivity.userName}-${group.lastActivity.timestamp}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="flex items-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <span className="text-foreground">{group.lastActivity.userName}</span> added ₹{group.lastActivity.amount}
                    </span>
                  </motion.div>
                ) : (
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Activity className="w-3 h-3" /> System Tracking Live
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <div className={`px-2 py-0.5 rounded-full ${statusBg} ${statusColor} text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 animate-breathing-glow ${statusShadow}`}>
           {group.urgencyStatus}
        </div>
      </div>

      <div className="p-5 flex-1 space-y-6">
        {/* 2. Progress Section */}
        <div className="grid grid-cols-5 items-center gap-4">
          <div className="col-span-1 relative w-16 h-16">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                className="text-muted/20"
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
                r="28"
                cx="32"
                cy="32"
              />
              <motion.circle
                initial={{ strokeDashoffset: 176 }}
                animate={{ strokeDashoffset: 176 - (176 * progress) / 100 }}
                transition={{ duration: 1.5 }}
                className={`${statusColor}`}
                strokeWidth="4"
                strokeDasharray="176"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="28"
                cx="32"
                cy="32"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold font-heading">
              {Math.round(progress)}%
            </div>
          </div>
          <div className="col-span-4 space-y-2">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-foreground flex items-center gap-1">
                <CountUp value={group.totalSaved} /> <span className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[8px]">Saved</span>
              </span>
              <span className="text-muted-foreground text-right flex flex-col">
                <span className="font-heading">₹{group.goalAmount.toLocaleString('en-IN')}</span>
                <span className="uppercase tracking-[0.2em] text-[8px] font-medium">Goal</span>
              </span>
            </div>
            <div className="relative h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className={`absolute top-0 left-0 h-full ${group.urgencyStatus === 'Risk' ? 'bg-destructive' : 'bg-primary'} rounded-full`}
              />
              <div className="absolute inset-0 animate-shimmer pointer-events-none" />
            </div>
            <p className="text-[9px] text-muted-foreground font-medium italic text-right">
              ₹{remaining.toLocaleString('en-IN')} remaining to goal
            </p>
          </div>
        </div>

        {/* 3. Social & Urgency Details */}
        <div className="flex items-center justify-between">
          <TooltipProvider>
            <div className="flex -space-x-3">
              {group.members.map((m, i) => (
                <Tooltip key={m.userId}>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.2, zIndex: 50 }}
                      className={`relative w-9 h-9 rounded-full border-2 border-background bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-[10px] font-bold text-muted-foreground ${m.contributionShare > 35 ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    >
                      {m.name.substring(0, 2).toUpperCase()}
                      {m.contributionShare > 35 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                          <Trophy className="w-2 h-2 text-primary-foreground" />
                        </div>
                      )}
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-bold">{m.name}</p>
                    <p className="text-[10px] opacity-80">₹{m.totalContributed.toLocaleString('en-IN')} • {m.contributionShare}% of total</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {group.members.length > 3 && (
                <div className="w-9 h-9 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                  +{group.members.length - 3}
                </div>
              )}
            </div>
          </TooltipProvider>

          <div className="text-right space-y-1">
             <div className="flex items-center gap-1 justify-end text-xs font-bold text-foreground">
               <Clock className="w-3 h-3 text-muted-foreground" /> {daysLeft} Days Left
             </div>
             <div className="h-[20px] w-20">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={group.trendData.map((v, i) => ({ v }))}>
                    <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      </div>

      {/* 4. Smart Insight Strip */}
      <div className="mt-auto bg-muted/30 p-3 flex items-center gap-3 overflow-hidden">
        <motion.div 
          animate={{ x: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"
        >
          <Zap className="w-3.5 h-3.5 text-primary" />
        </motion.div>
        <div className="text-[10px] font-medium text-muted-foreground leading-tight">
          {group.urgencyStatus === 'On track' ? (
            <span>💡 At current pace, goal will be reached <span className="text-foreground font-bold">4 days early</span>.</span>
          ) : (
            <span>⚠ Activity dropped by 12% — contributing <span className="text-foreground font-bold">₹200 today</span> keeps you on track.</span>
          )}
        </div>
      </div>

      {/* 5. Hover Action Overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-md z-20 flex flex-col items-center justify-center gap-3 p-6"
          >
            <div className="text-center mb-2">
               <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Energy Score</p>
               <div className="text-2xl font-black font-heading text-primary">{group.energyScore}%</div>
            </div>
            
            <div className="w-full space-y-2">
              <Button 
                onClick={(e) => { e.stopPropagation(); }}
                className="w-full rounded-xl gradient-primary text-primary-foreground font-bold"
              >
                <Plus className="w-4 h-4 mr-2" /> Contribute
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  onClick={(e) => { e.stopPropagation(); }}
                  className="rounded-xl font-bold bg-background text-xs"
                >
                  <Copy className="w-3.5 h-3.5 mr-2" /> Invite
                </Button>
                <Button 
                  variant="outline" 
                  onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/groups/${group.id}`); }}
                  className="rounded-xl font-bold bg-background text-xs"
                >
                  Details <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-0 right-0 p-4">
        <div className={`w-2 h-2 rounded-full ${statusColor} animate-pulse`} />
      </div>
    </motion.div>
  );
}

// --- Main Page ---

const CATEGORIES = [
  { id: 'Trip ✈️', label: 'Trip', icon: '✈️', color: 'bg-blue-500/10 text-blue-500' },
  { id: 'Event 🎉', label: 'Event', icon: '🎉', color: 'bg-purple-500/10 text-purple-500' },
  { id: 'Emergency 🛡️', label: 'Emergency', icon: '🛡️', color: 'bg-red-500/10 text-red-500' },
  { id: 'Custom', label: 'Custom', icon: '✨', color: 'bg-teal-500/10 text-teal-500' },
];

export default function UserGroups() {
  const navigate = useNavigate();
  const { groups, createGroup } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    goalAmount: 10000,
    category: 'Trip ✈️' as any,
    targetDate: '',
    contributionMode: 'Equal contribution' as any,
    autoRoundUp: true,
    weeklyFixed: false,
    penaltyNudge: true
  });

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleCreate = () => {
    createGroup({
      name: formData.name,
      goalAmount: Number(formData.goalAmount),
      category: formData.category,
      emoji: CATEGORIES.find(c => c.id === formData.category)?.icon || '💰',
      targetDate: formData.targetDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      contributionMode: formData.contributionMode,
      smartOptions: {
        autoRoundUp: formData.autoRoundUp,
        weeklyFixed: formData.weeklyFixed,
        penaltyNudge: formData.penaltyNudge
      },
      createdBy: 'u1'
    });
    nextStep();
  };

  const resetAndClose = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setStep(1);
      setFormData({
        name: '',
        goalAmount: 10000,
        category: 'Trip ✈️',
        targetDate: '',
        contributionMode: 'Equal contribution',
        autoRoundUp: true,
        weeklyFixed: false,
        penaltyNudge: true
      });
    }, 500);
  };

  return (
    <div className="max-w-6xl space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Group Saving Hub
          </h1>
          <p className="text-sm text-muted-foreground">Live collaborative investing with real-time participation</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl gradient-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4 mr-2" /> Create Group
        </Button>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {groups.map((group, i) => (
          <GroupCard key={group.id} group={group} />
        ))}

        {/* Empty State / Create Placeholder */}
        <motion.div
          whileHover={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="bg-card/30 border-2 border-dashed border-border/50 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4 hover:bg-muted/30 transition-colors cursor-pointer min-h-[350px]"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Plus className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold text-foreground">Launch New Goal</p>
            <p className="text-sm text-muted-foreground max-w-[200px]">Start building wealth with your squad in real-time</p>
          </div>
        </motion.div>
      </div>

      {/* --- CREATE GROUP MODAL --- */}
      <Dialog open={isModalOpen} onOpenChange={(val) => !val && resetAndClose()}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl glass">
          <div className="p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold font-heading text-foreground">Group Details</h2>
                    <p className="text-sm text-muted-foreground">What are you saving for?</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Group Name</Label>
                      <Input 
                        id="name" 
                        placeholder="e.g., Goa Trip 🏖️" 
                        className="rounded-xl border-border/50 focus:ring-primary h-12 px-4 shadow-sm"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Goal Amount (₹)</Label>
                        <Input 
                          id="amount" 
                          type="number"
                          placeholder="10000" 
                          className="rounded-xl border-border/50 focus:ring-primary h-12 shadow-sm"
                          value={formData.goalAmount}
                          onChange={(e) => setFormData({...formData, goalAmount: Number(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date">Target Date</Label>
                        <Input 
                          id="date" 
                          type="date"
                          className="rounded-xl border-border/50 focus:ring-primary h-12 shadow-sm"
                          value={formData.targetDate}
                          onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {CATEGORIES.map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => setFormData({...formData, category: cat.id})}
                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                              formData.category === cat.id 
                                ? 'border-primary bg-primary/5 shadow-md' 
                                : 'border-transparent bg-muted/50 hover:bg-muted opacity-60 hover:opacity-100'
                            }`}
                          >
                            <span>{cat.icon}</span>
                            <span className="text-xs font-bold">{cat.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full rounded-xl gradient-primary text-primary-foreground h-12 shadow-lg shadow-primary/20"
                    onClick={nextStep}
                    disabled={!formData.name}
                  >
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold font-heading text-foreground">Contribution Rules</h2>
                    <p className="text-sm text-muted-foreground">Define how members contribute</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Contribution Mode</Label>
                      <div className="space-y-2">
                        {['Equal contribution', 'Custom contribution', '% based contribution'].map(mode => (
                          <button
                            key={mode}
                            onClick={() => setFormData({...formData, contributionMode: mode as any})}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                              formData.contributionMode === mode 
                                ? 'border-primary bg-primary/5' 
                                : 'border-transparent bg-muted/50'
                            }`}
                          >
                            <span className="text-sm font-medium">{mode}</span>
                            {formData.contributionMode === mode && <Check className="w-4 h-4 text-primary" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                        <Zap className="w-3 h-3 text-primary" /> Smart Options
                      </p>
                      <div className="space-y-2">
                        <label className="flex items-center justify-between p-3 rounded-xl bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">Auto round-up</span>
                            <span className="text-[10px] text-muted-foreground">Add spare change automatically</span>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={formData.autoRoundUp} 
                            onChange={(e) => setFormData({...formData, autoRoundUp: e.target.checked})}
                            className="w-5 h-5 accent-primary" 
                          />
                        </label>
                        <label className="flex items-center justify-between p-3 rounded-xl bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">Weekly fixed</span>
                            <span className="text-[10px] text-muted-foreground">Save ₹100 every week</span>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={formData.weeklyFixed} 
                            onChange={(e) => setFormData({...formData, weeklyFixed: e.target.checked})}
                            className="w-5 h-5 accent-primary" 
                          />
                        </label>
                        <label className="flex items-center justify-between p-3 rounded-xl bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-warning flex items-center gap-1">
                              Penalty Nudge <Info className="w-3 h-3 opacity-60" />
                            </span>
                            <span className="text-[10px] text-muted-foreground">Fun nudges for inactivity</span>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={formData.penaltyNudge} 
                            onChange={(e) => setFormData({...formData, penaltyNudge: e.target.checked})}
                            className="w-5 h-5 accent-warning" 
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={prevStep}>Back</Button>
                    <Button 
                      className="flex-[2] rounded-xl gradient-primary text-primary-foreground h-12 shadow-lg shadow-primary/20"
                      onClick={nextStep}
                    >
                      Next <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold font-heading text-foreground">Invite Members</h2>
                    <p className="text-sm text-muted-foreground">Share the link with your squad</p>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-muted/50 border border-border/50 p-6 rounded-3xl relative overflow-hidden text-center">
                      <div className="relative z-10 space-y-3">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                          <Share2 className="w-8 h-8 text-primary" />
                        </div>
                        <p className="text-xs font-medium text-muted-foreground">Your Invite Link</p>
                        <div className="bg-background rounded-xl p-3 border border-border flex items-center justify-between animate-shimmer overflow-hidden">
                          <a 
                            href={`/dashboard/groups/${groups[0]?.id || 'new'}`}
                            onClick={(e) => { e.preventDefault(); navigate(`/dashboard/groups/${groups[0]?.id || 'new'}`); }}
                            className="text-[10px] text-primary font-mono truncate mr-2 hover:underline cursor-pointer"
                          >
                            {window.location.origin.replace(/^https?:\/\//, '')}/invite/{formData.name.toLowerCase().replace(/\s+/g, '-') || 'new-group'}
                          </a>
                          <button 
                            className="shrink-0 bg-primary/10 p-2 rounded-lg text-primary hover:bg-primary hover:text-white transition-colors"
                            onClick={() => {
                              const inviteLink = `${window.location.origin}/dashboard/groups/${groups[0]?.id || 'new'}?invite=${formData.name.toLowerCase().replace(/\s+/g, '-') || 'new-group'}`;
                              navigator.clipboard.writeText(inviteLink);
                              toast.success('Link copied!');
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="rounded-xl border-border/50 flex flex-col h-auto py-3 gap-1">
                        <div className="w-8 h-8 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" /></svg>
                        </div>
                        <span className="text-[10px] font-bold">WhatsApp</span>
                      </Button>
                      <Button variant="outline" className="rounded-xl border-border/50 flex flex-col h-auto py-3 gap-1">
                        <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-foreground">
                          <MoreVertical className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold">More</span>
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={prevStep}>Back</Button>
                    <Button 
                      className="flex-[2] rounded-xl gradient-primary text-primary-foreground h-12 shadow-lg shadow-primary/20"
                      onClick={handleCreate}
                    >
                      Finish & Create
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8 text-center py-6"
                >
                  <div className="relative mx-auto w-24 h-24">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 10, stiffness: 100 }}
                      className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center text-success"
                    >
                      <PartyPopper className="w-12 h-12" />
                    </motion.div>
                    <motion.div
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0, 0]
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 rounded-full border-4 border-success"
                    />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold font-heading text-foreground">Goal Initialized!</h2>
                    <p className="text-sm text-muted-foreground">The "{formData.name}" group is now live.</p>
                  </div>

                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                    <p className="text-xs text-muted-foreground">Pro Tip</p>
                    <p className="text-sm font-medium text-foreground">Invite 2 more friends to reach your goal 35% faster!</p>
                  </div>

                  <Button 
                    className="w-full rounded-xl gradient-primary text-primary-foreground h-12"
                    onClick={resetAndClose}
                  >
                    Go to Dashboard
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
