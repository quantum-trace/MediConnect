"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Users,
  IndianRupee,
  Clock,
    HelpCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  TrendingUp,
  Stethoscope,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDoctorSidebar } from "./sidebar-provider";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const mainNavItems = [
  { icon: LayoutDashboard, label: "Overview",      href: "/doctor" },
  { icon: Calendar,        label: "Appointments",  href: "/doctor/appointments" },
  { icon: Users,           label: "Patients",      href: "/doctor/patients" },
  { icon: Clock,           label: "Availability",  href: "/doctor/availability" },
  { icon: IndianRupee,     label: "Earnings",      href: "/doctor/earnings" },
  { icon: Video,           label: "Consultations", href: "/doctor/consultations" },
  { icon: FileText,        label: "Prescriptions", href: "/doctor/prescriptions" },
  { icon: TrendingUp,      label: "Analytics",     href: "/doctor/analytics" },
];

const secondaryNavItems = [
  { icon: HelpCircle,  label: "Help",     href: "/doctor/help" },
];

export function DoctorSidebar() {
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useDoctorSidebar();
  const pathname = usePathname();

  const renderContent = (isMobile: boolean = false) => {
    const collapsed = isMobile ? false : isCollapsed;

    return (
      <>
        {/* Logo Section */}
        <div className={cn("flex h-14 items-center border-b border-border/30 overflow-hidden", collapsed ? "justify-center gap-2 px-2" : "justify-between px-4")}>
          <Link href="/doctor" className="flex items-center gap-3 shrink-0" onClick={() => isMobile && setIsMobileOpen(false)}>
            <div className={cn("relative flex items-center justify-center transition-all", collapsed ? "h-8 w-8" : "h-11 w-11")}>
              <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-primary via-primary to-accent opacity-20 blur-lg" />
              <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-primary/20 to-accent/20 animate-pulse" />
              <div className={cn("relative flex items-center justify-center rounded-xl bg-linear-to-br from-primary to-accent shadow-lg shadow-primary/30", collapsed ? "h-8 w-8" : "h-10 w-10")}>
                <Stethoscope className={cn("text-white transition-all", collapsed ? "h-4 w-4" : "h-5 w-5")} />
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
                  <span className="text-lg font-bold gradient-text">MediConnect</span>
                  <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    Doctor Portal
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
              className="h-8 w-8 cursor-pointer rounded-lg text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground shrink-0"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-0.5 p-2 overflow-y-auto custom-scrollbar">
          <div className="mb-1">
            {!collapsed && (
              <span className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                Main Menu
              </span>
            )}
          </div>
          {mainNavItems.map((item) => {
            const isActive =
              item.href === "/doctor"
                ? pathname === "/doctor"
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
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId={isMobile ? undefined : "doctorActiveNav"}
                        className="absolute inset-0 rounded-xl bg-linear-to-r from-primary/15 via-primary/10 to-accent/15 border border-primary/20 shadow-lg shadow-primary/5"
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      />
                    )}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "relative flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 shrink-0",
                        isActive
                          ? "bg-linear-to-br from-primary/20 to-accent/20 shadow-inner"
                          : "bg-secondary/30 group-hover:bg-secondary/60"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4 transition-colors duration-300",
                          isActive ? "text-primary" : "group-hover:text-primary"
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
                    className="flex items-center gap-2 border-border/50 bg-card/95 backdrop-blur-xl"
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
                Support
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
                    className="flex items-center gap-2 border-border/50 bg-card/95 backdrop-blur-xl"
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
