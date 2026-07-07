import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificationService } from "@/lib/services/notification.service";
import { AppointmentStatus } from "@prisma/client";

export async function GET(req: Request) {
  // Optional: protect with a CRON_SECRET if deployed
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    // Look for appointments happening in the next ~65 minutes
    const upcomingThreshold = new Date(now.getTime() + 65 * 60 * 1000);

    // Fetch dynamic template from SystemOption (SOLID configurable DB options)
    let reminderTemplate = await prisma.systemOption.findUnique({
      where: { key: "REMINDER_TEMPLATE" }
    });

    if (!reminderTemplate) {
      // Auto-seed the configurable option if it doesn't exist
      reminderTemplate = await prisma.systemOption.create({
        data: {
          category: "NOTIFICATIONS",
          key: "REMINDER_TEMPLATE",
          value: "Reminder: You have a {{MODE}} consultation with {{PATIENT_NAME}} at {{TIME}}.",
        }
      });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        status: AppointmentStatus.CONFIRMED,
        date: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          lte: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        }
      },
      include: {
        doctor: { select: { clerkId: true, name: true, id: true } },
        patient: { select: { name: true, id: true } }
      }
    });

    const notificationsSent = [];

    for (const appt of appointments) {
      // Parse "09:00 AM" into actual Date object
      const timeMatch = appt.timeSlot.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!timeMatch) continue;

      const [, hours, mins, modifier] = timeMatch;
      let h = parseInt(hours, 10);
      const m = parseInt(mins, 10);

      if (modifier.toUpperCase() === "PM" && h < 12) h += 12;
      if (modifier.toUpperCase() === "AM" && h === 12) h = 0;

      const apptDateTime = new Date(appt.date);
      apptDateTime.setHours(h, m, 0, 0);

      // If the appointment is within the next 1 hour (and hasn't passed)
      if (apptDateTime > now && apptDateTime <= upcomingThreshold) {
        
        // Ensure the doctor has a mapped User account to receive notifications
        const doctorUser = await prisma.user.findUnique({
          where: { clerkId: appt.doctor.clerkId || "" }
        });

        if (doctorUser) {
          // Check if reminder was already sent
          const existingNotif = await prisma.notification.findFirst({
            where: {
              appointmentId: appt.id,
              userId: doctorUser.id,
              title: "Upcoming Appointment Reminder"
            }
          });

          if (!existingNotif) {
            // Hydrate the dynamic template
            const message = reminderTemplate.value
              .replace("{{MODE}}", appt.consultationType)
              .replace("{{PATIENT_NAME}}", appt.patient.name)
              .replace("{{TIME}}", appt.timeSlot);

            await notificationService.createNotification({
              userId: doctorUser.id,
              type: "SYSTEM_ALERT", // Uses DB Enum, avoiding arbitrary hardcodes
              title: "Upcoming Appointment Reminder",
              message: message,
              appointmentId: appt.id,
              link: "/doctor/availability"
            });
            notificationsSent.push(appt.id);
          }
        }
      }
    }

    return NextResponse.json({ success: true, count: notificationsSent.length, notificationsSent });
  } catch (error) {
    console.error("CRON REMINDER ERROR:", error);
    return NextResponse.json({ error: "Failed to process reminders" }, { status: 500 });
  }
}
