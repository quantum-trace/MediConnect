import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { USER_ROLE } from "@/lib/constants";

export const userService = {
  async findByClerkId(clerkId: string) {
    return prisma.user.findUnique({ where: { clerkId } });
  },

  /** Upsert without changing role (used during appointment booking). */
  async upsertBasic(data: {
    clerkId: string;
    email: string;
    name: string;
    imageUrl: string;
  }) {
    return prisma.user.upsert({
      where: { clerkId: data.clerkId },
      update: {},
      create: { ...data, role: USER_ROLE.PATIENT as Role },
    });
  },

  /** Upsert and explicitly set role (used during onboarding). */
  async upsertWithRole(data: {
    clerkId: string;
    email: string;
    name: string;
    imageUrl: string;
    role: Role;
  }) {
    return prisma.user.upsert({
      where: { clerkId: data.clerkId },
      update: { role: data.role },
      create: data,
    });
  },

  async create(data: {
    clerkId: string;
    email: string;
    name: string;
    imageUrl: string;
  }) {
    return prisma.user.create({
      data: { ...data, role: USER_ROLE.PATIENT as Role },
    });
  },
};
