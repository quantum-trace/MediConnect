import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { userService } from "@/lib/services/user.service";
import { notificationService } from "@/lib/services/notification.service";

export async function PATCH() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await userService.findByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await notificationService.markAllAsRead(user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[NOTIFICATIONS_READ_ALL]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
