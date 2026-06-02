import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { addDays, parseUserDateInput } from "@/lib/date-utils";
import { z } from "zod";

const occasionSchema = z.object({
  type: z.enum(["birthday", "anniversary", "work_anniversary", "milestone", "custom"]),
  name: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  recurring: z.boolean().default(false),
  giftPreference: z.string().optional(),
  reminderDaysBefore: z.number().int().positive().optional().default(7),
}).superRefine((data, ctx) => {
  if (data.type === "custom" && !data.name?.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["name"],
      message: "Custom occasions require a name",
    });
  }
});

// POST /api/contacts/[id]/occasions — Add an occasion for a contact
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
    const validatedData = occasionSchema.parse(body);
    const occasionDate = parseUserDateInput(validatedData.date);

    if (!occasionDate) {
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

    const reminderType =
      validatedData.type === "birthday"
        ? "birthday"
        : validatedData.giftPreference || contact.loveLanguage === "gifts"
          ? "gift"
          : "custom";
    const reminderDueDate = addDays(occasionDate, -validatedData.reminderDaysBefore);

    const occasion = await prisma.$transaction(async (tx) => {
      const createdOccasion = await tx.occasion.create({
        data: {
          contactId: id,
          ...validatedData,
          date: occasionDate,
          name: validatedData.type === "custom" ? validatedData.name?.trim() : undefined,
        },
      });

      await tx.reminder.create({
        data: {
          contactId: id,
          occasionId: createdOccasion.id,
          type: reminderType,
          dueDate: reminderDueDate,
          actionSuggestion: buildOccasionReminderSuggestion(contact.name, validatedData),
          status: "pending",
        },
      });

      return createdOccasion;
    });

    return NextResponse.json(occasion, { status: 201 });
  } catch (error) {
    console.error("Error creating occasion:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create occasion" },
      { status: 500 }
    );
  }
}

// GET /api/contacts/[id]/occasions — List occasions for a contact
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

    const occasions = await prisma.occasion.findMany({
      where: {
        contactId: id,
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(occasions, { status: 200 });
  } catch (error) {
    console.error("Error fetching occasions:", error);
    return NextResponse.json(
      { error: "Failed to fetch occasions" },
      { status: 500 }
    );
  }
}

function buildOccasionReminderSuggestion(
  contactName: string,
  occasion: z.infer<typeof occasionSchema>
) {
  const label = occasion.type === "custom" ? occasion.name : occasion.type.replace("_", " ");
  const gift = occasion.giftPreference?.trim();

  if (gift) {
    return `Prepare for ${contactName}'s ${label}. Gift idea: ${gift}`;
  }

  return `Reach out to ${contactName} for their ${label}.`;
}
