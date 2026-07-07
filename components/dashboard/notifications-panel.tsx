"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Ban,
  CalendarCheck,
  Loader2,
  Trash2,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

const TYPE_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  APPOINTMENT_BOOKED: {
    icon: Calendar,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  APPOINTMENT_APPROVED: {
    icon: CalendarCheck,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  APPOINTMENT_REJECTED: {
    icon: Ban,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
  APPOINTMENT_CANCELLED: {
    icon: AlertCircle,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  APPOINTMENT_RESCHEDULED: {
    icon: RefreshCw,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  AVAILABILITY_CHANGED: {
    icon: Clock,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  SYSTEM_ALERT: {
    icon: AlertCircle,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  ADMIN_ANNOUNCEMENT: {
    icon: Info,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
};

const FALLBACK_CONFIG = {
  icon: Bell,
  color: "text-muted-foreground",
  bgColor: "bg-secondary",
};

export function NotificationsPanel() {
  const { notifications, unreadCount, loading, markRead, markAllRead, deleteNotification, deleteAllNotifications } =
    useNotifications();
  const router = useRouter();

  const displayed = notifications.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 p-5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10">
            <Bell className="h-5 w-5 text-rose-500" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">Notifications</h3>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                : "You're all caught up"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={markAllRead}
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-destructive"
              onClick={deleteAllNotifications}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Delete all
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/50">
            <Bell className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <div>
            <p className="text-sm font-medium">No notifications yet</p>
            <p className="text-xs text-muted-foreground">
              We&apos;ll notify you when something happens
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          <AnimatePresence initial={false}>
            {displayed.map((notification) => {
              const config = TYPE_CONFIG[notification.type] ?? FALLBACK_CONFIG;
              const Icon = config.icon;

              return (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  className={cn(
                    "group relative cursor-pointer p-4 transition-colors hover:bg-secondary/30",
                    !notification.read && "bg-primary/5"
                  )}
                  onClick={() => {
                    if (!notification.read) markRead(notification.id);
                    if (notification.link) router.push(notification.link);
                  }}
                >
                  {/* Unread indicator bar */}
                  {!notification.read && (
                    <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                  )}

                  <div className="flex items-start gap-3 pl-2">
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        config.bgColor
                      )}
                    >
                      <Icon className={cn("h-5 w-5", config.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <p className={cn("font-medium text-sm", !notification.read && "text-foreground")}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="ml-2 mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-1 pt-0.5 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity md:flex-row">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                          title="Mark as read"
                          onClick={(e) => {
                            e.stopPropagation();
                            markRead(notification.id);
                          }}
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        title="Delete notification"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* View All */}
      {notifications.length > 0 && (
        <div className="border-t border-border/50 p-4">
          <Button
            variant="ghost"
            className="w-full gap-1 text-primary hover:bg-primary/10 hover:text-primary"
          >
            View All Notifications
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </motion.div>
  );
}
