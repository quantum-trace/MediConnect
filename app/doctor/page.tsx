"use client";

import { useEffect, useState } from "react";

import {
  DoctorHeader,
} from "@/components/doctor/header";

import {
  DoctorStatsCards,
} from "@/components/doctor/stats-cards";

import {
  AppointmentManagement,
} from "@/components/doctor/appointment-management";

import {
  PatientList,
} from "@/components/doctor/patient-list";

import {
  EarningsAnalytics,
} from "@/components/doctor/earnings-analytics";

import {
  CalendarScheduling,
} from "@/components/doctor/calendar-scheduling";

import {
  AvailabilityControls,
} from "@/components/doctor/availability-controls";

import { useUser } from "@clerk/nextjs";

export default function DoctorDashboard() {
  const { user } = useUser();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [appointments, setAppointments] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recentConsultations, setRecentConsultations] = useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const response = await fetch(
          "/api/doctor/appointments"
        );

        const data = await response.json();

        setAppointments(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, []);

  const uniquePatients =
    new Set(
      appointments.map(
        (appointment) =>
          appointment.patientId
      )
    ).size;

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-screen">
      <DoctorHeader />

      <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, Dr.{" "}
            {user?.firstName || "Doctor"}
          </h1>

          <p className="mt-2 text-muted-foreground">
            {loading
              ? "Loading your appointments..."
              : `You have ${appointments.length} appointments and ${uniquePatients} patients assigned to you.`}
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 lg:mb-8">
          <DoctorStatsCards />
        </div>

        {/* Main Dashboard Grid */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:mb-8 lg:gap-8 xl:grid-cols-3 min-w-0">
          {/* Main Column (2/3) */}
          <div className="space-y-6 lg:space-y-8 xl:col-span-2 min-w-0">
            <AppointmentManagement />
            <PatientList />
          </div>

          {/* Side Column (1/3) */}
          <div className="space-y-6 lg:space-y-8 min-w-0 relative">
            <div className="sticky top-24 space-y-6 lg:space-y-8">
              <CalendarScheduling />
            </div>
          </div>
        </div>

        {/* Full Width Sections */}
        <div className="space-y-6 lg:space-y-8 min-w-0">
          <AvailabilityControls />
          <EarningsAnalytics />
        </div>
      </main>
    </div>
  );
}