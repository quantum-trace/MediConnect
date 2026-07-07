import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type AdminGuardSuccess = { userId: string; adminUserId: string };
type AdminGuardResult =
  | { ok: true; data: AdminGuardSuccess }
  | { ok: false; response: NextResponse };

/**
 * Verifies the caller is authenticated and holds the ADMIN role in the DB.
 * Returns the Clerk userId and DB user id on success, or a ready NextResponse on failure.
 */
export async function requireAdmin(): Promise<AdminGuardResult> {
  const { userId } = await auth();
  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "ADMIN") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, data: { userId, adminUserId: user.id } };
}
