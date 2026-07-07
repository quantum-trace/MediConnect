import { NextResponse } from "next/server";

/**
 * GET /api/reviews?doctorId=...
 *
 * Returns reviews for a given doctor.
 * Currently returns an empty array until a Review model is added to the Prisma
 * schema. The reviews-section component renders an empty state when no data
 * is returned, so the booking page degrades gracefully.
 *
 * When implementing real reviews:
 *  1. Add a Review model to prisma/schema.prisma
 *  2. Create lib/services/review.service.ts
 *  3. Replace the stub below with reviewService.findByDoctor(doctorId)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const doctorId = searchParams.get("doctorId");

  if (!doctorId) {
    return NextResponse.json(
      { error: "doctorId query param is required" },
      { status: 400 }
    );
  }

  return NextResponse.json([]);
}
