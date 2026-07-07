import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { doctorService } from "@/lib/services/doctor.service";
import { invitationService } from "@/lib/services/invitation.service";
import { DOCTOR_STATUS } from "@/lib/constants";
import { DoctorStatus } from "@prisma/client";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const { id } = await params;
    const doctor = await doctorService.findById(id);

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    if (!doctor.email) {
      return NextResponse.json(
        { error: "Doctor profile has no email address" },
        { status: 422 }
      );
    }

    if (doctor.status === DOCTOR_STATUS.ACTIVE) {
      return NextResponse.json(
        { error: "Doctor account is already active" },
        { status: 409 }
      );
    }

    if (doctor.status === DOCTOR_STATUS.SUSPENDED) {
      return NextResponse.json(
        { error: "Doctor account is suspended" },
        { status: 409 }
      );
    }

    await invitationService.sendDoctorInvitation({
      email: doctor.email,
      doctorId: doctor.id,
      doctorName: doctor.name,
    });

    const updated = await doctorService.updateStatus(
      id,
      DOCTOR_STATUS.INVITED as DoctorStatus
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error("ADMIN INVITE DOCTOR ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
