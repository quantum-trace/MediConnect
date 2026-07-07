"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, Search, ShieldCheck, Sun, Moon, CheckCheck, Trash2, LogOut, ChevronDown, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser, useClerk } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { useAdminSidebar } from "@/components/admin/sidebar-provider";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const { theme, setTheme } = useTheme();
  const { notifications, unreadCount, markRead, markAllRead, deleteNotification, deleteAllNotifications } = useNotifications();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { setIsMobileOpen } = useAdminSidebar();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/30 bg-background/80 px-4 md:px-6 backdrop-blur-xl"
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2 sm:pr-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9 text-muted-foreground shrink-0 cursor-pointer"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-rose-500/20 to-orange-500/20 shrink-0">
          <ShieldCheck className="h-4 w-4 text-rose-500" />
        </div>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold leading-none truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-3 shrink-0">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search platform..."
            className="h-9 w-64 rounded-xl border-border/30 bg-secondary/30 pl-9 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-rose-500/30"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const q = (e.target as HTMLInputElement).value.trim();
                if (q) router.push(`/admin/users?search=${encodeURIComponent(q)}`);
              }
            }}
          />
        </div>

        {/* Theme Toggle */}
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 cursor-pointer rounded-xl border-border/30 bg-secondary/30"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative h-9 w-9 cursor-pointer rounded-xl border-border/30 bg-secondary/30 hover:bg-secondary/50"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 p-0 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-80 rounded-xl border-border/50 bg-card/95 p-0 backdrop-blur-xl"
          >
            <DropdownMenuLabel className="flex items-center justify-between border-b border-border/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <Badge className="h-5 rounded-full bg-rose-500/20 px-2 text-[10px] font-semibold text-rose-500">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto cursor-pointer px-2 py-1 text-xs text-rose-500 hover:bg-rose-500/10"
                    title="Mark all as read"
                    onClick={() => markAllRead()}
                  >
                    <CheckCheck className="h-3 w-3" />
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto cursor-pointer px-2 py-1 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="Delete all"
                    onClick={() => deleteAllNotifications()}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </DropdownMenuLabel>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                notifications.slice(0, 5).map((notification, index) => (
                  <div
                    key={notification.id}
                    className={`group flex cursor-pointer flex-col items-start gap-1 px-4 py-3 hover:bg-secondary/50 transition-colors relative ${
                      !notification.read ? "bg-rose-500/5" : ""
                    } ${index !== Math.min(notifications.length, 5) - 1 ? "border-b border-border/20" : ""}`}
                    onClick={() => {
                      if (!notification.read) markRead(notification.id);
                      if (notification.link) router.push(notification.link);
                    }}
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <span className="text-sm font-medium leading-tight pr-12">
                        {notification.title}
                      </span>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-rose-500" />
                        )}
                        <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pr-12">
                      {notification.message}
                    </p>

                    {/* Actions overlay */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded-md p-0.5">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-rose-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            markRead(notification.id);
                          }}
                        >
                          <CheckCheck className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <DropdownMenuSeparator className="m-0" />
            <div className="p-2">
              <Link href="/admin/activity">
                <Button
                  variant="ghost"
                  className="w-full cursor-pointer justify-center rounded-lg text-sm text-rose-500 hover:bg-rose-500/10 hover:text-rose-500"
                >
                  View all activity
                </Button>
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Dropdown */}
        {isLoaded && user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative flex h-9 items-center gap-2 rounded-xl px-2 hover:bg-secondary/50 cursor-pointer">
                <Avatar className="h-6 w-6 border border-border/30">
                  <AvatarImage src={user.imageUrl} />
                  <AvatarFallback className="bg-rose-500 text-white text-[10px]">
                    {user.firstName?.[0] ?? "A"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block">{user.fullName ?? "Admin"}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/30 bg-card/95 backdrop-blur-xl">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.fullName ?? "Admin"}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ redirectUrl: "/" })}
                className="cursor-pointer text-rose-500 focus:bg-rose-500/10 focus:text-rose-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </motion.header>
  );
}
