import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Settings, Shield, Zap, TrendingUp, ChevronRight } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { motion } from 'framer-motion';

interface PortfolioSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PortfolioSettingsSheet({ open, onOpenChange }: PortfolioSettingsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-[#F8FAF5] border-l border-[#4A9A6E]/10 p-0">
        <div className="flex flex-col h-full bg-white m-4 rounded-[2.5rem] shadow-2xl overflow-hidden border border-[#4A9A6E]/5">
          <div className="p-8 bg-gradient-to-br from-[#4A9A6E]/5 to-transparent">
            <SheetHeader className="mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[#4A9A6E] flex items-center justify-center mb-4 shadow-lg shadow-[#4A9A6E]/20">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <SheetTitle className="text-3xl font-black font-heading text-[#1E2937]">Portfolio Control</SheetTitle>
              <SheetDescription className="text-[#64748B] text-sm font-medium">
                Optimize your automated wealth strategy and risk parameters.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6">
              {/* Strategy Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#4A9A6E]">Strategy Mode</h4>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'defensive', label: 'Defensive', icon: Shield, desc: 'Focus on index & debt funds' },
                    { id: 'growth', label: 'Strategic Growth', icon: TrendingUp, desc: 'Balanced crypto & gold allocation', active: true },
                    { id: 'aggressive', label: 'Aggressive', icon: Zap, desc: 'High momentum AI-driven routes' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                        mode.active 
                        ? 'bg-white border-[#4A9A6E] shadow-xl shadow-[#4A9A6E]/5 ring-1 ring-[#4A9A6E]' 
                        : 'bg-[#F8FAF5] border-transparent grayscale opacity-70 hover:opacity-100 hover:grayscale-0'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mode.active ? 'bg-[#4A9A6E]/10 text-[#4A9A6E]' : 'bg-gray-200 text-gray-500'}`}>
                        <mode.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#1E2937]">{mode.label}</p>
                        <p className="text-[10px] text-[#64748B]">{mode.desc}</p>
                      </div>
                      {mode.active && <ChevronRight className="w-4 h-4 text-[#4A9A6E]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4 pt-6 mt-6 border-t border-[#4A9A6E]/5">
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#4A9A6E]">Automation Parameters</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F8FAF5]">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-[#1E2937]">Auto-Invest Threshold</p>
                      <p className="text-[10px] text-[#64748B]">Invest when wallet hits ₹500</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F8FAF5]">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-[#1E2937]">Smart Portfolio Rebalancing</p>
                      <p className="text-[10px] text-[#64748B]">Auto-adjust based on volatility</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto p-8 border-t border-[#4A9A6E]/5">
            <button 
              onClick={() => onOpenChange(false)}
              className="w-full h-14 bg-[#4A9A6E] text-white font-bold rounded-2xl shadow-lg shadow-[#4A9A6E]/20 hover:bg-[#3d835d] transition-all"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
