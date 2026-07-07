import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { analyticsService } from "@/lib/services/analytics.service";

export async function GET(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const { searchParams } = new URL(request.url);
    const trendDays = parseInt(searchParams.get("trendDays") ?? "30", 10);
    const revenueMonths = parseInt(searchParams.get("revenueMonths") ?? "6", 10);
    const activityLimit = parseInt(searchParams.get("activityLimit") ?? "20", 10);
    const doctorLimit = parseInt(searchParams.get("doctorLimit") ?? "10", 10);

    const [trends, specialty, revenue, topDoctors, recentActivity] = await Promise.all([
      analyticsService.getAppointmentTrends(trendDays),
      analyticsService.getSpecialtyDistribution(),
      analyticsService.getRevenueByMonth(revenueMonths),
      analyticsService.getTopDoctors(doctorLimit),
      analyticsService.getRecentActivity(activityLimit),
    ]);

    return NextResponse.json({ trends, specialty, revenue, topDoctors, recentActivity });
  } catch (error) {
    console.error("ADMIN ANALYTICS ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
