"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CONSULTATION_TYPE, ConsultationType } from "@/lib/constants";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: ConsultationType;
  patient: string;
}

const V = CONSULTATION_TYPE.VIDEO;

// Events will be populated dynamically from API

export function CalendarScheduling() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const res = await fetch("/api/doctor/appointments");
        if (res.ok) {
          const data = await res.json();
          setAppointments(data);
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchAppointments();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Build the dynamic events object for the currently selected month and year
  const events: Record<number, CalendarEvent[]> = {};
  
  appointments.forEach(appt => {
    const d = new Date(appt.date);
    if (d.getFullYear() === year && d.getMonth() === month && appt.status !== "CANCELLED") {
      const day = d.getDate();
      if (!events[day]) events[day] = [];
      events[day].push({
        id: appt.id,
        title: appt.prescription?.diagnosis || "Consultation",
        time: appt.timeSlot,
        type: appt.consultationType || V,
        patient: appt.patient?.name || "Unknown"
      });
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="rounded-2xl border border-border/30 bg-card shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/30 p-4 lg:p-5">
        <div>
          <h2 className="text-xl font-bold">Calendar</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Schedule and manage your appointments
          </p>
        </div>
      </div>

      <div className="flex flex-col">
        {/* Calendar */}
        <div className="p-4 lg:p-5 border-b border-border/20">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">
              {months[month]} {year}
            </h3>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevMonth}
                className="h-8 w-8 rounded-lg cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextMonth}
                className="h-8 w-8 rounded-lg cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 mb-1">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the first of the month */}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="h-9" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const hasEvents = events[day] && events[day].length > 0;
              const isSelected = day === selectedDate;
              const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "relative h-9 flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-all duration-200 hover:bg-secondary/50 cursor-pointer",
                    isSelected &&
                      "bg-gradient-to-br from-primary to-accent text-white shadow-md",
                    isToday && !isSelected && "ring-1 ring-primary/50",
                    !isSelected && "text-foreground"
                  )}
                >
                  <span className={isSelected ? "-mt-2" : ""}>{day}</span>
                  {hasEvents && !isSelected && (
                    <div className="absolute bottom-1 flex gap-0.5">
                      {events[day].slice(0, 3).map((_, i) => (
                        <span
                          key={i}
                          className="h-1 w-1 rounded-full bg-primary"
                        />
                      ))}
                    </div>
                  )}
                  {hasEvents && isSelected && (
                    <span className="absolute bottom-0.5 text-[8px] text-white/90 font-semibold tracking-tighter">
                      {events[day].length} evts
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
