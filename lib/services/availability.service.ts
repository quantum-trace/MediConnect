import { prisma } from "@/lib/prisma";
import {
  DAY_KEYS,
  type AvailabilitySchedule,
  type DayAvailability,
  type DayKey,
} from "@/lib/constants";

export const availabilityService = {
  async findByDoctor(doctorId: string): Promise<AvailabilitySchedule | null> {
    const rows = await prisma.doctorAvailability.findMany({
      where: { doctorId },
    });

    if (rows.length === 0) return null;

    return Object.fromEntries(
      rows.map((r) => [r.dayKey, { enabled: r.enabled, slots: r.slots }])
    ) as AvailabilitySchedule;
  },

  async upsertSchedule(
    doctorId: string,
    schedule: AvailabilitySchedule
  ): Promise<AvailabilitySchedule> {
    const ops = DAY_KEYS.map((dayKey: DayKey) => {
      const day: DayAvailability = schedule[dayKey] ?? { enabled: false, slots: [] };
      return prisma.doctorAvailability.upsert({
        where: { doctorId_dayKey: { doctorId, dayKey } },
        update: { enabled: day.enabled, slots: day.slots },
        create: { doctorId, dayKey, enabled: day.enabled, slots: day.slots },
      });
    });

    const rows = await prisma.$transaction(ops);

    return Object.fromEntries(
      rows.map((r) => [r.dayKey, { enabled: r.enabled, slots: r.slots }])
    ) as AvailabilitySchedule;
  },
};
