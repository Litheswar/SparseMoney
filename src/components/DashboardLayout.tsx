import { NavLink as RRNavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import {
  Home, ArrowLeftRight, Wallet, BarChart3, Settings2, Compass,
  Users, UserCircle, Shield, Activity, AlertTriangle, FileText,
  Cpu, Bell, LogOut, Menu, X, TrendingUp
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import NotificationPanel from './NotificationPanel';

const userNav = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/dashboard/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/dashboard/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/dashboard/insights', icon: BarChart3, label: 'Insights' },
  { to: '/dashboard/rules', icon: Settings2, label: 'Rules' },
  { to: '/dashboard/horizon', icon: Compass, label: 'Horizon' },
  { to: '/dashboard/groups', icon: Users, label: 'Groups' },
  { to: '/dashboard/profile', icon: UserCircle, label: 'Profile' },
];

const adminNav = [
  { to: '/admin', icon: Home, label: 'Overview' },
  { to: '/admin/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/admin/engine', icon: Cpu, label: 'Engine Logs' },
  { to: '/admin/anomaly', icon: AlertTriangle, label: 'Anomaly' },
  { to: '/admin/behavior', icon: Activity, label: 'Behavior' },
  { to: '/admin/rules', icon: Settings2, label: 'Rule Analytics' },
  { to: '/admin/audit', icon: FileText, label: 'Audit Logs' },
  { to: '/admin/health', icon: Bell, label: 'System Health' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { notifications } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();
  const navItems = user?.role === 'admin' ? adminNav : userNav;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 gradient-dark flex flex-col transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold font-heading text-sidebar-foreground">SpareSmart</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-sidebar-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location.pathname === item.to ||
              (item.to !== '/dashboard' && item.to !== '/admin' && location.pathname.startsWith(item.to));
            return (
              <RRNavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
              >
                <item.icon className="w-4.5 h-4.5" />
                {item.label}
              </RRNavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/50 flex items-center gap-1">
                {user?.role === 'admin' ? <Shield className="w-3 h-3" /> : null}
                {user?.role === 'admin' ? 'Admin' : 'User'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-xl"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border h-14 flex items-center px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-3">
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <h2 className="text-sm font-medium text-muted-foreground">
            {user?.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
          </h2>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsNotificationsOpen(true)}
              className="relative rounded-full hover:bg-muted/50 transition-colors group"
            >
              <Bell className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
              {unreadCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-background shadow-sm"
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
        <main className="flex-1 p-4 lg:p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
