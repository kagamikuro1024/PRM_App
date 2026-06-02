"use client"

import { useMemo, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { formatDistance } from "date-fns"
import { Check, Clock, X } from "lucide-react"

function getThreeDaysFromNow(): Date {
  const now = Date.now()
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000
  return new Date(now + threeDaysMs)
}

export interface Reminder {
  id: string
  dueDate: Date | string
  actionSuggestion: string | null
  contact: {
    id: string
    name: string
    avatar: string | null
  } | null
}

interface Props {
  today: Reminder[]
  thisWeek: Reminder[]
  later: Reminder[]
}

export function RemindersClient({ today, thisWeek, later }: Props) {
  const [reminders, setReminders] = useState<Reminder[]>([...today, ...thisWeek, ...later])

  const groupedReminders = useMemo(() => {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const weekLater = new Date(startOfToday)
    weekLater.setDate(weekLater.getDate() + 7)

    const todayList: Reminder[] = []
    const thisWeekList: Reminder[] = []
    const laterList: Reminder[] = []

    for (const reminder of reminders) {
      const due = new Date(reminder.dueDate)
      due.setHours(0, 0, 0, 0)

      if (due.getTime() === startOfToday.getTime()) {
        todayList.push(reminder)
      } else if (due > startOfToday && due <= weekLater) {
        thisWeekList.push(reminder)
      } else {
        laterList.push(reminder)
      }
    }

    return { todayList, thisWeekList, laterList }
  }, [reminders])

  const handleUpdate = async (id: string, status: "done" | "dismissed") => {
    const response = await fetch(`/api/reminders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (!response.ok) return
    setReminders(reminders.filter(r => r.id !== id))
  }

  const handleSnooze = async (id: string) => {
    const newDueDate = getThreeDaysFromNow()
    const response = await fetch(`/api/reminders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "snoozed", dueDate: newDueDate.toISOString() }),
    })
    if (!response.ok) return

    const data = await response.json()
    setReminders([
      ...reminders.filter((r) => r.id !== id),
      data.replacementReminder,
    ])
  }

  const renderSection = (title: string, list: Reminder[]) => {
    if (list.length === 0) return null
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <div className="space-y-4">
          {list.map((reminder) => (
            <div key={reminder.id} className="rounded-lg border p-4 bg-card">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={reminder.contact?.avatar || ""} />
                  <AvatarFallback className="bg-blue-500 text-white">
                    {reminder.contact?.name?.slice(0, 2).toUpperCase() || "??"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{reminder.contact?.name || "Unknown contact"}</p>
                  <p className="text-sm text-gray-600">{reminder.actionSuggestion}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Due: {formatDistance(new Date(reminder.dueDate), new Date(), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleSnooze(reminder.id)}>
                    <Clock className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={() => handleUpdate(reminder.id, "done")}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleUpdate(reminder.id, "dismissed")}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (reminders.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-dashed">
        <p className="text-gray-500">No pending reminders. Good job!</p>
      </div>
    )
  }

  return (
    <div>
      {renderSection("Today", groupedReminders.todayList)}
      {renderSection("This Week", groupedReminders.thisWeekList)}
      {renderSection("Later", groupedReminders.laterList)}
    </div>
  )
}
