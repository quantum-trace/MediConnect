import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { USER_ROLE } from "@/lib/constants";
import { Role } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: adminClerkId } = await auth();
    if (!adminClerkId) return new NextResponse("Unauthorized", { status: 401 });

    const admin = await prisma.user.findUnique({ where: { clerkId: adminClerkId } });
    if (!admin || admin.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { role } = await req.json();
    const { userId } = await params;

    if (!Object.values(USER_ROLE).includes(role)) {
      return new NextResponse("Invalid role", { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) return new NextResponse("User not found", { status: 404 });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role as Role },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[USER_ROLE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
