import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function AdminTransactions() {
  const { transactions } = useApp();
  const [search, setSearch] = useState('');

  const filtered = transactions.filter(t =>
    !search || t.merchant.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const csv = 'ID,Merchant,Category,Amount,RoundUp,Time\n' +
      filtered.map(t => `${t.id},${t.merchant},${t.category},${t.amount},${t.roundUp},${t.timestamp.toISOString()}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading text-foreground">Transaction Monitoring</h1>
        <Button variant="outline" onClick={exportCSV} className="rounded-xl">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-10 rounded-xl" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 text-muted-foreground font-medium">Merchant</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Category</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Amount</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Round-Up</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Time</th>
                <th className="text-left p-3 text-muted-foreground font-medium">ID</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((tx, i) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 hover:bg-muted/20"
                >
                  <td className="p-3 text-foreground">{tx.icon} {tx.merchant}</td>
                  <td className="p-3 text-muted-foreground">{tx.category}</td>
                  <td className="p-3 text-right text-foreground font-medium">₹{tx.amount}</td>
                  <td className="p-3 text-right text-success">+₹{tx.roundUp}</td>
                  <td className="p-3 text-muted-foreground text-xs">{tx.timestamp.toLocaleTimeString()}</td>
                  <td className="p-3 text-xs text-muted-foreground font-mono">{tx.id.slice(0, 12)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
