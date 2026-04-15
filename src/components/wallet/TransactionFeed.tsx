import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction, formatCurrency } from '@/lib/automation';
import { ArrowUpRight, ArrowDownLeft, Zap, ExternalLink } from 'lucide-react';

interface TransactionFeedProps {
  transactions: Transaction[];
}

export const TransactionFeed: React.FC<TransactionFeedProps> = ({ transactions }) => {
  const recentTransactions = transactions.slice(0, 8);

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold font-heading text-foreground">Live Feed</h3>
        <div className="flex items-center gap-1.5 bg-primary/10 px-2 py-1 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold text-primary uppercase">Real-Time</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="space-y-4 pr-1">
          <AnimatePresence initial={false}>
            {recentTransactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="group relative"
              >
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg relative">
                      {tx.icon}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-background border border-white/10 flex items-center justify-center">
                        {tx.roundUp > 0 ? <Zap className="w-2 h-2 text-primary" /> : <ArrowDownLeft className="w-2 h-2 text-muted-foreground" />}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground truncate max-w-[120px]">{tx.merchant}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {tx.category}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{formatCurrency(tx.amount)}</p>
                    {tx.roundUp > 0 && (
                      <motion.p 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] text-primary font-bold flex items-center justify-end gap-0.5"
                      >
                        <ArrowUpRight className="w-2 h-2" />
                        +{formatCurrency(tx.roundUp)}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Hover Detail */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded-lg bg-white/10 border border-white/10 hover:bg-white/20 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      
      <button className="w-full mt-6 py-2.5 rounded-xl border border-white/5 text-[10px] font-bold text-muted-foreground hover:bg-white/5 transition-colors">
        Download Statements
      </button>
    </div>
  );
};
