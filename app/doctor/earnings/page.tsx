"use client";

import { EarningsAnalytics } from "@/components/doctor/earnings-analytics";
import { DoctorHeader } from "@/components/doctor/header";
import { motion } from "framer-motion";

export default function EarningsPage() {
  return (
    <div className="min-h-screen">
      <DoctorHeader />
      <main className="p-6 lg:p-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
          <p className="mt-1 text-muted-foreground">
            Track your revenue and consultation history.
          </p>
        </motion.div>
        <EarningsAnalytics />
      </main>
    </div>
  );
}
