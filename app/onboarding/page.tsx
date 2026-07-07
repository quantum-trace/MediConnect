import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { userService } from "@/lib/services/user.service";

/**
 * Onboarding is now a fallback-only page visited only when auth/redirect
 * couldn't auto-create the user (edge case: DB write failed mid-flight).
 * Patients are auto-created directly in auth/redirect and land on /dashboard.
 * Doctors are invited by admin and never reach this page.
 *
 * Any user who somehow has a complete role in DB gets immediately redirected.
 */
export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const user = await userService.findByClerkId(userId);

  if (user?.role === "PATIENT") redirect("/dashboard");
  if (user?.role === "DOCTOR") redirect("/doctor");
  if (user?.role === "ADMIN") redirect("/admin");

  // Rare edge case: user authenticated but DB record missing.
  // Redirect to auth/redirect which will auto-create the record.
  redirect("/auth/redirect");
}
