"use client";

import { motion } from "framer-motion";
import { Clock, Video, Building2, Sun, Sunset, Moon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONSULTATION_TYPE, TIME_SLOTS, type ConsultationType, type AvailabilitySchedule, type DayKey } from "@/lib/constants";
import { isSlotPastForDate } from "@/lib/date-utils";

const JS_DAY_TO_DAY_KEY: Record<number, DayKey> = {
  0: "sun", 1: "mon", 2: "tue", 3: "wed", 4: "thu", 5: "fri", 6: "sat",
};

interface TimeSlotsProps {
  selectedDate: Date | null;
  selectedSlot: string | null;
  selectedType: ConsultationType;
  availability: AvailabilitySchedule | null;
  bookedSlots: string[];
  isLoadingSlots: boolean;
  onSelectSlot: (slot: string) => void;
  onSelectType: (type: ConsultationType) => void;
}

interface CategorizedSlots {
  morning: string[];
  afternoon: string[];
  evening: string[];
}

function getSlotsForDate(
  date: Date,
  availability: AvailabilitySchedule | null
): string[] {
  if (!availability) {
    return [
      ...TIME_SLOTS.morning,
      ...TIME_SLOTS.afternoon,
      ...TIME_SLOTS.evening,
    ];
  }
  const dayKey = JS_DAY_TO_DAY_KEY[date.getDay()];
  if (!dayKey) return [];
  const dayAvail = availability[dayKey];
  if (!dayAvail?.enabled) return [];
  return dayAvail.slots;
}

function parseTimeToMinutes(timeStr: string): number {
  const [time, period] = timeStr.split(" ");
  const [hStr, mStr] = time.split(":");
  let hours = Number(hStr);
  const minutes = Number(mStr);
  
  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }
  
  return hours * 60 + minutes;
}

function categorizeSlots(slots: string[]): CategorizedSlots {
  const morning: string[] = [];
  const afternoon: string[] = [];
  const evening: string[] = [];

  const sortedSlots = [...slots].sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));

  for (const slot of sortedSlots) {
    const hour = parseInt(slot.split(":")[0], 10);
    const isPM = slot.includes("PM");
    const hour24 = isPM && hour !== 12 ? hour + 12 : !isPM && hour === 12 ? 0 : hour;

    if (hour24 < 12) morning.push(slot);
    else if (hour24 < 16) afternoon.push(slot);
    else evening.push(slot);
  }

  return { morning, afternoon, evening };
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1 },
};

interface SlotGroupProps {
  label: string;
  icon: React.ReactNode;
  slots: string[];
  selectedSlot: string | null;
  bookedSlots: string[];
  isPastSlot: (slot: string) => boolean;
  onSelectSlot: (slot: string) => void;
}

function SlotGroup({ label, icon, slots, selectedSlot, bookedSlots, isPastSlot, onSelectSlot }: SlotGroupProps) {
  if (slots.length === 0) return null;

  return (
    <div className="mb-6 last:mb-0">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-3 gap-2"
      >
        {slots.map((slot) => {
          const isBooked = bookedSlots.includes(slot);
          const isPast = isPastSlot(slot);
          const isDisabled = isBooked || isPast;
          const isSelected = selectedSlot === slot;

          return (
            <motion.button
              key={slot}
              variants={itemVariants}
              whileHover={!isDisabled ? { scale: 1.05 } : {}}
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
              onClick={() => !isDisabled && onSelectSlot(slot)}
              disabled={isDisabled}
              title={
                isBooked ? "This time slot is already booked"
                : isPast ? "This time has already passed"
                : undefined
              }
              className={cn(
                "rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isBooked
                  ? "cursor-not-allowed border border-border/30 bg-muted/10 text-muted-foreground/40 line-through"
                  : isPast
                  ? "cursor-not-allowed border border-border/20 bg-muted/5 text-muted-foreground/25"
                  : isSelected
                  ? "border border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "border border-border bg-secondary/30 text-foreground hover:border-primary/50 hover:bg-primary/10"
              )}
            >
              {slot}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

export function TimeSlotPicker({
  selectedDate,
  selectedSlot,
  selectedType,
  availability,
  bookedSlots,
  isLoadingSlots,
  onSelectSlot,
  onSelectType,
}: TimeSlotsProps) {
  if (!selectedDate) {
    return (
      <div className="flex h-full min-h-50 items-center justify-center rounded-2xl border border-border bg-card/40 p-8 backdrop-blur-xl">
        <div className="text-center">
          <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">Select a date to view available time slots</p>
        </div>
      </div>
    );
  }

  const rawSlots = getSlotsForDate(selectedDate, availability);
  const { morning, afternoon, evening } = categorizeSlots(rawSlots);
  const hasSlots = morning.length > 0 || afternoon.length > 0 || evening.length > 0;

  const isPastSlot = (slot: string) => isSlotPastForDate(selectedDate, slot);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(date);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur-xl">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <h3 className="text-lg font-semibold text-foreground">Available Times</h3>
        <p className="mt-1 text-sm text-muted-foreground">{formatDate(selectedDate)}</p>
      </div>

      {/* Consultation type toggle */}
      <div className="border-b border-border p-4">
        <div className="flex gap-2 rounded-xl bg-secondary/30 p-1">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectType(CONSULTATION_TYPE.VIDEO)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all",
              selectedType === CONSULTATION_TYPE.VIDEO
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Video className="h-4 w-4" />
            Video Call
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectType(CONSULTATION_TYPE.IN_PERSON)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all",
              selectedType === CONSULTATION_TYPE.IN_PERSON
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Building2 className="h-4 w-4" />
            In-Person
          </motion.button>
        </div>
      </div>

      {/* Slots */}
      <div className="max-h-100 overflow-y-auto p-6">
        {isLoadingSlots ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !hasSlots ? (
          <div className="py-8 text-center">
            <Clock className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No available slots for this day
            </p>
          </div>
        ) : (
          <>
            <SlotGroup
              label="Morning"
              icon={<Sun className="h-4 w-4 text-amber-400" />}
              slots={morning}
              selectedSlot={selectedSlot}
              bookedSlots={bookedSlots}
              isPastSlot={isPastSlot}
              onSelectSlot={onSelectSlot}
            />
            <SlotGroup
              label="Afternoon"
              icon={<Sunset className="h-4 w-4 text-orange-400" />}
              slots={afternoon}
              selectedSlot={selectedSlot}
              bookedSlots={bookedSlots}
              isPastSlot={isPastSlot}
              onSelectSlot={onSelectSlot}
            />
            <SlotGroup
              label="Evening"
              icon={<Moon className="h-4 w-4 text-indigo-400" />}
              slots={evening}
              selectedSlot={selectedSlot}
              bookedSlots={bookedSlots}
              isPastSlot={isPastSlot}
              onSelectSlot={onSelectSlot}
            />
          </>
        )}
      </div>
    </div>
  );
}
