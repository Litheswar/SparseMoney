import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart as RPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Investment } from '@/lib/automation';

interface InteractivePortfolioProps {
  portfolio: Investment[];
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;

  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={fill} className="text-sm font-bold font-heading">
        {payload.name}
      </text>
      <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="hsl(var(--muted-foreground))" className="text-[10px] font-medium">
        ₹{value.toLocaleString('en-IN')}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export const InteractivePortfolio: React.FC<InteractivePortfolioProps> = ({ portfolio }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const totalAmount = portfolio.reduce((sum, item) => sum + item.amount, 0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold font-heading text-foreground">Portfolio Allocation</h3>
          <p className="text-xs text-muted-foreground">Diversified across 4 asset classes</p>
        </div>
        <div className="p-2 rounded-xl bg-primary/10">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center flex-1">
        <div className="h-64 relative">
          <ResponsiveContainer width="100%" height="100%">
            <RPieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={portfolio}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                dataKey="amount"
                onMouseEnter={onPieEnter}
                paddingAngle={5}
                stroke="none"
              >
                {portfolio.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    style={{ filter: `drop-shadow(0 0 8px ${entry.color}44)` }}
                  />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return null; // Custom shape handles it better
                  }
                  return null;
                }}
              />
            </RPieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          {portfolio.map((item, index) => (
            <motion.div 
              key={item.name}
              onMouseEnter={() => setActiveIndex(index)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                activeIndex === index 
                  ? 'bg-white/5 border-white/20 scale-105 shadow-lg' 
                  : 'bg-transparent border-transparent opacity-60 grayscale-[0.5]'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-sm font-bold text-foreground">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">{Math.round((item.amount / totalAmount) * 100)}% allocation</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">₹{item.amount.toLocaleString('en-IN')}</p>
                  <p className={`text-[10px] flex items-center justify-end gap-0.5 ${item.returns >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {item.returns >= 0 ? <ArrowUpRight className="w-2 h-2" /> : <ArrowDownRight className="w-2 h-2" />}
                    {item.returns}%
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
