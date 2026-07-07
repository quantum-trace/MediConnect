import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { VALID_APPOINTMENT_STATUSES, APPOINTMENT_STATUS } from "@/lib/constants";
import { formatDate, isDateInPastIST, isSlotPastIST, getDateComponentsIST } from "@/lib/date-utils";
import { appointmentService } from "@/lib/services/appointment.service";
import { videoService } from "@/lib/services/video.service";
import { notificationService } from "@/lib/services/notification.service";
import { userService } from "@/lib/services/user.service";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // ── Status update (doctor action) ────────────────────────────────────────
    if ("status" in body) {
      const { status } = body;
      if (!status || !VALID_APPOINTMENT_STATUSES.includes(status)) {
        return NextResponse.json({ error: "Invalid appointment status" }, { status: 400 });
      }

      const appointment = await appointmentService.updateStatus(id, status);

      // When a VIDEO appointment is confirmed, guarantee a room exists.
      // Using ensureRoomForAppointment (idempotent) so retrying is safe.
      let videoRoomWarning: string | undefined;
      if (
        status === APPOINTMENT_STATUS.CONFIRMED &&
        appointment.consultationType === "VIDEO"
      ) {
        try {
          await videoService.ensureRoomForAppointment(appointment.id, appointment.date);
        } catch (videoErr) {
          // Room creation is non-fatal — the appointment is confirmed and the
          // room will be lazily provisioned when someone joins. We surface the
          // warning in the response so the client can show a toast.
          const msg = videoErr instanceof Error ? videoErr.message : "Unknown error";
          console.error(`[VIDEO] Room provisioning failed for appointment ${id}: ${msg}`);
          videoRoomWarning = "Appointment confirmed, but the video room could not be created right now. It will be provisioned when you join.";
        }
      }

      // Notify patient on confirmation, cancellation, or completion
      try {
        const notifiableStatuses = [
          APPOINTMENT_STATUS.CONFIRMED,
          APPOINTMENT_STATUS.CANCELLED,
          APPOINTMENT_STATUS.COMPLETED,
        ];

        if (notifiableStatuses.includes(status)) {
          const typeMap: Record<string, string> = {
            [APPOINTMENT_STATUS.CONFIRMED]: "APPOINTMENT_APPROVED",
            [APPOINTMENT_STATUS.CANCELLED]: "APPOINTMENT_CANCELLED",
            [APPOINTMENT_STATUS.COMPLETED]: "SYSTEM_ALERT",
          };
          const titleMap: Record<string, string> = {
            [APPOINTMENT_STATUS.CONFIRMED]: "Appointment Confirmed",
            [APPOINTMENT_STATUS.CANCELLED]: "Appointment Cancelled",
            [APPOINTMENT_STATUS.COMPLETED]: "Appointment Completed",
          };
          const messageMap: Record<string, string> = {
            [APPOINTMENT_STATUS.CONFIRMED]: `Your appointment with Dr. ${appointment.doctor.name} on ${formatDate(appointment.date)} at ${appointment.timeSlot} has been confirmed.`,
            [APPOINTMENT_STATUS.CANCELLED]: `Your appointment with Dr. ${appointment.doctor.name} on ${formatDate(appointment.date)} at ${appointment.timeSlot} has been cancelled.`,
            [APPOINTMENT_STATUS.COMPLETED]: `Your appointment with Dr. ${appointment.doctor.name} has been marked as completed.`,
          };

          await notificationService.createNotification({
            userId: appointment.patientId,
            type: typeMap[status] as Parameters<typeof notificationService.createNotification>[0]["type"],
            title: titleMap[status],
            message: messageMap[status],
            appointmentId: appointment.id,
            link: "/dashboard/appointments",
          });
        }
      } catch (notifErr) {
        console.error("[NOTIFICATION] Status notification failed:", notifErr);
      }

      return NextResponse.json({
        ...appointment,
        ...(videoRoomWarning ? { videoRoomWarning } : {}),
      });
    }

    // ── Reschedule (patient or doctor action) ────────────────────────────────
    if ("date" in body && "timeSlot" in body) {
      const { date, timeSlot } = body;
      if (!date || !timeSlot || typeof timeSlot !== "string") {
        return NextResponse.json({ error: "Missing date or timeSlot" }, { status: 400 });
      }

      const { year: rYear, month: rMonth, day: rDay } = getDateComponentsIST(new Date(date));

      if (isDateInPastIST(rYear, rMonth, rDay)) {
        return NextResponse.json({ error: "Cannot reschedule to a past date" }, { status: 400 });
      }

      if (isSlotPastIST(rYear, rMonth, rDay, timeSlot)) {
        return NextResponse.json({ error: "This time slot has already passed. Please select a future time." }, { status: 400 });
      }

      const appointment = await appointmentService.reschedule(
        id,
        userId,
        new Date(rYear, rMonth - 1, rDay),
        timeSlot
      );

      // Notify the doctor
      try {
        if (appointment.doctor.clerkId) {
          const doctorUser = await userService.findByClerkId(appointment.doctor.clerkId);
          if (doctorUser) {
            await notificationService.createNotification({
              userId: doctorUser.id,
              type: "APPOINTMENT_RESCHEDULED",
              title: "Appointment Rescheduled",
              message: `${appointment.patient.name} has rescheduled their appointment to ${formatDate(date)} at ${timeSlot}.`,
              appointmentId: appointment.id,
              link: "/doctor/appointments",
            });
          }
        }
      } catch (notifErr) {
        console.error("[NOTIFICATION] Reschedule notification failed:", notifErr);
      }

      return NextResponse.json(appointment);
    }

    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err?.code === "NOT_FOUND")
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    if (err?.code === "UNAUTHORIZED")
      return NextResponse.json({ error: "Not your appointment" }, { status: 403 });
    if (err?.code === "INVALID_STATUS")
      return NextResponse.json({ error: err.message }, { status: 422 });
    if (err?.code === "SLOT_CONFLICT")
      return NextResponse.json({ error: "This slot is already booked" }, { status: 409 });
    console.error("APPOINTMENT UPDATE ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
