"use client";

import { motion } from "framer-motion";
import {
  Users,
  Stethoscope,
  Calendar,
  CheckCircle2,
  XCircle,
  IndianRupee,
  FileText,
  Video,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import type { PlatformStats } from "@/lib/services/analytics.service";

interface KPICardsProps {
  stats: PlatformStats;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `₹${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(1)}K`;
  return `₹${value}`;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
} as const;

export function AdminKPICards({ stats }: KPICardsProps) {
  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      gradient: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
      badge: `+${Math.max(0, stats.totalUsers - 10)} this month`,
      badgeColor: "bg-emerald-500/10 text-emerald-500",
    },
    {
      title: "Total Doctors",
      value: stats.totalDoctors.toLocaleString(),
      icon: Stethoscope,
      gradient: "from-violet-500/20 to-violet-500/5",
      iconColor: "text-violet-500",
      badge: `${stats.totalDoctors} registered`,
      badgeColor: "bg-violet-500/10 text-violet-500",
    },
    {
      title: "Total Appointments",
      value: stats.totalAppointments.toLocaleString(),
      icon: Calendar,
      gradient: "from-blue-500/20 to-blue-500/5",
      iconColor: "text-blue-500",
      badge: `${stats.pendingAppointments} pending`,
      badgeColor: "bg-amber-500/10 text-amber-500",
    },
    {
      title: "Completed",
      value: stats.completedAppointments.toLocaleString(),
      icon: CheckCircle2,
      gradient: "from-emerald-500/20 to-emerald-500/5",
      iconColor: "text-emerald-500",
      badge: `${stats.totalAppointments > 0 ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100) : 0}% rate`,
      badgeColor: "bg-emerald-500/10 text-emerald-500",
    },
    {
      title: "Cancellations",
      value: stats.cancelledAppointments.toLocaleString(),
      icon: XCircle,
      gradient: "from-rose-500/20 to-rose-500/5",
      iconColor: "text-rose-500",
      badge: `${stats.totalAppointments > 0 ? Math.round((stats.cancelledAppointments / stats.totalAppointments) * 100) : 0}% rate`,
      badgeColor: "bg-rose-500/10 text-rose-500",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: IndianRupee,
      gradient: "from-amber-500/20 to-amber-500/5",
      iconColor: "text-amber-500",
      badge: "from completed",
      badgeColor: "bg-amber-500/10 text-amber-500",
    },
    {
      title: "Prescriptions",
      value: stats.totalPrescriptions.toLocaleString(),
      icon: FileText,
      gradient: "from-cyan-500/20 to-cyan-500/5",
      iconColor: "text-cyan-500",
      badge: "issued",
      badgeColor: "bg-cyan-500/10 text-cyan-500",
    },
    {
      title: "Video Consultations",
      value: stats.activeVideoConsultations.toLocaleString(),
      icon: Video,
      gradient: "from-indigo-500/20 to-indigo-500/5",
      iconColor: "text-indigo-500",
      badge: "confirmed",
      badgeColor: "bg-indigo-500/10 text-indigo-500",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4"
    >
      {cards.map((card) => (
        <motion.div
          key={card.title}
          variants={cardVariants}
          transition={{ duration: 0.5, ease: "easeOut" }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="group relative overflow-hidden rounded-2xl border border-border/30 bg-linear-to-br from-card/80 to-card/40 p-5 backdrop-blur-xl transition-all duration-300 hover:border-border/60 hover:shadow-xl hover:shadow-black/5"
        >
          <div
            className={`absolute inset-0 bg-linear-to-br ${card.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
          />
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-linear-to-br from-white/5 to-transparent blur-2xl" />

          <div className="relative">
            <div className="flex items-start justify-between">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br ${card.gradient} border border-white/5 transition-transform duration-300 group-hover:scale-110`}
              >
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <div
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${card.badgeColor}`}
              >
                <ArrowUpRight className="h-3 w-3" />
                {card.badge}
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-2xl font-bold tracking-tight">{card.value}</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">{card.title}</p>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <TrendingUp className="h-3 w-3" />
              <span>Platform total</span>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
