import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { VALID_APPOINTMENT_STATUSES } from "@/lib/constants";

export async function GET(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const take = parseInt(searchParams.get("take") ?? "100", 10);
  const skip = parseInt(searchParams.get("skip") ?? "0", 10);

  const validStatus =
    status && status !== "all" && VALID_APPOINTMENT_STATUSES.includes(status as never)
      ? (status as (typeof VALID_APPOINTMENT_STATUSES)[number])
      : undefined;

  const appointments = await prisma.appointment.findMany({
    where: {
      ...(validStatus ? { status: validStatus } : {}),
      ...(search
        ? {
            OR: [
              { patient: { name: { contains: search, mode: "insensitive" } } },
              { doctor: { name: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    orderBy: { date: "desc" },
    take,
    skip,
    include: {
      patient: {
        select: { id: true, name: true, email: true, imageUrl: true },
      },
      doctor: {
        select: { id: true, name: true, specialty: true, imageUrl: true },
      },
    },
  });

  return NextResponse.json(appointments);
}
