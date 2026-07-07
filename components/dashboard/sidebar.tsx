"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "./sidebar-provider";

import {
  LayoutDashboard,
  Calendar,
  Search,
  FileText,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Pill,
  Stethoscope,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ── Nav data ─────────────────────────────────────────────────────────────────
// Open/Closed: new routes are added here only — no component logic changes needed.

interface NavItemConfig {
  icon: React.ElementType;
  label: string;
  href: string;
  exact: boolean;
}

interface NavGroup {
  key: string;
  label: string;
  items: NavItemConfig[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    key: "main",
    label: "Main Menu",
    items: [
      { icon: LayoutDashboard, label: "Dashboard",       href: "/dashboard",               exact: true  },
      { icon: Calendar,        label: "Appointments",    href: "/dashboard/appointments",  exact: false },
      { icon: Search,          label: "Find Doctors",    href: "/booking",                 exact: false },
      { icon: FileText,        label: "Medical Records", href: "/dashboard/records",       exact: false },
      { icon: Pill,            label: "Prescriptions",   href: "/dashboard/prescriptions", exact: false },
    ],
  },
  {
    key: "account",
    label: "Account",
    items: [
      { icon: HelpCircle, label: "Help & Support", href: "/dashboard/help", exact: false },
    ],
  },
];

// ── NavItem — single-responsibility primitive ─────────────────────────────────

function NavItem({
  icon: Icon,
  label,
  href,
  isActive,
  isCollapsed,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive: boolean;
  isCollapsed: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={cn(
            "group relative flex items-center rounded-lg transition-colors duration-150 cursor-pointer select-none",
            isCollapsed
              ? "h-9 w-9 mx-auto justify-center"
              : "gap-2.5 px-3 py-1.75",
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground/70 hover:bg-secondary/60 hover:text-foreground"
          )}
        >
          {/* Left accent bar — spring-animated between active items */}
          {isActive && !isCollapsed && (
            <motion.span
              layoutId="sidebar-active-bar"
              className="absolute left-0 top-1 bottom-1 w-0.75 rounded-full bg-primary"
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}

          <Icon
            className={cn(
              "shrink-0 transition-colors duration-150",
              isCollapsed ? "h-4.5 w-4.5" : "h-4 w-4",
              isActive
                ? "text-primary"
                : "text-muted-foreground/60 group-hover:text-foreground"
            )}
          />

          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </TooltipTrigger>

      {isCollapsed && (
        <TooltipContent side="right" className="text-xs font-medium">
          {label}
        </TooltipContent>
      )}
    </Tooltip>
  );
}

// ── DashboardSidebar ──────────────────────────────────────────────────────────

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export function DashboardSidebar() {
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
  const pathname = usePathname();

  const renderContent = (isMobile: boolean = false) => {
    const collapsed = isMobile ? false : isCollapsed;

    return (
      <>
        {/* ── Zone 1: Logo header ──────────────────────────────────────────── */}
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-border/40",
            collapsed ? "justify-center" : "justify-between px-4"
          )}
        >
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0" onClick={() => isMobile && setIsMobileOpen(false)}>
            <div className="relative shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-primary to-accent shadow-sm shadow-primary/25">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                  className="text-[15px] font-bold tracking-tight gradient-text whitespace-nowrap"
                >
                  MediConnect
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {!isMobile && !collapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="shrink-0 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/40 hover:bg-secondary/60 hover:text-foreground transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-3.75 w-3.75" />
            </button>
          )}
        </div>

        {/* ── Zone 2: Navigation ───────────────────────────────────────────── */}
        <nav className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden py-3 min-h-0 custom-scrollbar">
          <div className={cn("flex flex-col gap-4", collapsed ? "px-3.5" : "px-2")}>
            {NAV_GROUPS.map((group, groupIndex) => (
              <div key={group.key} className="flex flex-col gap-0.5">

                {/* Section label — expanded only */}
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 select-none"
                    >
                      {group.label}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Collapsed group separator */}
                {collapsed && groupIndex > 0 && (
                  <div className="mx-auto mb-1 h-px w-5 rounded-full bg-border/50" />
                )}

                {group.items.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                  return (
                    <div key={item.href} onClick={() => isMobile && setIsMobileOpen(false)}>
                      <NavItem
                        icon={item.icon}
                        label={item.label}
                        href={item.href}
                        isActive={isActive}
                        isCollapsed={collapsed}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </nav>

        {/* ── Zone 3: Collapse toggle (collapsed state only) ───────────────── */}
        {!isMobile && collapsed && (
          <div className="shrink-0 border-t border-border/40 p-3 flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/45 hover:bg-secondary/60 hover:text-foreground transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-3.75 w-3.75" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">Expand sidebar</TooltipContent>
            </Tooltip>
          </div>
        )}
      </>
    );
  };

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:flex fixed left-0 top-0 z-40 h-screen flex-col border-r border-border/40 bg-card/60 backdrop-blur-xl overflow-hidden"
      >
        {renderContent(false)}
      </motion.aside>

      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0 border-r border-border/40 bg-card/95 backdrop-blur-xl md:hidden">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="flex h-screen flex-col">
            {renderContent(true)}
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}
