"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Moon,
  Sun,
  Sunset,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { TIME_SLOTS } from "@/lib/constants";
import {
  getTodayISODateIST,
  getDateComponentsIST,
  isSlotPastIST,
  formatISODate,
  formatShortDate,
} from "@/lib/date-utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RescheduleAppointment {
  id: string;
  date: string;
  timeSlot: string;
  status: string;
  doctor: {
    id: string;
    name: string;
    specialty: string;
    hospital: string;
  };
}

interface RescheduleDialogProps {
  appointment: RescheduleAppointment | null;
  onClose: () => void;
  onSuccess: (updated: RescheduleAppointment) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// ── Private sub-component: MiniCalendar ──────────────────────────────────────

function MiniCalendar({
  selectedDate,
  onDateSelect,
}: {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}) {
  const istNow = getDateComponentsIST(new Date());
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const todayStr = getTodayISODateIST();
  const selectedStr = toDateStr(selectedDate);

  const cells: (number | null)[] = [
    ...Array<null>(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const isAtEarliestMonth =
    viewYear === istNow.year && viewMonth === istNow.month - 1;

  const navigate = (delta: number) => {
    if (delta === -1 && isAtEarliestMonth) return;
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const isPast = (day: number) => {
    const cellStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return cellStr < todayStr;
  };

  const cellStr = (day: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return (
    <div className="select-none space-y-2">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          disabled={isAtEarliestMonth}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors",
            isAtEarliestMonth ? "cursor-not-allowed opacity-25" : "hover:bg-secondary/50"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-foreground">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={() => navigate(1)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary/50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[10px] font-medium text-muted-foreground/60"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-px">
        {cells.map((day, i) => (
          <div key={i} className="aspect-square">
            {day !== null && (
              <button
                disabled={isPast(day)}
                onClick={() =>
                  !isPast(day) && onDateSelect(new Date(viewYear, viewMonth, day))
                }
                className={cn(
                  "flex h-full w-full items-center justify-center rounded-lg text-xs font-medium transition-all duration-150",
                  isPast(day)
                    ? "cursor-not-allowed text-muted-foreground/25"
                    : cellStr(day) === selectedStr
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                    : cellStr(day) === todayStr
                    ? "ring-1 ring-primary/60 text-foreground"
                    : "text-foreground hover:bg-secondary/50"
                )}
              >
                {day}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Slot period config ────────────────────────────────────────────────────────

const SLOT_PERIODS = [
  { key: "morning" as const,   label: "Morning",   Icon: Sun },
  { key: "afternoon" as const, label: "Afternoon", Icon: Sunset },
  { key: "evening" as const,   label: "Evening",   Icon: Moon },
] as const;

// ── RescheduleDialog ─────────────────────────────────────────────────────────

export function RescheduleDialog({
  appointment,
  onClose,
  onSuccess,
}: RescheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset when the appointment being rescheduled changes
  useEffect(() => {
    if (appointment) {
      Promise.resolve().then(() => {
        setSelectedDate(new Date(appointment.date));
        setSelectedSlot(null);
        setError(null);
        setBookedSlots([]);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointment?.id]);

  // Fetch booked slots for the selected date (cancellable via cleanup)
  useEffect(() => {
    if (!appointment) return;
    let stale = false;

    async function load() {
      setIsLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const res = await fetch(
          `/api/appointments/booked?doctorId=${appointment!.doctor.id}&date=${toDateStr(selectedDate)}`
        );
        if (!stale && res.ok) {
          const data = await res.json();
          setBookedSlots(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!stale) setBookedSlots([]);
      } finally {
        if (!stale) setIsLoadingSlots(false);
      }
    }

    load();
    return () => { stale = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointment?.id, appointment?.doctor.id, selectedDate]);

  const handleConfirm = async () => {
    if (!appointment || !selectedSlot) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formatISODate(selectedDate),
          timeSlot: selectedSlot,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to reschedule");
      onSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBooked = (slot: string) => bookedSlots.includes(slot);
  const isCurrentSlot = (slot: string) =>
    !!appointment &&
    appointment.timeSlot === slot &&
    toDateStr(new Date(appointment.date)) === toDateStr(selectedDate);
  const isPastSlot = (slot: string) => {
    const { year, month, day } = getDateComponentsIST(selectedDate);
    return isSlotPastIST(year, month, day, slot);
  };

  return (
    <Dialog open={!!appointment} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-3xl gap-0 border-border/50 bg-card/95 p-0 backdrop-blur-xl"
        showCloseButton
      >
        {/* Header */}
        <DialogHeader className="border-b border-border/50 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Reschedule Appointment
              </DialogTitle>
              {appointment && (
                <DialogDescription className="text-xs">
                  {appointment.doctor.name} · {appointment.doctor.specialty}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {appointment && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
            {/* ── Left: Calendar ────────────────────────────────────────── */}
            <div className="border-b border-border/50 p-6 lg:border-b-0 lg:border-r">
              {/* Current booking chip */}
              <div className="mb-4 rounded-xl bg-secondary/30 px-4 py-3">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Current booking
                </p>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", weekday: "short", month: "short", day: "numeric" }).format(new Date(appointment.date))}
                  </span>
                  <span className="flex items-center gap-1 text-cyan-400">
                    <Clock className="h-3.5 w-3.5" />
                    {appointment.timeSlot}
                  </span>
                </div>
              </div>

              <p className="mb-3 text-xs font-medium text-muted-foreground">
                Select a new date
              </p>
              <MiniCalendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </div>

            {/* ── Right: Time slots ─────────────────────────────────────── */}
            <div className="flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Choose a Time
                </h3>
                <span className="text-xs text-muted-foreground">
                  {formatShortDate(selectedDate)}
                </span>
              </div>

              {isLoadingSlots ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary"
                  />
                  <span className="text-xs">Loading availability…</span>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-4 pr-0.5">
                  {SLOT_PERIODS.map(({ key, label, Icon }) => (
                    <div key={key}>
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground/60" />
                        <span className="text-xs font-medium text-muted-foreground">
                          {label}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {TIME_SLOTS[key].map((slot) => {
                          const booked = isBooked(slot);
                          const current = isCurrentSlot(slot);
                          const past = isPastSlot(slot) && !current;
                          const selected = selectedSlot === slot;
                          const disabled = (booked && !current) || past;
                          return (
                            <button
                              key={slot}
                              disabled={disabled}
                              onClick={() => !disabled && setSelectedSlot(slot)}
                              title={
                                booked && !current ? "Already booked"
                                : past ? "This time has already passed"
                                : undefined
                              }
                              className={cn(
                                "rounded-lg py-2 text-xs font-medium transition-all duration-150",
                                booked && !current
                                  ? "cursor-not-allowed bg-secondary/20 text-muted-foreground/30 line-through"
                                  : past
                                  ? "cursor-not-allowed bg-secondary/10 text-muted-foreground/20"
                                  : selected
                                  ? "bg-linear-to-br from-primary to-accent text-white shadow-sm shadow-primary/20"
                                  : current
                                  ? "border border-dashed border-primary/50 text-primary/80"
                                  : "bg-secondary/30 text-foreground hover:bg-secondary/60"
                              )}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Legend */}
              {!isLoadingSlots && (
                <div className="mt-auto flex flex-wrap gap-3 border-t border-border/30 pt-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2 w-5 rounded-sm border border-dashed border-primary/50" />
                    Current
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2 w-5 rounded-sm bg-secondary/20" />
                    Booked
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2 w-5 rounded-sm bg-secondary/10" />
                    Past
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2 w-5 rounded-sm bg-linear-to-r from-primary to-accent" />
                    Selected
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error banner (animated) */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mx-6 mb-1 flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-2 rounded-b-xl border-t border-border/50 bg-muted/20 px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border-border/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedSlot || isSubmitting}
            className="gap-2 rounded-xl bg-linear-to-r from-primary to-accent text-white shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                />
                Rescheduling…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Confirm Reschedule
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
