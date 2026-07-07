import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { userService } from "@/lib/services/user.service";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingUser = await userService.findByClerkId(userId);
    if (existingUser) {
      return NextResponse.json(existingUser);
    }

    const newUser = await userService.create({
      clerkId: userId,
      email: clerkUser.emailAddresses[0].emailAddress,
      name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
      imageUrl: clerkUser.imageUrl,
    });

    return NextResponse.json(newUser);
  } catch (error) {
    console.error("CREATE USER ERROR:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
