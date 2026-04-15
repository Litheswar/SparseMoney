import React from 'react';
import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { Investment } from '@/lib/automation';

interface SparklineProps {
  color: string;
  data: { value: number }[];
}

const Sparkline: React.FC<SparklineProps> = ({ color, data }) => (
  <div className="h-8 w-16">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fillOpacity={1}
          fill={`url(#gradient-${color})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

interface HoldingsListProps {
  portfolio: Investment[];
}

// Mock sparkline data
const generateMockData = () => 
  Array.from({ length: 6 }).map((_, i) => ({ value: 10 + Math.random() * 20 }));

export const HoldingsList: React.FC<HoldingsListProps> = ({ portfolio }) => {
  return (
    <div className="glass-card p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold font-heading text-foreground uppercase tracking-widest text-[11px] opacity-70">Asset Holdings</h3>
        <TrendingUp className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="space-y-3">
        {portfolio.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, x: 5 }}
            className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-inner"
                style={{ backgroundColor: `${item.color}15`, color: item.color }}
              >
                {item.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-muted-foreground">{item.type}</span>
                  <span className="text-[10px] text-success font-bold flex items-center">
                    <ArrowUpRight className="w-2 h-2" />
                    {item.returns}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Sparkline color={item.color} data={generateMockData()} />
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">₹{item.amount.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-muted-foreground font-medium">Profit: ₹{Math.round(item.amount * item.returns / 100).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-6 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
      >
        View Detailed Report
      </motion.button>
    </div>
  );
};
