import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  size?: number;
  hideText?: boolean;
  context?: 'sage' | 'wealth' | 'intel' | 'neutral';
  withGlow?: boolean;
  tagline?: string;
  animate?: boolean;
  pulse?: boolean;
}

export default function BrandLogo({
  className,
  size = 32,
  hideText = false,
  context = 'sage',
  withGlow = false,
  tagline,
  animate = true,
  pulse = false,
}: BrandLogoProps) {
  
  const tints = {
    sage: 'sage-glow-md bg-gradient-to-br from-[#4A9A6E] to-[#4A9A6E]/70',
    wealth: 'gold-glow-md bg-gradient-to-br from-[#D4A017] to-[#D4A017]/70',
    intel: 'indigo-glow-md bg-gradient-to-br from-[#5B21B6] to-[#5B21B6]/70',
    neutral: 'bg-slate-200',
  };

  const textColors = {
    sage: 'text-[#1E2937]',
    wealth: 'text-[#D4A017]',
    intel: 'text-[#5B21B6]',
    neutral: 'text-slate-400',
  };

  const taglineColors = {
    sage: 'text-[#4A9A6E]',
    wealth: 'text-[#D4A017]/80',
    intel: 'text-[#5B21B6]/80',
    neutral: 'text-slate-400/80',
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <motion.div
        initial={animate ? { opacity: 0, scale: 0.8, rotate: -10 } : false}
        animate={animate ? { opacity: 1, scale: 1, rotate: 0 } : false}
        whileHover={animate ? { scale: 1.1, rotate: 5, filter: 'brightness(1.1)' } : false}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "relative flex items-center justify-center rounded-2xl overflow-hidden shrink-0",
          withGlow && tints[context],
          context === 'neutral' && "opacity-50 grayscale",
          pulse && "ring-4 ring-emerald-500/50"
        )}

        style={{ width: size, height: size }}
      >
        <img 
          src="/favicon.png" 
          alt="SpareSmart Logo" 
          className="w-full h-full object-cover"
        />
        
        {withGlow && animate && (
          <motion.div
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1] 
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className={cn(
              "absolute inset-0 -z-10 blur-xl opacity-30",
              context === 'sage' && "bg-[#4A9A6E]",
              context === 'wealth' && "bg-[#D4A017]",
              context === 'intel' && "bg-[#5B21B6]"
            )}
          />
        )}
      </motion.div>

      {!hideText && (
        <div className="flex flex-col leading-none">
          <motion.span 
            initial={animate ? { opacity: 0, x: -10 } : false}
            animate={animate ? { opacity: 1, x: 0 } : false}
            transition={{ delay: 0.1, duration: 0.5 }}
            className={cn(
              "font-black font-heading tracking-tight",
              size > 30 ? "text-xl" : "text-base",
              textColors[context]
            )}
          >
            SpareSmart
          </motion.span>
          {tagline && (
            <motion.span 
              initial={animate ? { opacity: 0 } : false}
              animate={animate ? { opacity: 1 } : false}
              transition={{ delay: 0.2, duration: 0.5 }}
              className={cn(
                "text-[10px] font-bold uppercase tracking-[0.2em] mt-1",
                taglineColors[context]
              )}
            >
              {tagline}
            </motion.span>
          )}
        </div>
      )}
    </div>
  );
}
