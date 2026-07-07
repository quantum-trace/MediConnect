"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";

import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  Video,
  Calendar,
  ChevronRight,
  Heart,
  BadgeCheck,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";
import { MEDICAL_SPECIALTIES } from "@/lib/constants";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export function DoctorSearch() {
  const router = useRouter();

  const [selectedSpecialty, setSelectedSpecialty] =
    useState("All");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [favorites, setFavorites] =
    useState<string[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [doctors, setDoctors] = useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const response = await fetch(
          "/api/doctor?forBooking=true"
        );

        const data =
          await response.json();

        setDoctors(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(error);
        toast.error("Failed to load doctors.");
      } finally {
        setLoading(false);
      }
    }

    fetchDoctors();
  }, []);

  const toggleFavorite = (
    id: string
  ) => {
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter(
            (fid) => fid !== id
          )
        : [...prev, id]
    );
  };



  const filteredDoctors = Array.isArray(doctors)
    ? doctors.filter((doctor) => {
        const JS_DAY_TO_DAY_KEY: Record<number, string> = {
          0: "sun", 1: "mon", 2: "tue", 3: "wed", 4: "thu", 5: "fri", 6: "sat",
        };
        const todayKey = JS_DAY_TO_DAY_KEY[new Date().getDay()];
        const isAvailableToday = doctor.availability?.some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (a: any) => a.dayKey === todayKey && a.enabled === true
        );

        if (!isAvailableToday) {
          return false;
        }

        const matchesSpecialty =
          selectedSpecialty === "All" || doctor.specialty === selectedSpecialty;
        const lowerSearch = searchQuery.toLowerCase();
        const matchesSearch =
          !searchQuery ||
          doctor.name?.toLowerCase().includes(lowerSearch) ||
          doctor.specialty?.toLowerCase().includes(lowerSearch) ||
          doctor.hospital?.toLowerCase().includes(lowerSearch);
        return matchesSpecialty && matchesSearch;
      })
    : [];

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: 0.3,
      }}
      className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border/50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
            <Search className="h-5 w-5 text-accent" />
          </div>

          <div>
            <h3 className="text-lg font-semibold">
              Find Specialists
            </h3>

            <p className="text-sm text-muted-foreground">
              Connect with verified
              healthcare professionals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <div className="relative flex-1 sm:w-64 min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search doctors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 rounded-lg border-border/50 bg-secondary/30 pl-9 text-sm w-full"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => { setSearchQuery(""); setSelectedSpecialty("All"); }}
            title="Clear filters"
            className="h-9 w-9 cursor-pointer rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto border-b border-border/50 p-4 scrollbar-none">
        {MEDICAL_SPECIALTIES.map(
          ({ value, label }) => (
            <Button
              key={value}
              variant="ghost"
              size="sm"
              onClick={() =>
                setSelectedSpecialty(value)
              }
              className={cn(
                "shrink-0 rounded-full px-4",
                selectedSpecialty === value
                  ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                  : "text-muted-foreground hover:bg-secondary/50"
              )}
            >
              {label}
            </Button>
          )
        )}
      </div>

      {/* Doctors */}
      <div className="divide-y divide-border/50">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 p-5">
                <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-8 w-32 mt-3" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-8 w-28" />
                </div>
              </div>
            ))}
          </>
        ) : filteredDoctors.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Search className="h-7 w-7 text-primary/60" />
            </div>
            <p className="font-medium text-muted-foreground">No doctors found</p>
            <p className="text-sm text-muted-foreground/70">
              Try a different specialty or check back later.
            </p>
          </div>
        ) : (
          filteredDoctors.map(
            (doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{
                  opacity: 0,
                  x: -20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay:
                    0.1 * index,
                }}
                className="group cursor-pointer p-5 transition-colors hover:bg-secondary/30"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Left */}
                  <div className="flex gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="relative shrink-0">
                      <Avatar className="h-16 w-16 border-2 border-primary/20">
                        <AvatarImage
                          src={
                            doctor.imageUrl
                          }
                          alt={
                            doctor.name
                          }
                        />

                        <AvatarFallback className="bg-linear-to-br from-primary to-accent text-lg text-white">
                          {doctor.name
                            ?.split(
                              " "
                            )
                            ?.map(
                              (
                                word: string
                              ) =>
                                word[0]
                            )
                            ?.join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                        <Video className="h-3 w-3 text-white" />
                      </div>
                    </div>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold truncate">
                          {
                            doctor.name
                          }
                        </h4>

                        <BadgeCheck className="h-4 w-4 text-cyan-400" />

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            toggleFavorite(
                              doctor.id
                            )
                          }
                        >
                          <Heart
                            className={cn(
                              "h-4 w-4",
                              favorites.includes(
                                doctor.id
                              )
                                ? "fill-rose-500 text-rose-500"
                                : "text-muted-foreground"
                            )}
                          />
                        </Button>
                      </div>

                      <p className="text-sm text-primary">
                        {
                          doctor.specialty
                        }
                      </p>

                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />

                          <span className="font-medium text-foreground">
                            4.9
                          </span>

                          <span>
                            (250+
                            reviews)
                          </span>
                        </div>

                        <span>•</span>

                        <span>
                          {
                            doctor.experience
                          }{" "}
                          Years
                        </span>
                      </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">
                            {doctor.hospital}
                          </span>
                        </div>


                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 w-full sm:w-auto shrink-0 border-t border-border/20 pt-4 sm:border-0 sm:pt-0">
                    <div className="flex flex-col sm:items-end gap-1.5">
                      <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                        <Clock className="mr-1 h-3 w-3" />
                        Available
                        Today
                      </Badge>

                      <p className="text-lg font-semibold">
                        ₹{doctor.consultationFee}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      className="gap-1.5 rounded-xl bg-linear-to-r from-primary to-accent text-white cursor-pointer hover:opacity-90 flex-1 sm:flex-none min-w-[120px] max-w-[200px]"
                      onClick={() => router.push(`/booking?doctorId=${doctor.id}`)}
                    >
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate min-w-0">Book</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          )
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 p-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/booking")}
          className="w-full cursor-pointer gap-1 text-primary hover:bg-primary/10 hover:text-primary transition-colors"
        >
          Explore All Specialists
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}