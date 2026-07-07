import type { IVideoProvider, VideoRoom } from "./types";

const DAILY_API_BASE = "https://api.daily.co/v1";

export class DailyVideoProvider implements IVideoProvider {
  constructor(private readonly apiKey: string) {}

  async createRoom(name: string, expiresAt?: Date): Promise<VideoRoom> {
    const body: Record<string, unknown> = { name };
    if (expiresAt) {
      body.properties = { exp: Math.floor(expiresAt.getTime() / 1000) };
    }

    const res = await fetch(`${DAILY_API_BASE}/rooms`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        `Daily.co room creation failed: ${(err as { error?: string }).error ?? res.statusText}`
      );
    }

    const data = (await res.json()) as { name: string; url: string };
    return { roomName: data.name, roomUrl: data.url, expiresAt };
  }

  async deleteRoom(roomName: string): Promise<void> {
    await fetch(`${DAILY_API_BASE}/rooms/${roomName}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
  }
}
