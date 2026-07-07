"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {  } from "@/lib/constants";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";

interface RescheduleModalProps {
  appointmentId: string;
  onClose: () => void;
  onSuccess: (id: string, date: string, timeSlot: string) => void;
}

export function RescheduleModal({ appointmentId, onClose, onSuccess }: RescheduleModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeSlot, setTimeSlot] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [availability, setAvailability] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchAvailability() {
      try {
        const res = await fetch("/api/doctor/availability");
        if (res.ok) {
          const data = await res.json();
          setAvailability(data);
        }
      } catch (error) {
        console.error("Failed to fetch availability", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAvailability();
  }, []);

  const handleReschedule = async () => {
    if (!date || !timeSlot) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: date.toISOString(), timeSlot }),
      });
      if (!res.ok) throw new Error("Failed to reschedule");
      toast.success("Appointment successfully rescheduled");
      onSuccess(appointmentId, date.toISOString(), timeSlot);
    } catch {
      toast.error("Failed to reschedule appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const getAvailableSlots = () => {
    if (!date || !availability) return [];
    // Convert JS getDay() (0=Sun, 1=Mon) to our DAY_KEYS
    const jsDay = date.getDay();
    const dayKeyMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const dayKey = dayKeyMap[jsDay];
    
    const daySchedule = availability[dayKey];
    if (!daySchedule || !daySchedule.enabled) return [];
    return daySchedule.slots || [];
  };

  const availableSlots = getAvailableSlots();

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl overflow-hidden border-border/30 shadow-2xl p-0">
        <div className="bg-primary/5 p-6 border-b border-border/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Reschedule Appointment
            </DialogTitle>
            <DialogDescription>
              Select a new date and time from your available schedule.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Loading availability...</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" /> Pick a Date
                </h4>
                <div className="border border-border/30 rounded-xl p-1 bg-card inline-block">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => { setDate(d); setTimeSlot(""); }}
                    disabled={(d) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return d < today;
                    }}
                    className="p-2"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" /> Available Slots
                </h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {availableSlots.length === 0 ? (
                    <div className="p-4 rounded-xl bg-secondary/30 text-center text-sm text-muted-foreground">
                      No availability on this date.
                    </div>
                  ) : (
                    availableSlots.map((slot: string) => (
                      <Button
                        key={slot}
                        variant={timeSlot === slot ? "default" : "outline"}
                        className={`w-full justify-start rounded-xl ${
                          timeSlot === slot ? "shadow-md" : "hover:border-primary/30"
                        }`}
                        onClick={() => setTimeSlot(slot)}
                      >
                        {slot}
                      </Button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 pt-0 flex justify-end gap-3">
          <Button variant="ghost" className="rounded-xl" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            className="rounded-xl bg-primary shadow-lg shadow-primary/20" 
            onClick={handleReschedule} 
            disabled={!date || !timeSlot || submitting}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Confirm Reschedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
