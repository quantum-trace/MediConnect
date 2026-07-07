"use client";

import { AvailabilityControls } from "@/components/doctor/availability-controls";
import { DoctorHeader } from "@/components/doctor/header";
import { motion } from "framer-motion";

export default function AvailabilityPage() {
  return (
    <div className="min-h-screen">
      <DoctorHeader />
      <main className="p-6 lg:p-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight">Availability</h1>
          <p className="mt-1 text-muted-foreground">
            Set your weekly schedule so patients can book appointments with you.
          </p>
        </motion.div>
        <AvailabilityControls />
      </main>
    </div>
  );
}
