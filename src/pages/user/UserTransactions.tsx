import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';

interface Transaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  spare: number;
  rounded_amount: number;
  icon: string;
  created_at: string;
}

export default function UserTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [txResult, cats] = await Promise.all([
          api.transactions.list({ limit: 100 }),
          api.transactions.categories(),
        ]);
        setTransactions(txResult.transactions || []);
        setCategories(cats || []);
      } catch (err) {
        console.error('Load transactions error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Client-side search filter (server-side also works but instant is better UX)
  const filtered = transactions.filter(t => {
    if (search && !(t.merchant || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== 'all' && t.category !== category) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Transactions</h1>
        <p className="text-sm text-muted-foreground">Full history with round-up breakdown</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search merchant..."
            className="pl-10 rounded-xl"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40 rounded-xl">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Transaction List */}
      <div className="glass-card divide-y divide-border">
        {filtered.map((tx, i) => {
          const spare = Number(tx.spare || 0);
          const amount = Number(tx.amount);
          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
            >
              <button
                onClick={() => setExpandedId(expandedId === tx.id ? null : tx.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors text-left"
              >
                <span className="text-xl">{tx.icon || '💳'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{tx.merchant || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.created_at).toLocaleDateString()} · {tx.category}
                  </p>
                </div>
                <div className="text-right mr-2">
                  <p className="text-sm font-semibold text-foreground">₹{amount}</p>
                  <p className="text-xs text-success">+₹{spare}</p>
                </div>
                {expandedId === tx.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              <AnimatePresence>
                {expandedId === tx.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0">
                      <div className="bg-muted/30 rounded-xl p-4">
                        <p className="text-sm font-medium text-foreground mb-2">Round-Up Breakdown</p>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="bg-muted px-3 py-1.5 rounded-lg text-foreground">₹{amount}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="bg-muted px-3 py-1.5 rounded-lg text-foreground">₹{amount + spare}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="bg-success/10 text-success px-3 py-1.5 rounded-lg font-bold">Spare ₹{spare}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No transactions found</p>
        )}
      </div>
    </div>
  );
}
