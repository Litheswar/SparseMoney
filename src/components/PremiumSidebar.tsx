import React, { useState, useEffect } from 'react';
import { NavLink as RRNavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import {
  Home, ArrowLeftRight, Wallet, BarChart3, Settings2, Compass,
  Users, UserCircle, Shield, Activity, AlertTriangle, FileText,
  Cpu, Bell, LogOut, ChevronLeft, ChevronRight, Sparkles, TrendingUp,
  Settings, User, CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const userNav = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/dashboard/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/dashboard/wallet', icon: Wallet, label: 'Wallet', badge: 'new' },
  { to: '/dashboard/insights', icon: BarChart3, label: 'Insights', warning: true },
  { to: '/dashboard/rules', icon: Settings2, label: 'Rules' },
  { to: '/dashboard/horizon', icon: Compass, label: 'Horizon' },
  { to: '/dashboard/groups', icon: Users, label: 'Groups', count: 3 },
  { to: '/dashboard/profile', icon: UserCircle, label: 'Profile' },
];

const adminNav = [
  { to: '/admin', icon: Home, label: 'Overview' },
  { to: '/admin/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/admin/engine', icon: Cpu, label: 'Engine Logs' },
  { to: '/admin/anomaly', icon: AlertTriangle, label: 'Anomaly', warning: true },
  { to: '/admin/behavior', icon: Activity, label: 'Behavior' },
  { to: '/admin/rules', icon: Settings2, label: 'Rule Analytics' },
  { to: '/admin/audit', icon: FileText, label: 'Audit Logs' },
  { to: '/admin/health', icon: Bell, label: 'System Health', badge: 'alert' },
];

interface NavItemProps {
  item: typeof userNav[0];
  isCollapsed: boolean;
  isActive: boolean;
  onClick?: () => void;
}

const NavNavItem = ({ item, isCollapsed, isActive, onClick }: NavItemProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <RRNavLink
          to={item.to}
          onClick={onClick}
          className={cn(
            "group relative flex items-center h-12 my-1 rounded-xl text-sm font-medium transition-all duration-200 outline-none overflow-hidden",
            isActive 
              ? "text-primary" 
              : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:sidebar-item-hover"
          )}
        >
          {/* Active Highlight background */}
          {isActive && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 bg-primary/10 rounded-xl"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          
          {/* Left Accent Bar */}
          {isActive && (
            <motion.div 
              layoutId="active-indicator"
              className="tab-active-indicator"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}

          {/* Icon Container - Fixed size to prevent shifting */}
          <div className="w-12 h-12 shrink-0 flex items-center justify-center relative z-10">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-[#4A9A6E] transition-none" : "group-hover:text-[#4A9A6E]"
              )} />
              
              {/* Context Aware Indicators */}
              {(item.badge || item.warning || (item.count && item.count > 0)) && (
                <span className={cn(
                  "absolute -top-1 -right-1 w-2 h-2 rounded-full",
                  item.warning ? "bg-[#D4A017] shadow-[0_0_8px_rgba(212,160,23,0.6)]" : "bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.4)]",
                  isActive || "animate-pulse"
                )} />
              )}
            </motion.div>
          </div>

          {/* Label - Absolute/Clip to prevent "Squeeze" */}
          <AnimatePresence mode="popLayout" initial={false}>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
                className="relative z-10 flex-1 truncate pr-4"
              >
                <motion.span 
                  className="inline-block"
                  whileHover={{ x: 2 }}
                >
                  {item.label}
                </motion.span>
                {item.count && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-md bg-primary/20 text-[10px] text-primary font-bold">
                    {item.count}
                  </span>
                )}
              </motion.span>
            )}
          </AnimatePresence>
        </RRNavLink>
      </TooltipTrigger>
      <AnimatePresence mode="wait">
        {isCollapsed && (
          <TooltipContent 
            side="right" 
            sideOffset={16}
            className="bg-[#1E293B] border-white/10 text-white font-medium shadow-2xl z-[60]"
          >
            {item.label}
            {item.count && <span className="ml-2 text-primary">({item.count})</span>}
          </TooltipContent>
        )}
      </AnimatePresence>
    </Tooltip>
  );
};

