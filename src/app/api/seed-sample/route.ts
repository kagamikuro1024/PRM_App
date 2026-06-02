import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { seedUserData } from "@/lib/user-seed";

/**
 * API endpoint to manually trigger seeding sample data for the current user
 * POST /api/seed-sample
 * Requires authentication
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await seedUserData(session.user.id);

    return NextResponse.json({
      message: "Sample data seeded successfully",
      userId: session.user.id,
    });
  } catch (error) {
    console.error("Seed sample error:", error);
    return NextResponse.json(
      { error: "Failed to seed sample data" },
      { status: 500 }
    );
  }
}
