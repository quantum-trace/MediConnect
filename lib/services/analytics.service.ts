import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, format, startOfMonth, subMonths } from "date-fns";

export interface PlatformStats {
  totalUsers: number;
  totalDoctors: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  totalRevenue: number;
  activeVideoConsultations: number;
  totalPrescriptions: number;
}

export interface TrendPoint {
  date: string;
  appointments: number;
  completed: number;
  cancelled: number;
}

export interface SpecialtyCount {
  specialty: string;
  count: number;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  appointments: number;
}

export interface DoctorActivity {
  id: string;
  name: string;
  specialty: string;
  imageUrl: string;
  totalAppointments: number;
  completedAppointments: number;
  revenue: number;
  isApproved: boolean;
}

export interface ActivityItem {
  id: string;
  type: "appointment" | "prescription";
  patientName: string;
  doctorName: string;
  status?: string;
  date: string;
  createdAt: string;
}

export const analyticsService = {
  async getPlatformStats(): Promise<PlatformStats> {
    const [
      totalUsers,
      totalDoctors,
      appointmentCounts,
      prescriptionsCount,
      completedWithFees,
    ] = await Promise.all([
      prisma.user.count({ where: { role: { not: "ADMIN" } } }),
      prisma.doctor.count(),
      prisma.appointment.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      prisma.prescription.count(),
      prisma.appointment.findMany({
        where: { status: "COMPLETED" },
        select: { doctor: { select: { consultationFee: true } } },
      }),
    ]);

    const statusMap = Object.fromEntries(
      appointmentCounts.map((g) => [g.status, g._count.id])
    );

    const totalRevenue = completedWithFees.reduce(
      (sum, a) => sum + a.doctor.consultationFee,
      0
    );

    return {
      totalUsers,
      totalDoctors,
      totalAppointments: Object.values(statusMap).reduce((s, c) => s + c, 0),
      completedAppointments: statusMap["COMPLETED"] ?? 0,
      cancelledAppointments: statusMap["CANCELLED"] ?? 0,
      pendingAppointments: statusMap["PENDING"] ?? 0,
      confirmedAppointments: statusMap["CONFIRMED"] ?? 0,
      totalRevenue,
      activeVideoConsultations: statusMap["CONFIRMED"] ?? 0,
      totalPrescriptions: prescriptionsCount,
    };
  },

  async getAppointmentTrends(days = 30): Promise<TrendPoint[]> {
    const startDate = startOfDay(subDays(new Date(), days - 1));

    const appointments = await prisma.appointment.findMany({
      where: { date: { gte: startDate } },
      select: { date: true, status: true },
    });

    const buckets: Record<string, TrendPoint> = {};
    for (let i = 0; i < days; i++) {
      const d = format(subDays(new Date(), days - 1 - i), "MMM dd");
      buckets[d] = { date: d, appointments: 0, completed: 0, cancelled: 0 };
    }

    for (const appt of appointments) {
      const key = format(appt.date, "MMM dd");
      if (buckets[key]) {
        buckets[key].appointments++;
        if (appt.status === "COMPLETED") buckets[key].completed++;
        if (appt.status === "CANCELLED") buckets[key].cancelled++;
      }
    }

    return Object.values(buckets);
  },

  async getSpecialtyDistribution(): Promise<SpecialtyCount[]> {
    const doctors = await prisma.doctor.findMany({
      select: {
        specialty: true,
        _count: { select: { appointments: true } },
      },
    });

    const map: Record<string, number> = {};
    for (const d of doctors) {
      const label = d.specialty.replace(/_/g, " ");
      map[label] = (map[label] ?? 0) + d._count.appointments;
    }

    return Object.entries(map)
      .map(([specialty, count]) => ({ specialty, count }))
      .sort((a, b) => b.count - a.count);
  },

  async getRevenueByMonth(months = 6): Promise<RevenuePoint[]> {
    const startDate = startOfMonth(subMonths(new Date(), months - 1));

    const completed = await prisma.appointment.findMany({
      where: { status: "COMPLETED", date: { gte: startDate } },
      select: {
        date: true,
        doctor: { select: { consultationFee: true } },
      },
    });

    const buckets: Record<string, RevenuePoint> = {};
    for (let i = 0; i < months; i++) {
      const key = format(subMonths(new Date(), months - 1 - i), "MMM yyyy");
      buckets[key] = { month: key, revenue: 0, appointments: 0 };
    }

    for (const appt of completed) {
      const key = format(appt.date, "MMM yyyy");
      if (buckets[key]) {
        buckets[key].revenue += appt.doctor.consultationFee;
        buckets[key].appointments++;
      }
    }

    return Object.values(buckets);
  },

  async getTopDoctors(limit = 10): Promise<DoctorActivity[]> {
    const doctors = await prisma.doctor.findMany({
      take: limit,
      select: {
        id: true,
        name: true,
        specialty: true,
        imageUrl: true,
        consultationFee: true,
        isApproved: true,
        appointments: {
          select: { status: true },
        },
      },
      orderBy: { appointments: { _count: "desc" } },
    });

    return doctors.map((d) => {
      const completed = d.appointments.filter((a) => a.status === "COMPLETED").length;
      return {
        id: d.id,
        name: d.name,
        specialty: d.specialty.replace(/_/g, " "),
        imageUrl: d.imageUrl,
        totalAppointments: d.appointments.length,
        completedAppointments: completed,
        revenue: completed * d.consultationFee,
        isApproved: d.isApproved,
      };
    });
  },

  async getRecentActivity(limit = 20): Promise<ActivityItem[]> {
    const [appointments, prescriptions] = await Promise.all([
      prisma.appointment.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          date: true,
          createdAt: true,
          patient: { select: { name: true } },
          doctor: { select: { name: true } },
        },
      }),
      prisma.prescription.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          patient: { select: { name: true } },
          doctor: { select: { name: true } },
        },
      }),
    ]);

    const items: ActivityItem[] = [
      ...appointments.map((a) => ({
        id: a.id,
        type: "appointment" as const,
        patientName: a.patient.name,
        doctorName: a.doctor.name,
        status: a.status,
        date: a.date.toISOString(),
        createdAt: a.createdAt.toISOString(),
      })),
      ...prescriptions.map((p) => ({
        id: p.id,
        type: "prescription" as const,
        patientName: p.patient.name,
        doctorName: p.doctor.name,
        date: p.createdAt.toISOString(),
        createdAt: p.createdAt.toISOString(),
      })),
    ];

    return items
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },
};
