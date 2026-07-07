"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  FileText,
  Pill,
  Calendar,
  Loader2,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { formatDate, formatISODate } from "@/lib/date-utils";

interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PrescriptionEditorProps {
  appointment: {
    id: string;
    patient: { name: string; imageUrl?: string };
    date: string;
    timeSlot: string;
  } | null;
  existingPrescription?: {
    id: string;
    diagnosis: string;
    notes?: string;
    followUpDate?: string;
    followUpNotes?: string;
    medications: MedicationItem[];
  } | null;
  onClose: () => void;
  onSaved: (prescription: unknown) => void;
}

function newMedication(): MedicationItem {
  return { id: crypto.randomUUID(), name: "", dosage: "", frequency: "", duration: "", instructions: "" };
}

export function PrescriptionEditor({
  appointment,
  existingPrescription,
  onClose,
  onSaved,
}: PrescriptionEditorProps) {
  const isEdit = !!existingPrescription;

  const [diagnosis, setDiagnosis] = useState(existingPrescription?.diagnosis ?? "");
  const [notes, setNotes] = useState(existingPrescription?.notes ?? "");
  const [followUpDate, setFollowUpDate] = useState(
    existingPrescription?.followUpDate
      ? formatISODate(existingPrescription.followUpDate)
      : ""
  );
  const [followUpNotes, setFollowUpNotes] = useState(existingPrescription?.followUpNotes ?? "");
  const [medications, setMedications] = useState<MedicationItem[]>(
    existingPrescription?.medications?.length
      ? existingPrescription.medications.map((m) => ({ ...m, id: m.id ?? crypto.randomUUID() }))
      : [newMedication()]
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const addMedication = useCallback(() => {
    setMedications((prev) => [...prev, newMedication()]);
  }, []);

  const removeMedication = useCallback((id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateMedication = useCallback((id: string, field: keyof MedicationItem, value: string) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  }, []);

  const handleSave = async () => {
    if (!appointment) return;
    if (!diagnosis.trim()) {
      setError("Diagnosis is required.");
      return;
    }

    const medicationsToSave = medications
      .filter((m) => m.name.trim())
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ id: _id, ...m }) => m);

    setSaving(true);
    setError(null);

    try {
      const url = isEdit
        ? `/api/prescriptions/${existingPrescription!.id}`
        : "/api/prescriptions";

      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: appointment.id,
          diagnosis: diagnosis.trim(),
          notes: notes.trim() || undefined,
          followUpDate: followUpDate || undefined,
          followUpNotes: followUpNotes.trim() || undefined,
          medications: medicationsToSave,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save prescription");
      }

      const prescription = await res.json();
      setSaved(true);
      closeTimerRef.current = setTimeout(() => {
        onSaved(prescription);
        onClose();
      }, 800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (!appointment) return null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-border/30 bg-card/95 p-0 backdrop-blur-xl">
        {/* Header */}
        <DialogHeader className="sticky top-0 z-10 border-b border-border/30 bg-card/95 px-6 py-5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
              <FileText className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                {isEdit ? "Edit Prescription" : "Write Prescription"}
              </DialogTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {appointment.patient.name} &bull;{" "}
                {formatDate(appointment.date)} &bull;{" "}
                {appointment.timeSlot}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Diagnosis */}
          <section>
            <label className="mb-2 block text-sm font-semibold">
              Diagnosis <span className="text-destructive">*</span>
            </label>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Primary diagnosis and clinical findings..."
              rows={3}
              className="w-full resize-none rounded-xl border border-border/50 bg-secondary/20 px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </section>

          {/* Medications */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-violet-500" />
                <span className="text-sm font-semibold">Medications</span>
                <Badge className="h-5 rounded-md bg-violet-500/10 px-2 text-[10px] text-violet-500">
                  {medications.filter((m) => m.name.trim()).length}
                </Badge>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addMedication}
                className="h-8 gap-1.5 rounded-lg border-border/30 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Medicine
              </Button>
            </div>

            <AnimatePresence initial={false}>
              {medications.map((med, idx) => (
                <motion.div
                  key={med.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mb-3 overflow-hidden rounded-xl border border-border/30 bg-secondary/10 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Medicine {idx + 1}
                    </span>
                    {medications.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeMedication(med.id)}
                        className="h-6 w-6 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Input
                        value={med.name}
                        onChange={(e) => updateMedication(med.id, "name", e.target.value)}
                        placeholder="Medicine name (e.g., Amoxicillin 500mg)"
                        className="rounded-lg border-border/30 bg-card/50 text-sm"
                      />
                    </div>
                    <Input
                      value={med.dosage}
                      onChange={(e) => updateMedication(med.id, "dosage", e.target.value)}
                      placeholder="Dosage (e.g., 1 tablet)"
                      className="rounded-lg border-border/30 bg-card/50 text-sm"
                    />
                    <Input
                      value={med.frequency}
                      onChange={(e) => updateMedication(med.id, "frequency", e.target.value)}
                      placeholder="Frequency (e.g., Twice daily)"
                      className="rounded-lg border-border/30 bg-card/50 text-sm"
                    />
                    <Input
                      value={med.duration}
                      onChange={(e) => updateMedication(med.id, "duration", e.target.value)}
                      placeholder="Duration (e.g., 7 days)"
                      className="rounded-lg border-border/30 bg-card/50 text-sm"
                    />
                    <Input
                      value={med.instructions}
                      onChange={(e) => updateMedication(med.id, "instructions", e.target.value)}
                      placeholder="Instructions (e.g., After meals)"
                      className="rounded-lg border-border/30 bg-card/50 text-sm"
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </section>

          {/* Doctor Notes */}
          <section>
            <label className="mb-2 block text-sm font-semibold">Doctor Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional clinical notes, lifestyle advice, precautions..."
              rows={3}
              className="w-full resize-none rounded-xl border border-border/50 bg-secondary/20 px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </section>

          {/* Follow-up */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-semibold">Follow-up Recommendation</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">Follow-up Date</label>
                <Input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="rounded-lg border-border/30 bg-secondary/20 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">Follow-up Notes</label>
                <Input
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  placeholder="e.g., Review blood reports"
                  className="rounded-lg border-border/30 bg-secondary/20 text-sm"
                />
              </div>
            </div>
          </section>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="sticky bottom-0 flex flex-row items-center justify-between gap-3 border-t border-border/30 bg-card/95 px-6 py-4 backdrop-blur-xl">
          <Button variant="ghost" onClick={onClose} disabled={saving} className="rounded-xl">
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            {isEdit && existingPrescription && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 rounded-xl border-border/30 text-xs"
                onClick={() =>
                  window.open(`/prescriptions/${existingPrescription.id}/print`, "_blank")
                }
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Preview PDF
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={saving || saved}
              className="min-w-[140px] gap-2 rounded-xl bg-violet-600 hover:bg-violet-700"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Saved!
                </>
              ) : saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  {isEdit ? "Update Prescription" : "Save Prescription"}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
