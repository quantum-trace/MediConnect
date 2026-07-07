import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DoctorHeader } from "@/components/doctor/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Phone, Mail, MapPin, Activity, User, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date-utils";

export default async function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch user, their patient profile, and recent appointments
  const patient = await prisma.user.findUnique({
    where: { id },
    include: {
      patientProfile: true,
      appointments: {
        orderBy: { date: "desc" },
        take: 5,
        include: {
          prescription: true,
          doctor: true,
        },
      },
    },
  });

  if (!patient) return notFound();

  return (
    <div className="min-h-screen bg-secondary/5">
      <DoctorHeader />
      
      <main className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 rounded-3xl border border-border/30 bg-card p-5 sm:p-8 shadow-sm">
          <Avatar className="h-16 w-16 sm:h-24 sm:w-24 border-4 border-primary/10 shadow-xl">
            <AvatarImage src={patient.imageUrl ?? undefined} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-2xl sm:text-3xl font-bold">
              {patient.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate pr-24 sm:pr-0">
              {patient.name}
            </h1>
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 min-w-0">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{patient.email}</span>
              </span>
              {patient.patientProfile?.phone && (
                <span className="flex items-center gap-1.5 shrink-0">
                  <Phone className="h-4 w-4 shrink-0" />
                  {patient.patientProfile.phone}
                </span>
              )}
            </div>
          </div>
          
          <Badge className="absolute top-5 right-5 sm:static h-7 sm:h-8 rounded-full bg-emerald-500/10 px-3 sm:px-4 text-[10px] sm:text-xs font-semibold text-emerald-500 hover:bg-emerald-500/20 shrink-0">
            Active
          </Badge>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Medical Details */}
          <div className="md:col-span-1 space-y-8">
            <Card className="rounded-2xl border-border/30 shadow-sm overflow-hidden">
              <CardHeader className="bg-secondary/20 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Age</p>
                    <p className="font-medium text-foreground">{patient.patientProfile?.age || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Gender</p>
                    <p className="font-medium text-foreground capitalize">{patient.patientProfile?.gender?.toLowerCase() || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Blood Type</p>
                    <p className="font-medium text-destructive">{patient.patientProfile?.bloodType || "N/A"}</p>
                  </div>
                </div>

                {patient.patientProfile?.address && (
                  <div className="pt-4 border-t border-border/30">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                      <MapPin className="h-3 w-3" /> Address
                    </p>
                    <p className="text-sm font-medium leading-relaxed">{patient.patientProfile.address}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Appointment History */}
          <div className="md:col-span-2">
            <Card className="rounded-2xl border-border/30 shadow-sm overflow-hidden h-full">
              <CardHeader className="bg-secondary/20 pb-4 border-b border-border/30">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Recent Medical History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {patient.appointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                    <Heart className="h-12 w-12 opacity-20 mb-4" />
                    <p>No appointment history found.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/20">
                    {patient.appointments.map((apt) => (
                      <div key={apt.id} className="p-6 flex items-start gap-4 transition-colors hover:bg-secondary/10">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold truncate">Dr. {apt.doctor?.name || "Doctor"}</h3>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDate(apt.date)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {apt.consultationType} Consultation • {apt.timeSlot}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge className="text-[10px] uppercase font-semibold">
                              {apt.status}
                            </Badge>
                            {apt.prescription && (
                              <Badge className="bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 text-[10px] uppercase font-semibold">
                                Prescription Added
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
