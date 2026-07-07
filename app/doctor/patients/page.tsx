"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Mail,
  Calendar,
  Activity,
  Loader2,
  User,
  Clock,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DoctorHeader } from "@/components/doctor/header";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { formatDateTime } from "@/lib/date-utils";
import Link from "next/link";

interface PatientSummary {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
  totalAppointments: number;
  lastVisit: string | null;
  nextAppointment: string | null;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/doctor/patients")
      .then((r) => r.json())
      .then((d) => setPatients(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Failed to load patients."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <DoctorHeader />
      <main className="p-6 lg:p-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Patients</h1>
            <p className="mt-1 text-muted-foreground">
              {loading ? "Loading..." : `${patients.length} total patients`}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients..."
              className="h-10 rounded-xl border-border/30 bg-secondary/20 pl-9 text-sm"
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/30 bg-card shadow-sm overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Users className="h-8 w-8 text-primary/60" />
              </div>
              <p className="font-medium text-muted-foreground">
                {search ? "No patients match your search" : "No patients yet"}
              </p>
              <p className="text-sm text-muted-foreground/70">
                {search
                  ? "Try a different name or email."
                  : "Patients will appear here once they book appointments with you."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {/* Header row */}
              <div className="hidden grid-cols-12 px-6 py-3 sm:grid">
                <span className="col-span-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Patient</span>
                <span className="col-span-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Visit</span>
                <span className="col-span-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Next Appointment</span>
                <span className="col-span-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Appointments</span>
              </div>

              {filtered.map((patient, i) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group grid grid-cols-1 items-center gap-4 px-6 py-4 transition-colors hover:bg-secondary/20 sm:grid-cols-12"
                >
                  {/* Patient info */}
                  <Link href={`/doctor/patients/${patient.id}`} className="col-span-4 flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                    <Avatar className="h-10 w-10 border border-border/30">
                      <AvatarImage src={patient.imageUrl ?? ""} alt={patient.name} />
                      <AvatarFallback className="bg-linear-to-br from-primary/20 to-accent/20 text-sm font-semibold">
                        {patient.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-primary hover:underline">{patient.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{patient.email}</span>
                      </div>
                    </div>
                  </Link>

                  {/* Last visit */}
                  <div className="col-span-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {patient.lastVisit
                      ? formatDistanceToNow(new Date(patient.lastVisit), { addSuffix: true })
                      : "No visits yet"}
                  </div>

                  {/* Next appointment */}
                  <div className="col-span-3">
                    {patient.nextAppointment ? (
                      <div className="flex items-center gap-1.5 text-sm text-primary">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        {formatDateTime(patient.nextAppointment)}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground/60">No upcoming</span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <Badge className="bg-primary/10 text-primary">
                      <Activity className="mr-1 h-3 w-3" />
                      {patient.totalAppointments}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
                      asChild
                    >
                      <Link href={`/doctor/patients/${patient.id}`}>
                        <User className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
