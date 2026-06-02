import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { computeHealthScore } from "@/lib/health-score"
import { addDays, getNextOccasionDate, startOfDay } from "@/lib/date-utils"

// GET /api/dashboard/stats — Dashboard summary data
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Parallel queries
    const [contacts, reminders, recentInteractions] = await Promise.all([
      // All contacts with health scores
      prisma.contact.findMany({
        where: { userId, isArchived: false },
        include: { occasions: true },
        orderBy: { updatedAt: "desc" },
      }),

      // Today's pending reminders (limit 5)
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
        take: 5,
      }),

      // Recent interactions (last 5)
      prisma.interaction.findMany({
        where: {
          contact: { userId, isArchived: false },
        },
        include: {
          contact: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { date: "desc" },
        take: 5,
      }),
    ])

    // Compute health scores
    const contactsWithHealth = contacts.map((contact) => ({
      ...contact,
      healthScore: computeHealthScore(contact),
    }))

    // Stats
    const totalContacts = contactsWithHealth.length
    const healthyCount = contactsWithHealth.filter((c) => (c.healthScore || 0) >= 70).length
    const needsAttentionCount = contactsWithHealth.filter((c) => (c.healthScore || 0) < 40).length

    // Upcoming occasions (next 14 days)
    const today = startOfDay(new Date())
    const tomorrow = addDays(today, 1)
    const fourteenDaysFromNow = addDays(today, 14)
    const upcomingOccasions: Array<{
      id: string
      contactId: string
      contactName: string
      type: string
      date: Date
      daysAway: number
    }> = []

    for (const contact of contactsWithHealth) {
      for (const occasion of contact.occasions) {
        const occDate = getNextOccasionDate(occasion.date, occasion.recurring)

        if (occDate >= today && occDate <= fourteenDaysFromNow) {
          const daysAway = Math.ceil((startOfDay(occDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          upcomingOccasions.push({
            id: occasion.id,
            contactId: contact.id,
            contactName: contact.name,
            type: occasion.type,
            date: occDate,
            daysAway,
          })
        }
      }
    }

    // Sort by days away
    upcomingOccasions.sort((a, b) => a.daysAway - b.daysAway)

    return NextResponse.json({
      totalContacts,
      healthyCount,
      needsAttentionCount,
      contacts: contactsWithHealth.slice(0, 50), // Limit for heat grid
      todayReminders: reminders.filter((r) => {
        const due = new Date(r.dueDate)
        return due >= today && due < tomorrow
      }),
      upcomingOccasions: upcomingOccasions.slice(0, 10),
      recentInteractions,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}
