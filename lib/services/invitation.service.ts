import { clerkClient } from "@clerk/nextjs/server";
import { getBaseUrl } from "@/lib/config/app-url";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DoctorInvitationPayload {
  email: string;
  doctorId: string;
  doctorName: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const invitationService = {
  /**
   * Sends (or resends) a Clerk invitation to a doctor.
   *
   * Using ignoreExisting=true means calling this again for the same email
   * revokes the old invitation link and issues a fresh one — safe for
   * both "Send" and "Resend" UI actions.
   *
   * publicMetadata.doctorId is stored on the invitation for audit trails
   * and future webhook support (e.g. user.created webhook can read it to
   * set user publicMetadata automatically).
   */
  async sendDoctorInvitation({
    email,
    doctorId,
    doctorName,
  }: DoctorInvitationPayload): Promise<void> {
    const client = await clerkClient();
    await client.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: `${getBaseUrl()}/auth/redirect`,
      publicMetadata: {
        role: "DOCTOR",
        doctorId,
        doctorName,
      },
      ignoreExisting: true,
    });
  },

  async sendAdminInvitation({ email, name }: { email: string; name: string }): Promise<void> {
    const client = await clerkClient();
    await client.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: `${getBaseUrl()}/auth/redirect`,
      publicMetadata: {
        role: "ADMIN",
        adminName: name,
      },
      ignoreExisting: true,
    });
  },
};
