import type { IVideoProvider, VideoRoom } from "./types";

// Public Jitsi Meet instance — no API key required.
// Rooms are created implicitly when the first participant joins the URL.
const JITSI_BASE_URL = "https://meet.jit.si";

export class JitsiVideoProvider implements IVideoProvider {
  async createRoom(name: string, expiresAt?: Date): Promise<VideoRoom> {
    // Sanitise the room name: only alphanumerics, hyphens, underscores.
    const sanitized = name.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 64);
    return {
      roomName: sanitized,
      roomUrl: `${JITSI_BASE_URL}/${sanitized}`,
      expiresAt,
    };
  }

  async deleteRoom(): Promise<void> {
    // Jitsi rooms are ephemeral — they close automatically once all
    // participants leave. No API call is needed or available.
  }
}
