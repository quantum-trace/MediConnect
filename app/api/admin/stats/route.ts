import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { analyticsService } from "@/lib/services/analytics.service";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const stats = await analyticsService.getPlatformStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("ADMIN STATS ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
