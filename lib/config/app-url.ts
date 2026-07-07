/**
 * Resolves the canonical base URL for the application.
 *
 * Resolution order (first match wins):
 *  1. NEXT_PUBLIC_APP_URL  — explicit override; set this in Vercel environment
 *                            variables for production (and in .env.local for dev)
 *  2. VERCEL_URL           — auto-injected by Vercel for every deployment;
 *                            represents the deployment URL (not necessarily the
 *                            custom domain), so prefer NEXT_PUBLIC_APP_URL for
 *                            stable production links
 *  3. http://localhost:3000 — local development fallback
 *
 * Trailing slashes are stripped so callers can safely append paths:
 *   `${getBaseUrl()}/auth/redirect`
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  // VERCEL_URL is a server-side-only env var (no NEXT_PUBLIC_ prefix needed
  // here because invitation.service.ts is server-only code).
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}
