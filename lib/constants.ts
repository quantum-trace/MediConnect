export const NOTIFICATION_TYPE = {
  APPOINTMENT_BOOKED: "APPOINTMENT_BOOKED",
  APPOINTMENT_APPROVED: "APPOINTMENT_APPROVED",
  APPOINTMENT_REJECTED: "APPOINTMENT_REJECTED",
  APPOINTMENT_CANCELLED: "APPOINTMENT_CANCELLED",
  APPOINTMENT_RESCHEDULED: "APPOINTMENT_RESCHEDULED",
  AVAILABILITY_CHANGED: "AVAILABILITY_CHANGED",
} as const;
export type NotificationTypeValue =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export const USER_ROLE = {
  PATIENT: "PATIENT",
  DOCTOR: "DOCTOR",
  ADMIN: "ADMIN",
} as const;
export type UserRoleType = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const APPOINTMENT_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const;
export type AppointmentStatusType =
  (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS];

export const VALID_APPOINTMENT_STATUSES = Object.values(APPOINTMENT_STATUS);

export const CONSULTATION_TYPE = {
  VIDEO: "VIDEO" as const,
  IN_PERSON: "IN_PERSON" as const,
};
export type ConsultationType =
  (typeof CONSULTATION_TYPE)[keyof typeof CONSULTATION_TYPE];

/**
 * Specialties with alias support.
 * `value` is the canonical DB value.
 * `label` is the display name.
 * `aliases` are alternate role titles (e.g. "Surgeon" maps to "Cardiology").
 * Use `resolveSpecialty()` to normalise any alias to a canonical value.
 */
export interface MedicalSpecialty {
  value: string;
  label: string;
  aliases?: string[];
}

export const MEDICAL_SPECIALTIES: MedicalSpecialty[] = [
  { value: "All", label: "All" },
  {
    value: "CARDIOLOGY",
    label: "Cardiology",
    aliases: ["Cardiologist", "Heart Surgeon"],
  },
  {
    value: "DERMATOLOGY",
    label: "Dermatology",
    aliases: ["Dermatologist", "Skin Specialist"],
  },
  {
    value: "NEUROLOGY",
    label: "Neurology",
    aliases: ["Neurologist", "Brain Specialist"],
  },
  {
    value: "PEDIATRICS",
    label: "Pediatrics",
    aliases: ["Pediatrician", "Child Specialist"],
  },
  {
    value: "ORTHOPEDICS",
    label: "Orthopedics",
    aliases: ["Orthopedic Surgeon", "Bone Specialist"],
  },
  {
    value: "PSYCHIATRY",
    label: "Psychiatry",
    aliases: ["Psychiatrist", "Mental Health Specialist"],
  },
  {
    value: "GENERAL_MEDICINE",
    label: "General Medicine",
    aliases: ["General Physician", "GP"],
  },
];

/** Resolves any display name or alias to the canonical DB specialty value. */
export function resolveSpecialty(nameOrAlias: string): string | undefined {
  const lower = nameOrAlias.toLowerCase();
  return MEDICAL_SPECIALTIES.find(
    (s) =>
      s.value.toLowerCase() === lower ||
      s.label.toLowerCase() === lower ||
      s.aliases?.some((a) => a.toLowerCase() === lower)
  )?.value;
}

/** Time slots grouped by period of day */
export const TIME_SLOTS = {
  morning: [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
  ],
  afternoon: [
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
  ],
  evening: ["04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM"],
} as const;

/** Flat list of quick-book options shown in the patient dashboard */
export const BOOKABLE_SLOTS = [
  "09:00 AM",
  "11:00 AM",
  "02:00 PM",
  "04:00 PM",
] as const;

/**
 * Doctor invitation/account lifecycle states.
 * Mirrors the Prisma DoctorStatus enum — import from here so business logic
 * never contains raw string literals.
 */
export const DOCTOR_STATUS = {
  PENDING: "PENDING",
  INVITED: "INVITED",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;
export type DoctorStatusType = (typeof DOCTOR_STATUS)[keyof typeof DOCTOR_STATUS];

/** Human-readable labels for each DoctorStatus value. */
export const DOCTOR_STATUS_LABELS: Record<DoctorStatusType, string> = {
  PENDING: "Pending Invitation",
  INVITED: "Invitation Sent",
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
};

export const DEFAULT_DOCTOR_PROFILE = {
  specialty: "GENERAL_MEDICINE",
  experience: 1,
  consultationFee: 500,
  hospital: "MediConnect Hospital",
} as const;

// ─── Doctor Availability ─────────────────────────────────────────────────────

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const DAY_KEYS: DayKey[] = [
  "mon", "tue", "wed", "thu", "fri", "sat", "sun",
];

export interface DayAvailability {
  enabled: boolean;
  slots: string[];
}

export type AvailabilitySchedule = Record<DayKey, DayAvailability>;
