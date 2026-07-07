import type { AvailabilitySchedule } from "@/lib/constants";

export interface BookingDoctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  consultationFee: number;
  hospital: string;
  imageUrl: string;
  available: boolean;
  isApproved: boolean;
  status: string;
  availability: AvailabilitySchedule | null;
}

export interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  reason: string;
}
