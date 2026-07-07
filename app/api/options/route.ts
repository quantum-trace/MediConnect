import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type SeedRow = { category: string; key: string; value: string };

const CATEGORY_SEEDS: Record<string, SeedRow[]> = {
  GENDER: [
    { category: "GENDER", key: "GENDER_MALE",           value: "Male" },
    { category: "GENDER", key: "GENDER_FEMALE",         value: "Female" },
    { category: "GENDER", key: "GENDER_OTHER",          value: "Other" },
    { category: "GENDER", key: "GENDER_PREFER_NOT_SAY", value: "Prefer not to say" },
  ],
  SPECIALTY: [
    { category: "SPECIALTY", key: "CARDIOLOGY",       value: "Cardiology" },
    { category: "SPECIALTY", key: "DERMATOLOGY",      value: "Dermatology" },
    { category: "SPECIALTY", key: "NEUROLOGY",        value: "Neurology" },
    { category: "SPECIALTY", key: "PEDIATRICS",       value: "Pediatrics" },
    { category: "SPECIALTY", key: "ORTHOPEDICS",      value: "Orthopedics" },
    { category: "SPECIALTY", key: "PSYCHIATRY",       value: "Psychiatry" },
    { category: "SPECIALTY", key: "GENERAL_MEDICINE", value: "General Medicine" },
  ],
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    let options = await prisma.systemOption.findMany({
      where: { category },
      orderBy: { value: "asc" }
    });

    if (options.length === 0) {
      const seeds = CATEGORY_SEEDS[category];
      if (seeds) {
        await prisma.systemOption.createMany({ data: seeds });
        options = await prisma.systemOption.findMany({
          where: { category },
          orderBy: { value: "asc" },
        });
      }
    }

    return NextResponse.json(options);
  } catch (error) {
    console.error("GET OPTIONS ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
