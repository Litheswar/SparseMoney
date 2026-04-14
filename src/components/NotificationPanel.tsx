import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, CheckCheck, BellOff, Settings2, 
  LayoutGrid, AlertTriangle, CheckCircle2, Lightbulb 
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import NotificationCard from './NotificationCard';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'all' | 'alert' | 'success' | 'insight';

const tabs: { id: TabType; label: string; icon: any }[] = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'alert', label: 'Alerts', icon: AlertTriangle },
  { id: 'success', label: 'Success', icon: CheckCircle2 },
  { id: 'insight', label: 'Insights', icon: Lightbulb },
];

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
  } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const navigate = useNavigate();

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    return n.category === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/40 backdrop-blur-sm z-[60]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-full max-w-md bg-card border-l border-border shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-border bg-muted/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold font-heading text-foreground">Notifications</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {unreadCount} unread messages
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        onClose();
                        navigate('/dashboard/profile');
                    }}
                    className="rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Settings2 className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="rounded-xl"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex p-1 bg-muted/50 rounded-xl">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all relative",
                        isActive 
                          ? "text-primary bg-card shadow-sm" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                      {tab.label}
                      {isActive && (
                        <motion.div
                          layoutId="activeTabBadge"
                          className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-primary"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((n, i) => (
                  <NotificationCard 
                    key={n.id} 
                    notification={n} 
                    onRead={markNotificationAsRead}
                    index={i}
                  />
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-40">
                  <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mb-4">
                    <BellOff className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-medium">No {activeTab === 'all' ? '' : activeTab} notifications</p>
                  <p className="text-xs">We'll alert you when something happens</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-border bg-muted/20">
                <Button 
                  onClick={markAllNotificationsAsRead}
                  disabled={unreadCount === 0}
                  className="w-full rounded-xl gradient-primary border-none text-white font-bold"
                >
                  <CheckCheck className="w-4 h-4 mr-2" /> Mark all as read
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
