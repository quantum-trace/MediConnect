"use client";

import { AppointmentManagement } from "@/components/doctor/appointment-management";
import { DoctorHeader } from "@/components/doctor/header";
import { motion } from "framer-motion";

export default function DoctorAppointmentsPage() {
  return (
    <div className="min-h-screen">
      <DoctorHeader />
      <main className="p-6 lg:p-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="mt-1 text-muted-foreground">
            Manage all your patient appointments.
          </p>
        </motion.div>
        <AppointmentManagement />
      </main>
    </div>
  );
}
