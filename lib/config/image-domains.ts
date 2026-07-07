import type { RemotePattern } from "next/dist/shared/lib/image-config";

/**
 * Allowed external image sources for next/image.
 *
 * Each entry is a RemotePattern — protocol, hostname, and optional pathname
 * are all validated at build time. Add new sources here; never inline hostnames
 * in next.config.ts or component code.
 *
 * Clerk notes:
 *  - img.clerk.com  → Clerk's primary CDN (current)
 *  - images.clerk.dev → Clerk's legacy CDN (still used in some regions)
 *  - lh3.googleusercontent.com → Google OAuth profile pictures
 *  - avatars.githubusercontent.com → GitHub OAuth profile pictures
 */
export const ALLOWED_IMAGE_REMOTE_PATTERNS: RemotePattern[] = [
  // ── Unsplash (placeholder / seed images) ─────────────────────────────────
  {
    protocol: "https",
    hostname: "images.unsplash.com",
    pathname: "/**",
  },

  // ── Clerk CDN (primary) ───────────────────────────────────────────────────
  {
    protocol: "https",
    hostname: "img.clerk.com",
    pathname: "/**",
  },

  // ── Clerk CDN (legacy) ────────────────────────────────────────────────────
  {
    protocol: "https",
    hostname: "images.clerk.dev",
    pathname: "/**",
  },

  // ── Google OAuth avatars (served via Clerk when user signs in with Google) ─
  {
    protocol: "https",
    hostname: "lh3.googleusercontent.com",
    pathname: "/**",
  },

  // ── GitHub OAuth avatars (served via Clerk when user signs in with GitHub) ─
  {
    protocol: "https",
    hostname: "avatars.githubusercontent.com",
    pathname: "/**",
  },
];
