"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Bell,
  Search,
  MessageSquare,
  ChevronDown,
  Sun,
  Moon,
  Settings,
  LogOut,
  Plus,
  CheckCheck,
  Trash2,
  Menu,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
import { useSidebar } from "@/components/dashboard/sidebar-provider";

export function DashboardHeader() {
  const [searchFocused, setSearchFocused] = useState(false);
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const { notifications, unreadCount, markRead, markAllRead, deleteNotification, deleteAllNotifications } = useNotifications();
  const { signOut } = useClerk();
  const router = useRouter();
  const { setIsMobileOpen } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-4 md:px-6 backdrop-blur-xl">
      {/* Search */}
      <div className="flex flex-1 items-center gap-2 sm:gap-4 min-w-0 pr-2 sm:pr-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9 text-muted-foreground shrink-0 cursor-pointer"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div
          className={cn(
            "relative w-full transition-all duration-300",
            searchFocused ? "max-w-[400px]" : "max-w-[320px]"
          )}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search doctors, appointments, records..."
            className="h-10 w-full rounded-xl border-border/50 bg-secondary/30 pl-10 pr-4 text-sm placeholder:text-muted-foreground/60 focus:border-primary/50 focus:bg-secondary/50 focus:ring-1 focus:ring-primary/30"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const q = (e.target as HTMLInputElement).value.trim();
                if (q) router.push(`/booking?search=${encodeURIComponent(q)}`);
              }
            }}
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden h-5 -translate-y-1/2 select-none items-center gap-1 rounded border border-border/50 bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Quick Action */}
        <Link href="/booking" className="hidden sm:block">
          <Button
            size="sm"
            className="cursor-pointer gap-2 rounded-xl bg-linear-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 flex w-full"
          >
            <Plus className="h-4 w-4" />
            Book Appointment
          </Button>
        </Link>

        {/* Messages */}
        <Link href="/dashboard/notifications">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 cursor-pointer rounded-xl text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
          </Button>
        </Link>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 cursor-pointer rounded-xl text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive p-0 text-[10px] font-bold text-destructive-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
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
                  <Badge className="h-5 rounded-full bg-primary/20 px-2 text-[10px] font-semibold text-primary">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto cursor-pointer px-2 py-1 text-xs text-primary hover:bg-primary/10"
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
                      !notification.read ? "bg-primary/5" : ""
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
                          <span className="h-2 w-2 rounded-full bg-primary" />
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
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
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
              <Link href="/dashboard/notifications">
                <Button
                  variant="ghost"
                  className="w-full cursor-pointer justify-center rounded-lg text-sm text-primary hover:bg-primary/10 hover:text-primary"
                >
                  View all notifications
                </Button>
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 cursor-pointer rounded-xl text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-10 cursor-pointer items-center gap-2 rounded-xl px-2 hover:bg-secondary/50"
            >
              <Avatar className="h-8 w-8 border border-primary/30">
                <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                <AvatarFallback className="bg-linear-to-br from-primary to-accent text-xs text-white">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium">{user?.fullName}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 rounded-xl border-border/50 bg-card/95 backdrop-blur-xl"
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={() => router.push("/dashboard/settings")}
            >
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem 
              className="cursor-pointer gap-2 text-destructive focus:text-destructive"
              onClick={() => signOut({ redirectUrl: '/' })}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
