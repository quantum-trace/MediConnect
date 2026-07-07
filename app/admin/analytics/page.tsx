"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/header";
import { AppointmentsChart } from "@/components/admin/appointments-chart";
import { SpecialtyChart } from "@/components/admin/specialty-chart";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { AdminKPICards } from "@/components/admin/kpi-cards";
import { Loader2 } from "lucide-react";
import type {
  PlatformStats,
  TrendPoint,
  SpecialtyCount,
  RevenuePoint,
  ActivityItem,
} from "@/lib/services/analytics.service";

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

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<PlatformStats>(EMPTY_STATS);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [trendDays, setTrendDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch(`/api/admin/analytics?trendDays=${trendDays}&revenueMonths=12&activityLimit=20&doctorLimit=10`),
      ]);
      if (!statsRes.ok) throw new Error(await statsRes.text());
      if (!analyticsRes.ok) throw new Error(await analyticsRes.text());
      const [s, a] = await Promise.all([statsRes.json(), analyticsRes.json()]);
      setStats(s);
      setAnalytics(a);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [trendDays]);

  useEffect(() => {
    Promise.resolve().then(() => fetchAll());
  }, [fetchAll]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 text-center">
          <p className="text-sm font-medium text-rose-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Analytics" subtitle="Deep-dive into platform metrics" />
      <main className="p-6 lg:p-8 space-y-8">
        <AdminKPICards stats={stats} />

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <AppointmentsChart
              data={analytics?.trends ?? []}
              days={trendDays}
              onDaysChange={setTrendDays}
            />
          </div>
          <SpecialtyChart data={analytics?.specialty ?? []} />
        </section>

        <RevenueChart data={analytics?.revenue ?? []} />
      </main>
    </div>
  );
}
