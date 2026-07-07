import { prisma } from "@/lib/prisma";
import { Prisma, Specialty, DoctorStatus } from "@prisma/client";
import { DOCTOR_STATUS, DEFAULT_DOCTOR_PROFILE } from "@/lib/constants";

/**
 * Single source of truth for the fields returned by admin doctor queries.
 * Both findAllForAdmin() and createAdminInitiated() use this select so the
 * response shape is always identical — including _count.
 */
const adminDoctorSelect = {
  id: true,
  name: true,
  email: true,
  specialty: true,
  experience: true,
  consultationFee: true,
  hospital: true,
  imageUrl: true,
  available: true,
  isApproved: true,
  status: true,
  createdAt: true,
  _count: {
    select: {
      appointments: true,
      prescriptions: true,
    },
  },
} satisfies Prisma.DoctorSelect;

// ── Input types (kept narrow — callers can't accidentally pass extra fields) ──

export interface CreateDoctorInput {
  name: string;
  email: string;
  specialty: Specialty;
  hospital: string;
  consultationFee: number;
  experience: number;
  imageUrl?: string;
}

export interface UpdateDoctorStatusInput {
  isApproved?: boolean;
  available?: boolean;
  status?: DoctorStatus;
}

// licenseNumber is intentionally excluded — it is a one-time-only field
// managed via raw SQL so it works regardless of Prisma client cache state.
export interface UpdateDoctorProfileInput {
  name?: string;
  specialty?: Specialty;
  consultationFee?: number;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const doctorService = {
  async findAll() {
    return prisma.doctor.findMany();
  },

  async findActiveForBooking() {
    return prisma.doctor.findMany({
      where: { available: true, isApproved: true },
      include: { availability: true },
      orderBy: { name: "asc" },
    });
  },

  async findAllForAdmin() {
    return prisma.doctor.findMany({
      orderBy: { createdAt: "desc" },
      select: adminDoctorSelect,
    });
  },

  async findByClerkId(clerkId: string) {
    return prisma.doctor.findUnique({ where: { clerkId } });
  },

  async findByEmail(email: string) {
    return prisma.doctor.findUnique({ where: { email } });
  },

  async findById(id: string) {
    return prisma.doctor.findUnique({ where: { id } });
  },

  /**
   * Creates a doctor profile initiated by an admin.
   * The doctor account starts in PENDING state with isApproved = true
   * (admin creation implies admin approval). The doctor cannot log in
   * until they accept an invitation and their status becomes ACTIVE.
   */
  async createAdminInitiated(data: CreateDoctorInput) {
    return prisma.doctor.create({
      data: {
        name: data.name,
        email: data.email,
        specialty: data.specialty,
        hospital: data.hospital,
        consultationFee: data.consultationFee,
        experience: data.experience,
        imageUrl: data.imageUrl ?? "",
        isApproved: true,
        status: DOCTOR_STATUS.PENDING as DoctorStatus,
      },
      select: adminDoctorSelect,
    });
  },

  /**
   * Updates the invitation lifecycle status of a doctor.
   * Separate from isApproved/available to keep concerns distinct.
   */
  async updateStatus(id: string, status: DoctorStatus) {
    return prisma.doctor.update({
      where: { id },
      data: { status },
    });
  },

  /**
   * Links a Clerk user account to a doctor profile after the doctor
   * accepts their invitation. Also marks the account as ACTIVE.
   */
  async linkClerkAccount(doctorId: string, clerkId: string) {
    return prisma.doctor.update({
      where: { id: doctorId },
      data: {
        clerkId,
        status: DOCTOR_STATUS.ACTIVE as DoctorStatus,
      },
    });
  },

  /**
   * Admin toggle for approval and availability flags.
   * Only accepts the specific boolean fields — no arbitrary updates.
   */
  async updateAdminFields(
    id: string,
    changes: { isApproved?: boolean; available?: boolean }
  ) {
    return prisma.doctor.update({
      where: { id },
      data: changes,
      select: { id: true, name: true, isApproved: true, available: true, status: true },
    });
  },

  async updateSelfProfile(clerkId: string, data: UpdateDoctorProfileInput) {
    return prisma.doctor.update({
      where: { clerkId },
      data,
    });
  },

  // ── License number — raw SQL so it works regardless of Prisma client cache ──

  async getLicenseNumber(clerkId: string): Promise<string | null> {
    const rows = await prisma.$queryRaw<{ licenseNumber: string | null }[]>`
      SELECT "licenseNumber" FROM "Doctor" WHERE "clerkId" = ${clerkId} LIMIT 1
    `;
    return rows[0]?.licenseNumber ?? null;
  },

  async setLicenseNumber(clerkId: string, value: string): Promise<void> {
    await prisma.$executeRaw`
      UPDATE "Doctor"
      SET    "licenseNumber" = ${value},
             "updatedAt"     = NOW()
      WHERE  "clerkId" = ${clerkId}
    `;
  },

  async getLicenseNumberById(id: string): Promise<string | null> {
    const rows = await prisma.$queryRaw<{ licenseNumber: string | null }[]>`
      SELECT "licenseNumber" FROM "Doctor" WHERE "id" = ${id} LIMIT 1
    `;
    return rows[0]?.licenseNumber ?? null;
  },

  async setLicenseNumberById(id: string, value: string | null): Promise<void> {
    await prisma.$executeRaw`
      UPDATE "Doctor"
      SET    "licenseNumber" = ${value},
             "updatedAt"     = NOW()
      WHERE  "id" = ${id}
    `;
  },

  async getAllLicenseNumbers(): Promise<Record<string, string | null>> {
    const rows = await prisma.$queryRaw<{ id: string; licenseNumber: string | null }[]>`
      SELECT "id", "licenseNumber" FROM "Doctor"
    `;
    return Object.fromEntries(rows.map((r) => [r.id, r.licenseNumber ?? null]));
  },

  /**
   * Legacy upsert used during the old self-registration flow.
   * Kept for backward compatibility but not exposed in any current UI.
   */
  async upsert(clerkId: string, data: { name: string; imageUrl: string }) {
    return prisma.doctor.upsert({
      where: { clerkId },
      update: {},
      create: {
        clerkId,
        name: data.name,
        imageUrl: data.imageUrl,
        specialty: DEFAULT_DOCTOR_PROFILE.specialty as Specialty,
        experience: DEFAULT_DOCTOR_PROFILE.experience,
        consultationFee: DEFAULT_DOCTOR_PROFILE.consultationFee,
        hospital: DEFAULT_DOCTOR_PROFILE.hospital,
        status: DOCTOR_STATUS.ACTIVE as DoctorStatus,
        isApproved: true,
      },
    });
  },
};
