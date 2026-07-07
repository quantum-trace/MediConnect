"use client";

import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";

import { StatsCards } from "@/components/dashboard/stats-cards";
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments";
import { DoctorSearch } from "@/components/dashboard/doctor-search";
import { MedicalHistory } from "@/components/dashboard/medical-history";

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="flex-1 flex flex-col min-w-0 space-y-6 lg:space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1"
      >
        <h1 className="text-2xl font-bold">
          Welcome back,{" "}
          <span className="gradient-text">
            {user?.firstName || "User"}
          </span>
        </h1>

        <p className="text-muted-foreground">
          Here&apos;s an overview of your healthcare activity and upcoming appointments.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2 min-w-0">
          <UpcomingAppointments />
          <DoctorSearch />
        </div>

        {/* Right Column */}
        <div className="space-y-6 min-w-0">
          <MedicalHistory />
        </div>
      </div>
    </div>
  );
}