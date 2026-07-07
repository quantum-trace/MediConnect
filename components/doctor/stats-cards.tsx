"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  IndianRupee,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

const ICONS = {
  Calendar,
  Users,
  IndianRupee,
  Clock,
};

type StatData = {
  title: string;
  value: string;
  change: string;
  trend: string;
  subtitle: string;
  icon: keyof typeof ICONS;
  color: string;
  gradient: string;
};

export function DoctorStatsCards() {
  const [stats, setStats] = useState<StatData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/doctor/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[160px] animate-pulse rounded-2xl border border-border/30 bg-card/50" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5"
    >
      {stats?.map((stat) => {
        const Icon = ICONS[stat.icon] || Calendar;
        
        return (
          <motion.div
            key={stat.title}
            variants={cardVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden rounded-2xl border border-border/30 bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md"
          >
            {/* Background gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
            />

            {/* Decorative orb */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative flex flex-col h-full">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      stat.color === "blue"
                        ? "text-blue-500"
                        : stat.color === "indigo"
                        ? "text-indigo-500"
                        : stat.color === "emerald"
                        ? "text-emerald-500"
                        : "text-amber-500"
                    }`}
                  />
                </div>
                <div
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    stat.trend === "up"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-amber-500/10 text-amber-500"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {stat.change}
                </div>
              </div>

              {/* Value */}
              <div className="mt-4">
                <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{stat.title}</p>
              </div>

              <div className="flex-1" />

              {/* Footer */}
              <div className="mt-4 flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
                <TrendingUp className="h-3 w-3" />
                {stat.subtitle}
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
