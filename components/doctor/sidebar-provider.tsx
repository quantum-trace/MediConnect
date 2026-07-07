"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function DoctorSidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useDoctorSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useDoctorSidebar must be used within a DoctorSidebarProvider");
  }
  return context;
}

export function DoctorContent({ children }: { children: ReactNode }) {
  const { isCollapsed } = useDoctorSidebar();

  return (
    <div
      className={cn(
        "transition-all duration-300 flex-1 flex flex-col min-w-0 w-full",
        isCollapsed ? "pl-0 md:pl-[80px]" : "pl-0 md:pl-[280px]"
      )}
    >
      {children}
    </div>
  );
}
