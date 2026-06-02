import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { addDays, parseUserDateInput } from "@/lib/date-utils"
import { Prisma } from "@prisma/client"
import { z } from "zod"

const reminderUpdateSchema = z.object({
  status: z.enum(["pending", "done", "snoozed", "dismissed"]).optional(),
  dueDate: z.string().optional(),
}).refine((data) => data.status || data.dueDate, {
  message: "status or dueDate is required",
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const body = await req.json()
  const parsedBody = reminderUpdateSchema.safeParse(body)

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: parsedBody.error.issues[0]?.message || "Invalid reminder update" },
      { status: 400 }
    )
  }

  const { status, dueDate } = parsedBody.data

  // Verify reminder belongs to user's contact
  const reminder = await prisma.reminder.findFirst({
    where: {
      id,
      OR: [
        { contact: { userId: session.user.id, isArchived: false } },
        { occasion: { contact: { userId: session.user.id, isArchived: false } } },
      ],
    },
    include: {
      contact: true,
      occasion: {
        include: {
          contact: true,
        },
      },
    },
  })

  if (!reminder) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (status === "snoozed" || (dueDate && !status)) {
    const nextDueDate = dueDate ? parseUserDateInput(dueDate) : addDays(new Date(), 3)

    if (!nextDueDate) {
      return NextResponse.json({ error: "Invalid dueDate" }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.reminder.update({
        where: { id },
        data: { status: "snoozed" },
        include: { contact: true },
      })

      const replacement = await tx.reminder.create({
        data: {
          contactId: reminder.contactId ?? reminder.occasion?.contactId,
          occasionId: reminder.occasionId,
          type: reminder.type,
          dueDate: nextDueDate,
          actionSuggestion: reminder.actionSuggestion,
          status: "pending",
        },
        include: { contact: true },
      })

      return { reminder: updated, replacementReminder: replacement }
    })

    return NextResponse.json(result)
  }

  const updateData: Prisma.ReminderUpdateInput = {}
  if (status) updateData.status = status
  if (dueDate) {
    const parsedDueDate = parseUserDateInput(dueDate)
    if (!parsedDueDate) {
      return NextResponse.json({ error: "Invalid dueDate" }, { status: 400 })
    }
    updateData.dueDate = parsedDueDate
  }

  const updated = await prisma.reminder.update({
    where: { id },
    data: updateData,
    include: { contact: true },
  })

  return NextResponse.json(updated)
}
