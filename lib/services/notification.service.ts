import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

export const notificationService = {
  async getUserNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async markAsRead(id: string, userId: string) {
    return prisma.notification.update({
      where: { id, userId },
      data: { read: true },
    });
  },

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  },

  async deleteNotification(id: string, userId: string) {
    return prisma.notification.delete({
      where: { id, userId },
    });
  },

  async deleteAllNotifications(userId: string) {
    return prisma.notification.deleteMany({
      where: { userId },
    });
  },

  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    appointmentId?: string;
  }) {
    return prisma.notification.create({
      data,
    });
  },
};
