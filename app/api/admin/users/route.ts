import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const search = searchParams.get("search");

  const users = await prisma.user.findMany({
    where: {
      ...(role && role !== "all" ? { role: role as "PATIENT" | "DOCTOR" | "ADMIN" } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      imageUrl: true,
      role: true,
      createdAt: true,
      _count: {
        select: { appointments: true },
      },
    },
  });

  return NextResponse.json(users);
}
