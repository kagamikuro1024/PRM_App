import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { parseUserDateInput } from "@/lib/date-utils";
import { z } from "zod";

const interactionSchema = z.object({
  channel: z.enum(["in_person", "call", "message", "email", "social"]),
  date: z.string().min(1, "Date is required"),
  summary: z.string().optional(),
  mood: z.enum(["positive", "neutral", "negative"]).optional(),
  followUps: z.array(z.string()).optional().default([]),
});

// POST /api/contacts/[id]/interactions — Log a new interaction
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validatedData = interactionSchema.parse(body);
    const interactionDate = parseUserDateInput(validatedData.date);

    if (!interactionDate) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    // Check if contact exists and belongs to user
    const contact = await prisma.contact.findFirst({
      where: {
        id,
        userId: session.user.id,
        isArchived: false,
      },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Create interaction
    const interaction = await prisma.interaction.create({
      data: {
        contactId: id,
        ...validatedData,
        date: interactionDate,
      },
    });

    if (!contact.lastContactAt || interactionDate > contact.lastContactAt) {
      await prisma.contact.update({
        where: { id },
        data: { lastContactAt: interactionDate },
      });
    }

    return NextResponse.json(interaction, { status: 201 });
  } catch (error) {
    console.error("Error creating interaction:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create interaction" },
      { status: 500 }
    );
  }
}

// GET /api/contacts/[id]/interactions — List interactions for a contact
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if contact exists and belongs to user
    const contact = await prisma.contact.findFirst({
      where: {
        id,
        userId: session.user.id,
        isArchived: false,
      },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const interactions = await prisma.interaction.findMany({
      where: {
        contactId: id,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(interactions, { status: 200 });
  } catch (error) {
    console.error("Error fetching interactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch interactions" },
      { status: 500 }
    );
  }
}
