"use client";

import { MedicalHistory } from "@/components/dashboard/medical-history";
import { motion } from "framer-motion";

export default function RecordsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Medical Records</h1>
        <p className="text-muted-foreground">
          View your complete prescription history and medical records.
        </p>
      </motion.div>
      <MedicalHistory />
    </div>
  );
}
