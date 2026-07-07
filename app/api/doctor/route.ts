import { NextResponse } from "next/server";
import { doctorService } from "@/lib/services/doctor.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const forBooking = searchParams.get("forBooking") === "true";

    const doctors = forBooking
      ? await doctorService.findActiveForBooking()
      : await doctorService.findAll();

    return NextResponse.json(doctors);
  } catch (error) {
    console.error("DOCTORS API ERROR:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
