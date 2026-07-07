"use client";


import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  ChevronDown,
  Sun,
  Moon,
  Settings,
  LogOut,
  Video,
  Calendar,
  CheckCheck,
  Trash2,
  X,
  Menu,
} from "lucide-react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useDoctorSidebar } from "@/components/doctor/sidebar-provider";

export function DoctorHeader() {
    const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const { notifications, unreadCount, markRead, markAllRead, deleteNotification, deleteAllNotifications } = useNotifications();
  const router = useRouter();
  const { setIsMobileOpen } = useDoctorSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border/30 bg-background/60 px-4 md:px-8 backdrop-blur-2xl">
      <div className="flex items-center gap-2 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 text-muted-foreground hover:bg-secondary/40 hover:text-foreground cursor-pointer"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Left Section - Search */}
      <div className="flex flex-1 items-center gap-6 min-w-0 pr-4">
        <div className="relative w-full max-w-[340px]">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            placeholder="Search patients..."
            className="h-11 w-full rounded-xl border-border/30 bg-secondary/20 pl-11 pr-12 text-sm placeholder:text-muted-foreground/50 focus:border-primary/40 focus:bg-secondary/40 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
            
            
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const q = (e.target as HTMLInputElement).value.trim();
                if (q) router.push(`/doctor/patients?search=${encodeURIComponent(q)}`);
              }
            }}
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden h-6 -translate-y-1/2 select-none items-center gap-1 rounded-lg border border-border/30 bg-secondary/50 px-2 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-1 sm:gap-3 shrink-0">
        {/* Quick Actions */}
        <Link href="/doctor/availability">
          <Button
            variant="outline"
            size="sm"
            className="hidden h-10 cursor-pointer gap-2 rounded-xl border-border/30 bg-secondary/20 px-4 text-muted-foreground hover:bg-secondary/40 hover:text-foreground lg:flex"
          >
            <Calendar className="h-4 w-4" />
            Schedule
          </Button>
        </Link>

        <Link href="/doctor/consultations">
          <Button
            size="sm"
            className="hidden h-10 cursor-pointer gap-2 rounded-xl bg-linear-to-r from-primary to-accent px-4 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 lg:flex"
          >
            <Video className="h-4 w-4" />
            Start Consultation
          </Button>
        </Link>

        <div className="mx-2 h-8 w-px bg-border/30 hidden lg:block" />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-11 w-11 cursor-pointer rounded-xl text-muted-foreground hover:bg-secondary/40 hover:text-foreground transition-all duration-300"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive p-0 text-[10px] font-bold text-destructive-foreground shadow-lg shadow-destructive/30">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-96 rounded-2xl border-border/30 bg-card/95 p-0 backdrop-blur-2xl shadow-2xl"
          >
            <DropdownMenuLabel className="flex items-center justify-between border-b border-border/30 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold">Notifications</span>
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
                    className="h-auto cursor-pointer px-2 py-1 text-xs text-primary hover:bg-primary/10 hover:text-primary rounded-lg"
                    onClick={markAllRead}
                  >
                    <CheckCheck className="mr-1 h-3 w-3" />
                    Mark all read
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto cursor-pointer px-2 py-1 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg"
                    onClick={deleteAllNotifications}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Clear all
                  </Button>
                )}
              </div>
            </DropdownMenuLabel>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                notifications.slice(0, 5).map((notification, index) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`group flex cursor-pointer flex-col items-start gap-2 px-5 py-4 focus:bg-secondary/40 transition-colors ${
                      !notification.read ? "bg-primary/5" : ""
                    } ${index !== Math.min(notifications.length, 5) - 1 ? "border-b border-border/20" : ""}`}
                    onClick={() => !notification.read && markRead(notification.id)}
                  >
                    <div className="flex w-full items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-primary animate-pulse" />
                        )}
                        <span className="text-sm font-semibold pr-4">{notification.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap shrink-0">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-4 pr-6">
                      {notification.message}
                    </p>
                  </DropdownMenuItem>
                ))
              )}
            </div>

            <DropdownMenuSeparator className="m-0 bg-border/30" />
            <div className="p-3">
              <Link href="/doctor/notifications">
                <Button
                  variant="ghost"
                  className="w-full cursor-pointer justify-center rounded-xl text-sm font-medium text-primary hover:bg-primary/10 hover:text-primary h-10"
                >
                  View all notifications
                </Button>
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 cursor-pointer rounded-xl text-muted-foreground hover:bg-secondary/40 hover:text-foreground transition-all duration-300"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <div className="mx-1 h-8 w-px bg-border/30" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-12 cursor-pointer items-center gap-3 rounded-xl px-3 hover:bg-secondary/40 transition-all duration-300"
            >
              <div className="relative">
                <Avatar className="h-9 w-9 border-2 border-primary/30 shadow-lg shadow-primary/10">
                  <AvatarImage src={user?.imageUrl} alt={user?.fullName || "Doctor"} />
                  <AvatarFallback className="bg-linear-to-br from-primary to-accent text-xs font-semibold text-white">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500" />
              </div>
              <div className="hidden text-left xl:block max-w-[140px]">
                <p className="text-sm font-semibold truncate">{user?.fullName || "Doctor"}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
              <ChevronDown className="hidden xl:block h-4 w-4 text-muted-foreground shrink-0" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-64 rounded-2xl border-border/30 bg-card/95 backdrop-blur-2xl shadow-2xl"
          >
            <DropdownMenuLabel className="font-normal px-4 py-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
                <Badge className="w-fit mt-1 h-5 rounded-md bg-emerald-500/20 px-2 text-[10px] font-medium text-emerald-500">
                  Verified Physician
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/30" />
            <Link href="/doctor/settings">
              <DropdownMenuItem className="cursor-pointer gap-3 px-4 py-2.5 focus:bg-secondary/40">
                <Settings className="h-4 w-4 text-muted-foreground" />
                Profile Settings
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator className="bg-border/30" />
            <SignOutButton>
              <DropdownMenuItem className="cursor-pointer gap-3 px-4 py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive">
                <LogOut className="h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </SignOutButton>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
