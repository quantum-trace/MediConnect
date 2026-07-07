"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  Loader2,
  Pill,
  Eye,
  Printer,
  Calendar,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DoctorHeader } from "@/components/doctor/header";
import { toast } from "sonner";
import { formatDate } from "@/lib/date-utils";

interface PrescriptionItem {
  id: string;
  diagnosis: string;
  createdAt: string;
  medications: { name: string; dosage: string }[];
  patient: { name: string; email: string; imageUrl?: string };
  appointment: { date: string; timeSlot: string };
}

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchPrescriptions = useCallback(async () => {
    try {
      const res = await fetch("/api/prescriptions");
      const data = await res.json();
      setPrescriptions(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load prescriptions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => fetchPrescriptions());
  }, [fetchPrescriptions]);

  const filtered = prescriptions.filter(
    (p) =>
      !search ||
      p.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.diagnosis?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <DoctorHeader />
      <main className="p-6 lg:p-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Prescriptions</h1>
            <p className="mt-1 text-muted-foreground">
              {loading ? "Loading..." : `${prescriptions.length} prescriptions issued`}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient or diagnosis..."
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
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
                <FileText className="h-8 w-8 text-violet-500/60" />
              </div>
              <p className="font-medium text-muted-foreground">No prescriptions found</p>
              <p className="text-sm text-muted-foreground/70">
                {search
                  ? "Try a different search term."
                  : "Write prescriptions from completed appointments."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {filtered.map((rx, i) => (
                <AnimatePresence key={rx.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="group flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-secondary/20"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <Avatar className="h-10 w-10 border border-border/30 shrink-0">
                        <AvatarImage src={rx.patient?.imageUrl} alt={rx.patient?.name} />
                        <AvatarFallback className="bg-linear-to-br from-violet-500/20 to-primary/20 text-sm font-semibold">
                          {rx.patient?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">{rx.patient?.name}</p>
                          <Badge className="bg-violet-500/10 text-violet-500 shrink-0">
                            <Pill className="mr-1 h-3 w-3" />
                            {rx.medications?.length} med{rx.medications?.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground truncate">
                          {rx.diagnosis}
                        </p>
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground/70">
                          <Calendar className="h-3 w-3" />
                          {formatDate(rx.appointment?.date ?? rx.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 cursor-pointer rounded-lg"
                        onClick={() => window.open(`/prescriptions/${rx.id}/print`, "_blank")}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 cursor-pointer rounded-lg"
                        onClick={() => window.open(`/prescriptions/${rx.id}/print`, "_blank")}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
