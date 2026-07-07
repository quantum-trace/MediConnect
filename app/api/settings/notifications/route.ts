import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { userService } from "@/lib/services/user.service";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await userService.findByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all options
    const options = await prisma.notificationOption.findMany({
      orderBy: { createdAt: "asc" },
    });

    // Get user preferences
    const preferences = await prisma.userNotificationPreference.findMany({
      where: { userId: user.id },
    });

    // Merge them: if user preference doesn't exist, use defaultOn
    const merged = options.map((opt) => {
      const pref = preferences.find((p) => p.optionKey === opt.key);
      return {
        key: opt.key,
        label: opt.alias,
        description: opt.description,
        enabled: pref ? pref.enabled : opt.defaultOn,
      };
    });

    return NextResponse.json(merged);
  } catch (error) {
    console.error("[SETTINGS_NOTIF_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await userService.findByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { key, enabled } = await req.json();

    if (!key || typeof enabled !== "boolean") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Upsert preference
    await prisma.userNotificationPreference.upsert({
      where: {
        userId_optionKey: {
          userId: user.id,
          optionKey: key,
        },
      },
      update: { enabled },
      create: {
        userId: user.id,
        optionKey: key,
        enabled,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SETTINGS_NOTIF_PATCH]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
