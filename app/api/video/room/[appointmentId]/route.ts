import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { appointmentService } from "@/lib/services/appointment.service";
import { videoService } from "@/lib/services/video.service";
import { APPOINTMENT_STATUS, CONSULTATION_TYPE } from "@/lib/constants";

// ── Shared auth + appointment guard ──────────────────────────────────────────

async function resolveAppointment(appointmentId: string, userId: string) {
  const appointment = await appointmentService.findByIdForVideo(appointmentId);

  if (!appointment) {
    return { error: "Appointment not found", status: 404 } as const;
  }

  const isPatient = appointment.patient.clerkId === userId;
  const isDoctor  = appointment.doctor.clerkId  === userId;

  if (!isPatient && !isDoctor) {
    return { error: "You are not authorised to access this consultation", status: 403 } as const;
  }

  if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
    return { error: "This appointment has been cancelled", status: 422 } as const;
  }
  if (appointment.status === APPOINTMENT_STATUS.PENDING) {
    return { error: "This appointment has not been approved yet", status: 422 } as const;
  }
  if (appointment.consultationType !== CONSULTATION_TYPE.VIDEO) {
    return { error: "This is not a video consultation", status: 422 } as const;
  }

  return { appointment, isPatient, isDoctor };
}

// ── GET — fetch (or lazily provision) the room URL ───────────────────────────

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { appointmentId } = await params;
    const guard = await resolveAppointment(appointmentId, userId);
    if ("error" in guard) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const { appointment } = guard;

    // Happy path — room already in DB
    if (appointment.videoRoomUrl && appointment.videoRoomName) {
      return NextResponse.json({
        roomUrl:  appointment.videoRoomUrl,
        roomName: appointment.videoRoomName,
      });
    }

    // Lazy provisioning — room was not created at confirmation time
    console.warn(
      `[VIDEO] No room URL for appointment ${appointmentId} — provisioning lazily`
    );
    try {
      const room = await videoService.ensureRoomForAppointment(
        appointment.id,
        appointment.date
      );
      return NextResponse.json({ roomUrl: room.roomUrl, roomName: room.roomName });
    } catch (provisionErr) {
      const msg = provisionErr instanceof Error ? provisionErr.message : "Unknown error";
      console.error(
        `[VIDEO] Lazy provisioning failed for appointment ${appointmentId}: ${msg}`
      );
      return NextResponse.json(
        { error: "Video room could not be provisioned. Please try again in a moment." },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("[VIDEO] GET room error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// ── POST — manual room (re-)provision by doctor or patient ───────────────────

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { appointmentId } = await params;
    const guard = await resolveAppointment(appointmentId, userId);
    if ("error" in guard) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const { appointment } = guard;

    if (appointment.status !== APPOINTMENT_STATUS.CONFIRMED) {
      return NextResponse.json(
        { error: "Only confirmed appointments can have a video room" },
        { status: 422 }
      );
    }

    // ensureRoom is idempotent — safe to call even if the room already exists
    const room = await videoService.ensureRoomForAppointment(
      appointment.id,
      appointment.date
    );
    return NextResponse.json({ roomUrl: room.roomUrl, roomName: room.roomName });
  } catch (error) {
    console.error("[VIDEO] POST room error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
