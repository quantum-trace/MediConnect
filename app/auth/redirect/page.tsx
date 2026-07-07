import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { userService } from "@/lib/services/user.service";
import { doctorService } from "@/lib/services/doctor.service";
import { DOCTOR_STATUS, USER_ROLE } from "@/lib/constants";
import { Role } from "@prisma/client";

/**
 * Central auth redirect page — determines where every signed-in user lands.
 *
 * Three cases on first visit (no DB user yet):
 *   1. Email matches an INVITED Doctor → activate doctor account → /doctor
 *   2. No match → auto-create as PATIENT → /dashboard
 *
 * On subsequent visits (DB user exists):
 *   → redirect based on stored role
 *
 * This server-side check is the **actual security gate** for doctor access.
 * Removing the self-registration UI alone would not be sufficient.
 */
export default async function AuthRedirectPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  // ── Returning user: fast path ────────────────────────────────────────────
  const existingUser = await userService.findByClerkId(userId);
  if (existingUser) {
    switch (existingUser.role) {
      case USER_ROLE.ADMIN:
        redirect("/admin");
      case USER_ROLE.DOCTOR:
        redirect("/doctor");
      default:
        redirect("/dashboard");
    }
  }

  // ── New user: determine role from invitation OR default to PATIENT ────────
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/");

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const name =
    clerkUser.fullName?.trim() ||
    `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
    "User";

  // Check if this was an Admin invitation (via Clerk publicMetadata)
  if (clerkUser.publicMetadata.role === USER_ROLE.ADMIN) {
    await userService.upsertWithRole({
      clerkId: userId,
      email,
      name,
      imageUrl: clerkUser.imageUrl,
      role: USER_ROLE.ADMIN as Role,
    });
    redirect("/admin");
  }

  // Check if this email was invited as a doctor (only INVITED status qualifies)
  const invitedDoctor = email
    ? await doctorService.findByEmail(email)
    : null;

  const isInvitedDoctor =
    invitedDoctor?.status === DOCTOR_STATUS.INVITED;

  if (isInvitedDoctor && invitedDoctor) {
    // Link the Clerk account to the doctor profile and activate it
    await doctorService.linkClerkAccount(invitedDoctor.id, userId);

    // Create the User record with DOCTOR role
    await userService.upsertWithRole({
      clerkId: userId,
      email,
      name,
      imageUrl: clerkUser.imageUrl,
      role: USER_ROLE.DOCTOR as Role,
    });

    redirect("/doctor");
  }

  // Default: create as PATIENT — no onboarding step needed
  await userService.upsertWithRole({
    clerkId: userId,
    email,
    name,
    imageUrl: clerkUser.imageUrl,
    role: USER_ROLE.PATIENT as Role,
  });

  redirect("/dashboard");
}
