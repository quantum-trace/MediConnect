import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { userService } from "@/lib/services/user.service";
import { appointmentService } from "@/lib/services/appointment.service";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await userService.findByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const appointments = await appointmentService.findByPatient(user.id);
    return NextResponse.json(appointments);
  } catch (error) {
    console.error("USER APPOINTMENTS ERROR:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
