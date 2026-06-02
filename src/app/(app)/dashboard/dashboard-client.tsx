"use client"

import { Contact, Interaction, Reminder } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Users,
  Heart,
  AlertCircle,
  Calendar,
  MessageSquare,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface DashboardClientProps {
  totalContacts: number
  healthyCount: number
  needsAttentionCount: number
  contacts: (Contact & { healthScore?: number })[]
  todayReminders: Array<Reminder & { contact: { id: string; name: string; avatar: string | null } | null }>
  upcomingOccasions: Array<{
    id: string
    contactId: string
    contactName: string
    type: string
    date: Date
    daysAway: number
  }>
  recentInteractions: Array<Interaction & { contact: { id: string; name: string; avatar: string | null } }>
}

export function DashboardClient({
  totalContacts,
  healthyCount,
  needsAttentionCount,
  contacts,
  todayReminders,
  upcomingOccasions,
  recentInteractions,
}: DashboardClientProps) {
  const getHealthScoreColor = (score?: number): string => {
    if (!score) return "#ef4444"
    if (score >= 70) return "#22c55e"
    if (score >= 40) return "#eab308"
    return "#ef4444"
  }

  const handleAiQuery = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get("query") as string
    if (query?.trim()) {
      window.location.href = `/advisor?q=${encodeURIComponent(query.trim())}`
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Your relationship overview at a glance</p>
      </div>

      {/* Today's Focus */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              Today&apos;s Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayReminders.length === 0 ? (
              <p className="text-sm text-gray-500">No reminders due today.</p>
            ) : (
              <div className="space-y-3">
                {todayReminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50">
                    <div className="h-2 w-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{reminder.contact?.name || "Unknown contact"}</p>
                      <p className="text-xs text-gray-600 truncate">{reminder.actionSuggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Upcoming Occasions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingOccasions.length === 0 ? (
              <p className="text-sm text-gray-500">No occasions in the next 14 days.</p>
            ) : (
              <div className="space-y-3">
                {upcomingOccasions.map((occasion) => (
                  <div key={occasion.id} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50">
                    <span className="text-lg">
                      {occasion.type === "birthday" ? "🎂" : occasion.type === "anniversary" ? "💍" : "📌"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{occasion.contactName}</p>
                      <p className="text-xs text-gray-600">
                        {occasion.type.replace("_", " ")} in {occasion.daysAway} day{occasion.daysAway !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Health Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Total Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-500" />
              <span className="text-3xl font-bold">{totalContacts}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Healthy (≥70)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-green-500" />
              <span className="text-3xl font-bold text-green-600">{healthyCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Needs Attention (&lt;40)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <span className="text-3xl font-bold text-red-600">{needsAttentionCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Relationship Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <p>No contacts yet. Add some to see your network health.</p>
              <Link
                href="/contacts"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-4"
              >
                Add Contact
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-10 gap-2 md:grid-cols-[repeat(15,minmax(0,1fr))] lg:grid-cols-[repeat(20,minmax(0,1fr))]">
              {contacts.slice(0, 100).map((contact) => (
                <Link
                  key={contact.id}
                  href={`/contacts/${contact.id}`}
                  className="aspect-square rounded-full transition-transform hover:scale-125"
                  style={{ backgroundColor: getHealthScoreColor(contact.healthScore) }}
                  title={`${contact.name}: ${Math.round(contact.healthScore || 0)}`}
                />
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Click a dot to view contact. Green (≥70), Yellow (40-69), Red (&lt;40)
          </p>
        </CardContent>
      </Card>

      {/* AI Quick Query */}
      <Card className="bg-gradient-to-r from-blue-50 to-orange-50 border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            AI Advisor
          </CardTitle>
          <p className="text-sm text-gray-600">
            Ask who&apos;s the best person to reach out to for advice
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAiQuery} className="flex gap-2">
            <Input
              name="query"
              placeholder="e.g., Who can help me with fundraising advice?"
              className="flex-1"
            />
            <Button type="submit">Ask AI</Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Interactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentInteractions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No interactions yet.</p>
          ) : (
            <div className="space-y-4">
              {recentInteractions.map((interaction) => (
                <div key={interaction.id} className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      You talked with <span className="font-medium">{interaction.contact.name}</span>
                    </p>
                    {interaction.summary && (
                      <p className="text-xs text-gray-600 truncate">{interaction.summary}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(interaction.date), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
