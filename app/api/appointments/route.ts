import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { appointmentService } from "@/lib/services/appointment.service";
import { userService } from "@/lib/services/user.service";
import { notificationService } from "@/lib/services/notification.service";
import { CONSULTATION_TYPE, ConsultationType } from "@/lib/constants";
import { formatDate, isDateInPastIST, isSlotPastIST, getDateComponentsIST } from "@/lib/date-utils";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { doctorId, date, timeSlot, consultationType } = body;

    if (!doctorId || !date || !timeSlot) {
      return NextResponse.json(
        { error: "Missing booking information" },
        { status: 400 }
      );
    }

    const validConsultationType: ConsultationType =
      consultationType === CONSULTATION_TYPE.IN_PERSON
        ? CONSULTATION_TYPE.IN_PERSON
        : CONSULTATION_TYPE.VIDEO;

    // Parse date in IST to avoid UTC-vs-IST day-shift bugs
    const { year: bYear, month: bMonth, day: bDay } = getDateComponentsIST(new Date(date));

    if (isDateInPastIST(bYear, bMonth, bDay)) {
      return NextResponse.json(
        { error: "Cannot book appointments in the past" },
        { status: 400 }
      );
    }

    if (isSlotPastIST(bYear, bMonth, bDay, timeSlot)) {
      return NextResponse.json(
        { error: "This time slot has already passed. Please select a future time." },
        { status: 400 }
      );
    }

    // Use local-midnight constructor so weekday is derived from the IST calendar date
    const bookingDate = new Date(bYear, bMonth - 1, bDay);

    const { availabilityService } = await import("@/lib/services/availability.service");
    const doctorAvailability = await availabilityService.findByDoctor(doctorId);

    if (!doctorAvailability) {
      return NextResponse.json(
        { error: "Doctor has no availability configured" },
        { status: 400 }
      );
    }

    const JS_DAY_TO_DAY_KEY: Record<number, string> = {
      0: "sun", 1: "mon", 2: "tue", 3: "wed", 4: "thu", 5: "fri", 6: "sat",
    };
    const dayKey = JS_DAY_TO_DAY_KEY[bookingDate.getDay()];
    const daySchedule = doctorAvailability[dayKey as keyof typeof doctorAvailability];

    if (!daySchedule?.enabled) {
      return NextResponse.json(
        { error: "Doctor is not available on this day" },
        { status: 400 }
      );
    }

    if (!daySchedule.slots.includes(timeSlot)) {
      return NextResponse.json(
        { error: "Invalid time slot for this day" },
        { status: 400 }
      );
    }

    const user = await userService.upsertBasic({
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      name: clerkUser.fullName || "Unknown User",
      imageUrl: clerkUser.imageUrl,
    });

    const hasConflict = await appointmentService.hasConflict(
      doctorId,
      bookingDate,
      timeSlot
    );
    if (hasConflict) {
      return NextResponse.json(
        { error: "This slot is already booked" },
        { status: 409 }
      );
    }

    const appointment = await appointmentService.create({
      patientId: user.id,
      doctorId,
      date: bookingDate,
      timeSlot,
      consultationType: validConsultationType,
    });

    // Notify doctor and patient — non-blocking, errors don't affect the response
    try {
      const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
      if (doctor?.clerkId) {
        const doctorUser = await userService.findByClerkId(doctor.clerkId);
        if (doctorUser) {
          await notificationService.createNotification({
            userId: user.id,
            type: "APPOINTMENT_BOOKED",
            title: "Appointment Requested",
            message: `Your appointment request with Dr. ${doctor.name} for ${formatDate(date)} at ${timeSlot} has been sent.`,
            appointmentId: appointment.id,
            link: "/dashboard/appointments"
          });

          await notificationService.createNotification({
            userId: doctorUser.id,
            type: "APPOINTMENT_BOOKED",
            title: "New Appointment Request",
            message: `${user.name} has requested an appointment on ${formatDate(date)} at ${timeSlot}.`,
            appointmentId: appointment.id,
            link: "/doctor/appointments"
          });
        }
      }
    } catch (notifErr) {
      console.error("NOTIFICATION ERROR (booking):", notifErr);
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("APPOINTMENT ERROR:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
