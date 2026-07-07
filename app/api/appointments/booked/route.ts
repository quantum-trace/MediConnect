import { NextResponse } from "next/server";
import { appointmentService } from "@/lib/services/appointment.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");
    const date = searchParams.get("date");

    if (!doctorId || !date) {
      return NextResponse.json(
        { error: "Missing doctorId or date" },
        { status: 400 }
      );
    }

    // Parse date-only string ("YYYY-MM-DD") as local midnight so getDay() aligns with calendar
    const [y, m, d] = date.split("-").map(Number);
    const bookedSlots = await appointmentService.getBookedSlots(
      doctorId,
      new Date(y, m - 1, d)
    );
    return NextResponse.json(bookedSlots);
  } catch (error) {
    console.error("BOOKED SLOTS ERROR:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
