import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { doctorService } from "@/lib/services/doctor.service";
import { appointmentService } from "@/lib/services/appointment.service";

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

    const appointments = await appointmentService.findByDoctor(doctor.id);
    return NextResponse.json(appointments);
  } catch (error) {
    console.error("DOCTOR APPOINTMENTS ERROR:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
