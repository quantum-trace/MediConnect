"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Video,
  Building2,
  User,
  Mail,
  Phone,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Shield,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CONSULTATION_TYPE, type ConsultationType } from "@/lib/constants";
import { formatISODate } from "@/lib/date-utils";
import type { BookingDoctor, BookingFormData } from "@/lib/types/booking";

interface BookingConfirmationProps {
  doctor: BookingDoctor;
  selectedDate: Date | null;
  selectedSlot: string | null;
  selectedType: ConsultationType;
}

type BookingState = "idle" | "processing" | "success" | "error";

export function BookingConfirmation({
  doctor,
  selectedDate,
  selectedSlot,
  selectedType,
}: BookingConfirmationProps) {
  const { user } = useUser();
  const router = useRouter();
  const [bookingState, setBookingState] = useState<BookingState>("idle");
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    reason: "",
  });

  useEffect(() => {
    if (!user) return;
    const nameParts = (user.fullName ?? "").split(" ");
    Promise.resolve().then(() => {
      setFormData((prev) => ({
        ...prev,
        firstName: nameParts[0] ?? prev.firstName,
        lastName: nameParts.slice(1).join(" ") ?? prev.lastName,
        email: user.primaryEmailAddress?.emailAddress ?? prev.email,
      }));
    });
  }, [user]);

  const formatDate = (date: Date | null) => {
    if (!date) return "Not selected";
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isReady =
    !!selectedDate &&
    !!selectedSlot &&
    !!formData.firstName &&
    !!formData.lastName &&
    !!formData.email &&
    !!formData.phone;

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedSlot) return;

    setBookingState("processing");
    setBookingError(null);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: doctor.id,
          date: formatISODate(selectedDate),
          timeSlot: selectedSlot,
          consultationType: selectedType,
        }),
      });

      if (!res.ok) {
        const data: { error?: string } = await res.json();
        throw new Error(data.error ?? "Booking failed. Please try again.");
      }

      setBookingState("success");
    } catch (err) {
      setBookingState("error");
      setBookingError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  };

  if (bookingState === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-xl"
      >
        <div className="flex flex-col items-center p-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <CheckCircle className="h-16 w-16 text-emerald-400" />
          </motion.div>
          <h3 className="mt-4 text-xl font-bold text-foreground">
            Appointment Confirmed!
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Your appointment with {doctor.name} on {formatDate(selectedDate)} at{" "}
            {selectedSlot} has been scheduled successfully.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/dashboard")}
            className="mt-6 w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-colors"
          >
            View My Appointments
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur-xl">
      {/* Header */}
      <div className="border-b border-border bg-linear-to-r from-primary/5 via-cyan-500/5 to-primary/5 px-6 py-4">
        <h3 className="text-lg font-semibold text-foreground">
          Confirm Appointment
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Review your details and confirm your booking
        </p>
      </div>

      {/* Appointment summary */}
      <div className="border-b border-border p-6">
        <div className="space-y-3 rounded-xl border border-border bg-muted/10 p-4">
          <h4 className="text-sm font-medium text-muted-foreground">
            Appointment Summary
          </h4>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {formatDate(selectedDate)}
              </p>
              <p className="text-xs text-muted-foreground">Date</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10">
              <Clock className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {selectedSlot ?? "Not selected"}
              </p>
              <p className="text-xs text-muted-foreground">Time</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              {selectedType === CONSULTATION_TYPE.VIDEO ? (
                <Video className="h-4 w-4 text-emerald-400" />
              ) : (
                <Building2 className="h-4 w-4 text-emerald-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {selectedType === CONSULTATION_TYPE.VIDEO
                  ? "Video Consultation"
                  : "In-Person Visit"}
              </p>
              <p className="text-xs text-muted-foreground">Consultation Type</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm text-muted-foreground">
              Consultation Fee
            </span>
            <span className="text-sm font-semibold text-foreground">
              ₹{doctor.consultationFee}.00
            </span>
          </div>
        </div>
      </div>

      {/* Patient details form */}
      <div className="space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <User className="h-4 w-4 text-muted-foreground" />
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="John"
              className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground placeholder-muted-foreground/50 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <User className="h-4 w-4 text-muted-foreground" />
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Doe"
              className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground placeholder-muted-foreground/50 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <Mail className="h-4 w-4 text-muted-foreground" />
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="john@example.com"
            className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground placeholder-muted-foreground/50 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <Phone className="h-4 w-4 text-muted-foreground" />
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+1 (555) 000-0000"
            className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground placeholder-muted-foreground/50 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Reason for Visit{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (Optional)
            </span>
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            placeholder="Briefly describe your symptoms or reason for consultation..."
            rows={3}
            className="w-full resize-none rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground placeholder-muted-foreground/50 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {bookingState === "error" && bookingError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <p className="text-sm text-red-400">{bookingError}</p>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 rounded-xl bg-primary/5 px-4 py-3">
          <Shield className="h-4 w-4 text-primary/70" />
          <span className="text-xs text-muted-foreground">
            Your information is protected by HIPAA-compliant security
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleConfirmBooking}
          disabled={!isReady || bookingState === "processing"}
          className={cn(
            "relative w-full overflow-hidden rounded-xl py-4 text-sm font-semibold transition-all",
            isReady && bookingState !== "processing"
              ? "bg-linear-to-r from-primary to-cyan-500 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
              : "cursor-not-allowed bg-secondary/50 text-muted-foreground"
          )}
        >
          {bookingState === "processing" ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
              />
              Confirming Appointment...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              Confirm Appointment
            </span>
          )}
        </motion.button>
      </div>
    </div>
  );
}
