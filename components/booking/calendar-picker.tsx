"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { AvailabilitySchedule, DayKey } from "@/lib/constants";
import { getDateComponentsIST, isDateInPastIST, isDateTodayIST } from "@/lib/date-utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const JS_DAY_TO_DAY_KEY: Record<number, DayKey> = {
  0: "sun", 1: "mon", 2: "tue", 3: "wed", 4: "thu", 5: "fri", 6: "sat",
};

interface CalendarPickerProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  availability: AvailabilitySchedule | null;
}

function generateCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
  for (let i = 1; i <= lastDay.getDate(); i++) days.push(i);
  return days;
}

export function CalendarPicker({
  selectedDate,
  onSelectDate,
  availability,
}: CalendarPickerProps) {
  // Initialise from IST so the calendar always opens on the correct IST month
  const istNow = getDateComponentsIST(new Date());
  const [currentMonth, setCurrentMonth] = useState(istNow.month - 1); // 0-indexed
  const [currentYear, setCurrentYear] = useState(istNow.year);
  const [direction, setDirection] = useState(0);

  const days = generateCalendarDays(currentYear, currentMonth);

  // True when the calendar is already showing the earliest navigable month
  const isAtCurrentMonth =
    currentYear === istNow.year && currentMonth === istNow.month - 1;

  const goToPreviousMonth = () => {
    if (isAtCurrentMonth) return; // Cannot navigate before the current IST month
    setDirection(-1);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    setDirection(1);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // month + 1 converts 0-indexed to the 1-based month expected by IST utilities
  const isToday = (day: number) => isDateTodayIST(currentYear, currentMonth + 1, day);
  const isPast = (day: number) => isDateInPastIST(currentYear, currentMonth + 1, day);

  const isSelected = (day: number) =>
    !!selectedDate &&
    day === selectedDate.getDate() &&
    currentMonth === selectedDate.getMonth() &&
    currentYear === selectedDate.getFullYear();

  const isDayAvailable = (day: number): boolean => {
    if (isPast(day)) return false;
    if (!availability) return false; // No schedule set → treat all future days as unavailable
    const date = new Date(currentYear, currentMonth, day);
    const dayKey = JS_DAY_TO_DAY_KEY[date.getDay()];
    return availability[dayKey]?.enabled ?? false;
  };

  const handleDateSelect = (day: number) => {
    if (isDayAvailable(day)) {
      onSelectDate(new Date(currentYear, currentMonth, day));
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/2 backdrop-blur-xl">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={isAtCurrentMonth ? {} : { scale: 1.1 }}
            whileTap={isAtCurrentMonth ? {} : { scale: 0.9 }}
            onClick={goToPreviousMonth}
            disabled={isAtCurrentMonth}
            aria-label="Previous month"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition-colors",
              isAtCurrentMonth
                ? "cursor-not-allowed opacity-25"
                : "hover:border-white/20 hover:text-foreground"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </motion.button>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentMonth}-${currentYear}`}
              initial={{ opacity: 0, y: direction * 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: direction * -20 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              <h3 className="text-lg font-semibold text-foreground">
                {MONTHS[currentMonth]} {currentYear}
              </h3>
            </motion.div>
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goToNextMonth}
            aria-label="Next month"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground"
          >
            <ChevronRight className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      {/* Grid */}
      <div className="p-6">
        {/* Day headers */}
        <div className="mb-4 grid grid-cols-7 gap-1">
          {DAYS.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentMonth}-${currentYear}`}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-7 gap-1"
          >
            {days.map((day, index) => (
              <div key={index} className="aspect-square p-0.5">
                {day !== null ? (
                    <motion.button
                    whileHover={isDayAvailable(day) ? { scale: 1.1 } : {}}
                    whileTap={isDayAvailable(day) ? { scale: 0.95 } : {}}
                    onClick={() => handleDateSelect(day)}
                    disabled={!isDayAvailable(day)}
                    title={!isDayAvailable(day) ? (isPast(day) ? "Cannot select a past date" : "Doctor is not available on this date") : undefined}
                    className={cn(
                      "relative flex h-full w-full items-center justify-center rounded-xl text-sm font-medium transition-all",
                      "text-muted-foreground",
                      isPast(day) && "cursor-not-allowed text-muted-foreground/30",
                      isToday(day) && !isSelected(day) && "border border-primary/50 text-primary",
                      isDayAvailable(day) && !isSelected(day) && !isToday(day) &&
                        "cursor-pointer border border-white/10 bg-white/5 text-foreground hover:border-primary/50 hover:bg-primary/10",
                      !isDayAvailable(day) && !isPast(day) &&
                        "cursor-not-allowed text-muted-foreground/50",
                      isSelected(day) &&
                        "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    )}
                  >
                    {day}
                    {isDayAvailable(day) && !isSelected(day) && (
                      <span className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-400" />
                    )}
                  </motion.button>
                ) : (
                  <div className="h-full w-full" />
                )}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
            <span className="text-xs text-muted-foreground">Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  );
}
