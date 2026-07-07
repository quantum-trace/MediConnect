import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { userService } from "@/lib/services/user.service";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await userService.findByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let profile = await prisma.patientProfile.findUnique({
      where: { userId: user.id }
    });

    if (!profile) {
      profile = await prisma.patientProfile.create({
        data: { userId: user.id }
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("GET PATIENT PROFILE ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await userService.findByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { age, gender, phone, address, bloodType } = body;

    const profile = await prisma.patientProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        age: age ? parseInt(age) : null,
        gender,
        phone,
        address,
        bloodType
      },
      update: {
        age: age ? parseInt(age) : null,
        gender,
        phone,
        address,
        bloodType
      }
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("UPDATE PATIENT PROFILE ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
