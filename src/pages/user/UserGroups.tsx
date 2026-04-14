import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Trophy, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Group {
  id: string;
  name: string;
  goal: number;
  collected: number;
  members: { name: string; amount: number }[];
  emoji: string;
}

const MOCK_GROUPS: Group[] = [
  {
    id: 'g1', name: 'Goa Trip 🏖️', goal: 25000, collected: 14200, emoji: '🏖️',
    members: [
      { name: 'Arjun', amount: 5200 },
      { name: 'Ravi', amount: 4800 },
      { name: 'Sneha', amount: 4200 },
    ],
  },
  {
    id: 'g2', name: 'Birthday Fund 🎂', goal: 5000, collected: 3800, emoji: '🎂',
    members: [
      { name: 'Arjun', amount: 2000 },
      { name: 'Priya', amount: 1800 },
    ],
  },
  {
    id: 'g3', name: 'Emergency Fund 🛡️', goal: 50000, collected: 12400, emoji: '🛡️',
    members: [
      { name: 'Arjun', amount: 12400 },
    ],
  },
];

export default function UserGroups() {
  const [groups] = useState<Group[]>(MOCK_GROUPS);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Group Saving Hub
          </h1>
          <p className="text-sm text-muted-foreground">Save together, achieve faster</p>
        </div>
        <Button className="rounded-xl gradient-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Create Group
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group, i) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5"
          >
            <div className="text-center mb-4">
              <span className="text-4xl">{group.emoji}</span>
              <h3 className="text-base font-semibold font-heading text-foreground mt-2">{group.name}</h3>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>₹{group.collected.toLocaleString('en-IN')}</span>
                <span>₹{group.goal.toLocaleString('en-IN')}</span>
              </div>
              <Progress value={(group.collected / group.goal) * 100} className="h-2.5 rounded-full" />
              <p className="text-xs text-muted-foreground mt-1 text-center">
                {Math.round((group.collected / group.goal) * 100)}% complete
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Leaderboard
              </p>
              {group.members.sort((a, b) => b.amount - a.amount).map((m, j) => (
                <div key={m.name} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">
                    {j === 0 ? '🥇' : j === 1 ? '🥈' : '🥉'} {m.name}
                  </span>
                  <span className="font-medium text-foreground">₹{m.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
