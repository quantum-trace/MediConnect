import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Specialty } from "@prisma/client";
import { doctorService, UpdateDoctorProfileInput } from "@/lib/services/doctor.service";

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

    // Fetch licenseNumber via raw SQL — bypasses any stale in-memory Prisma client
    const licenseNumber = await doctorService.getLicenseNumber(userId);
    return NextResponse.json({ ...doctor, licenseNumber });
  } catch (error) {
    console.error("GET DOCTOR PROFILE ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctor = await doctorService.findByClerkId(userId);
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, specialty, licenseNumber, consultationFee } = body;

    // ── License number: one-time-only, handled via raw SQL ────────────────────
    let resolvedLicenseNumber: string | null = await doctorService.getLicenseNumber(userId);

    if (licenseNumber !== undefined) {
      if (resolvedLicenseNumber) {
        return NextResponse.json(
          { error: "License number cannot be changed once set." },
          { status: 409 }
        );
      }
      const trimmed = String(licenseNumber).trim();
      if (!trimmed) {
        return NextResponse.json(
          { error: "License number cannot be empty." },
          { status: 422 }
        );
      }
      await doctorService.setLicenseNumber(userId, trimmed);
      resolvedLicenseNumber = trimmed;
    }

    // ── Other editable fields via normal Prisma update ────────────────────────
    const updates: UpdateDoctorProfileInput = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (specialty !== undefined) updates.specialty = specialty as Specialty;
    if (consultationFee !== undefined) {
      const fee = Number(consultationFee);
      if (!Number.isInteger(fee) || fee <= 0) {
        return NextResponse.json(
          { error: "Consultation fee must be a positive whole number." },
          { status: 422 }
        );
      }
      updates.consultationFee = fee;
    }

    const updated =
      Object.keys(updates).length > 0
        ? await doctorService.updateSelfProfile(userId, updates)
        : await doctorService.findByClerkId(userId);

    return NextResponse.json({ ...updated, licenseNumber: resolvedLicenseNumber });
  } catch (error) {
    console.error("PATCH DOCTOR PROFILE ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
