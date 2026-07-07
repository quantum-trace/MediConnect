"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  FileText,
  ChevronRight,
  ChevronLeft,
  Activity,
  Heart,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Patients will be fetched dynamically from API


export function PatientList() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    async function fetchPatients() {
      try {
        const res = await fetch("/api/doctor/patients");
        if (res.ok) {
          const data = await res.json();
          // Transform the API data into the shape expected by the UI
          const transformed = data.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (p: any) => {
            const age = p.profile?.age || "N/A";
            const gender = p.profile?.gender || "Unknown";
            const phone = p.profile?.phone || "+1 (555) 000-0000";
            const condition = "General Checkup";
            
            // Format dates
            let lastVisit = "First time";
            if (p.lastVisit) {
              const diffDays = Math.floor((new Date().getTime() - new Date(p.lastVisit).getTime()) / (1000 * 3600 * 24));
              lastVisit = diffDays === 0 ? "Today" : diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
            }
            
            let nextAppt = null;
            if (p.nextAppointment) {
              const nd = new Date(p.nextAppointment);
              const dateStr = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", month: "short", day: "numeric", year: "numeric" }).format(nd);
              const timeStr = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true }).format(nd);
              nextAppt = `${dateStr}, ${timeStr}`;
            }

            return {
              id: p.id,
              name: p.name,
              avatar: p.imageUrl || "",
              age,
              gender,
              condition,
              lastVisit,
              nextAppointment: nextAppt,
              phone,
              email: p.email
            };
          });
          setPatients(transformed);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset pagination on search
  useEffect(() => {
    Promise.resolve().then(() => setCurrentPage(1));
  }, [searchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-2xl border border-border/30 bg-card shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border/30 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="shrink-0">
          <h2 className="text-xl font-bold whitespace-nowrap">My Patients</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? "Loading..." : `${patients.length} active patients`}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <div className="relative flex-1 sm:w-64 min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-xl w-full border-border/30 bg-secondary/20 pl-10 text-sm placeholder:text-muted-foreground/50 focus:border-primary/40"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl border-border/30"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Patient List */}
      <div className="flex flex-col divide-y divide-border/20">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <Activity className="h-8 w-8 animate-pulse text-muted-foreground/50 mb-2" />
            <p className="text-sm">Loading patients...</p>
          </div>
        ) : paginatedPatients.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No patients found</div>
        ) : (
          paginatedPatients.map((patient, index) => (
          <motion.div
            key={patient.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group relative p-5 transition-colors hover:bg-secondary/20"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-14 w-14 border-2 border-border/30">
                  <AvatarImage src={patient.avatar} alt={patient.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-base font-semibold">
                    {patient.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold truncate">{patient.name}</h3>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground flex items-center gap-2">
                  <Heart className="h-3.5 w-3.5 text-primary/60" />
                  {patient.condition}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground/70">
                  <span>
                    {patient.age}y, {patient.gender}
                  </span>
                  <span className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Last: {patient.lastVisit}
                  </span>
                </div>
                {patient.nextAppointment && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span className="text-primary font-medium">
                      {patient.nextAppointment}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <a href={`tel:${patient.phone}`}>
                    <Phone className="h-3.5 w-3.5" />
                  </a>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <a href={`mailto:${patient.email}`}>
                    <Mail className="h-3.5 w-3.5" />
                  </a>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 rounded-xl border-border/30 bg-card/95 backdrop-blur-xl"
                  >
                    <DropdownMenuItem className="cursor-pointer gap-2" asChild>
                      <Link href={`/doctor/patients/${patient.id}/records`}>
                        <FileText className="h-4 w-4" />
                        View Records
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer gap-2" asChild>
                      <Link href={`/doctor/availability?patientId=${patient.id}`}>
                        <Calendar className="h-4 w-4" />
                        Schedule Appointment
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer gap-2" asChild>
                      <Link href={`/doctor/patients/${patient.id}/history`}>
                        <Activity className="h-4 w-4" />
                        Health History
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </motion.div>
          ))
        )}
      </div>

      {/* Footer / Pagination */}
      <div className="flex items-center justify-between border-t border-border/30 p-4">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          className="h-8 rounded-lg text-xs"
        >
          <ChevronLeft className="h-3 w-3 mr-1" />
          Prev
        </Button>
        <span className="text-xs text-muted-foreground font-medium">
          Page {currentPage} of {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          className="h-8 rounded-lg text-xs"
        >
          Next
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}
