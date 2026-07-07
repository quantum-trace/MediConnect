import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { doctorService } from "@/lib/services/doctor.service";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const { id } = await params;
    const body = await req.json();

    // ── Boolean status fields handled by Prisma ───────────────────────────────
    const allowedBooleans = ["isApproved", "available"] as const;
    type BoolField = (typeof allowedBooleans)[number];

    const boolUpdate: Partial<Record<BoolField, boolean>> = {};
    for (const field of allowedBooleans) {
      if (field in body && typeof body[field] === "boolean") {
        boolUpdate[field] = body[field];
      }
    }

    // ── licenseNumber — admin can set/overwrite any number of times ───────────
    let licenseNumber: string | null | undefined;
    if ("licenseNumber" in body) {
      const raw = body.licenseNumber;
      licenseNumber = raw === null ? null : String(raw).trim() || null;
    }

    const hasBoolChanges = Object.keys(boolUpdate).length > 0;
    const hasLicenseChange = licenseNumber !== undefined;

    if (!hasBoolChanges && !hasLicenseChange) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    // Apply boolean updates via Prisma
    if (hasBoolChanges) {
      await prisma.doctor.update({ where: { id }, data: boolUpdate });
    }

    // Apply licenseNumber via raw SQL (bypasses stale in-memory Prisma client)
    if (hasLicenseChange) {
      await doctorService.setLicenseNumberById(id, licenseNumber ?? null);
    }

    // Build response from the parts that changed
    const responsePayload: Record<string, unknown> = { id, ...boolUpdate };
    if (hasLicenseChange) {
      responsePayload.licenseNumber = licenseNumber ?? null;
    }

    return NextResponse.json(responsePayload);
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }
    console.error("ADMIN DOCTOR UPDATE ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
