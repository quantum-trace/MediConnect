import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { doctorService } from "@/lib/services/doctor.service";
import { availabilityService } from "@/lib/services/availability.service";
import { notificationService } from "@/lib/services/notification.service";
import { userService } from "@/lib/services/user.service";
import { DAY_KEYS, type AvailabilitySchedule } from "@/lib/constants";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctor = await doctorService.findByClerkId(userId);
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const schedule = await availabilityService.findByDoctor(doctor.id);
    return NextResponse.json(schedule);
  } catch (error) {
    console.error("AVAILABILITY GET ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctor = await doctorService.findByClerkId(userId);
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const body = await req.json();
    const { schedule } = body as { schedule: AvailabilitySchedule };

    if (!schedule || typeof schedule !== "object") {
      return NextResponse.json({ error: "Invalid schedule payload" }, { status: 400 });
    }

    const invalidKeys = Object.keys(schedule).filter(
      (k) => !DAY_KEYS.includes(k as (typeof DAY_KEYS)[number])
    );
    if (invalidKeys.length > 0) {
      return NextResponse.json(
        { error: `Invalid day keys: ${invalidKeys.join(", ")}` },
        { status: 400 }
      );
    }

    const saved = await availabilityService.upsertSchedule(doctor.id, schedule);

    try {
      const doctorUser = await userService.findByClerkId(userId);
      if (doctorUser) {
        await notificationService.createNotification({
          userId: doctorUser.id,
          type: "AVAILABILITY_CHANGED",
          title: "Availability Updated",
          message: "Your weekly consultation availability has been successfully updated.",
          link: "/doctor/availability",
        });
      }
    } catch (notifErr) {
      console.error("NOTIFICATION ERROR (availability):", notifErr);
    }

    return NextResponse.json(saved);
  } catch (error) {
    console.error("AVAILABILITY PATCH ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
