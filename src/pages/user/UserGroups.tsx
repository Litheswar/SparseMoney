import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Trophy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';

interface GroupMember {
  name: string;
  contribution: number;
}

interface Group {
  id: string;
  name: string;
  target_amount: number;
  collected: number;
  emoji: string;
  members: GroupMember[];
}

export default function UserGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.groups.list();
        setGroups(data || []);
      } catch (err) {
        console.error('Groups load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

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
        {groups.map((group, i) => {
          const target = Number(group.target_amount) || 1;
          const collected = Number(group.collected) || 0;
          return (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5"
            >
              <div className="text-center mb-4">
                <span className="text-4xl">{group.emoji || '🎯'}</span>
                <h3 className="text-base font-semibold font-heading text-foreground mt-2">{group.name}</h3>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>₹{collected.toLocaleString('en-IN')}</span>
                  <span>₹{target.toLocaleString('en-IN')}</span>
                </div>
                <Progress value={(collected / target) * 100} className="h-2.5 rounded-full" />
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  {Math.round((collected / target) * 100)}% complete
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> Leaderboard
                </p>
                {(group.members || []).sort((a, b) => b.contribution - a.contribution).map((m, j) => (
                  <div key={m.name} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">
                      {j === 0 ? '🥇' : j === 1 ? '🥈' : '🥉'} {m.name}
                    </span>
                    <span className="font-medium text-foreground">₹{m.contribution.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                {(!group.members || group.members.length === 0) && (
                  <p className="text-xs text-muted-foreground">No members yet</p>
                )}
              </div>
            </motion.div>
          );
        })}
        {groups.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <p>No groups yet. Create one to start saving together!</p>
          </div>
        )}
      </div>
    </div>
  );
}
