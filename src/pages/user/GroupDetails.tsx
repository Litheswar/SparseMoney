import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Share2, Users, Trophy, TrendingUp, Calendar, 
  Target, Info, AlertCircle, Copy, CheckCircle, Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

function CountUp({ value, prefix = '₹' }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  useMemo(() => {
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

export default function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { groups, groupContributions } = useApp();
  const group = groups.find(g => g.id === id);
  const [copied, setCopied] = useState(false);

  if (!group) return <div>Group not found</div>;

  const contributions = groupContributions.filter(c => c.groupId === id);
  const progress = (group.totalSaved / group.goalAmount) * 100;
  const daysLeft = Math.ceil((new Date(group.targetDate).getTime() - Date.now()) / 86400000);

  // Chart Data: Contributions over time (simulated)
  const timelineData = useMemo(() => {
    const data = [];
    let cumulative = 0;
    for (let i = 10; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const amount = Math.floor(Math.random() * 500) + 100;
      cumulative += amount;
      data.push({
        date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        amount: cumulative
      });
    }
    return data;
  }, []);

  const copyInvite = () => {
    navigator.clipboard.writeText(`${window.location.origin}/dashboard/groups/${group.id}?invite=${group.inviteCode}`);
    setCopied(true);
    toast.success('Invite link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{group.emoji}</span>
              <h1 className="text-2xl font-bold font-heading text-foreground">{group.name}</h1>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              Created {new Date(group.createdAt).toLocaleDateString()} • {group.members.length} members
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl" onClick={copyInvite}>
            {copied ? <CheckCircle className="w-4 h-4 mr-2 text-success" /> : <Copy className="w-4 h-4 mr-2" />}
            {group.inviteCode}
          </Button>
          <Button className="rounded-xl gradient-primary text-primary-foreground" onClick={copyInvite}>
            <Share2 className="w-4 h-4 mr-2" /> Share Group
          </Button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-card p-6 md:col-span-2 flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                className="text-muted/20"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
                r="70"
                cx="80"
                cy="80"
              />
              <motion.circle
                initial={{ strokeDashoffset: 440 }}
                animate={{ strokeDashoffset: 440 - (440 * progress) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-primary"
                strokeWidth="10"
                strokeDasharray="440"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="70"
                cx="80"
                cy="80"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold font-heading text-foreground">{Math.round(progress)}%</span>
              <span className="text-[10px] uppercase text-muted-foreground tracking-wider">Complete</span>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Accumulated</p>
              <h2 className="text-4xl font-bold font-heading text-foreground">
                <CountUp value={group.totalSaved} />
              </h2>
            </div>
            <div className="flex gap-10">
              <div>
                <p className="text-xs text-muted-foreground">Goal Target</p>
                <p className="text-lg font-semibold text-foreground">₹{group.goalAmount.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Days Left</p>
                <p className="text-lg font-semibold text-foreground">{daysLeft} days</p>
              </div>
            </div>
            <div className="pt-2">
              <div className="flex items-center gap-2 text-xs text-success font-medium bg-success/10 w-fit px-2 py-1 rounded-lg">
                <TrendingUp className="w-3 h-3" /> Saving 22% faster than last week
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-6">
          <h3 className="text-base font-semibold font-heading text-foreground flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" /> Smart Insights
          </h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Goal Predictor:</span> At current pace, you'll reach the goal in <span className="text-primary font-bold">18 days</span>.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-warning" />
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Participation:</span> 2 members are inactive. Sending nudges could speed up goal by 4 days.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4 text-success" />
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Behavioral:</span> Ravi is on a 5-day saving streak!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Analytics Chart */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold font-heading text-foreground">Saving Trajectory</h3>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-[10px] font-medium">
                  <div className="w-2 h-2 rounded-full bg-primary"></div> Trend
                </div>
              </div>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorAmount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Member Leaderboard */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Members & Contributions
              </h3>
              <Button variant="ghost" size="sm" className="text-primary text-xs font-semibold">
                Manage Members
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-border">
                    <th className="pb-3 text-xs font-medium text-muted-foreground">Rank</th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground">Name</th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground text-right">Contributed</th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground text-right">% Share</th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {group.members.sort((a, b) => b.totalContributed - a.totalContributed).map((member, i) => (
                    <tr key={member.userId} className="group hover:bg-muted/30 transition-colors">
                      <td className="py-4 text-sm font-semibold">
                        {i === 0 ? <span className="text-lg">🥇</span> : i === 1 ? <span className="text-lg">🥈</span> : i === 2 ? <span className="text-lg">🥉</span> : i + 1}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                            {member.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{member.name}</p>
                            <div className="flex gap-1 mt-0.5">
                              {member.badges.map(badge => (
                                <span key={badge} className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full border border-primary/20">
                                  {badge}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-right text-sm font-bold text-foreground">
                        ₹{member.totalContributed.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-xs font-medium text-muted-foreground">
                          {Math.round((member.totalContributed / group.totalSaved) * 100)}%
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {new Date(member.lastActive) > new Date(Date.now() - 3600000) ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-success/20 text-success">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                            Idle
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="glass-card p-5">
            <h3 className="text-base font-semibold font-heading text-foreground mb-4">Live Activity</h3>
            <div className="space-y-4">
              <AnimatePresence>
                {contributions.map((c, i) => (
                  <motion.div 
                    key={c.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 bg-muted/30 p-3 rounded-xl border border-transparent hover:border-border transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-white text-[10px] font-bold">
                      {c.userName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">
                        <span className="font-bold">{c.userName}</span> {c.source === 'roundup' ? 'saved spare change' : 'added'}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {Math.floor((Date.now() - new Date(c.timestamp).getTime()) / 60000)} mins ago
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">+₹{c.amount}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <Button variant="ghost" className="w-full mt-4 text-xs font-semibold text-primary">
              View Feed
            </Button>
          </div>

          {/* Goal Prediction Card */}
          <div className="glass-card p-5 border-l-4 border-l-primary">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-primary fill-primary" />
              <h3 className="text-sm font-bold text-foreground">Saving Power</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Based on your group's behavior over the last 7 days, you're projected to have a <span className="text-foreground font-bold text-primary">₹2,400 surplus</span> above the target.
            </p>
            <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/10">
              <ResponsiveContainer width="100%" height={60}>
                <LineChart data={[{v: 10}, {v: 15}, {v: 12}, {v: 25}, {v: 30}, {v: 28}, {v: 35}]}>
                  <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-center text-muted-foreground mt-2">Efficiency Rating: Excellent</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
