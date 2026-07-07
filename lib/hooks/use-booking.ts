"use client";

import { useState, useEffect, useCallback } from "react";
import type { BookingDoctor } from "@/lib/types/booking";
import { formatISODate } from "@/lib/date-utils";

interface UseBookingResult {
  doctor: BookingDoctor | null;
  bookedSlots: string[];
  isLoading: boolean;
  isLoadingSlots: boolean;
  error: string | null;
  refreshBookedSlots: (date: Date) => Promise<void>;
}

export function useBooking(doctorId: string | null): UseBookingResult {
  const [doctor, setDoctor] = useState<BookingDoctor | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!doctorId) {
      Promise.resolve().then(() => {
        setDoctor(null);
        setError(null);
      });
      return;
    }

    Promise.resolve().then(() => {
      setIsLoading(true);
      setError(null);
      fetch(`/api/doctor/${doctorId}`)
        .then((res) => {
          if (!res.ok) {
            return res.json().then((d: { error?: string }) => {
              throw new Error(d.error ?? "Failed to load doctor");
            });
          }
          return res.json() as Promise<BookingDoctor>;
        })
        .then((data) => setDoctor(data))
        .catch((err: Error) => setError(err.message))
        .finally(() => setIsLoading(false));
    });
  }, [doctorId]);

  const refreshBookedSlots = useCallback(
    async (date: Date) => {
      if (!doctorId) return;
      setIsLoadingSlots(true);
      try {
        const res = await fetch(
          `/api/appointments/booked?doctorId=${doctorId}&date=${formatISODate(date)}`
        );
        if (res.ok) {
          const slots: string[] = await res.json();
          setBookedSlots(slots);
        }
      } catch {
        // Non-fatal: booked state won't be reflected but booking will conflict-check server-side
      } finally {
        setIsLoadingSlots(false);
      }
    },
    [doctorId]
  );

  return { doctor, bookedSlots, isLoading, isLoadingSlots, error, refreshBookedSlots };
}
