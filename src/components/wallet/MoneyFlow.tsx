import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Coins, Wallet, Landmark, ArrowRight } from 'lucide-react';

interface Coin {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
}

export const MoneyFlow: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [activeStep, setActiveStep] = useState(0);

  // Simulate coins every 5 seconds or on trigger
  useEffect(() => {
    const interval = setInterval(() => {
      spawnCoins();
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const spawnCoins = () => {
    const newCoins = Array.from({ length: 3 }).map((_, i) => ({
      id: Date.now() + i,
      startX: 0,
      startY: 0,
      endX: 1, // Normalized
      endY: 0,
      delay: i * 0.4
    }));
    setCoins(prev => [...prev, ...newCoins]);
    setTimeout(() => {
      setCoins(prev => prev.filter(c => !newCoins.find(nc => nc.id === c.id)));
    }, 4000);
  };

  return (
    <div className="glass-card p-6 relative h-[300px] overflow-hidden flex flex-col justify-between">
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h3 className="text-lg font-bold font-heading text-foreground">Live Money Flow</h3>
          <p className="text-xs text-muted-foreground">Every ₹1 saved is a brick in your wealth wall</p>
        </div>
        <button 
          onClick={spawnCoins}
          className="text-[10px] px-2 py-1 bg-primary/20 text-primary border border-primary/20 rounded hover:bg-primary/30 transition-colors"
        >
          Simulate Flow
        </button>
      </div>

      <div className="flex justify-between items-center px-4 relative flex-1">
        {/* Connection Lines (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" fill="none">
          <motion.path
            d="M 60 120 Q 150 120 200 120"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            strokeDasharray="4 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
          />
          <motion.path
            d="M 260 120 Q 320 120 380 80"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <motion.path
            d="M 260 120 Q 320 120 380 160"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>

        {/* Nodes */}
        <div className="flex flex-col items-center gap-2 group cursor-default">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative z-20 shadow-xl"
          >
            <ShoppingBag className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary border-2 border-background flex items-center justify-center text-[8px] font-bold text-white">4</div>
          </motion.div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Spend</span>
        </div>

        <div className="flex flex-col items-center gap-2 relative">
          <motion.div 
            animate={{ 
              boxShadow: ["0 0 0px rgba(var(--primary), 0)", "0 0 20px rgba(var(--primary), 0.3)", "0 0 0px rgba(var(--primary), 0)"]
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center relative z-20"
          >
            <Coins className="w-8 h-8 text-primary" />
          </motion.div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Round-Up</span>
          
          {/* Animated Coins */}
          <AnimatePresence>
            {coins.map(coin => (
              <motion.div
                key={coin.id}
                initial={{ x: -120, y: 0, opacity: 0, scale: 0.5 }}
                animate={{ 
                  x: [ -120, 0, 140 ],
                  y: [ 0, 0, Math.random() > 0.5 ? -40 : 40 ],
                  opacity: [0, 1, 1, 0],
                  scale: [0.5, 1, 1, 0.5],
                  rotate: 360
                }}
                transition={{ duration: 3, delay: coin.delay, ease: "easeInOut" }}
                className="absolute text-yellow-500 z-30 filter drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]"
              >
                <Coins className="w-4 h-4" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-2 group">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative z-20 shadow-lg"
            >
              <Wallet className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Wallet</span>
          </div>

          <div className="flex flex-col items-center gap-2 group">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center relative z-20 shadow-lg"
            >
              <Landmark className="w-8 h-8 text-teal-500 group-hover:text-teal-400 transition-colors" />
            </motion.div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-500">Invested</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-4 text-[10px] font-medium text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span>Zomato ₹342 → +₹8</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-teal-500" />
          <span>Wallet → Gold ETF</span>
        </div>
      </div>
    </div>
  );
};
