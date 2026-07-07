"use client";

import { motion } from "framer-motion";
import {
  Clock,
  BadgeCheck,
  Heart,
  Share2,
  Video,
  Building2,
  Briefcase,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MEDICAL_SPECIALTIES } from "@/lib/constants";
import type { BookingDoctor } from "@/lib/types/booking";

interface DoctorProfileProps {
  doctor: BookingDoctor;
}

function getSpecialtyLabel(specialtyValue: string): string {
  return (
    MEDICAL_SPECIALTIES.find((s) => s.value === specialtyValue)?.label ??
    specialtyValue
  );
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

export function DoctorProfile({ doctor }: DoctorProfileProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const specialtyLabel = getSpecialtyLabel(doctor.specialty);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/2 backdrop-blur-xl">
        {/* Gradient header banner */}
        <div className="relative h-32 bg-linear-to-r from-primary/20 via-cyan-500/20 to-primary/10">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

          {/* Avatar */}
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <div className="h-32 w-32 overflow-hidden rounded-2xl border-4 border-background">
                {doctor.imageUrl ? (
                  <Image
                    src={doctor.imageUrl}
                    alt={doctor.name}
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/20 to-cyan-500/20 text-4xl font-bold text-primary">
                    {getInitials(doctor.name)}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-emerald-500">
                <BadgeCheck className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFavorite(!isFavorite)}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border backdrop-blur-sm transition-all",
                isFavorite
                  ? "border-red-500/50 bg-red-500/20 text-red-400"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-foreground"
              )}
            >
              <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Share doctor profile"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground backdrop-blur-sm transition-all hover:border-white/20 hover:text-foreground"
            >
              <Share2 className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

        {/* Main content */}
        <div className="px-8 pb-8 pt-20">
          {/* Name + verification */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{doctor.name}</h1>
              {doctor.isApproved && (
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                  Verified
                </span>
              )}
            </div>
            <p className="mt-1 text-muted-foreground">{specialtyLabel}</p>
          </div>

          {/* Stats row */}
          <div className="mb-6 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4 text-primary" />
              <span className="text-sm">{doctor.experience}+ years experience</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm">{doctor.hospital}</span>
            </div>
          </div>

          {/* Availability + consultation type badges */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">
                Accepting appointments
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Video className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-xs font-medium text-muted-foreground">Video</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">In-Person</span>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/2 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Hospital</span>
              </div>
              <p className="text-sm text-muted-foreground">{doctor.hospital}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/2 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Specialty</span>
              </div>
              <p className="text-sm text-muted-foreground">{specialtyLabel}</p>
            </div>
          </div>

          {/* Consultation fee */}
          <div className="mt-6 rounded-xl border border-white/10 bg-linear-to-r from-primary/5 to-cyan-500/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Consultation Fee</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">
                ₹{doctor.consultationFee}
              </span>
              <span className="text-sm text-muted-foreground">/ visit</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
