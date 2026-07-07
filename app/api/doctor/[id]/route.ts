import { NextResponse } from "next/server";
import { doctorService } from "@/lib/services/doctor.service";
import { availabilityService } from "@/lib/services/availability.service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const doctor = await doctorService.findById(id);

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    if (!doctor.available || !doctor.isApproved) {
      return NextResponse.json(
        { error: "Doctor is not currently available for booking" },
        { status: 403 }
      );
    }

    const availability = await availabilityService.findByDoctor(id);

    return NextResponse.json({ ...doctor, availability });
  } catch (error) {
    console.error("DOCTOR GET BY ID ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
