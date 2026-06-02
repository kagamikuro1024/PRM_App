import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Category } from "@prisma/client";
import type { Prisma } from '@prisma/client';
import { createContactSchema, normalizeContactPayload } from "@/lib/validations";
import { computeHealthScore } from "@/lib/health-score";
import { z } from "zod";

const categories = Object.values(Category);

function parsePositiveInt(value: string | null, fallback?: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

// GET /api/contacts — List all contacts for the logged-in user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const healthBelow = searchParams.get("healthBelow");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    // Build where clause
    const where: Prisma.ContactWhereInput = {
      userId: session.user.id,
      isArchived: false,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search] } },
      ];
    }

    if (category && category !== "all") {
      if (!categories.includes(category as Category)) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
      }
      where.category = category as Category
    }

    const take = parsePositiveInt(limit);
    const skip = parsePositiveInt(offset);

    // Fetch contacts with optional occasions for health score
    const contacts = await prisma.contact.findMany({
      where,
      include: {
        occasions: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      ...(take !== undefined && { take: Math.min(take, 100) }),
      ...(skip !== undefined && { skip }),
    });

    // Compute health score for each contact
    const contactsWithHealth = contacts.map((contact) => ({
      ...contact,
      healthScore: computeHealthScore(contact),
    }));

    // Filter by healthBelow if provided
    let filteredContacts = contactsWithHealth;
    if (healthBelow) {
      const threshold = parseFloat(healthBelow);
      if (!Number.isFinite(threshold)) {
        return NextResponse.json({ error: "Invalid healthBelow" }, { status: 400 });
      }
      filteredContacts = contactsWithHealth.filter(
        (c) => (c.healthScore || 0) < threshold
      );
    }

    return NextResponse.json(filteredContacts, { status: 200 });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

// POST /api/contacts — Create a new contact
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = createContactSchema.parse({
      ...body,
      userId: session.user.id,
    });

    const contact = await prisma.contact.create({
      data: normalizeContactPayload(validatedData),
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("Error creating contact:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid contact data" },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}
