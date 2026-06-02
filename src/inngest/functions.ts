import { Inngest } from "inngest"
import { prisma } from "@/lib/prisma"
import { Contact, Occasion } from "@prisma/client"
import { getNextOccasionDate } from "@/lib/date-utils"

export const inngestClient = new Inngest({ id: "prm-app" })

export const generateDailyReminders = inngestClient.createFunction(
  { id: "generate-daily-reminders", name: "Generate Daily Reminders", triggers: [{ cron: "0 8 * * *" }] },
  async () => {
    // 1. Get all users
    const users = await prisma.user.findMany({
      select: { id: true },
    })

    for (const user of users) {
      // 2. Get non-archived contacts with occasions
      const contacts = await prisma.contact.findMany({
        where: { userId: user.id, isArchived: false },
        include: {
          occasions: true,
        },
      })

      for (const contact of contacts) {
        // CHECK_IN reminder
        const now = new Date()
        const lastContactAt = contact.lastContactAt ? new Date(contact.lastContactAt) : null
        const checkInFrequency = contact.checkInFrequency || 30
        const daysSinceLastContact = lastContactAt
          ? (now.getTime() - lastContactAt.getTime()) / (1000 * 60 * 60 * 24)
          : Infinity

        if (daysSinceLastContact >= checkInFrequency) {
          // Check if a pending CHECK_IN reminder already exists
          const existing = await prisma.reminder.findFirst({
            where: {
              contactId: contact.id,
              type: "check_in",
              status: "pending",
            },
          })
          if (!existing) {
            const suggestion = generateActionSuggestion(contact, "check_in")
            await prisma.reminder.create({
              data: {
                contactId: contact.id,
                type: "check_in",
                dueDate: now,
                actionSuggestion: suggestion,
                status: "pending",
              },
            })
          }
        }

        // OCCASION reminders
        for (const occasion of contact.occasions) {
          const reminderDays = occasion.reminderDaysBefore || 7
          const occasionDate = getNextOccasionDate(occasion.date, occasion.recurring, now)
          const reminderDate = new Date(occasionDate)
          reminderDate.setDate(reminderDate.getDate() - reminderDays)

          // If reminderDate is today or in the past (and occasion is in future)
          if (reminderDate <= now && occasionDate >= now) {
            // Check existing pending occasion reminder for this occasion
            const existing = await prisma.reminder.findFirst({
              where: {
                contactId: contact.id,
                occasionId: occasion.id,
                status: "pending",
              },
            })
            if (!existing) {
              const suggestion = generateActionSuggestion(contact, "occasion", occasion)
              // Map occasion.type to reminder type
              let reminderType: "birthday" | "custom" = "custom"
              if (occasion.type === "birthday") reminderType = "birthday"
              // Could add more mappings

              await prisma.reminder.create({
                data: {
                  contactId: contact.id,
                  occasionId: occasion.id,
                  type: reminderType,
                  dueDate: reminderDate,
                  actionSuggestion: suggestion,
                  status: "pending",
                },
              })
            }
          }
        }
      }
    }
  }
)

export function generateActionSuggestion(
  contact: Contact,
  reminderType: "check_in" | "occasion",
  occasion?: Occasion
): string {
  switch (reminderType) {
    case "check_in":
      if (contact.expertiseTags && contact.expertiseTags.length > 0) {
        const topic = contact.expertiseTags[0]
        return `Reach out to discuss ${topic}. They might have valuable insights!`
      }
      if (contact.loveLanguage) {
        const lang = contact.loveLanguage
        if (lang === "words") return "Send a heartfelt message to let them know you're thinking of them."
        if (lang === "gifts") return "Consider a small thoughtful gift to show you care."
        if (lang === "time") return "Schedule a coffee or video call to catch up."
        if (lang === "acts") return "Offer to help with something they're working on."
        if (lang === "touch") return "A warm greeting or hug (if appropriate) would mean a lot."
      }
      return "It's been a while. Send a friendly check-in to maintain the relationship."

    case "occasion":
      const occName = occasion?.type || "special occasion"
      let suggestion = `Don't forget to acknowledge their ${occName}!`
      if (contact.loveLanguage) {
        if (contact.loveLanguage === "gifts") {
          suggestion += ` Gift idea: ${occasion?.giftPreference || "something thoughtful"}`
        } else if (contact.loveLanguage === "words") {
          suggestion += " A sincere message will be much appreciated."
        } else if (contact.loveLanguage === "time") {
          suggestion += " Plan a celebration together."
        } else {
          suggestion += " Mark the occasion with kindness."
        }
      }
      return suggestion

    default:
      return "Reminder for this contact."
  }
}
