import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowLeft, Video, Clock, User } from "lucide-react";
import { appointmentService } from "@/lib/services/appointment.service";
import { VideoRoom } from "@/components/video/video-room";

interface PageProps {
  params: Promise<{ appointmentId: string }>;
}

export default async function VideoConsultationPage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { appointmentId } = await params;
  const appointment = await appointmentService.findByIdForVideo(appointmentId);

  if (!appointment) {
    return <VideoError message="Appointment not found." backHref="/dashboard" />;
  }

  const isPatient = appointment.patient.clerkId === userId;
  const isDoctor = appointment.doctor.clerkId === userId;

  if (!isPatient && !isDoctor) {
    return <VideoError message="You are not authorised to join this consultation." backHref="/dashboard" />;
  }

  if (appointment.status === "CANCELLED") {
    return (
      <VideoError
        message="This appointment has been cancelled."
        backHref={isDoctor ? "/doctor" : "/dashboard"}
      />
    );
  }

  if (appointment.status === "PENDING") {
    return (
      <VideoError
        message="This appointment is still pending approval."
        backHref={isDoctor ? "/doctor" : "/dashboard"}
      />
    );
  }

  if (appointment.consultationType !== "VIDEO") {
    return (
      <VideoError
        message="This is an in-person appointment — no video room."
        backHref={isDoctor ? "/doctor" : "/dashboard"}
      />
    );
  }

  const role = isDoctor ? "DOCTOR" : "PATIENT";
  const backHref = isDoctor ? "/doctor" : "/dashboard";
  const otherParty = isDoctor ? appointment.patient.name : appointment.doctor.name;
  const otherPartyLabel = isDoctor ? "Patient" : "Doctor";

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0f]">
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-white/[0.06] bg-black/40 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="flex h-8 items-center gap-2 rounded-lg bg-primary/10 px-3 ring-1 ring-primary/20">
            <Video className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">MediConnect</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="hidden items-center gap-1.5 sm:flex">
            <User className="h-3.5 w-3.5" />
            <span>
              {otherPartyLabel}: <span className="font-medium text-foreground">{otherParty}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{appointment.timeSlot}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 animate-pulse rounded-full ${
                appointment.status === "CONFIRMED" ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <span className="capitalize">{appointment.status.toLowerCase()}</span>
          </div>
        </div>
      </header>

      {/* Video area */}
      <main className="flex min-h-0 flex-1">
        <VideoRoom
          appointmentId={appointmentId}
          doctorName={appointment.doctor.name}
          patientName={appointment.patient.name}
          role={role}
          timeSlot={appointment.timeSlot}
        />
      </main>
    </div>
  );
}

function VideoError({ message, backHref }: { message: string; backHref: string }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-[#0a0a0f] p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 ring-1 ring-destructive/20">
        <Video className="h-7 w-7 text-destructive" />
      </div>
      <div>
        <p className="text-lg font-semibold text-foreground">Cannot join video call</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      </div>
      <Link
        href={backHref}
        className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/50 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
      >
        <ArrowLeft className="h-4 w-4" />
        Go back to dashboard
      </Link>
    </div>
  );
}
