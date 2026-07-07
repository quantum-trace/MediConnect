"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Pill,
  TrendingUp,
  TrendingDown,
  Clock,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function StatsCards() {
  const [data, setData] = useState<{ upcomingAppointments: number; activePrescriptions: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const stats = [
    {
      title: "Upcoming Appointments",
      value: loading ? "-" : data?.upcomingAppointments.toString() || "0",
      change: "Scheduled",
      trend: "stable",
      icon: Calendar,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
    {
      title: "Active Prescriptions",
      value: loading ? "-" : data?.activePrescriptions.toString() || "0",
      change: "Issued",
      trend: "stable",
      icon: Pill,
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-500/10",
      iconColor: "text-violet-500",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4"
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.title}
          variants={itemVariants}
          className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/80"
        >
          {/* Gradient glow on hover */}
          <div
            className={cn(
              "absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20",
              stat.color
            )}
          />

          <div className="relative flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : stat.value}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {stat.trend === "up" && (
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                )}
                {stat.trend === "down" && (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                )}
                {stat.trend === "warning" && (
                  <Clock className="h-3 w-3 text-amber-500" />
                )}
                <span
                  className={cn(
                    "text-xs",
                    stat.trend === "up" && "text-emerald-500",
                    stat.trend === "down" && "text-destructive",
                    stat.trend === "warning" && "text-amber-500",
                    stat.trend === "stable" && "text-muted-foreground"
                  )}
                >
                  {stat.change}
                </span>
              </div>
            </div>
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                stat.bgColor
              )}
            >
              <stat.icon className={cn("h-6 w-6", stat.iconColor)} />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
