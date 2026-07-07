/**
 * Serialized shape of a doctor row returned by the admin API endpoints.
 * Dates are strings (ISO 8601) because they are JSON-serialized by the time
 * the frontend receives them. This is the single source of truth for the
 * admin doctor data contract — both the list (GET) and create (POST) responses
 * must conform to this shape.
 */
export interface AdminDoctorRow {
  id: string;
  name: string;
  email: string;
  specialty: string;
  experience: number;
  consultationFee: number;
  hospital: string;
  imageUrl: string;
  available: boolean;
  isApproved: boolean;
  status: string;
  licenseNumber: string | null;
  createdAt: string;
  _count: { appointments: number; prescriptions: number };
}
