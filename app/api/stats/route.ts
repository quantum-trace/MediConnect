import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { userService } from "@/lib/services/user.service";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await userService.findByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();

    // Upcoming appointments count
    const upcomingAppointmentsCount = await prisma.appointment.count({
      where: {
        patientId: user.id,
        date: { gte: now },
        status: { notIn: ["CANCELLED", "COMPLETED"] }
      }
    });

    // Active prescriptions count (for simplicity, any prescription with a medication)
    // Could be refined to check if the duration hasn't expired yet
    const activePrescriptionsCount = await prisma.prescription.count({
      where: {
        patientId: user.id
      }
    });

    return NextResponse.json({
      upcomingAppointments: upcomingAppointmentsCount,
      activePrescriptions: activePrescriptionsCount,
    });
  } catch (error) {
    console.error("[STATS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
