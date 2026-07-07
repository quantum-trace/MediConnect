"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  RescheduleDialog,
  type RescheduleAppointment,
} from "@/components/dashboard/reschedule-dialog";
import { JoinCallButton } from "@/components/video/join-call-button";
import Link from "next/link";
import {
  Clock,
  Video,
  MapPin,
  MoreHorizontal,
  Calendar,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { APPOINTMENT_STATUS } from "@/lib/constants";

const statusColors = {
  PENDING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  CONFIRMED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
  COMPLETED: "bg-primary/10 text-primary border-primary/20",
};

export function UpcomingAppointments() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [reschedulingAppointment, setReschedulingAppointment] =
    useState<RescheduleAppointment | null>(null);

  const handleRescheduleSuccess = (updated: RescheduleAppointment) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a))
    );
    setReschedulingAppointment(null);
    toast.success("Appointment rescheduled.");
  };

  const handleCancel = useCallback(async (id: string) => {
    setCancellingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: APPOINTMENT_STATUS.CANCELLED }),
      });
      if (!res.ok) throw new Error("Failed to cancel");
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: APPOINTMENT_STATUS.CANCELLED } : a
        )
      );
      toast.success("Appointment cancelled.");
    } catch {
      toast.error("Failed to cancel appointment. Please try again.");
    } finally {
      setCancellingId(null);
    }
  }, []);



  useEffect(() => {
    async function fetchAppointments() {
      try {
        const response = await fetch("/api/appointments/user");
        const data = await response.json();
        setAppointments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load appointments.");
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, []);

  const confirmedAppointments = appointments.filter(
    (a) => a.status === APPOINTMENT_STATUS.CONFIRMED
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
              <p className="text-sm text-muted-foreground">
                Your scheduled consultations
              </p>
            </div>
          </div>

          {confirmedAppointments.length > 0 && (
            <p className="text-sm font-medium text-muted-foreground">
              {confirmedAppointments.length}{" "}
              {confirmedAppointments.length === 1 ? "appointment" : "appointments"}
            </p>
          )}
        </div>

        {/* Appointments */}
        <div className="flex flex-col gap-3 p-4">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-border/40 bg-secondary/10 px-5 py-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-13 w-13 shrink-0 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </div>
              ))}
            </>
          ) : confirmedAppointments.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Calendar className="h-7 w-7 text-primary/60" />
              </div>
              <p className="font-medium text-muted-foreground">
                No confirmed appointments
              </p>
              <p className="text-sm text-muted-foreground/70">
                Book a consultation or wait for doctor approval.
              </p>
            </div>
          ) : (
            confirmedAppointments.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="group relative flex flex-col gap-4 rounded-xl border border-border/40 bg-secondary/10 px-4 sm:px-5 py-4 transition-colors hover:bg-secondary/30"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* LEFT: Avatar + Info */}
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="relative shrink-0 mt-0.5">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarImage
                          src={appointment.doctor.imageUrl}
                          alt={appointment.doctor.name}
                        />
                        <AvatarFallback className="bg-linear-to-br from-primary to-accent text-white">
                          {appointment.doctor.name
                            ?.split(" ")
                            ?.map((word: string) => word[0])
                            ?.join("") || "D"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <Video className="h-3 w-3 text-white" />
                      </div>
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="font-medium truncate text-base min-w-0">{appointment.doctor.name}</p>
                        <Badge
                          className={cn(
                            "h-5 px-1.5 text-[10px] font-medium capitalize sm:hidden shrink-0",
                            statusColors[
                              appointment.status as keyof typeof statusColors
                            ]
                          )}
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                      {appointment.doctor.specialty && (
                        <p className="text-sm text-muted-foreground truncate">
                          {appointment.doctor.specialty}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{appointment.doctor.hospital}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
                        <div className="flex items-center gap-1 text-primary">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", weekday: "short", month: "short", day: "numeric" }).format(new Date(appointment.date))}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-cyan-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{appointment.timeSlot}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Actions (Desktop) + Menu */}
                  <div className="flex items-center gap-3 shrink-0 mt-0.5">
                    <Badge
                      className={cn(
                        "hidden sm:inline-flex border font-medium capitalize",
                        statusColors[
                          appointment.status as keyof typeof statusColors
                        ]
                      )}
                    >
                      {appointment.status}
                    </Badge>

                    {appointment.consultationType === "VIDEO" &&
                      appointment.status !== APPOINTMENT_STATUS.CANCELLED &&
                      appointment.status !== APPOINTMENT_STATUS.COMPLETED && (
                        <div className="hidden sm:block">
                          <JoinCallButton
                            appointmentId={appointment.id}
                            status={appointment.status}
                            consultationType={appointment.consultationType}
                            variant="outline"
                            size="sm"
                          />
                        </div>
                      )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground sm:opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="border-border/50 bg-card/95 backdrop-blur-xl"
                      >
                        {appointment.status !== APPOINTMENT_STATUS.CANCELLED &&
                          appointment.status !==
                            APPOINTMENT_STATUS.COMPLETED && (
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() =>
                                setReschedulingAppointment(appointment)
                              }
                            >
                              Reschedule
                            </DropdownMenuItem>
                          )}

                        {appointment.status !== APPOINTMENT_STATUS.CANCELLED &&
                          appointment.status !==
                            APPOINTMENT_STATUS.COMPLETED && (
                            <DropdownMenuItem
                              className="cursor-pointer text-destructive focus:text-destructive"
                              disabled={cancellingId === appointment.id}
                              onClick={() => handleCancel(appointment.id)}
                            >
                              {cancellingId === appointment.id
                                ? "Cancelling…"
                                : "Cancel"}
                            </DropdownMenuItem>
                          )}

                        {(appointment.status === APPOINTMENT_STATUS.CANCELLED ||
                          appointment.status ===
                            APPOINTMENT_STATUS.COMPLETED) && (
                          <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                            No actions available
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* BOTTOM: Join Call (Mobile) */}
                {appointment.consultationType === "VIDEO" &&
                  appointment.status !== APPOINTMENT_STATUS.CANCELLED &&
                  appointment.status !== APPOINTMENT_STATUS.COMPLETED && (
                    <div className="w-full border-t border-border/20 pt-3 sm:hidden">
                      <JoinCallButton
                        appointmentId={appointment.id}
                        status={appointment.status}
                        consultationType={appointment.consultationType}
                        variant="outline"
                        size="sm"
                        className="w-full bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                      />
                    </div>
                  )}
              </motion.div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/50 p-4">
          <Link href="/booking" className="block w-full min-w-0">
            <Button
              className="w-full flex min-w-0 gap-2 rounded-xl bg-linear-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 px-2 sm:px-4"
            >
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="truncate min-w-0">Book New Appointment</span>
            </Button>
          </Link>
        </div>
      </motion.div>

      <RescheduleDialog
        appointment={reschedulingAppointment}
        onClose={() => setReschedulingAppointment(null)}
        onSuccess={handleRescheduleSuccess}
      />
    </>
  );
}
