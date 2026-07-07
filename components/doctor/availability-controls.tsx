"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Save, RotateCcw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AvailabilitySchedule, DayKey } from "@/lib/constants";
import { toast } from "sonner";

const daysOfWeek: { key: DayKey; label: string; short: string }[] = [
  { key: "mon", label: "Monday",    short: "Mon" },
  { key: "tue", label: "Tuesday",   short: "Tue" },
  { key: "wed", label: "Wednesday", short: "Wed" },
  { key: "thu", label: "Thursday",  short: "Thu" },
  { key: "fri", label: "Friday",    short: "Fri" },
  { key: "sat", label: "Saturday",  short: "Sat" },
  { key: "sun", label: "Sunday",    short: "Sun" },
];

const timeSlots = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
  "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM",
];

const defaultAvailability: AvailabilitySchedule = {
  mon: { enabled: true,  slots: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"] },
  tue: { enabled: true,  slots: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"] },
  wed: { enabled: true,  slots: ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"] },
  thu: { enabled: true,  slots: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"] },
  fri: { enabled: true,  slots: ["9:00 AM", "10:00 AM", "11:00 AM"] },
  sat: { enabled: false, slots: [] },
  sun: { enabled: false, slots: [] },
};

export function AvailabilityControls() {
  const [availability, setAvailability] = useState<AvailabilitySchedule>(defaultAvailability);
  const [savedAvailability, setSavedAvailability] = useState<AvailabilitySchedule>(defaultAvailability);
  const [selectedDay, setSelectedDay] = useState<DayKey>("mon");
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function fetchAvailability() {
      try {
        const res = await fetch("/api/doctor/availability");
        if (!res.ok) return;
        const data: AvailabilitySchedule | null = await res.json();
        if (data && Object.keys(data).length > 0) {
          setAvailability(data);
          setSavedAvailability(data);
        }
      } catch (err) {
        console.error("Failed to load availability:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAvailability();

    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  const toggleDayEnabled = (day: DayKey) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
    setHasChanges(true);
  };

  const toggleSlot = (day: DayKey, slot: string) => {
    setAvailability((prev) => {
      const currentSlots = prev[day].slots;
      const newSlots = currentSlots.includes(slot)
        ? currentSlots.filter((s) => s !== slot)
        : [...currentSlots, slot];
      return {
        ...prev,
        [day]: { ...prev[day], slots: newSlots },
      };
    });
    setHasChanges(true);
  };

  const resetToSaved = () => {
    setAvailability(savedAvailability);
    setHasChanges(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/doctor/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule: availability }),
      });
      if (!res.ok) throw new Error("Save failed");
      const saved: AvailabilitySchedule = await res.json();
      setSavedAvailability(saved);
      setHasChanges(false);
      setShowSaved(true);
      savedTimerRef.current = setTimeout(() => setShowSaved(false), 2000);
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save availability. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const totalHours = Object.values(availability).reduce(
    (sum, day) => sum + (day.enabled ? day.slots.length : 0),
    0
  );

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="rounded-2xl border border-border/30 bg-card shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-border/30 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">Availability</h2>
              {isLoading && (
                <span className="animate-pulse text-xs text-muted-foreground">
                  Loading...
                </span>
              )}
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground/60" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs rounded-xl border-border/30">
                  Set your weekly availability for patient appointments. Patients can only book during your available time slots.
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {totalHours} hours available this week
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToSaved}
              disabled={!hasChanges || isSaving}
              className="h-9 gap-2 rounded-xl border-border/30"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="h-9 gap-2 rounded-xl bg-linear-to-r from-primary to-accent px-4 text-white shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                  />
                  Saving...
                </>
              ) : showSaved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        <div
          className={cn(
            "grid grid-cols-1 lg:grid-cols-3 gap-0 transition-opacity duration-300",
            isLoading && "pointer-events-none opacity-50"
          )}
        >
          {/* Days List */}
          <div className="p-6 border-b lg:border-b-0 lg:border-r border-border/20">
            <h3 className="text-sm font-semibold mb-4">Weekly Schedule</h3>
            <div className="space-y-2">
              {daysOfWeek.map((day) => (
                <div
                  key={day.key}
                  onClick={() => setSelectedDay(day.key)}
                  className={cn(
                    "flex items-center justify-between rounded-xl p-3 cursor-pointer transition-all duration-200",
                    selectedDay === day.key
                      ? "bg-linear-to-r from-primary/10 to-accent/10 border border-primary/20"
                      : "hover:bg-secondary/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={availability[day.key].enabled}
                      onCheckedChange={() => toggleDayEnabled(day.key)}
                      onClick={(e) => e.stopPropagation()}
                      className="data-[state=checked]:bg-primary"
                    />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        !availability[day.key].enabled && "text-muted-foreground"
                      )}
                    >
                      {day.label}
                    </span>
                  </div>
                  <Badge
                    className={cn(
                      "h-5 rounded-md px-2 text-[10px] font-medium",
                      availability[day.key].enabled
                        ? "bg-primary/10 text-primary"
                        : "bg-muted/50 text-muted-foreground"
                    )}
                  >
                    {availability[day.key].enabled
                      ? `${availability[day.key].slots.length} slots`
                      : "Off"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">
                {daysOfWeek.find((d) => d.key === selectedDay)?.label} Time Slots
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {availability[selectedDay].slots.length} selected
              </div>
            </div>

            {availability[selectedDay].enabled ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map((slot) => {
                  const isSelected = availability[selectedDay].slots.includes(slot);
                  return (
                    <button
                      key={slot}
                      onClick={() => toggleSlot(selectedDay, slot)}
                      className={cn(
                        "flex items-center justify-center rounded-xl py-3 text-sm font-medium transition-all duration-200",
                        isSelected
                          ? "bg-linear-to-br from-primary to-accent text-white shadow-lg shadow-primary/20"
                          : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      )}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/50 mb-4">
                  <Clock className="h-7 w-7 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Day Off
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Enable this day to set available time slots
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleDayEnabled(selectedDay)}
                  className="mt-4 h-8 gap-2 rounded-lg border-border/30 text-xs"
                >
                  Enable {daysOfWeek.find((d) => d.key === selectedDay)?.label}
                </Button>
              </div>
            )}

            {availability[selectedDay].enabled && (
              <div className="mt-6 rounded-xl bg-secondary/20 p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Consultation Duration</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Each time slot represents a 1-hour window. Actual appointment durations vary based on consultation type (20-45 min).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
