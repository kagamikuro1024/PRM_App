import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { computeHealthScore } from "@/lib/health-score"
import { addDays, getNextOccasionDate, startOfDay } from "@/lib/date-utils"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const userId = session.user.id

  const [contacts, reminders, recentInteractions] = await Promise.all([
    prisma.contact.findMany({
      where: { userId, isArchived: false },
      include: { occasions: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.reminder.findMany({
      where: {
        OR: [
          { contact: { userId, isArchived: false } },
          { occasion: { contact: { userId, isArchived: false } } },
        ],
        status: "pending",
      },
      include: {
        contact: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
    prisma.interaction.findMany({
      where: { contact: { userId, isArchived: false } },
      include: {
        contact: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { date: "desc" },
      take: 5,
    }),
  ])

  const contactsWithHealth = contacts.map((contact) => ({
    ...contact,
    healthScore: computeHealthScore(contact),
  }))

  const today = startOfDay(new Date())
  const tomorrow = addDays(today, 1)
  const fourteenDaysFromNow = addDays(today, 14)

  const upcomingOccasions = contactsWithHealth
    .flatMap((contact) =>
      contact.occasions.map((occasion) => {
        const nextDate = getNextOccasionDate(occasion.date, occasion.recurring)
        return {
          id: occasion.id,
          contactId: contact.id,
          contactName: contact.name,
          type: occasion.type,
          date: nextDate,
          daysAway: Math.ceil(
            (startOfDay(nextDate).getTime() - today.getTime()) /
              (1000 * 60 * 60 * 24)
          ),
        }
      })
    )
    .filter((occasion) => occasion.date >= today && occasion.date <= fourteenDaysFromNow)
    .sort((a, b) => a.daysAway - b.daysAway)
    .slice(0, 10)

  return (
    <DashboardClient
      totalContacts={contactsWithHealth.length}
      healthyCount={contactsWithHealth.filter((c) => (c.healthScore || 0) >= 70).length}
      needsAttentionCount={contactsWithHealth.filter((c) => (c.healthScore || 0) < 40).length}
      contacts={contactsWithHealth.slice(0, 50)}
      todayReminders={reminders.filter((reminder) => {
        const due = new Date(reminder.dueDate)
        return due >= today && due < tomorrow
      })}
      upcomingOccasions={upcomingOccasions}
      recentInteractions={recentInteractions}
    />
  )
}
