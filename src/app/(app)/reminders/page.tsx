import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { RemindersClient } from "./reminders-client"
import type { Reminder } from "./reminders-client"

export default async function RemindersPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/auth/signin")
  }

  const reminders = await prisma.reminder.findMany({
    where: {
      OR: [
        { contact: { userId: session.user.id, isArchived: false } },
        { occasion: { contact: { userId: session.user.id, isArchived: false } } },
      ],
      status: "pending",
    },
    include: {
      contact: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      dueDate: "asc",
    },
  })

  type ReminderWithContact = (typeof reminders)[number]

  // Group by due date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekLater = new Date(today)
  weekLater.setDate(weekLater.getDate() + 7)

  const todayList: ReminderWithContact[] = []
  const thisWeekList: ReminderWithContact[] = []
  const laterList: ReminderWithContact[] = []

  for (const reminder of reminders) {
    const due = new Date(reminder.dueDate)
    due.setHours(0, 0, 0, 0)
    if (due.getTime() === today.getTime()) {
      todayList.push(reminder)
    } else if (due > today && due <= weekLater) {
      thisWeekList.push(reminder)
    } else {
      laterList.push(reminder)
    }
  }

  return (
    <RemindersClient
      today={todayList as Reminder[]}
      thisWeek={thisWeekList as Reminder[]}
      later={laterList as Reminder[]}
    />
  )
}
