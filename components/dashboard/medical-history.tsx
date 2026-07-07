"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Eye, ChevronRight, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PrescriptionViewer } from "@/components/dashboard/prescription-viewer";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Prescription {
  id: string;
  diagnosis: string;
  notes?: string;
  followUpDate?: string;
  followUpNotes?: string;
  createdAt: string;
  medications: {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  doctor: {
    name: string;
    specialty: string;
    hospital: string;
    imageUrl?: string;
  };
  appointment: {
    date: string;
    timeSlot: string;
  };
}

interface MedicalHistoryProps {
  title?: string;
}

export function MedicalHistory({ title = "Medical History" }: MedicalHistoryProps = {}) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<Prescription | null>(null);
  const [showAll, setShowAll] = useState(false);

  const fetchPrescriptions = useCallback(async () => {
    try {
      const res = await fetch("/api/prescriptions");
      const data = await res.json();
      setPrescriptions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load medical history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => fetchPrescriptions());
  }, [fetchPrescriptions]);

  const displayed = showAll ? prescriptions : prescriptions.slice(0, 4);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
              <FileText className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">
                {loading
                  ? "Loading..."
                  : `${prescriptions.length} prescription${prescriptions.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          {prescriptions.length > 4 && (
            <Button
              variant="ghost"
              className="gap-1 text-sm text-primary hover:bg-primary/10 hover:text-primary"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? "Show Less" : "View All"}
              <ChevronRight className={cn("h-4 w-4 transition-transform", showAll && "rotate-90")} />
            </Button>
          )}
        </div>

        {/* Records List */}
        <div className="divide-y divide-border/50">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </>
          ) : prescriptions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10">
                <Pill className="h-7 w-7 text-violet-400/60" />
              </div>
              <p className="font-medium text-muted-foreground">No prescriptions yet</p>
              <p className="text-sm text-muted-foreground/70">
                Records will appear here after your first completed consultation.
              </p>
            </div>
          ) : (
            displayed.map((prescription, index) => (
              <motion.div
                key={prescription.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * index }}
                className="group flex items-center justify-between p-4 transition-colors hover:bg-secondary/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                    <Pill className="h-5 w-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="font-medium line-clamp-1">{prescription.diagnosis}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        {formatDate(prescription.appointment.date)}
                      </span>
                      <span>&bull;</span>
                      <span>{prescription.doctor.name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    className="border border-violet-500/20 bg-violet-500/10 capitalize text-violet-500"
                  >
                    {prescription.medications.length} med
                    {prescription.medications.length !== 1 ? "s" : ""}
                  </Badge>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setViewing(prescription)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        window.open(`/prescriptions/${prescription.id}/print`, "_blank")
                      }
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      <PrescriptionViewer prescription={viewing} onClose={() => setViewing(null)} />
    </>
  );
}
