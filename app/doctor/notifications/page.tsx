"use client";

import { motion } from "framer-motion";
import { DoctorHeader } from "@/components/doctor/header";
import { useNotifications } from "@/hooks/use-notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Trash2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function DoctorNotificationsPage() {
  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    deleteNotification,
    deleteAllNotifications,
    loading
  } = useNotifications();

  const router = useRouter();

  return (
    <div className="min-h-screen bg-secondary/5">
      <DoctorHeader />
      
      <main className="mx-auto max-w-5xl p-6 lg:p-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <Badge className="bg-primary/20 text-primary hover:bg-primary/30 rounded-full px-3 py-0.5 text-sm">
                  {unreadCount} new
                </Badge>
              )}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your alerts, appointment reminders, and system updates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                className="rounded-xl border-primary/20 text-primary hover:bg-primary/5"
                onClick={markAllRead}
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark All Read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="outline"
                className="rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive"
                onClick={deleteAllNotifications}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </motion.div>

        <Card className="rounded-3xl border-border/30 shadow-sm overflow-hidden bg-card/50 backdrop-blur-xl">
          <CardHeader className="bg-secondary/10 border-b border-border/30">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-primary" />
              Inbox History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-20 text-muted-foreground">
                <span className="animate-pulse">Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Bell className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <h3 className="text-xl font-semibold mb-2">You&apos;re all caught up!</h3>
                <p className="text-muted-foreground">No new notifications to display.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/20">
                {notifications.map((notif) => (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={notif.id}
                    className={`group relative flex flex-col sm:flex-row sm:items-start gap-4 p-6 transition-all hover:bg-secondary/20 ${
                      !notif.read ? "bg-primary/5" : ""
                    }`}
                  >
                    {!notif.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`text-base font-semibold truncate pr-4 ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>
                          {notif.title}
                        </h4>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <p className={`text-sm leading-relaxed ${!notif.read ? "text-foreground/90" : "text-muted-foreground"}`}>
                        {notif.message}
                      </p>

                      {notif.link && (
                        <Button
                          variant="link"
                          className="px-0 mt-2 h-auto text-primary"
                          onClick={() => {
                            if (!notif.read) markRead(notif.id);
                            router.push(notif.link as string);
                          }}
                        >
                          View Details →
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                      {!notif.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-lg text-primary hover:bg-primary/10 w-full sm:w-auto"
                          onClick={() => markRead(notif.id)}
                        >
                          Mark Read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteNotification(notif.id)}
                        title="Delete Notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
