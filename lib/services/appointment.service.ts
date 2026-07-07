import { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { APPOINTMENT_STATUS, ConsultationType } from "@/lib/constants";

export const appointmentService = {
  async getBookedSlots(doctorId: string, date: Date): Promise<string[]> {
    const records = await prisma.appointment.findMany({
      where: {
        doctorId,
        date,
        status: { not: APPOINTMENT_STATUS.CANCELLED as AppointmentStatus },
      },
      select: { timeSlot: true },
    });
    return records.map((r) => r.timeSlot);
  },

  async hasConflict(
    doctorId: string,
    date: Date,
    timeSlot: string
  ): Promise<boolean> {
    const existing = await prisma.appointment.findFirst({
      where: {
        doctorId,
        date,
        timeSlot,
        status: { not: APPOINTMENT_STATUS.CANCELLED as AppointmentStatus },
      },
    });
    return !!existing;
  },

  async create(data: {
    patientId: string;
    doctorId: string;
    date: Date;
    timeSlot: string;
    consultationType?: ConsultationType;
  }) {
    const { consultationType, ...rest } = data;
     
    return prisma.appointment.create({
      // After `prisma generate`, remove `as any` and spread consultationType directly
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { ...rest, status: APPOINTMENT_STATUS.PENDING as AppointmentStatus, consultationType } as any,
    });
  },

  async updateStatus(id: string, status: AppointmentStatus) {
    return prisma.appointment.update({
      where: { id },
      data: { status },
      include: { patient: true, doctor: true },
    });
  },

  async findById(id: string) {
    return prisma.appointment.findUnique({
      where: { id },
      include: { patient: true, doctor: true },
    });
  },

  async reschedule(
    id: string,
    clerkUserId: string,
    date: Date,
    timeSlot: string
  ) {
    return prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.findUnique({
        where: { id },
        include: { patient: true, doctor: true },
      });

      if (!appointment) {
        throw Object.assign(new Error("Appointment not found"), { code: "NOT_FOUND" });
      }
      if (appointment.patient.clerkId !== clerkUserId && appointment.doctor.clerkId !== clerkUserId) {
        throw Object.assign(new Error("Not your appointment"), { code: "UNAUTHORIZED" });
      }
      if (
        appointment.status === (APPOINTMENT_STATUS.CANCELLED as AppointmentStatus) ||
        appointment.status === (APPOINTMENT_STATUS.COMPLETED as AppointmentStatus)
      ) {
        throw Object.assign(new Error("Cannot reschedule a cancelled or completed appointment"), {
          code: "INVALID_STATUS",
        });
      }

      const conflict = await tx.appointment.findFirst({
        where: {
          doctorId: appointment.doctorId,
          date,
          timeSlot,
          id: { not: id },
          status: { not: APPOINTMENT_STATUS.CANCELLED as AppointmentStatus },
        },
      });
      if (conflict) {
        throw Object.assign(new Error("This slot is already booked"), { code: "SLOT_CONFLICT" });
      }

      return tx.appointment.update({
        where: { id },
        data: {
          date,
          timeSlot,
          status: APPOINTMENT_STATUS.PENDING as AppointmentStatus,
        },
        include: { doctor: true, patient: true },
      });
    });
  },

  async findByPatient(patientId: string) {
    return prisma.appointment.findMany({
      where: { patientId },
      include: { doctor: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async findByDoctor(doctorId: string) {
    return prisma.appointment.findMany({
      where: { doctorId },
      include: { patient: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async findByIdForVideo(id: string) {
    return prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, clerkId: true, name: true, imageUrl: true } },
        doctor: { select: { id: true, clerkId: true, name: true, specialty: true, imageUrl: true } },
      },
    });
  },
};
