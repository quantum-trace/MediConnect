import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const doctor = await prisma.doctor.findFirst({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!doctor) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
  }

  const appointments = await prisma.appointment.findMany({
    where: { doctorId: doctor.id },
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      status: true,
      timeSlot: true,
      patient: {
        select: { 
          id: true, 
          name: true, 
          email: true, 
          imageUrl: true,
          patientProfile: {
            select: { age: true, gender: true, phone: true, address: true, bloodType: true }
          }
        },
      },
    },
  });

  // Collapse into unique patients with summary data
  const patientMap = new Map<
    string,
    {
      id: string;
      name: string;
      email: string;
      imageUrl: string | null;
      profile: {
        age: number | null;
        gender: string | null;
        phone: string | null;
        address: string | null;
        bloodType: string | null;
      } | null;
      totalAppointments: number;
      lastVisit: string | null;
      nextAppointment: string | null;
    }
  >();

  const now = new Date();

  for (const appt of appointments) {
    const { patient, date, status } = appt;
    if (!patientMap.has(patient.id)) {
      patientMap.set(patient.id, {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        imageUrl: patient.imageUrl,
        profile: patient.patientProfile || null,
        totalAppointments: 0,
        lastVisit: null,
        nextAppointment: null,
      });
    }
    const entry = patientMap.get(patient.id)!;
    entry.totalAppointments += 1;

    const apptDate = new Date(date);
    if (apptDate < now && status === "COMPLETED") {
      if (!entry.lastVisit || apptDate > new Date(entry.lastVisit)) {
        entry.lastVisit = date.toISOString();
      }
    }
    if (apptDate >= now && (status === "CONFIRMED" || status === "PENDING")) {
      if (!entry.nextAppointment || apptDate < new Date(entry.nextAppointment)) {
        entry.nextAppointment = date.toISOString();
      }
    }
  }

  return NextResponse.json(Array.from(patientMap.values()));
}
