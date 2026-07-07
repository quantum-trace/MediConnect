"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Ban,
  CalendarCheck,
  CheckCheck,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

const TYPE_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; bgColor: string; label: string }
> = {
  APPOINTMENT_BOOKED:      { icon: Calendar,      color: "text-primary",      bgColor: "bg-primary/10",      label: "Booked"       },
  APPOINTMENT_APPROVED:    { icon: CalendarCheck,  color: "text-emerald-500",  bgColor: "bg-emerald-500/10",  label: "Approved"     },
  APPOINTMENT_REJECTED:    { icon: Ban,            color: "text-rose-500",     bgColor: "bg-rose-500/10",     label: "Rejected"     },
  APPOINTMENT_CANCELLED:   { icon: AlertCircle,    color: "text-amber-500",    bgColor: "bg-amber-500/10",    label: "Cancelled"    },
  APPOINTMENT_RESCHEDULED: { icon: RefreshCw,      color: "text-blue-500",     bgColor: "bg-blue-500/10",     label: "Rescheduled"  },
  AVAILABILITY_CHANGED:    { icon: Clock,          color: "text-violet-500",   bgColor: "bg-violet-500/10",   label: "Availability" },
};

const FALLBACK = { icon: Bell, color: "text-muted-foreground", bgColor: "bg-secondary", label: "General" };

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();

  const [tab, setTab] = useState<"all" | "unread">("all");

  const displayed = notifications.filter((n) => tab === "all" || !n.read);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">Stay updated on your appointments and health activity.</p>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-2 shrink-0">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer gap-2 rounded-xl border-border/50"
                onClick={markAllRead}
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer gap-2 rounded-xl border-border/50 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40"
                onClick={deleteAllNotifications}
              >
                <Trash2 className="h-4 w-4" />
                Delete all
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "unread")}>
        <TabsList className="h-9 rounded-xl bg-secondary/30 p-1">
          <TabsTrigger value="all" className="rounded-lg px-4 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
            All
          </TabsTrigger>
          <TabsTrigger value="unread" className="rounded-lg px-4 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Unread
            {unreadCount > 0 && (
              <Badge className="ml-1.5 h-4 rounded-full bg-primary/20 px-1.5 text-[10px] font-semibold text-primary">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/50">
              <Bell className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="font-medium">
              {tab === "unread" ? "No unread notifications" : "No notifications yet"}
            </p>
            <p className="text-sm text-muted-foreground">
              {tab === "unread" ? "You're all caught up!" : "We'll notify you when something happens."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            <AnimatePresence initial={false}>
              {displayed.map((notification, index) => {
                const config = TYPE_CONFIG[notification.type] ?? FALLBACK;
                const Icon = config.icon;

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ delay: 0.03 * index, duration: 0.2 }}
                    className={cn(
                      "group relative cursor-pointer p-5 transition-colors hover:bg-secondary/30",
                      !notification.read && "bg-primary/5"
                    )}
                    onClick={() => !notification.read && markRead(notification.id)}
                  >
                    {!notification.read && (
                      <div className="absolute left-0 top-1/2 h-10 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                    )}

                    <div className="flex items-start gap-4 pl-2">
                      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", config.bgColor)}>
                        <Icon className={cn("h-5 w-5", config.color)} />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className={cn("font-medium truncate", !notification.read && "text-foreground")}>
                              {notification.title}
                            </p>
                            <Badge className={cn("h-5 shrink-0 rounded-md px-2 text-[10px] font-medium", config.bgColor, config.color)}>
                              {config.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {!notification.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">{notification.message}</p>

                        {/* Per-notification actions */}
                        <div className="flex items-center gap-3 mt-1">
                          {!notification.read && (
                            <button
                              onClick={(e) => { e.stopPropagation(); markRead(notification.id); }}
                              className="flex cursor-pointer items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                            className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
