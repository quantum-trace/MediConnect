"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/header";
import { AdminKPICards } from "@/components/admin/kpi-cards";
import { AppointmentsChart } from "@/components/admin/appointments-chart";
import { SpecialtyChart } from "@/components/admin/specialty-chart";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { ActivityFeed } from "@/components/admin/activity-feed";
import type { PlatformStats, TrendPoint, SpecialtyCount, RevenuePoint, ActivityItem } from "@/lib/services/analytics.service";
import { Loader2 } from "lucide-react";

interface AnalyticsData {
  trends: TrendPoint[];
  specialty: SpecialtyCount[];
  revenue: RevenuePoint[];
  recentActivity: ActivityItem[];
}

const EMPTY_STATS: PlatformStats = {
  totalUsers: 0,
  totalDoctors: 0,
  totalAppointments: 0,
  completedAppointments: 0,
  cancelledAppointments: 0,
  pendingAppointments: 0,
  confirmedAppointments: 0,
  totalRevenue: 0,
  activeVideoConsultations: 0,
  totalPrescriptions: 0,
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats>(EMPTY_STATS);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [trendDays, setTrendDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    const res = await fetch("/api/admin/stats");
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<PlatformStats>;
  }, []);

  const fetchAnalytics = useCallback(
    async (days: number) => {
      const res = await fetch(`/api/admin/analytics?trendDays=${days}&revenueMonths=6&activityLimit=20&doctorLimit=10`);
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<AnalyticsData>;
    },
    []
  );

  useEffect(() => {
    Promise.resolve().then(() => {
      setLoading(true);
      Promise.all([fetchStats(), fetchAnalytics(trendDays)])
        .then(([s, a]) => {
          setStats(s);
          setAnalytics(a);
          setError(null);
        })
        .catch((err: Error) => {
          setError(err.message ?? "Failed to load dashboard");
          toast.error(err.message);
        })
        .finally(() => setLoading(false));
    });
  }, [fetchStats, fetchAnalytics, trendDays]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
          <p className="text-sm text-muted-foreground">Loading platform data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 text-center">
          <p className="text-sm font-medium text-rose-500">{error}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Make sure your account has Admin privileges.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-screen">
      <AdminHeader
        title="Admin Dashboard"
        subtitle="Platform overview and analytics"
      />

      <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 space-y-8">
        {/* KPI Cards */}
        <section>
          <AdminKPICards stats={stats} />
        </section>

        {/* Charts row */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <AppointmentsChart
              data={analytics?.trends ?? []}
              days={trendDays}
              onDaysChange={setTrendDays}
            />
          </div>
          <div>
            <SpecialtyChart data={analytics?.specialty ?? []} />
          </div>
        </section>

        {/* Revenue + Activity row */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <RevenueChart data={analytics?.revenue ?? []} />
          <ActivityFeed items={analytics?.recentActivity ?? []} />
        </section>
      </main>
    </div>
  );
}
