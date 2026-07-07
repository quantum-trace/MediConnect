import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { doctorService } from "@/lib/services/doctor.service";
import { subMonths, subDays, format, isSameMonth, isSameDay } from "date-fns";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get("timeframe") || "This Year";

    const doctor = await doctorService.findByClerkId(userId);
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      include: { patient: true },
      orderBy: { date: "desc" },
    });

    const now = new Date();
    const earningsData = [];

    if (timeframe === "This Week") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const dayDate = subDays(now, i);
        const dayStr = format(dayDate, "EEE"); // Mon, Tue...
        
        const dayAppointments = appointments.filter(a => 
          isSameDay(new Date(a.date), dayDate) && 
          (a.status === "COMPLETED" || a.status === "CONFIRMED")
        );

        earningsData.push({
          month: dayStr, // keeping 'month' key so frontend doesn't break
          earnings: dayAppointments.length * doctor.consultationFee,
          consultations: dayAppointments.length
        });
      }
    } else if (timeframe === "This Month") {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const dayDate = subDays(now, i);
        const dayStr = format(dayDate, "MMM d");
        
        const dayAppointments = appointments.filter(a => 
          isSameDay(new Date(a.date), dayDate) && 
          (a.status === "COMPLETED" || a.status === "CONFIRMED")
        );

        earningsData.push({
          month: dayStr,
          earnings: dayAppointments.length * doctor.consultationFee,
          consultations: dayAppointments.length
        });
      }
    } else {
      // This Year (Last 9 months as before)
      for (let i = 8; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStr = format(monthDate, "MMM");
        
        const monthAppointments = appointments.filter(a => 
          isSameMonth(new Date(a.date), monthDate) && 
          (a.status === "COMPLETED" || a.status === "CONFIRMED")
        );

        earningsData.push({
          month: monthStr,
          earnings: monthAppointments.length * doctor.consultationFee,
          consultations: monthAppointments.length
        });
      }
    }

    // Recent Consultations (Top 4 most recent COMPLETED or CONFIRMED)
    const recentAppointments = appointments
      .filter(a => a.status === "COMPLETED" || a.status === "CONFIRMED")
      .slice(0, 4)
      .map(a => {
        // Mock type based on consultationType or fallback
        const type = a.consultationType === "VIDEO" ? "Video Consultation" : "In-Person Visit";
        
        let dateStr = "Recently";
        const diffDays = Math.floor((now.getTime() - new Date(a.date).getTime()) / (1000 * 3600 * 24));
        if (diffDays === 0) {
          dateStr = `Today, ${a.timeSlot}`;
        } else if (diffDays === 1) {
          dateStr = `Yesterday`;
        } else if (diffDays > 1) {
          dateStr = format(new Date(a.date), "MMM d");
        } else {
          dateStr = `Upcoming, ${a.timeSlot}`;
        }

        return {
          id: a.id,
          patient: a.patient.name,
          fee: doctor.consultationFee,
          type,
          date: dateStr,
          status: a.status
        };
      });

    return NextResponse.json({
      chartData: earningsData,
      recentConsultations: recentAppointments
    });
  } catch (error) {
    console.error("DOCTOR EARNINGS ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
