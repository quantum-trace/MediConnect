"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  BarChart3,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Settings,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAdminSidebar } from "./sidebar-provider";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const mainNavItems = [
  { icon: LayoutDashboard, label: "Overview",     href: "/admin" },
  { icon: Stethoscope,     label: "Doctors",      href: "/admin/doctors" },
  { icon: Users,           label: "Users",        href: "/admin/users" },
  { icon: Calendar,        label: "Appointments", href: "/admin/appointments" },
  { icon: BarChart3,       label: "Analytics",    href: "/admin/analytics" },
  { icon: ShieldCheck,     label: "Admins",       href: "/admin/admins" },
  { icon: Activity,        label: "Activity",     href: "/admin/activity" },
];

const secondaryNavItems = [
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export function AdminSidebar() {
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useAdminSidebar();
  const pathname = usePathname();

  const renderContent = (isMobile: boolean = false) => {
    const collapsed = isMobile ? false : isCollapsed;

    return (
      <>
        {/* Logo */}
        <div className={cn("flex h-14 items-center border-b border-border/30 overflow-hidden", collapsed ? "justify-center gap-2 px-2" : "justify-between px-4")}>
          <Link href="/admin" className="flex items-center gap-3 shrink-0" onClick={() => isMobile && setIsMobileOpen(false)}>
            <div className={cn("relative flex items-center justify-center transition-all", collapsed ? "h-8 w-8" : "h-11 w-11")}>
              <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-rose-500 via-rose-600 to-orange-500 opacity-20 blur-lg" />
              <div className={cn("relative flex items-center justify-center rounded-xl bg-linear-to-br from-rose-500 to-orange-500 shadow-lg shadow-rose-500/30", collapsed ? "h-8 w-8" : "h-10 w-10")}>
                <ShieldCheck className={cn("text-white transition-all", collapsed ? "h-4 w-4" : "h-5 w-5")} />
              </div>
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col"
                >
                  <span className="text-lg font-bold bg-linear-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
                    MediConnect
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    Admin Panel
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 cursor-pointer rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground shrink-0"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 p-2 overflow-y-auto custom-scrollbar">
          <div className="mb-1">
            {!collapsed && (
              <span className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                Management
              </span>
            )}
          </div>

          {mainNavItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    onClick={() => isMobile && setIsMobileOpen(false)}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-300 cursor-pointer",
                      isActive
                        ? "text-rose-500"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId={isMobile ? undefined : "adminActiveNav"}
                        className="absolute inset-0 rounded-xl bg-linear-to-r from-rose-500/15 via-rose-500/10 to-orange-500/15 border border-rose-500/20 shadow-lg shadow-rose-500/5"
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      />
                    )}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "relative flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 shrink-0",
                        isActive
                          ? "bg-linear-to-br from-rose-500/20 to-orange-500/20 shadow-inner"
                          : "bg-secondary/30 group-hover:bg-secondary/60"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4 transition-colors duration-300",
                          isActive ? "text-rose-500" : "group-hover:text-rose-500"
                        )}
                      />
                    </motion.div>
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="relative flex-1 truncate"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </TooltipTrigger>
                {collapsed && !isMobile && (
                  <TooltipContent
                    side="right"
                    className="border-border/50 bg-card/95 backdrop-blur-xl"
                  >
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}

          <div className="my-2 mx-3 border-t border-border/30" />

          <div className="mb-1">
            {!collapsed && (
              <span className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                System
              </span>
            )}
          </div>

          {secondaryNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    onClick={() => isMobile && setIsMobileOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-300 cursor-pointer",
                      isActive
                        ? "bg-secondary/50 text-foreground"
                        : "text-muted-foreground hover:bg-secondary/30 hover:text-foreground"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 shrink-0",
                        isActive
                          ? "bg-secondary/80"
                          : "bg-secondary/30 group-hover:bg-secondary/50"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                    </div>
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex-1 truncate"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </TooltipTrigger>
                {collapsed && !isMobile && (
                  <TooltipContent
                    side="right"
                    className="border-border/50 bg-card/95 backdrop-blur-xl"
                  >
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>
      </>
    );
  };

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:flex fixed left-0 top-0 z-40 h-screen flex-col border-r border-border/30 bg-linear-to-b from-card/80 to-card/40 backdrop-blur-2xl"
      >
        {renderContent(false)}
      </motion.aside>

      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0 border-r border-border/30 bg-card/95 backdrop-blur-xl md:hidden">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="flex h-screen flex-col">
            {renderContent(true)}
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}
