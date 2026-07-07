"use client";

import { HealthAnalytics } from "@/components/dashboard/health-analytics";
import { motion } from "framer-motion";

export default function HealthPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Health Analytics</h1>
        <p className="text-muted-foreground">
          Track your vital signs and health trends over time.
        </p>
      </motion.div>
      <HealthAnalytics />
    </div>
  );
}
