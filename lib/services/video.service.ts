import { getVideoProvider } from "@/lib/video";
import { prisma } from "@/lib/prisma";
import type { VideoRoom } from "@/lib/video/types";

const ROOM_EXPIRY_HOURS = 2;

export const videoService = {
  /**
   * Idempotent — returns the existing room if one is already stored,
   * otherwise creates a new one. Safe to call multiple times (e.g. on
   * retry after a previous partial failure).
   */
  async ensureRoomForAppointment(
    appointmentId: string,
    appointmentDate: Date
  ): Promise<VideoRoom> {
    const existing = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { videoRoomUrl: true, videoRoomName: true },
    });

    if (existing?.videoRoomUrl && existing?.videoRoomName) {
      console.info(`[VIDEO] Room already exists for appointment ${appointmentId}`);
      return {
        roomName: existing.videoRoomName,
        roomUrl: existing.videoRoomUrl,
      };
    }

    return videoService.createRoomForAppointment(appointmentId, appointmentDate);
  },

  /**
   * Always creates a fresh room and persists it to the DB.
   * Prefer ensureRoomForAppointment to avoid duplicate creation.
   */
  async createRoomForAppointment(
    appointmentId: string,
    appointmentDate: Date
  ): Promise<VideoRoom> {
    const provider = getVideoProvider();
    const roomName = `mediconnect-${appointmentId}`;
    const expiresAt = new Date(
      appointmentDate.getTime() + ROOM_EXPIRY_HOURS * 60 * 60 * 1000
    );

    console.info(`[VIDEO] Creating room "${roomName}" for appointment ${appointmentId}`);

    const room = await provider.createRoom(roomName, expiresAt);

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { videoRoomUrl: room.roomUrl, videoRoomName: room.roomName },
    });

    console.info(`[VIDEO] Room provisioned: ${room.roomUrl}`);
    return room;
  },

  async deleteRoomForAppointment(appointmentId: string): Promise<void> {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { videoRoomName: true },
    });
    if (!appointment?.videoRoomName) return;

    const provider = getVideoProvider();
    await provider.deleteRoom(appointment.videoRoomName);

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { videoRoomUrl: null, videoRoomName: null },
    });

    console.info(`[VIDEO] Room deleted for appointment ${appointmentId}`);
  },
};
