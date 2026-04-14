import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, CheckCircle2, AlertTriangle, XCircle, 
  Lightbulb, Zap, TrendingUp, Clock, ArrowRight
} from 'lucide-react';
import { Notification, NotificationType, NotificationCategory } from '@/context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/automation';

interface NotificationCardProps {
  notification: Notification;
  onRead: (id: string) => void;
  index: number;
}

const typeConfig: Record<NotificationType, { icon: any; color: string; bg: string }> = {
  success: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  error: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  insight: { icon: Lightbulb, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  info: { icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
};

export default function NotificationCard({ notification, onRead, index }: NotificationCardProps) {
  const { icon: Icon, color, bg } = typeConfig[notification.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onRead(notification.id)}
      className={cn(
        "relative p-4 rounded-2xl border transition-all cursor-pointer group",
        notification.read 
          ? "bg-muted/30 border-border/50 opacity-80" 
          : "bg-card border-border shadow-sm hover:shadow-md hover:border-primary/30"
      )}
    >
      {!notification.read && (
        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary animate-pulse" />
      )}

      <div className="flex gap-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bg)}>
          <Icon className={cn("w-5 h-5", color)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className={cn(
              "text-sm font-semibold truncate",
              notification.read ? "text-muted-foreground" : "text-foreground"
            )}>
              {notification.title}
            </h4>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 whitespace-nowrap ml-2">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {notification.description}
          </p>

          {notification.amount && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                {formatCurrency(notification.amount)}
              </span>
              <span className="text-[10px] text-muted-foreground">Investment</span>
            </div>
          )}

          {notification.actionLabel && (
            <button className="mt-3 flex items-center gap-1 text-[11px] font-bold text-primary group-hover:gap-2 transition-all">
              {notification.actionLabel} <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      
      {/* Category Tag */}
      <div className="absolute -bottom-2 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
         <span className="px-2 py-0.5 rounded-full bg-primary/10 text-[9px] font-bold text-primary uppercase tracking-wider">
           {notification.category}
         </span>
      </div>
    </motion.div>
  );
}
