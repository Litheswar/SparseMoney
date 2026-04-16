import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, Bell, X, TrendingUp
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import NotificationPanel from './NotificationPanel';
import { PremiumSidebar } from './PremiumSidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { notifications } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const pageName = location.pathname.split('/').pop()?.replace(/^\w/, (c) => c.toUpperCase()) || 'Dashboard';
    document.title = `SpareSmart — ${pageName}`;
  }, [location.pathname]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background flex p-0 lg:p-0">
      {/* Desktop Floating Sidebar */}
      <PremiumSidebar className="hidden lg:flex shrink-0" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/50 backdrop-blur-md h-16 flex items-center px-4 lg:px-12 transition-all">
          {/* Mobile Sidebar Toggle */}
          <div className="lg:hidden mr-4">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5">
                  <Menu className="w-6 h-6 text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 border-none bg-transparent w-[280px]">
                <PremiumSidebar className="w-[calc(100%-2rem)] h-[calc(100%-2rem)] m-4" />
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex flex-col">
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">
              {user?.role === 'admin' ? 'Admin Gateway' : 'Overview'}
            </h2>
            <p className="text-base font-bold text-foreground tracking-tight">
              {location.pathname.split('/').pop()?.replace(/^\w/, (c) => c.toUpperCase()) || 'Dashboard'}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsNotificationsOpen(true)}
              className="relative rounded-2xl hover:bg-[#4A9A6E]/5 transition-all group w-10 h-10 border border-[#4A9A6E]/10"
            >
              <Bell className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
              {unreadCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#D4A017] text-[10px] font-bold text-white flex items-center justify-center border-2 border-background shadow-lg"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </Button>
          </div>
        </header>

        <NotificationPanel 
          isOpen={isNotificationsOpen} 
          onClose={() => setIsNotificationsOpen(false)} 
        />
        
        <main className="flex-1 px-4 lg:px-12 py-8 relative">
          {/* Subtle Background Elements */}
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#4A9A6E]/5 rounded-full blur-[160px] -z-10 pointer-events-none animate-pulse-slow" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#5B21B6]/5 rounded-full blur-[140px] -z-10 pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ 
                duration: 0.5, 
                ease: [0.165, 0.84, 0.44, 1] 
              }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
