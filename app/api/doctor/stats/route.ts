import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { doctorService } from "@/lib/services/doctor.service";

import { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { prisma } from "@/lib/prisma";

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

    const now = new Date();
    
    // Appointments for today
    const startToday = startOfDay(now);
    const endToday = endOfDay(now);
    
    const todaysAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        date: { gte: startToday, lte: endToday }
      }
    });

    const todaysCount = todaysAppointments.length;
    const pendingCount = todaysAppointments.filter(a => a.status === "PENDING").length;

    // Total Patients
    const allAppointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      select: { patientId: true, date: true, status: true }
    });

    const uniquePatients = new Set(allAppointments.map(a => a.patientId)).size;
    
    // Patients this month
    const startOfCurrentMonth = startOfMonth(now);
    const patientsThisMonth = new Set(
      allAppointments.filter(a => a.date >= startOfCurrentMonth).map(a => a.patientId)
    ).size;

    // Monthly Earnings (only COMPLETED appointments count towards earnings)
    // If none are completed, we can fallback to CONFIRMED or just use COMPLETED
    const currentMonthAppointments = allAppointments.filter(a => a.date >= startOfCurrentMonth && (a.status === "COMPLETED" || a.status === "CONFIRMED"));
    const currentMonthEarnings = currentMonthAppointments.length * doctor.consultationFee;

    const startOfPrevMonth = startOfMonth(subMonths(now, 1));
    const endOfPrevMonth = endOfMonth(subMonths(now, 1));
    const prevMonthAppointments = allAppointments.filter(a => a.date >= startOfPrevMonth && a.date <= endOfPrevMonth && (a.status === "COMPLETED" || a.status === "CONFIRMED"));
    const prevMonthEarnings = prevMonthAppointments.length * doctor.consultationFee;

    let earningsTrend = 0;
    if (prevMonthEarnings > 0) {
      earningsTrend = ((currentMonthEarnings - prevMonthEarnings) / prevMonthEarnings) * 100;
    } else if (currentMonthEarnings > 0) {
      earningsTrend = 100;
    }

    // Format Indian Rupee
    const formattedEarnings = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(currentMonthEarnings);

    const stats = [
      {
        title: "Today's Appointments",
        value: todaysCount.toString(),
        change: `+${todaysCount}`,
        trend: todaysCount > 0 ? "up" : "down",
        subtitle: `${pendingCount} pending confirmation`,
        icon: "Calendar",
        color: "blue",
        gradient: "from-blue-500/20 to-blue-500/5",
      },
      {
        title: "Total Patients",
        value: uniquePatients.toString(),
        change: `+${patientsThisMonth}`,
        trend: patientsThisMonth > 0 ? "up" : "down",
        subtitle: "This month",
        icon: "Users",
        color: "indigo",
        gradient: "from-indigo-500/20 to-indigo-500/5",
      },
      {
        title: "Monthly Earnings",
        value: formattedEarnings,
        change: `${earningsTrend >= 0 ? '+' : ''}${earningsTrend.toFixed(1)}%`,
        trend: earningsTrend >= 0 ? "up" : "down",
        subtitle: "vs last month",
        icon: "IndianRupee",
        color: "emerald",
        gradient: "from-emerald-500/20 to-emerald-500/5",
      },
      {
        title: "Avg. Consultation",
        value: "30 min",
        change: "0 min",
        trend: "up",
        subtitle: "Standard slot duration",
        icon: "Clock",
        color: "amber",
        gradient: "from-amber-500/20 to-amber-500/5",
      },
    ];

    return NextResponse.json(stats);
  } catch (error) {
    console.error("DOCTOR STATS ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
