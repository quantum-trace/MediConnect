"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { APPOINTMENT_STATUS } from "@/lib/constants";
import { RescheduleDialog, type RescheduleAppointment } from "@/components/dashboard/reschedule-dialog";
import { JoinCallButton } from "@/components/video/join-call-button";
import Link from "next/link";

const STATUS_STYLES = {
  PENDING:   "bg-amber-500/10 text-amber-500 border-amber-500/20",
  CONFIRMED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
  COMPLETED: "bg-primary/10 text-primary border-primary/20",
};

export default function AppointmentsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [rescheduling, setRescheduling] = useState<RescheduleAppointment | null>(null);

  useEffect(() => {
    fetch("/api/appointments/user")
      .then((r) => r.json())
      .then((d) => setAppointments(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Failed to load appointments."))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = useCallback(async (id: string) => {
    setCancellingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: APPOINTMENT_STATUS.CANCELLED }),
      });
      if (!res.ok) throw new Error();
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: APPOINTMENT_STATUS.CANCELLED } : a))
      );
      toast.success("Appointment cancelled.");
    } catch {
      toast.error("Failed to cancel appointment.");
    } finally {
      setCancellingId(null);
    }
  }, []);

  const filtered = appointments.filter((a) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "upcoming" && a.status === APPOINTMENT_STATUS.CONFIRMED) ||
      (activeTab === "pending" && a.status === APPOINTMENT_STATUS.PENDING) ||
      (activeTab === "completed" && a.status === APPOINTMENT_STATUS.COMPLETED) ||
      (activeTab === "cancelled" && a.status === APPOINTMENT_STATUS.CANCELLED);

    const matchesSearch =
      !search ||
      a.doctor?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor?.specialty?.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">My Appointments</h1>
        <p className="text-muted-foreground">
          Manage and track all your medical appointments.
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-9 rounded-xl bg-secondary/30 p-1">
            {[
              { value: "all",       label: "All" },
              { value: "upcoming",  label: "Upcoming" },
              { value: "pending",   label: "Pending" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
            ].map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="rounded-lg px-3 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search doctor or specialty..."
            className="h-9 rounded-xl border-border/50 bg-secondary/30 pl-9 text-sm"
          />
        </div>
      </div>

      {/* Appointment Cards */}
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="divide-y divide-border/50">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-5">
                  <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Calendar className="h-8 w-8 text-primary/60" />
              </div>
              <p className="font-medium text-muted-foreground">No appointments found</p>
              <p className="text-sm text-muted-foreground/70">
                {activeTab === "all"
                  ? "Book your first appointment below."
                  : `No ${activeTab} appointments to show.`}
              </p>
              {activeTab === "all" && (
                <Link href="/booking">
                  <Button className="mt-2 rounded-xl bg-linear-to-r from-primary to-accent text-white">
                    Book Appointment
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            filtered.map((appt, i) => (
              <motion.div
                key={appt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="group relative flex flex-col gap-4 p-5 transition-colors hover:bg-secondary/30"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Avatar + Info */}
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="relative shrink-0 mt-0.5">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarImage src={appt.doctor?.imageUrl} alt={appt.doctor?.name} />
                        <AvatarFallback className="bg-linear-to-br from-primary to-accent text-white">
                          {appt.doctor?.name?.split(" ").map((w: string) => w[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <Video className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="font-medium truncate text-base min-w-0">{appt.doctor?.name}</p>
                        <Badge
                          className={cn(
                            "h-5 px-1.5 text-[10px] font-medium capitalize sm:hidden shrink-0",
                            STATUS_STYLES[appt.status as keyof typeof STATUS_STYLES]
                          )}
                        >
                          {appt.status.toLowerCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{appt.doctor?.specialty}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{appt.doctor?.hospital}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm mt-1 flex-wrap sm:flex-nowrap">
                        <span className="flex items-center gap-1 text-primary shrink-0">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", weekday: "short", month: "short", day: "numeric" }).format(new Date(appt.date))}
                        </span>
                        <span className="flex items-center gap-1 text-cyan-400 shrink-0">
                          <Clock className="h-3.5 w-3.5" />
                          {appt.timeSlot}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions (Desktop) + Menu */}
                  <div className="flex items-center gap-3 shrink-0 mt-0.5">
                    <div className="hidden sm:flex items-center gap-3">
                      <Badge
                        className={cn(
                          "border capitalize font-medium",
                          STATUS_STYLES[appt.status as keyof typeof STATUS_STYLES]
                        )}
                      >
                        {appt.status.toLowerCase()}
                      </Badge>

                      {appt.status === APPOINTMENT_STATUS.CONFIRMED && (
                        <JoinCallButton
                          appointmentId={appt.id}
                          status={appt.status}
                          consultationType={appt.consultationType ?? "VIDEO"}
                          variant="outline"
                          size="sm"
                        />
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-border/50 bg-card/95 backdrop-blur-xl">
                      {appt.status !== APPOINTMENT_STATUS.CANCELLED &&
                        appt.status !== APPOINTMENT_STATUS.COMPLETED && (
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => setRescheduling(appt)}
                          >
                            Reschedule
                          </DropdownMenuItem>
                        )}
                      {appt.status !== APPOINTMENT_STATUS.CANCELLED &&
                        appt.status !== APPOINTMENT_STATUS.COMPLETED && (
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:text-destructive"
                            disabled={cancellingId === appt.id}
                            onClick={() => handleCancel(appt.id)}
                          >
                            {cancellingId === appt.id ? "Cancelling…" : "Cancel"}
                          </DropdownMenuItem>
                        )}
                      {appt.prescription && (
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() =>
                            window.open(`/prescriptions/${appt.prescription.id}/print`, "_blank")
                          }
                        >
                          View Prescription
                        </DropdownMenuItem>
                      )}
                      {appt.status === APPOINTMENT_STATUS.CANCELLED && (
                        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                          No actions available
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* BOTTOM: Join Call (Mobile) */}
                {appt.status === APPOINTMENT_STATUS.CONFIRMED && (
                  <div className="w-full border-t border-border/20 pt-3 sm:hidden">
                    <JoinCallButton
                      appointmentId={appt.id}
                      status={appt.status}
                      consultationType={appt.consultationType ?? "VIDEO"}
                      variant="outline"
                      size="sm"
                      className="w-full bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                    />
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="border-t border-border/50 p-4">
            <Link href="/booking">
              <Button className="w-full gap-2 rounded-xl bg-linear-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 hover:shadow-primary/40">
                <Calendar className="h-4 w-4" />
                Book New Appointment
              </Button>
            </Link>
          </div>
        )}
      </div>

      <RescheduleDialog
        appointment={rescheduling}
        onClose={() => setRescheduling(null)}
        onSuccess={(updated) => {
          setAppointments((prev) =>
            prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a))
          );
          setRescheduling(null);
          toast.success("Appointment rescheduled.");
        }}
      />
    </div>
  );
}
