import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { userService } from "@/lib/services/user.service";
import { notificationService } from "@/lib/services/notification.service";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await userService.findByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    await notificationService.deleteNotification(id, user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[NOTIFICATIONS_DELETE_ONE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
