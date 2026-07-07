import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { doctorService } from "@/lib/services/doctor.service";
import { Specialty } from "@prisma/client";
import { MEDICAL_SPECIALTIES } from "@/lib/constants";
import { z } from "zod";

// ── Validation ────────────────────────────────────────────────────────────────

const VALID_SPECIALTIES = MEDICAL_SPECIALTIES
  .filter((s) => s.value !== "All")
  .map((s) => s.value) as [string, ...string[]];

const createDoctorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  specialty: z.enum(VALID_SPECIALTIES as unknown as [Specialty, ...Specialty[]]),
  hospital: z.string().min(2, "Hospital name is required"),
  consultationFee: z.number().int().positive("Fee must be a positive number"),
  experience: z.number().int().min(0, "Experience cannot be negative"),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

// ── GET — list all doctors ────────────────────────────────────────────────────

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const [doctors, licenseNumbers] = await Promise.all([
      doctorService.findAllForAdmin(),
      doctorService.getAllLicenseNumbers(),
    ]);
    const merged = doctors.map((d) => ({
      ...d,
      licenseNumber: licenseNumbers[d.id] ?? null,
    }));
    return NextResponse.json(merged);
  } catch (error) {
    console.error("ADMIN DOCTORS LIST ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// ── POST — create a new doctor profile ───────────────────────────────────────

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const body = await req.json();
    const parsed = createDoctorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { name, email, specialty, hospital, consultationFee, experience, imageUrl } =
      parsed.data;

    // Guard: doctor email must be unique
    const existing = await doctorService.findByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "A doctor with this email already exists" },
        { status: 409 }
      );
    }

    const doctor = await doctorService.createAdminInitiated({
      name,
      email,
      specialty: specialty as Specialty,
      hospital,
      consultationFee,
      experience,
      imageUrl: imageUrl ?? "",
    });

    return NextResponse.json(doctor, { status: 201 });
  } catch (error) {
    console.error("ADMIN CREATE DOCTOR ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
