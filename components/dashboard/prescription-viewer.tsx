"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FileText,
  Pill,
  Calendar,
  ExternalLink,
  Stethoscope,
  ClipboardList,
  X,
} from "lucide-react";
import { formatDate } from "@/lib/date-utils";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface PrescriptionDetail {
  id: string;
  diagnosis: string;
  notes?: string;
  followUpDate?: string;
  followUpNotes?: string;
  createdAt: string;
  medications: Medication[];
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

interface PrescriptionViewerProps {
  prescription: PrescriptionDetail | null;
  onClose: () => void;
}

export function PrescriptionViewer({ prescription, onClose }: PrescriptionViewerProps) {
  if (!prescription) return null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-border/30 bg-card/95 p-0 backdrop-blur-xl">
        {/* Header */}
        <DialogHeader className="sticky top-0 z-10 border-b border-border/30 bg-card/95 px-6 py-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                <FileText className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">Prescription</DialogTitle>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {formatDate(prescription.appointment.date)} &bull;{" "}
                  {prescription.appointment.timeSlot}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 rounded-xl border-border/30 text-xs"
                onClick={() =>
                  window.open(`/prescriptions/${prescription.id}/print`, "_blank")
                }
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Download PDF
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 p-6">
          {/* Doctor info */}
          <div className="flex items-center gap-4 rounded-xl border border-border/30 bg-secondary/20 p-4">
            <Avatar className="h-12 w-12 border-2 border-border/30">
              <AvatarImage src={prescription.doctor.imageUrl} />
              <AvatarFallback className="bg-linear-to-br from-primary/20 to-accent/20 text-sm font-semibold">
                {prescription.doctor.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{prescription.doctor.name}</p>
              <p className="text-sm text-muted-foreground capitalize">
                {prescription.doctor.specialty.replace(/_/g, " ").toLowerCase()}
              </p>
              <p className="text-xs text-muted-foreground">{prescription.doctor.hospital}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-muted-foreground">Issued on</p>
              <p className="text-sm font-medium">
                {formatDate(prescription.createdAt)}
              </p>
            </div>
          </div>

          {/* Diagnosis */}
          <section>
            <div className="mb-2 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Diagnosis</h3>
            </div>
            <div className="rounded-xl border border-border/30 bg-secondary/10 px-4 py-3 text-sm leading-relaxed">
              {prescription.diagnosis}
            </div>
          </section>

          {/* Medications */}
          {prescription.medications.length > 0 && (
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Pill className="h-4 w-4 text-violet-500" />
                <h3 className="text-sm font-semibold">Medications</h3>
                <Badge className="h-5 rounded-md bg-violet-500/10 px-2 text-[10px] text-violet-500">
                  {prescription.medications.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {prescription.medications.map((med, idx) => (
                  <div
                    key={med.id}
                    className="rounded-xl border border-border/30 bg-secondary/10 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/10 text-xs font-semibold text-violet-500">
                          {idx + 1}
                        </span>
                        <span className="font-medium">{med.name}</span>
                      </div>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <Badge
                        className="rounded-lg border border-border/30 bg-transparent text-xs font-normal"
                      >
                        {med.dosage}
                      </Badge>
                      <Badge
                        className="rounded-lg border border-border/30 bg-transparent text-xs font-normal"
                      >
                        {med.frequency}
                      </Badge>
                      <Badge
                        className="rounded-lg border border-border/30 bg-transparent text-xs font-normal"
                      >
                        {med.duration}
                      </Badge>
                      {med.instructions && (
                        <span className="text-xs text-muted-foreground italic">
                          {med.instructions}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Doctor Notes */}
          {prescription.notes && (
            <section>
              <div className="mb-2 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-semibold">Doctor Notes</h3>
              </div>
              <div className="rounded-xl border border-border/30 bg-secondary/10 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                {prescription.notes}
              </div>
            </section>
          )}

          {/* Follow-up */}
          {(prescription.followUpDate || prescription.followUpNotes) && (
            <section>
              <div className="mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-semibold">Follow-up</h3>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                {prescription.followUpDate && (
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    {new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", month: "long", day: "numeric", year: "numeric" }).format(new Date(prescription.followUpDate))}
                  </p>
                )}
                {prescription.followUpNotes && (
                  <p className="mt-1 text-sm text-muted-foreground">{prescription.followUpNotes}</p>
                )}
              </div>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
