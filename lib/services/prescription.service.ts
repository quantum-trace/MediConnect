import { prisma } from "@/lib/prisma";

export interface MedicationInput {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface CreatePrescriptionInput {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  notes?: string;
  followUpDate?: Date;
  followUpNotes?: string;
  medications: MedicationInput[];
}

export interface UpdatePrescriptionInput {
  diagnosis?: string;
  notes?: string;
  followUpDate?: Date | null;
  followUpNotes?: string;
  medications?: MedicationInput[];
}

const PRESCRIPTION_INCLUDE = {
  medications: true,
  patient: { select: { id: true, name: true, email: true, imageUrl: true } },
  doctor: { select: { id: true, name: true, specialty: true, hospital: true, imageUrl: true } },
  appointment: { select: { id: true, date: true, timeSlot: true, consultationType: true } },
} as const;

export const prescriptionService = {
  async create(data: CreatePrescriptionInput) {
    const { medications, ...rest } = data;
    return prisma.prescription.create({
      data: {
        ...rest,
        medications: { create: medications },
      },
      include: PRESCRIPTION_INCLUDE,
    });
  },

  async findById(id: string) {
    return prisma.prescription.findUnique({
      where: { id },
      include: PRESCRIPTION_INCLUDE,
    });
  },

  async findByAppointment(appointmentId: string) {
    return prisma.prescription.findUnique({
      where: { appointmentId },
      include: PRESCRIPTION_INCLUDE,
    });
  },

  async findByPatient(patientId: string) {
    return prisma.prescription.findMany({
      where: { patientId },
      include: PRESCRIPTION_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  },

  async findByDoctor(doctorId: string) {
    return prisma.prescription.findMany({
      where: { doctorId },
      include: PRESCRIPTION_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  },

  async update(id: string, data: UpdatePrescriptionInput) {
    const { medications, ...rest } = data;

    return prisma.$transaction(async (tx) => {
      if (medications !== undefined) {
        await tx.medicationItem.deleteMany({ where: { prescriptionId: id } });
      }

      return tx.prescription.update({
        where: { id },
        data: {
          ...rest,
          ...(medications !== undefined && {
            medications: { create: medications },
          }),
        },
        include: PRESCRIPTION_INCLUDE,
      });
    });
  },

  async assertDoctorOwns(prescriptionId: string, doctorId: string) {
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      select: { doctorId: true },
    });
    if (!prescription) {
      throw Object.assign(new Error("Prescription not found"), { code: "NOT_FOUND" });
    }
    if (prescription.doctorId !== doctorId) {
      throw Object.assign(new Error("Not your prescription"), { code: "FORBIDDEN" });
    }
  },

  async assertPatientOwns(prescriptionId: string, patientId: string) {
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      select: { patientId: true },
    });
    if (!prescription) {
      throw Object.assign(new Error("Prescription not found"), { code: "NOT_FOUND" });
    }
    if (prescription.patientId !== patientId) {
      throw Object.assign(new Error("Not your prescription"), { code: "FORBIDDEN" });
    }
  },
};