export function PremiumSidebar({ className }: { className?: string }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [greeting, setGreeting] = useState('');
  
  const navItems = user?.role === 'admin' ? adminNav : userNav;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className={cn(
        "flex flex-col h-[calc(100vh-2rem)] sticky top-4 left-4 z-50 floating-sidebar transition-all duration-300 ease-in-out m-4",
        className
      )}
    >
      {/* Brand Section */}
      <div className={cn(
        "p-6 flex items-center h-20",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        <AnimatePresence mode="popLayout">
          {!isCollapsed ? (
            <motion.div
              key="expanded-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4A9A6E] to-[#4A9A6E]/70 flex items-center justify-center sage-glow-md">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black font-heading text-[#1E2937] tracking-tight">
                  SpareSmart
                </span>
                <span className="text-[10px] font-bold text-[#4A9A6E] tracking-[0.2em] uppercase leading-none mt-1">
                  Wealth
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A9A6E] to-[#4A9A6E]/70 flex items-center justify-center sage-glow-sm"
            >
              <TrendingUp className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sidebar-foreground/50 hover:text-primary transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {isCollapsed && (
         <button 
          onClick={() => setIsCollapsed(false)}
          className="mx-auto mb-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sidebar-foreground/50 hover:text-primary transition-all duration-200"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Greeting & Hint */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-6 mb-4 overflow-hidden"
          >
            <p className="text-[11px] text-[#64748B] font-medium">
              {greeting}, {user?.name?.split(' ')[0]} 👋
            </p>
            <div className="mt-3 p-3 rounded-xl bg-[#4A9A6E]/5 border border-[#4A9A6E]/10 flex items-start gap-2 group cursor-pointer hover:bg-[#4A9A6E]/10 transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-[#4A9A6E] mt-0.5" />
              <p className="text-[10px] text-[#4A9A6E]/80 font-medium leading-tight">
                Check Insights — unusual spending detected.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav List */}
      <TooltipProvider delayDuration={300}>
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {navItems.map(item => {
            const isActive = location.pathname === item.to ||
              (item.to !== '/dashboard' && item.to !== '/admin' && location.pathname.startsWith(item.to));
            return (
              <NavNavItem 
                key={item.to} 
                item={item} 
                isCollapsed={isCollapsed} 
                isActive={isActive} 
              />
            );
          })}
        </nav>
      </TooltipProvider>

      {/* Live Activity Strip */}
      {!isCollapsed && (
        <div className="px-6 py-3 overflow-hidden border-t border-[#4A9A6E]/5">
          <div className="flex items-center gap-2 animate-marquee whitespace-nowrap">
            <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">+₹7 added</span>
            <span className="text-[10px] font-bold text-[#4A9A6E] bg-[#4A9A6E]/10 px-2 py-0.5 rounded-full">Wealth Sync</span>
          </div>
        </div>
      )}

      {/* User Section (Bottom) */}
      <div className="p-4 mt-auto border-t border-white/5 bg-white/[0.02]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
               "w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-white/5 transition-all duration-300 outline-none group",
               isCollapsed ? "justify-center" : "justify-start"
            )}>
              <div className="relative shrink-0">
                <Avatar className="w-9 h-9 border-2 border-primary/20 group-hover:border-primary transition-colors">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">
                    {user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#1e293b] rounded-full" />
              </div>
              
              {!isCollapsed && (
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-sm font-bold text-white truncate w-full">{user?.name}</span>
                  <span className="text-[10px] text-sidebar-foreground/40 font-semibold uppercase tracking-wider">
                    {user?.role === 'admin' ? 'Administrator' : 'Premium User'}
                  </span>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            side="top" 
            align={isCollapsed ? "center" : "start"} 
            className="w-60 mb-2 bg-white border-[#4A9A6E]/10 text-[#1E2937] rounded-[1.5rem] p-2 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-[#64748B] px-3 py-2">
              Wealth Control
            </DropdownMenuLabel>
            <DropdownMenuItem className="rounded-xl px-3 py-2.5 focus:bg-[#4A9A6E]/10 focus:text-[#4A9A6E] cursor-pointer gap-3 transition-colors">
              <User className="w-4 h-4" /> View Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl px-3 py-2.5 focus:bg-[#4A9A6E]/10 focus:text-[#4A9A6E] cursor-pointer gap-3 transition-colors">
              <Settings className="w-4 h-4" /> Portfolio Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#4A9A6E]/5 my-1" />
            <DropdownMenuItem 
              onClick={logout}
              className="rounded-xl px-3 py-2.5 text-rose-500 focus:bg-rose-500/10 focus:text-rose-500 cursor-pointer gap-3 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.aside>
  );
}
