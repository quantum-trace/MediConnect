"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  Home,
  Search,
  Loader2,
  AlertCircle,
  UserRound,
  Building2,
  Briefcase,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CONSULTATION_TYPE, MEDICAL_SPECIALTIES, type ConsultationType } from "@/lib/constants";
import { useBooking } from "@/lib/hooks/use-booking";
import { DoctorProfile } from "@/components/booking/doctor-profile";
import { CalendarPicker } from "@/components/booking/calendar-picker";
import { TimeSlotPicker } from "@/components/booking/time-slots";
import { ReviewsSection } from "@/components/booking/reviews-section";
import { BookingConfirmation } from "@/components/booking/booking-confirmation";
import type { BookingDoctor } from "@/lib/types/booking";

interface BookingContentProps {
  doctorId: string | null;
}

// ── Doctor Discovery ──────────────────────────────────────────────────────────

interface DoctorCardProps {
  doctor: BookingDoctor;
  onSelect: (id: string) => void;
}

function getSpecialtyLabel(value: string): string {
  return MEDICAL_SPECIALTIES.find((s) => s.value === value)?.label ?? value;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function DoctorCard({ doctor, onSelect }: DoctorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/2 backdrop-blur-xl transition-shadow hover:shadow-lg hover:shadow-primary/10"
    >
      {/* Doctor avatar */}
      <div className="relative h-40 bg-linear-to-br from-primary/10 to-cyan-500/10">
        {doctor.imageUrl ? (
          <Image
            src={doctor.imageUrl}
            alt={doctor.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-primary/30">
            {getInitials(doctor.name)}
          </div>
        )}
      </div>

      {/* Doctor info */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 flex items-center gap-2">
          <h3 className="font-semibold text-foreground">{doctor.name}</h3>
          {doctor.isApproved && (
            <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-400" />
          )}
        </div>

        <p className="mb-3 text-sm text-primary">{getSpecialtyLabel(doctor.specialty)}</p>

        <div className="mb-3 space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{doctor.hospital}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-3.5 w-3.5 shrink-0" />
            <span>{doctor.experience}+ years experience</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">
            ₹{doctor.consultationFee}
            <span className="ml-0.5 text-xs font-normal text-muted-foreground">/visit</span>
          </span>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(doctor.id)}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors"
          >
            Book Now
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function DoctorDiscovery({ onSelectDoctor }: { onSelectDoctor: (id: string) => void }) {
  const [doctors, setDoctors] = useState<BookingDoctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");

  useEffect(() => {
    Promise.resolve().then(() => {
      setIsLoading(true);
      fetch("/api/doctor?forBooking=true")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load doctors");
          return res.json() as Promise<BookingDoctor[]>;
        })
        .then((data) => setDoctors(data))
        .catch(() => toast.error("Failed to load doctors"))
        .finally(() => setIsLoading(false));
    });
  }, []);

  const filteredDoctors = doctors.filter((d) => {
    const matchesSearch =
      !searchQuery ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.hospital.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty =
      selectedSpecialty === "All" || d.specialty === selectedSpecialty;

    return matchesSearch && matchesSpecialty;
  });

  const specialtyOptions = [
    { value: "All", label: "All Specialties" },
    ...MEDICAL_SPECIALTIES.filter((s) => s.value !== "All"),
  ];

  return (
    <div className="space-y-6">
      {/* Search + filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctors or hospitals..."
            className="w-full rounded-xl border border-border/50 bg-secondary/30 py-2.5 pl-11 pr-4 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          />
        </div>
        <select
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          className="rounded-xl border border-border/50 bg-secondary/30 px-4 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20 sm:w-[200px]"
        >
          {specialtyOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Doctor grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 py-12">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <UserRound className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">
            {doctors.length === 0
              ? "No doctors are currently available for booking."
              : "No doctors match your search criteria."}
          </p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5"
        >
          {filteredDoctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} onSelect={onSelectDoctor} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ── Booking Form ──────────────────────────────────────────────────────────────

function BookingForm({ doctorId }: { doctorId: string }) {
  const { doctor, bookedSlots, isLoading, isLoadingSlots, error, refreshBookedSlots } =
    useBooking(doctorId);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ConsultationType>(CONSULTATION_TYPE.VIDEO);

  const handleDateSelect = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      setSelectedSlot(null);
      refreshBookedSlots(date);
    },
    [refreshBookedSlots]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-lg font-medium text-foreground">
          {error ?? "Doctor not found"}
        </p>
        <p className="text-sm text-muted-foreground">
          This doctor may not be available for booking.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          <DoctorProfile doctor={doctor} />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <CalendarPicker
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
              availability={doctor.availability}
            />
            <TimeSlotPicker
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              selectedType={selectedType}
              availability={doctor.availability}
              bookedSlots={bookedSlots}
              isLoadingSlots={isLoadingSlots}
              onSelectSlot={setSelectedSlot}
              onSelectType={setSelectedType}
            />
          </div>

          <ReviewsSection doctorId={doctor.id} doctorName={doctor.name} />
        </div>

        {/* Right column — confirmation */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <BookingConfirmation
              doctor={doctor}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              selectedType={selectedType}
            />
          </div>
        </div>
      </div>

    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function BookingContent({ doctorId }: BookingContentProps) {
  const router = useRouter();
  const [activeDoctorId, setActiveDoctorId] = useState<string | null>(doctorId);
  const isBookingMode = !!activeDoctorId;

  const handleSelectDoctor = (id: string) => {
    router.push(`/booking?doctorId=${id}`, { scroll: false });
    setActiveDoctorId(id);
  };

  const handleBack = () => {
    router.push("/booking", { scroll: false });
    setActiveDoctorId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-1/4 top-0 h-150 w-150 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-1/4 left-0 h-100 w-100 rounded-full bg-accent/10 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isBookingMode ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              ) : (
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {isBookingMode ? "Book Appointment" : "Find a Doctor"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isBookingMode
                    ? "Schedule your consultation"
                    : "Choose from our verified specialists"}
                </p>
              </div>
            </div>

            <nav className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
              <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
                <Home className="h-4 w-4" />
                Home
              </Link>
              <span>/</span>
              <Link href="/dashboard" className="hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              {isBookingMode ? (
                <>
                  <button
                    onClick={handleBack}
                    className="hover:text-foreground transition-colors"
                  >
                    Booking
                  </button>
                  <span>/</span>
                  <span className="text-foreground">Doctor</span>
                </>
              ) : (
                <span className="text-foreground">Booking</span>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isBookingMode ? (
          <BookingForm doctorId={activeDoctorId} />
        ) : (
          <DoctorDiscovery onSelectDoctor={handleSelectDoctor} />
        )}
      </main>
    </div>
  );
}
