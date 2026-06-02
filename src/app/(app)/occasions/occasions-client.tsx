"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Gift } from "lucide-react"
import Link from "next/link"
import { format, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"

interface Occasion {
  id: string
  contactId: string
  contact: {
    id: string
    name: string
    avatar: string | null
  }
  type: string
  date: Date
  giftPreference: string | null
}

interface OccasionsClientProps {
  grouped: Record<string, Occasion[]>
  filter: string
}

const occasionIcons: Record<string, string> = {
  birthday: "🎂",
  anniversary: "💍",
  work_anniversary: "💼",
  milestone: "🎯",
  custom: "📌",
}

const occasionColors: Record<string, string> = {
  birthday: "bg-pink-100 text-pink-800",
  anniversary: "bg-red-100 text-red-800",
  work_anniversary: "bg-blue-100 text-blue-800",
  milestone: "bg-purple-100 text-purple-800",
  custom: "bg-gray-100 text-gray-800",
}

export function OccasionsClient({ grouped, filter }: OccasionsClientProps) {
  const isUpcomingSoon = (date: Date) => {
    const days = differenceInDays(date, new Date())
    return days >= 0 && days <= 7
  }

  const monthOrder = Object.keys(grouped).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime()
  })

  const totalOccasions = Object.values(grouped).reduce((sum, list) => sum + list.length, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Occasions</h1>
          <p className="text-gray-600">
            {totalOccasions} upcoming {totalOccasions === 1 ? "occasion" : "occasions"}
            {filter === "30" ? " (next 30 days)" : filter === "90" ? " (next 90 days)" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/occasions?filter=30"
            className={cn(
              "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 px-3 py-1",
              filter === "30"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            )}
          >
            30 days
          </Link>
          <Link
            href="/occasions?filter=90"
            className={cn(
              "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 px-3 py-1",
              filter === "90"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            )}
          >
            90 days
          </Link>
          <Link
            href="/occasions?filter=all"
            className={cn(
              "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 px-3 py-1",
              filter === "all"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            )}
          >
            All
          </Link>
        </div>
      </div>

      {totalOccasions === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">No upcoming occasions in this timeframe.</p>
            <p className="text-sm text-gray-500 mt-2">
              Add occasions to contacts to start tracking birthdays and special dates.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {monthOrder.map((month) => (
            <div key={month}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{month}</h2>
              <div className="space-y-3">
                {grouped[month].map((occasion) => (
                  <Card
                    key={occasion.id}
                    className={`transition-shadow hover:shadow-md ${
                      isUpcomingSoon(new Date(occasion.date))
                        ? "border-orange-200 bg-orange-50"
                        : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 text-3xl">
                          {occasionIcons[occasion.type] || "📌"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              href={`/contacts/${occasion.contactId}`}
                              className="font-medium hover:underline"
                            >
                              {occasion.contact.name}
                            </Link>
                            <Badge className={occasionColors[occasion.type] || "bg-gray-100"}>
                              {occasion.type.replace("_", " ")}
                            </Badge>
                            {isUpcomingSoon(new Date(occasion.date)) && (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                Coming soon 🔔
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(occasion.date), "MMM d, yyyy")}
                              {" "}
                              ({differenceInDays(new Date(occasion.date), new Date()) === 0
                                ? "Today"
                                : differenceInDays(new Date(occasion.date), new Date()) > 0
                                ? `in ${differenceInDays(new Date(occasion.date), new Date())} days`
                                : `${Math.abs(differenceInDays(new Date(occasion.date), new Date()))} days ago`})
                            </span>
                            {occasion.giftPreference && (
                              <span className="flex items-center gap-1 text-xs">
                                <Gift className="h-3 w-3" />
                                {occasion.giftPreference}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
