import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { seedUserData } from "@/lib/user-seed";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

/**
 * GET /api/seed-sample
 * Force re-seed: Clears existing contacts for the user and seeds the 20 detailed mock contacts,
 * then redirects to the dashboard.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Delete existing contacts to allow the seed function to run
    await prisma.contact.deleteMany({
      where: { userId },
    });

    // Run the updated seed with 20 contacts
    await seedUserData(userId);

    // Redirect directly to the dashboard so they see the fresh data
    return redirect("/dashboard");
  } catch (error) {
    console.error("Force seed error:", error);
    return NextResponse.json(
      { error: "Failed to force seed sample data" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/seed-sample
 * Manually trigger seeding (only runs if the user has 0 contacts)
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
