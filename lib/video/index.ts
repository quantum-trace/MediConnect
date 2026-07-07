import { DailyVideoProvider } from "./daily.provider";
import { JitsiVideoProvider } from "./jitsi.provider";
import type { IVideoProvider } from "./types";

let _provider: IVideoProvider | null = null;

/**
 * Returns the active video provider singleton.
 *
 * Selection order:
 *  1. Daily.co  — when DAILY_API_KEY is set (preferred for production; rooms
 *                  are private and time-limited)
 *  2. Jitsi Meet — automatic fallback when no key is configured (free, no
 *                  credentials required; rooms are public but the URL is
 *                  derived from the opaque appointment ID so it is effectively
 *                  unguessable)
 *
 * Both providers implement IVideoProvider, so callers are unaware of which
 * one is active (Dependency-Inversion / Liskov-Substitution).
 */
export function getVideoProvider(): IVideoProvider {
  if (!_provider) {
    const apiKey = process.env.DAILY_API_KEY;
    if (apiKey) {
      console.info("[VIDEO] Using Daily.co provider");
      _provider = new DailyVideoProvider(apiKey);
    } else {
      console.info("[VIDEO] DAILY_API_KEY not set — falling back to Jitsi Meet provider");
      _provider = new JitsiVideoProvider();
    }
  }
  return _provider;
}

export type { IVideoProvider, VideoRoom } from "./types";
