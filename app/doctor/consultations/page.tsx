"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Calendar, Clock, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DoctorHeader } from "@/components/doctor/header";
import { JoinCallButton } from "@/components/video/join-call-button";
import { APPOINTMENT_STATUS, CONSULTATION_TYPE } from "@/lib/constants";
import { toast } from "sonner";
import { formatDate } from "@/lib/date-utils";

export default function ConsultationsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [appointments, setAppointments] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    fetch("/api/doctor/appointments")
      .then((r) => r.json())
      .then((d) =>
        setAppointments(
          (Array.isArray(d) ? d : []).filter(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (a: any) =>
              a.consultationType === CONSULTATION_TYPE.VIDEO &&
              (a.status === APPOINTMENT_STATUS.CONFIRMED || a.status === APPOINTMENT_STATUS.COMPLETED)
          )
        )
      )
      .catch(() => toast.error("Failed to load consultations."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <DoctorHeader />
      <main className="p-6 lg:p-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Video Consultations</h1>
            <p className="mt-1 text-muted-foreground">
              {loading ? "Loading..." : `${appointments.length} video consultations`}
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-9 rounded-xl bg-secondary/30 p-1">
              <TabsTrigger value="upcoming" className="rounded-lg px-3 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="completed" className="rounded-lg px-3 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
                Completed
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/30 bg-card shadow-sm overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Video className="h-8 w-8 text-primary/60" />
              </div>
              <p className="font-medium text-muted-foreground">No video consultations yet</p>
              <p className="text-sm text-muted-foreground/70">
                Confirmed video appointments will appear here.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="divide-y divide-border/20">
                {appointments
                  .filter((a) => 
                    activeTab === "upcoming" 
                      ? a.status === APPOINTMENT_STATUS.CONFIRMED 
                      : a.status === APPOINTMENT_STATUS.COMPLETED
                  )
                  .length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No {activeTab} video consultations
                  </div>
                ) : (
                appointments
                  .filter((a) => 
                    activeTab === "upcoming" 
                      ? a.status === APPOINTMENT_STATUS.CONFIRMED 
                      : a.status === APPOINTMENT_STATUS.COMPLETED
                  )
                  .map((appt, i) => (
                  <motion.div
                    key={appt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-secondary/20"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-11 w-11 border border-border/30">
                        <AvatarImage src={appt.patient?.imageUrl} alt={appt.patient?.name} />
                        <AvatarFallback className="bg-linear-to-br from-primary/20 to-accent/20 text-sm font-semibold">
                          {appt.patient?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{appt.patient?.name}</p>
                          <Badge
                            className={
                              appt.status === APPOINTMENT_STATUS.CONFIRMED
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-muted/50 text-muted-foreground"
                            }
                          >
                            {appt.status === APPOINTMENT_STATUS.CONFIRMED ? "Live" : "Completed"}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(appt.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {appt.timeSlot}
                          </span>
                        </div>
                      </div>
                    </div>

                    {appt.status === APPOINTMENT_STATUS.CONFIRMED ? (
                      <JoinCallButton
                        appointmentId={appt.id}
                        status={appt.status}
                        consultationType={CONSULTATION_TYPE.VIDEO}
                        variant="default"
                        size="sm"
                        label="Join Now"
                        className="gap-2 rounded-xl bg-linear-to-r from-primary to-accent text-white"
                      />
                    ) : (
                      <Badge className="bg-muted/50 text-muted-foreground">Ended</Badge>
                    )}
                  </motion.div>
                )))}
              </div>
            </AnimatePresence>
          )}
        </motion.div>
      </main>
    </div>
  );
}
