import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function UserTransactions() {
  const { transactions } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = ['all', ...new Set(transactions.map(t => t.category))];

  const filtered = transactions.filter(t => {
    if (search && !t.merchant.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== 'all' && t.category !== category) return false;
    return true;
  });

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
            {categories.map(c => (
              <SelectItem key={c} value={c}>{c === 'all' ? 'All Categories' : c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Transaction List */}
      <div className="glass-card divide-y divide-border">
        {filtered.map((tx, i) => (
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
              <span className="text-xl">{tx.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{tx.merchant}</p>
                <p className="text-xs text-muted-foreground">
                  {tx.timestamp.toLocaleDateString()} · {tx.category}
                </p>
              </div>
              <div className="text-right mr-2">
                <p className="text-sm font-semibold text-foreground">₹{tx.amount}</p>
                <p className="text-xs text-success">+₹{tx.roundUp}</p>
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
                        <span className="bg-muted px-3 py-1.5 rounded-lg text-foreground">₹{tx.amount}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="bg-muted px-3 py-1.5 rounded-lg text-foreground">₹{tx.amount + tx.roundUp}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="bg-success/10 text-success px-3 py-1.5 rounded-lg font-bold">Spare ₹{tx.roundUp}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No transactions found</p>
        )}
      </div>
    </div>
  );
}
