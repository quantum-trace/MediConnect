import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prescriptionService } from "@/lib/services/prescription.service";
import { userService } from "@/lib/services/user.service";
import { doctorService } from "@/lib/services/doctor.service";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const medicationSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  duration: z.string().min(1),
  instructions: z.string().optional(),
});

const createSchema = z.object({
  appointmentId: z.string().min(1),
  diagnosis: z.string().min(1),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
  followUpNotes: z.string().optional(),
  medications: z.array(medicationSchema).min(0),
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctor = await doctorService.findByClerkId(userId);
    if (!doctor) {
      return NextResponse.json({ error: "Doctor record not found" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { appointmentId, followUpDate, ...rest } = parsed.data;

    // Verify the appointment belongs to this doctor and is COMPLETED
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { doctorId: true, patientId: true, status: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }
    if (appointment.doctorId !== doctor.id) {
      return NextResponse.json({ error: "Not your appointment" }, { status: 403 });
    }
    if (appointment.status !== "COMPLETED") {
      return NextResponse.json({ error: "Prescription can only be created for completed appointments" }, { status: 422 });
    }

    const prescription = await prescriptionService.create({
      appointmentId,
      patientId: appointment.patientId,
      doctorId: doctor.id,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      ...rest,
    });

    return NextResponse.json(prescription, { status: 201 });
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Prescription already exists for this appointment" }, { status: 409 });
    }
    console.error("CREATE PRESCRIPTION ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Doctors see prescriptions they wrote
    const doctor = await doctorService.findByClerkId(userId);
    if (doctor) {
      const prescriptions = await prescriptionService.findByDoctor(doctor.id);
      return NextResponse.json(prescriptions);
    }

    // Patients see their own prescriptions
    const user = await userService.findByClerkId(userId);
    if (user) {
      const prescriptions = await prescriptionService.findByPatient(user.id);
      return NextResponse.json(prescriptions);
    }

    return NextResponse.json({ error: "User not found" }, { status: 404 });
  } catch (error) {
    console.error("GET PRESCRIPTIONS ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
