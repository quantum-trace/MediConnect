import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prescriptionService } from "@/lib/services/prescription.service";
import { userService } from "@/lib/services/user.service";
import { doctorService } from "@/lib/services/doctor.service";
import { z } from "zod";

const medicationSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  duration: z.string().min(1),
  instructions: z.string().optional(),
});

const updateSchema = z.object({
  diagnosis: z.string().min(1).optional(),
  notes: z.string().optional(),
  followUpDate: z.string().nullable().optional(),
  followUpNotes: z.string().optional(),
  medications: z.array(medicationSchema).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const prescription = await prescriptionService.findById(id);
    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    // Allow access to the owning patient or doctor
    const user = await userService.findByClerkId(userId);
    const doctor = await doctorService.findByClerkId(userId);

    const isOwningPatient = user && prescription.patientId === user.id;
    const isOwningDoctor = doctor && prescription.doctorId === doctor.id;

    if (!isOwningPatient && !isOwningDoctor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(prescription);
  } catch (error) {
    console.error("GET PRESCRIPTION ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctor = await doctorService.findByClerkId(userId);
    if (!doctor) {
      return NextResponse.json({ error: "Only doctors can update prescriptions" }, { status: 403 });
    }

    const { id } = await params;
    await prescriptionService.assertDoctorOwns(id, doctor.id);

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { followUpDate, ...rest } = parsed.data;
    const updated = await prescriptionService.update(id, {
      ...rest,
      ...(followUpDate !== undefined && {
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      }),
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err?.code === "NOT_FOUND") {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }
    if (err?.code === "FORBIDDEN") {
      return NextResponse.json({ error: "Not your prescription" }, { status: 403 });
    }
    console.error("UPDATE PRESCRIPTION ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
