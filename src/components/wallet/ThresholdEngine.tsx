import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Rocket } from 'lucide-react';
import { formatCurrency } from '@/lib/automation';

interface ThresholdEngineProps {
  balance: number;
  threshold: number;
}

export const ThresholdEngine: React.FC<ThresholdEngineProps> = ({ balance, threshold }) => {
  const percentage = Math.min(100, (balance / threshold) * 100);
  const strokeDasharray = 251.2; // 2 * PI * r (r=40)
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;
  const isNear = percentage > 80;

  return (
    <div className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden group">
      <div className={`absolute inset-0 bg-primary/5 transition-opacity duration-500 ${isNear ? 'opacity-100' : 'opacity-0'}`} />
      
      <div className="relative z-10 text-center mb-6">
        <h3 className="text-sm font-bold font-heading text-foreground uppercase tracking-widest opacity-70">Threshold Engine</h3>
        <p className="text-[10px] text-muted-foreground mt-1">Next Auto-Investment at {formatCurrency(threshold)}</p>
      </div>

      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Glow Effect */}
        <AnimatePresence>
          {isNear && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"
            />
          )}
        </AnimatePresence>

        <svg className="w-full h-full transform -rotate-90">
          {/* Background Circle */}
          <circle
            cx="96"
            cy="96"
            r="80"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-white/5"
          />
          {/* Progress Circle */}
          <motion.circle
            cx="96"
            cy="96"
            r="80"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray * 2}
            initial={{ strokeDashoffset: strokeDasharray * 2 }}
            animate={{ strokeDashoffset: strokeDasharray * 2 - (strokeDasharray * 2 * percentage) / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={isNear ? "text-primary filter drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]" : "text-primary/60"}
          />
        </svg>

        <div className="absolute flex flex-col items-center">
          <motion.div 
            animate={isNear ? { y: [-2, 2, -2] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
            className={`p-3 rounded-2xl ${isNear ? 'bg-primary text-white shadow-[0_0_20px_rgba(var(--primary),0.5)]' : 'bg-white/5 text-muted-foreground'}`}
          >
            {isNear ? <Rocket className="w-8 h-8" /> : <Zap className="w-8 h-8" />}
          </motion.div>
          <span className="text-2xl font-bold font-heading text-foreground mt-2">{Math.round(percentage)}%</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase">{formatCurrency(balance)}</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 w-full">
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
          <p className="text-[10px] text-muted-foreground mb-1 uppercase">To Go</p>
          <p className="text-sm font-bold text-foreground">{formatCurrency(threshold - balance)}</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
          <p className="text-[10px] text-muted-foreground mb-1 uppercase">Avg Daily</p>
          <p className="text-sm font-bold text-foreground">₹24</p>
        </div>
      </div>
    </div>
  );
};
