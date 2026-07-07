import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prescriptionService } from "@/lib/services/prescription.service";
import { userService } from "@/lib/services/user.service";
import { doctorService } from "@/lib/services/doctor.service";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: appointmentId } = await params;

    // Verify caller is the patient or doctor of this appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { patientId: true, doctorId: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const user = await userService.findByClerkId(userId);
    const doctor = await doctorService.findByClerkId(userId);

    const isPatient = user && appointment.patientId === user.id;
    const isDoctor = doctor && appointment.doctorId === doctor.id;

    if (!isPatient && !isDoctor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const prescription = await prescriptionService.findByAppointment(appointmentId);
    if (!prescription) {
      return NextResponse.json(null);
    }

    return NextResponse.json(prescription);
  } catch (error) {
    console.error("GET APPOINTMENT PRESCRIPTION ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
