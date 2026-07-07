"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Clock,
  Check,
  X,
  MoreHorizontal,
  Calendar,
  ChevronRight,
  User,
  FileText,
  Edit3,
  CheckCircle,
} from "lucide-react";
import { JoinCallButton } from "@/components/video/join-call-button";
import { PrescriptionEditor } from "@/components/doctor/prescription-editor";
import { RescheduleModal } from "@/components/doctor/reschedule-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APPOINTMENT_STATUS, type AppointmentStatusType } from "@/lib/constants";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig: Record<
  AppointmentStatusType,
  { label: string; color: string; bg: string }
> = {
  [APPOINTMENT_STATUS.PENDING]: {
    label: "Pending",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  [APPOINTMENT_STATUS.CONFIRMED]: {
    label: "Confirmed",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  [APPOINTMENT_STATUS.CANCELLED]: {
    label: "Cancelled",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  [APPOINTMENT_STATUS.COMPLETED]: {
    label: "Completed",
    color: "text-muted-foreground",
    bg: "bg-muted/50",
  },
};

function isPastAppointment(dateString: string, timeSlot: string) {
  const match = timeSlot.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return false;
  
  const [, hours, mins, modifier] = match;
  let h = parseInt(hours, 10);
  const m = parseInt(mins, 10);

  if (modifier.toUpperCase() === "PM" && h < 12) h += 12;
  if (modifier.toUpperCase() === "AM" && h === 12) h = 0;

  const apptDate = new Date(dateString);
  apptDate.setHours(h, m, 0, 0);
  
  return apptDate < new Date();
}

interface Appointment {
  id: string;
  status: AppointmentStatusType;
  date: string;
  timeSlot: string;
  consultationType?: string;
  patientId: string;
  patient: { name: string; imageUrl?: string };
  prescription?: { id: string } | null;
}

export function AppointmentManagement() {
  const [activeTab, setActiveTab] = useState("all");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [prescribingAppointment, setPrescribingAppointment] = useState<Appointment | null>(null);
  const [existingPrescription, setExistingPrescription] = useState<unknown>(null);
  const [loadingPrescription, setLoadingPrescription] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await fetch("/api/doctor/appointments");
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => fetchAppointments());
  }, [fetchAppointments]);

  const updateAppointmentStatus = useCallback(async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update appointment");
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: status as AppointmentStatusType } : a))
      );
      toast.success(`Appointment ${status.toLowerCase()}.`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update appointment. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  }, []);

  const openPrescriptionEditor = useCallback(async (appointment: Appointment) => {
    setLoadingPrescription(appointment.id);
    try {
      const res = await fetch(`/api/appointments/${appointment.id}/prescription`);
      const data = res.ok ? await res.json() : null;
      setExistingPrescription(data);
      setPrescribingAppointment(appointment);
    } catch {
      setExistingPrescription(null);
      setPrescribingAppointment(appointment);
    } finally {
      setLoadingPrescription(null);
    }
  }, []);

  const handlePrescriptionSaved = useCallback((prescription: unknown) => {
    const p = prescription as { id: string };
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === prescribingAppointment?.id
          ? { ...a, prescription: { id: p.id } }
          : a
      )
    );
    setPrescribingAppointment(null);
    setExistingPrescription(null);
  }, [prescribingAppointment]);

  const filteredAppointments = appointments.filter((a) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return a.status === APPOINTMENT_STATUS.PENDING;
    if (activeTab === "confirmed") return a.status === APPOINTMENT_STATUS.CONFIRMED;
    if (activeTab === "completed") return a.status === APPOINTMENT_STATUS.COMPLETED;
    return true;
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="overflow-hidden rounded-2xl border border-border/30 bg-card shadow-sm"
      >
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-border/30 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Appointments</h2>
            <div className="mt-1 text-sm text-muted-foreground">
              {loading ? (
                <Skeleton className="h-4 w-32 inline-block" />
              ) : (
                `${appointments.length} appointments total`
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-0 w-full sm:w-auto">
              <TabsList className="h-9 rounded-xl bg-secondary/30 p-1 flex min-w-0 overflow-x-auto scrollbar-none w-full justify-start sm:justify-center">
                {[
                  { value: "all", label: "All" },
                  { value: "pending", label: "Pending" },
                  { value: "confirmed", label: "Confirmed" },
                  { value: "completed", label: "Completed" },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="rounded-lg px-3 text-[10px] data-[state=active]:bg-card data-[state=active]:shadow-sm"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <Button
              variant="outline"
              size="sm"
              className="hidden h-9 gap-2 rounded-xl border-border/30 sm:flex text-xs cursor-pointer"
              asChild
            >
              <Link href="/doctor/availability">
                <Calendar className="h-4 w-4" />
                View Calendar
              </Link>
            </Button>
          </div>
        </div>

        {/* Appointments List */}
        <div className="divide-y divide-border/20">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-5 p-5">
                  <Skeleton className="hidden h-16 w-20 shrink-0 rounded-xl sm:block" />
                  <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="hidden h-9 w-24 rounded-xl sm:block" />
                  <Skeleton className="h-9 w-20 rounded-lg" />
                </div>
              ))}
            </>
          ) : filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Calendar className="h-7 w-7 text-primary/60" />
              </div>
              <p className="font-medium text-muted-foreground">No appointments found</p>
              <p className="text-sm text-muted-foreground/70">
                {activeTab === "all"
                  ? "You have no appointments scheduled yet."
                  : `No ${activeTab} appointments to show.`}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 p-5 transition-colors hover:bg-secondary/20"
                >
                  {/* Time */}
                  <div className="hidden w-20 shrink-0 flex-col items-center sm:flex">
                    <span className="text-sm font-semibold">
                      {new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" }).format(new Date(appointment.date))}
                    </span>
                    <span className="text-xs text-muted-foreground">30 min</span>
                  </div>

                  <div className="hidden h-16 w-px bg-linear-to-b from-transparent via-border/50 to-transparent sm:block shrink-0" />

                  {/* Patient Info */}
                  <div className="flex flex-1 items-start gap-4 min-w-0 w-full sm:w-auto">
                    <Avatar className="h-12 w-12 border-2 border-border/30 shrink-0 mt-0.5">
                      <AvatarImage src={appointment.patient.imageUrl} />
                      <AvatarFallback className="bg-linear-to-br from-primary/20 to-accent/20 text-sm font-semibold">
                        {appointment.patient.name
                          ?.split(" ")
                          ?.map((n: string) => n[0])
                          ?.join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="truncate font-semibold min-w-0">{appointment.patient.name}</h3>
                        <Badge
                          className={`inline-flex h-5 rounded-md px-2 text-[10px] font-medium ${
                            statusConfig[appointment.status].bg
                          } ${statusConfig[appointment.status].color}`}
                        >
                          {statusConfig[appointment.status].label}
                        </Badge>
                        {appointment.prescription && (
                          <Badge className="inline-flex h-5 rounded-md bg-violet-500/10 px-2 text-[10px] font-medium text-violet-500">
                            Rx
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {appointment.timeSlot}
                      </p>
                      <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground/70">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Patient
                        </span>
                        <span className="flex items-center gap-1 sm:hidden">
                          <Clock className="h-3 w-3" />
                          {new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(appointment.date))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-2 shrink-0 border-t border-border/20 pt-4 mt-2 sm:mt-0 sm:border-t-0 sm:pt-0">
                    {/* Consultation Type */}
                    <div className="sm:hidden flex items-center gap-2 rounded-lg bg-primary/10 px-2.5 py-1 text-primary shrink-0">
                      <Video className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-medium">
                        {appointment.consultationType === "IN_PERSON" ? "In Person" : "Video"}
                      </span>
                    </div>
                    <div className="hidden sm:block shrink-0 mr-2">
                      <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 text-primary">
                        <Video className="h-4 w-4" />
                        <span className="text-xs font-medium">
                          {appointment.consultationType === "IN_PERSON" ? "In Person" : "Video Call"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {appointment.status === APPOINTMENT_STATUS.PENDING && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={updatingId === appointment.id}
                          className="h-9 w-9 rounded-lg text-emerald-500 hover:bg-emerald-500/10"
                          onClick={() =>
                            updateAppointmentStatus(appointment.id, APPOINTMENT_STATUS.CONFIRMED)
                          }
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={updatingId === appointment.id}
                          className="h-9 w-9 rounded-lg text-destructive hover:bg-destructive/10"
                          onClick={() =>
                            updateAppointmentStatus(appointment.id, APPOINTMENT_STATUS.CANCELLED)
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {appointment.status === APPOINTMENT_STATUS.CONFIRMED && (
                      <JoinCallButton
                        appointmentId={appointment.id}
                        status={appointment.status}
                        consultationType={appointment.consultationType ?? "VIDEO"}
                        variant="outline"
                        size="sm"
                        label="Join Call"
                        className="h-9 rounded-lg border-border/30 px-4"
                      />
                    )}

                    {appointment.status === APPOINTMENT_STATUS.COMPLETED && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={loadingPrescription === appointment.id}
                        onClick={() => openPrescriptionEditor(appointment)}
                        className={`h-9 gap-1.5 rounded-lg border-border/30 px-3 text-xs ${
                          appointment.prescription
                            ? "border-violet-500/30 text-violet-500 hover:bg-violet-500/10"
                            : ""
                        }`}
                      >
                        {appointment.prescription ? (
                          <Edit3 className="h-3.5 w-3.5" />
                        ) : (
                          <FileText className="h-3.5 w-3.5" />
                        )}
                        {appointment.prescription ? "Edit Rx" : "Write Rx"}
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 rounded-lg text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 rounded-xl border-border/30 bg-card/95 backdrop-blur-xl"
                      >
                        {appointment.status === APPOINTMENT_STATUS.COMPLETED &&
                          appointment.prescription && (
                            <DropdownMenuItem
                              className="cursor-pointer gap-2"
                              onClick={() =>
                                window.open(
                                  `/prescriptions/${appointment.prescription!.id}/print`,
                                  "_blank"
                                )
                              }
                            >
                              <FileText className="h-4 w-4" />
                              View Prescription
                            </DropdownMenuItem>
                          )}
                        <DropdownMenuItem className="cursor-pointer gap-2" asChild>
                          <Link href={`/doctor/patients/${appointment.patientId}`}>
                            <User className="h-4 w-4" />
                            View Patient Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => setReschedulingId(appointment.id)}>
                          <Calendar className="h-4 w-4" />
                          Reschedule
                        </DropdownMenuItem>
                        {isPastAppointment(appointment.date, appointment.timeSlot) && appointment.status !== APPOINTMENT_STATUS.COMPLETED && appointment.status !== APPOINTMENT_STATUS.CANCELLED && (
                          <DropdownMenuItem 
                            className="cursor-pointer gap-2 text-emerald-500 focus:text-emerald-500"
                            onClick={() => updateAppointmentStatus(appointment.id, APPOINTMENT_STATUS.COMPLETED)}
                            disabled={updatingId === appointment.id}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Mark Completed
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                          onClick={() => updateAppointmentStatus(appointment.id, APPOINTMENT_STATUS.CANCELLED)}
                          disabled={updatingId === appointment.id}
                        >
                          Cancel Appointment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/30 p-4">
          <Button
            variant="ghost"
            className="w-full justify-center gap-2 rounded-xl text-sm font-medium text-primary hover:bg-primary/10 cursor-pointer"
            asChild
          >
            <Link href="/doctor/appointments">
              View All Appointments
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </motion.div>

      {prescribingAppointment && (
        <PrescriptionEditor
          appointment={prescribingAppointment}
          existingPrescription={existingPrescription as Parameters<typeof PrescriptionEditor>[0]["existingPrescription"]}
          onClose={() => {
            setPrescribingAppointment(null);
            setExistingPrescription(null);
          }}
          onSaved={handlePrescriptionSaved}
        />
      )}

      {reschedulingId && (
        <RescheduleModal
          appointmentId={reschedulingId}
          onClose={() => setReschedulingId(null)}
          onSuccess={(id, date, timeSlot) => {
            setAppointments((prev) =>
              prev.map((a) =>
                a.id === id ? { ...a, date, timeSlot } : a
              )
            );
            setReschedulingId(null);
          }}
        />
      )}
    </>
  );
}
