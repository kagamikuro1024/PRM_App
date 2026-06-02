import { prisma } from "@/lib/prisma";
import type { Contact } from "@prisma/client";

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function buildCheckInReminder(contact: Contact) {
  return {
    contactId: contact.id,
    type: "check_in" as const,
    dueDate: new Date(),
    actionSuggestion: `Check in with ${contact.name} about ${
      contact.expertiseTags[0] || "what they are working on"
    }.`,
    status: "pending" as const,
  };
}

/**
 * Seed realistic sample contacts and relationship history for a specific user.
 * This only runs when the user has no contacts yet.
 */
export async function seedUserData(userId: string): Promise<void> {
  const existingContactCount = await prisma.contact.count({
    where: { userId },
  });

  if (existingContactCount > 0) {
    console.log(`User ${userId} already has ${existingContactCount} contacts, skipping seed`);
    return;
  }

  console.log(`Seeding sample data for user ${userId}...`);

  await prisma.$transaction(async (tx) => {
    const minh = await tx.contact.create({
      data: {
        userId,
        name: "Minh Nguyen",
        email: "minh@example.com",
        category: "professional",
        strength: 5,
        tags: ["startup", "investor", "hcmc"],
        loveLanguage: "words",
        loveLanguageDetails: "Appreciates direct, specific encouragement.",
        expertiseTags: ["fundraising", "Product Strategy", "Vietnam startups"],
        checkInFrequency: 14,
        lastContactAt: daysAgo(4),
        linkedinUrl: "https://linkedin.com/in/minhnguyen",
        interactions: {
          create: [
            {
              channel: "call",
              date: daysAgo(4),
              summary: "Talked through seed round timing and investor intros.",
              mood: "positive",
              followUps: ["Send updated deck"],
            },
          ],
        },
        occasions: {
          create: [
            {
              type: "birthday",
              date: daysFromNow(6),
              recurring: true,
              giftPreference: "Leadership books or a thoughtful note.",
              reminderDaysBefore: 7,
            },
          ],
        },
      },
    });

    const lan = await tx.contact.create({
      data: {
        userId,
        name: "Lan Tran",
        email: "lan@example.com",
        category: "personal",
        strength: 4,
        tags: ["design", "friend", "art"],
        loveLanguage: "gifts",
        loveLanguageDetails: "Likes handmade gifts and flowers.",
        expertiseTags: ["UI/UX Design", "Illustration"],
        checkInFrequency: 30,
        lastContactAt: daysAgo(25),
        interactions: {
          create: [
            {
              channel: "message",
              date: daysAgo(25),
              summary: "Shared updates about her new portfolio launch.",
              mood: "positive",
              followUps: ["Ask how the launch went"],
            },
          ],
        },
      },
    });

    const david = await tx.contact.create({
      data: {
        userId,
        name: "David Chen",
        email: "david@example.com",
        category: "mentor",
        strength: 5,
        tags: ["leadership", "career", "mentor"],
        loveLanguage: "time",
        loveLanguageDetails: "Prefers focused coffee chats over long messages.",
        expertiseTags: ["Executive Coaching", "Team Management"],
        checkInFrequency: 30,
        lastContactAt: daysAgo(62),
        interactions: {
          create: [
            {
              channel: "in_person",
              date: daysAgo(62),
              summary: "Discussed hiring a first engineering manager.",
              mood: "positive",
              followUps: ["Book a follow-up coffee"],
            },
          ],
        },
      },
    });

    await tx.contact.create({
      data: {
        userId,
        name: "Mai Pham",
        email: "mai@example.com",
        category: "community",
        strength: 3,
        tags: ["ai", "ml", "community"],
        loveLanguage: "acts",
        loveLanguageDetails: "Values practical help and thoughtful introductions.",
        expertiseTags: ["AI", "Machine Learning", "Data Strategy"],
        checkInFrequency: 45,
        lastContactAt: daysAgo(12),
        interactions: {
          create: [
            {
              channel: "email",
              date: daysAgo(12),
              summary: "Sent notes from the local AI meetup.",
              mood: "neutral",
              followUps: [],
            },
          ],
        },
      },
    });

    await tx.contact.create({
      data: {
        userId,
        name: "Huy Le",
        email: "huy@example.com",
        category: "professional",
        strength: 4,
        tags: ["engineering", "backend", "infra"],
        loveLanguage: "words",
        loveLanguageDetails: "Responds well to concise context and appreciation.",
        expertiseTags: ["engineering", "Backend Architecture", "DevOps"],
        checkInFrequency: 30,
        lastContactAt: daysAgo(31),
        interactions: {
          create: [
            {
              channel: "message",
              date: daysAgo(31),
              summary: "Asked for feedback on API reliability tradeoffs.",
              mood: "positive",
              followUps: ["Share final architecture decision"],
            },
          ],
        },
        occasions: {
          create: [
            {
              type: "work_anniversary",
              date: daysFromNow(18),
              recurring: true,
              giftPreference: "Congratulatory LinkedIn note.",
              reminderDaysBefore: 7,
            },
          ],
        },
      },
    });

    await tx.contact.create({
      data: {
        userId,
        name: "An Nguyen",
        email: "an@example.com",
        category: "family",
        strength: 5,
        tags: ["family", "home"],
        loveLanguage: "time",
        loveLanguageDetails: "Likes relaxed weekend calls.",
        expertiseTags: ["Personal Finance"],
        checkInFrequency: 7,
        lastContactAt: daysAgo(2),
        interactions: {
          create: [
            {
              channel: "call",
              date: daysAgo(2),
              summary: "Caught up about family plans for the weekend.",
              mood: "positive",
              followUps: [],
            },
          ],
        },
      },
    });

    await tx.reminder.createMany({
      data: [buildCheckInReminder(david), buildCheckInReminder(lan)],
    });

    const minhBirthday = await tx.occasion.findFirst({
      where: { contactId: minh.id, type: "birthday" },
    });

    if (minhBirthday) {
      await tx.reminder.create({
        data: {
          contactId: minh.id,
          occasionId: minhBirthday.id,
          type: "birthday",
          dueDate: daysFromNow(1),
          actionSuggestion: "Prepare Minh's birthday note and leadership book idea.",
          status: "pending",
        },
      });
    }
  });

  console.log(`Seed completed for user ${userId}.`);
}
