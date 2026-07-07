import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { USER_ROLE } from "@/lib/constants";
import { userService } from "@/lib/services/user.service";
import { doctorService } from "@/lib/services/doctor.service";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { role } = await req.json();

    if (!Object.values(USER_ROLE).includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const user = await userService.upsertWithRole({
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      name: clerkUser.fullName || "User",
      imageUrl: clerkUser.imageUrl,
      role,
    });

    if (role === USER_ROLE.DOCTOR) {
      await doctorService.upsert(userId, {
        name: clerkUser.fullName || "Doctor",
        imageUrl: clerkUser.imageUrl,
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("ONBOARDING ERROR:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
