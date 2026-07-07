"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Search,
  Loader2,
  Video,
  MapPin,
  Clock,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminHeader } from "@/components/admin/header";
import { toast } from "sonner";
import { formatDate } from "@/lib/date-utils";
import { APPOINTMENT_STATUS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-amber-500/10 text-amber-500",
  CONFIRMED: "bg-emerald-500/10 text-emerald-500",
  CANCELLED: "bg-rose-500/10 text-rose-500",
  COMPLETED: "bg-primary/10 text-primary",
};

type StatusFilter = "all" | "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

interface Appointment {
  id: string;
  date: string;
  timeSlot: string;
  status: string;
  consultationType?: string;
  patient: { name: string; email: string; imageUrl?: string };
  doctor: { name: string; specialty: string; imageUrl?: string };
}

const TABS: { label: string; value: StatusFilter }[] = [
  { label: "All",       value: "all" },
  { label: "Pending",   value: APPOINTMENT_STATUS.PENDING },
  { label: "Confirmed", value: APPOINTMENT_STATUS.CONFIRMED },
  { label: "Completed", value: APPOINTMENT_STATUS.COMPLETED },
  { label: "Cancelled", value: APPOINTMENT_STATUS.CANCELLED },
];

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const fetchAppointments = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/appointments?${params}`);
      if (!res.ok) throw new Error(await res.text());
      setAppointments(await res.json());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    Promise.resolve().then(() => fetchAppointments());
  }, [fetchAppointments]);

  return (
    <div className="min-h-screen">
      <AdminHeader title="Appointments" subtitle="All platform appointments" />
      <main className="p-6 lg:p-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total",     value: appointments.length,                                                    color: "text-foreground" },
            { label: "Pending",   value: appointments.filter((a) => a.status === APPOINTMENT_STATUS.PENDING).length,   color: "text-amber-500" },
            { label: "Confirmed", value: appointments.filter((a) => a.status === APPOINTMENT_STATUS.CONFIRMED).length, color: "text-emerald-500" },
            { label: "Completed", value: appointments.filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED).length, color: "text-primary" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border/30 bg-linear-to-br from-card/80 to-card/40 p-5 backdrop-blur-xl"
            >
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`mt-1 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <TabsList className="h-9 rounded-xl bg-secondary/30 p-1">
              {TABS.map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="rounded-lg px-3 text-[10px] data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient or doctor..."
              className="h-9 rounded-xl border-border/30 bg-secondary/30 pl-9 text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/30 bg-linear-to-br from-card/80 to-card/40 backdrop-blur-xl overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10">
                <Calendar className="h-8 w-8 text-rose-500/60" />
              </div>
              <p className="font-medium text-muted-foreground">No appointments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/20">
                    {["Patient", "Doctor", "Date & Time", "Type", "Status"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {appointments.map((appt) => (
                    <tr key={appt.id} className="transition-colors hover:bg-secondary/20">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-border/30">
                            <AvatarImage src={appt.patient.imageUrl ?? ""} alt={appt.patient.name} />
                            <AvatarFallback className="bg-linear-to-br from-primary/20 to-accent/20 text-xs font-semibold">
                              {appt.patient.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold">{appt.patient.name}</p>
                            <p className="text-xs text-muted-foreground">{appt.patient.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7 border border-border/30">
                            <AvatarImage src={appt.doctor.imageUrl ?? ""} alt={appt.doctor.name} />
                            <AvatarFallback className="bg-linear-to-br from-violet-500/20 to-primary/20 text-xs">
                              {appt.doctor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{appt.doctor.name}</p>
                            <p className="text-xs text-muted-foreground">{appt.doctor.specialty}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-0.5 text-sm">
                          <p className="flex items-center gap-1 font-medium">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {formatDate(appt.date)}
                          </p>
                          <p className="flex items-center gap-1 text-muted-foreground text-xs">
                            <Clock className="h-3 w-3" />
                            {appt.timeSlot}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          {appt.consultationType === "VIDEO" ? (
                            <Video className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <MapPin className="h-3.5 w-3.5 text-violet-500" />
                          )}
                          {appt.consultationType === "VIDEO" ? "Video" : "In Person"}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge className={cn("h-5 rounded-md px-2 text-[10px] font-semibold", STATUS_STYLES[appt.status])}>
                          {appt.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
