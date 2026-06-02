import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getNextOccasionDate, startOfDay } from "@/lib/date-utils"
import { OccasionsClient } from "./occasions-client"

export default async function OccasionsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const { filter } = await searchParams
  const now = startOfDay(new Date())

  // Build date range based on filter
  let maxDate: Date
  if (filter === "90") {
    maxDate = new Date(now)
    maxDate.setDate(maxDate.getDate() + 90)
  } else if (filter === "all") {
    maxDate = new Date(now.getTime() + 10 * 365 * 24 * 60 * 60 * 1000) // 10 years
  } else {
    // Default: 30 days
    maxDate = new Date(now)
    maxDate.setDate(maxDate.getDate() + 30)
  }

  const rawOccasions = await prisma.occasion.findMany({
    where: {
      contact: {
        userId: session.user.id,
        isArchived: false,
      },
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
      date: "asc",
    },
  })

  const occasions = rawOccasions
    .map((occasion) => ({
      ...occasion,
      date: getNextOccasionDate(occasion.date, occasion.recurring),
    }))
    .filter((occasion) => occasion.date >= now && occasion.date <= maxDate)
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  // Group by month
  const grouped: Record<string, typeof occasions> = {}
  for (const occasion of occasions) {
    const monthKey = occasion.date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
    if (!grouped[monthKey]) {
      grouped[monthKey] = []
    }
    grouped[monthKey].push(occasion)
  }

  return <OccasionsClient grouped={grouped} filter={filter || "30"} />
}
