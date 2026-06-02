import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { z } from "zod"

const reminderStatusSchema = z.enum(["pending", "done", "snoozed", "dismissed"])

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") // "pending", "done", "snoozed"

  const parsedStatus = status ? reminderStatusSchema.safeParse(status) : null
  if (parsedStatus && !parsedStatus.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const where: Prisma.ReminderWhereInput = {
    OR: [
      { contact: { userId: session.user.id, isArchived: false } },
      { occasion: { contact: { userId: session.user.id, isArchived: false } } },
    ],
  }
  if (parsedStatus?.success) {
    where.status = parsedStatus.data
  }

  const reminders = await prisma.reminder.findMany({
    where,
    include: {
      contact: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      occasion: {
        include: {
          contact: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
    },
    orderBy: {
      dueDate: "asc",
    },
  })

  return NextResponse.json(reminders)
}
