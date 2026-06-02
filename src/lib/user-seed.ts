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

interface ContactSeedInput {
  name: string;
  email: string;
  category: "professional" | "personal" | "mentor" | "mentee" | "community" | "family";
  strength: number;
  tags: string[];
  loveLanguage?: "gifts" | "words" | "time" | "acts" | "touch";
  loveLanguageDetails?: string;
  expertiseTags: string[];
  checkInFrequency: number;
  lastContactDaysAgo: number;
  linkedinUrl?: string;
  interaction?: {
    channel: "in_person" | "call" | "message" | "email" | "social";
    daysAgo: number;
    summary: string;
    mood: "positive" | "neutral" | "negative";
    followUps: string[];
  };
  occasion?: {
    type: "birthday" | "anniversary" | "work_anniversary" | "milestone" | "custom";
    daysFromNow: number;
    recurring: boolean;
    giftPreference: string;
    reminderDaysBefore: number;
  };
}

/**
 * Seed realistic sample contacts and relationship history for a specific user.
 * This only runs when the user has no contacts yet.
 */
export async function seedUserData(userId: string): Promise<void> {
  // Verify that the user exists in the database before seeding (safeguard for NextAuth timing)
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userExists) {
    console.log(`User ${userId} does not exist in database yet, skipping seed for now`);
    return;
  }

  const existingContactCount = await prisma.contact.count({
    where: { userId },
  });

  if (existingContactCount > 0) {
    console.log(`User ${userId} already has ${existingContactCount} contacts, skipping seed`);
    return;
  }

  console.log(`Seeding sample data for user ${userId}...`);

  const contactsData: ContactSeedInput[] = [
    {
      name: "Minh Nguyen",
      email: "minh@example.com",
      category: "professional",
      strength: 5,
      tags: ["startup", "investor", "hcmc"],
      loveLanguage: "words",
      loveLanguageDetails: "Appreciates direct, specific encouragement.",
      expertiseTags: ["fundraising", "Product Strategy", "Vietnam startups"],
      checkInFrequency: 14,
      lastContactDaysAgo: 4,
      linkedinUrl: "https://linkedin.com/in/minhnguyen",
      interaction: {
        channel: "call",
        daysAgo: 4,
        summary: "Talked through seed round timing and investor intros.",
        mood: "positive",
        followUps: ["Send updated deck"],
      },
      occasion: {
        type: "birthday",
        daysFromNow: 6,
        recurring: true,
        giftPreference: "Leadership books or a thoughtful note.",
        reminderDaysBefore: 7,
      }
    },
    {
      name: "Lan Tran",
      email: "lan@example.com",
      category: "personal",
      strength: 4,
      tags: ["design", "friend", "art"],
      loveLanguage: "gifts",
      loveLanguageDetails: "Likes handmade gifts and flowers.",
      expertiseTags: ["UI/UX Design", "Illustration"],
      checkInFrequency: 30,
      lastContactDaysAgo: 25,
      interaction: {
        channel: "message",
        daysAgo: 25,
        summary: "Shared updates about her new portfolio launch.",
        mood: "positive",
        followUps: ["Ask how the launch went"],
      }
    },
    {
      name: "David Chen",
      email: "david@example.com",
      category: "mentor",
      strength: 5,
      tags: ["leadership", "career", "mentor"],
      loveLanguage: "time",
      loveLanguageDetails: "Prefers focused coffee chats over long messages.",
      expertiseTags: ["Executive Coaching", "Team Management"],
      checkInFrequency: 30,
      lastContactDaysAgo: 62,
      interaction: {
        channel: "in_person",
        daysAgo: 62,
        summary: "Discussed hiring a first engineering manager.",
        mood: "positive",
        followUps: ["Book a follow-up coffee"],
      }
    },
    {
      name: "Mai Pham",
      email: "mai@example.com",
      category: "community",
      strength: 3,
      tags: ["ai", "ml", "community"],
      loveLanguage: "acts",
      loveLanguageDetails: "Values practical help and thoughtful introductions.",
      expertiseTags: ["AI", "Machine Learning", "Data Strategy"],
      checkInFrequency: 45,
      lastContactDaysAgo: 12,
      interaction: {
        channel: "email",
        daysAgo: 12,
        summary: "Sent notes from the local AI meetup.",
        mood: "neutral",
        followUps: [],
      }
    },
    {
      name: "Huy Le",
      email: "huy@example.com",
      category: "professional",
      strength: 4,
      tags: ["engineering", "backend", "infra"],
      loveLanguage: "words",
      loveLanguageDetails: "Responds well to concise context and appreciation.",
      expertiseTags: ["Backend Architecture", "DevOps", "Database Scaling"],
      checkInFrequency: 30,
      lastContactDaysAgo: 31,
      interaction: {
        channel: "message",
        daysAgo: 31,
        summary: "Asked for feedback on API reliability tradeoffs.",
        mood: "positive",
        followUps: ["Share final architecture decision"],
      },
      occasion: {
        type: "work_anniversary",
        daysFromNow: 18,
        recurring: true,
        giftPreference: "Congratulatory LinkedIn note.",
        reminderDaysBefore: 7,
      }
    },
    {
      name: "An Nguyen",
      email: "an@example.com",
      category: "family",
      strength: 5,
      tags: ["family", "home"],
      loveLanguage: "time",
      loveLanguageDetails: "Likes relaxed weekend calls.",
      expertiseTags: ["Personal Finance", "Real Estate"],
      checkInFrequency: 7,
      lastContactDaysAgo: 2,
      interaction: {
        channel: "call",
        daysAgo: 2,
        summary: "Caught up about family plans for the weekend.",
        mood: "positive",
        followUps: [],
      }
    },
    {
      name: "Binh Vo",
      email: "binh@example.com",
      category: "professional",
      strength: 4,
      tags: ["marketing", "growth", "branding"],
      loveLanguage: "words",
      loveLanguageDetails: "Likes short, metric-focused appreciation notes.",
      expertiseTags: ["Digital Marketing", "SEO", "User Acquisition"],
      checkInFrequency: 15,
      lastContactDaysAgo: 10,
      interaction: {
        channel: "in_person",
        daysAgo: 10,
        summary: "Brainstormed marketing campaigns for Q3 launch.",
        mood: "positive",
        followUps: ["Compile feedback on competitors"],
      }
    },
    {
      name: "Vy Hoang",
      email: "vy@example.com",
      category: "personal",
      strength: 4,
      tags: ["college", "friend", "travel"],
      loveLanguage: "time",
      loveLanguageDetails: "Appreciates sharing old stories over dinner.",
      expertiseTags: ["Travel Planning", "Photography"],
      checkInFrequency: 30,
      lastContactDaysAgo: 15,
      interaction: {
        channel: "call",
        daysAgo: 15,
        summary: "Planned a reunion weekend with college friends.",
        mood: "positive",
        followUps: ["Send Airbnb options"],
      }
    },
    {
      name: "Cuong Pham",
      email: "cuong.p@example.com",
      category: "mentee",
      strength: 4,
      tags: ["junior", "frontend", "dev"],
      loveLanguage: "acts",
      loveLanguageDetails: "Appreciates code reviews and architectural advice.",
      expertiseTags: ["React", "Tailwind CSS", "TypeScript"],
      checkInFrequency: 20,
      lastContactDaysAgo: 5,
      interaction: {
        channel: "call",
        daysAgo: 5,
        summary: "Reviewed his resume and portfolio project.",
        mood: "positive",
        followUps: ["Send feedback on GitHub repo"],
      },
      occasion: {
        type: "birthday",
        daysFromNow: 12,
        recurring: true,
        giftPreference: "Next.js online courses or tech gadgets.",
        reminderDaysBefore: 5,
      }
    },
    {
      name: "Trang Le",
      email: "trang.le@example.com",
      category: "community",
      strength: 3,
      tags: ["creator", "writing", "blog"],
      loveLanguage: "gifts",
      loveLanguageDetails: "Likes specialty coffees and stationery.",
      expertiseTags: ["Content Creation", "SEO Writing", "Social Media"],
      checkInFrequency: 40,
      lastContactDaysAgo: 28,
      interaction: {
        channel: "message",
        daysAgo: 28,
        summary: "Recommended her for a freelance copywriting gig.",
        mood: "positive",
        followUps: [],
      }
    },
    {
      name: "Duy Nguyen",
      email: "duy@example.com",
      category: "family",
      strength: 3,
      tags: ["cousin", "family"],
      loveLanguage: "time",
      loveLanguageDetails: "Enjoys Sunday morning coffee chats.",
      expertiseTags: ["Real Estate Investment", "Local Regulations"],
      checkInFrequency: 14,
      lastContactDaysAgo: 8,
      interaction: {
        channel: "call",
        daysAgo: 8,
        summary: "Discussed property trends in Thu Duc City.",
        mood: "neutral",
        followUps: [],
      }
    },
    {
      name: "Huong Ngo",
      email: "huong.n@example.com",
      category: "professional",
      strength: 4,
      tags: ["hr", "recruitment", "network"],
      loveLanguage: "words",
      loveLanguageDetails: "Responds well to professional compliments on LinkedIn.",
      expertiseTags: ["Talent Acquisition", "Interview Prep", "HR Policy"],
      checkInFrequency: 30,
      lastContactDaysAgo: 20,
      interaction: {
        channel: "email",
        daysAgo: 20,
        summary: "Asked for recommendations for a senior Go developer role.",
        mood: "positive",
        followUps: ["Send candidate profiles"],
      }
    },
    {
      name: "Son Doan",
      email: "son.d@example.com",
      category: "mentor",
      strength: 5,
      tags: ["investor", "advisor", "finance"],
      loveLanguage: "time",
      loveLanguageDetails: "Prefers precise, data-backed 15-minute briefings.",
      expertiseTags: ["Angel Investing", "SaaS Metrics", "B2B Sales"],
      checkInFrequency: 60,
      lastContactDaysAgo: 50,
      interaction: {
        channel: "email",
        daysAgo: 50,
        summary: "Sent quick update on MRR growth metrics.",
        mood: "positive",
        followUps: ["Schedule quarterly advisory call"],
      }
    },
    {
      name: "Linh Bui",
      email: "linh@example.com",
      category: "personal",
      strength: 4,
      tags: ["fitness", "yoga", "friend"],
      loveLanguage: "acts",
      loveLanguageDetails: "Likes it when friends join her weekend classes.",
      expertiseTags: ["Yoga", "Nutrition", "Mindfulness"],
      checkInFrequency: 21,
      lastContactDaysAgo: 7,
      interaction: {
        channel: "in_person",
        daysAgo: 7,
        summary: "Attended her morning outdoor yoga class.",
        mood: "positive",
        followUps: [],
      }
    },
    {
      name: "Phong Dang",
      email: "phong.d@example.com",
      category: "community",
      strength: 3,
      tags: ["web3", "crypto", "blockchain"],
      loveLanguage: "words",
      loveLanguageDetails: "Likes sharing technical deep-dives on Github/X.",
      expertiseTags: ["Solidity", "Smart Contracts", "DeFi"],
      checkInFrequency: 45,
      lastContactDaysAgo: 35,
      interaction: {
        channel: "social",
        daysAgo: 35,
        summary: "Commented on his recent smart contract audit post.",
        mood: "positive",
        followUps: [],
      }
    },
    {
      name: "Thao Vu",
      email: "thao@example.com",
      category: "mentee",
      strength: 4,
      tags: ["intern", "pm", "product"],
      loveLanguage: "time",
      loveLanguageDetails: "Wants feedback on career pathing.",
      expertiseTags: ["Product Analytics", "SQL", "User Testing"],
      checkInFrequency: 30,
      lastContactDaysAgo: 12,
      interaction: {
        channel: "call",
        daysAgo: 12,
        summary: "Mentored her on transitioning from QA to PM role.",
        mood: "positive",
        followUps: ["Send list of recommended PM books"],
      }
    },
    {
      name: "Tuan Hoang",
      email: "tuan.h@example.com",
      category: "professional",
      strength: 4,
      tags: ["frontend", "nextjs", "react"],
      loveLanguage: "acts",
      loveLanguageDetails: "Appreciates sharing useful open-source libraries.",
      expertiseTags: ["Performance Optimization", "Web Core Vitals"],
      checkInFrequency: 30,
      lastContactDaysAgo: 19,
      interaction: {
        channel: "message",
        daysAgo: 19,
        summary: "Shared a new package for SVG animations.",
        mood: "positive",
        followUps: [],
      }
    },
    {
      name: "Ngoc Nguyen",
      email: "ngoc@example.com",
      category: "family",
      strength: 5,
      tags: ["sister", "family"],
      loveLanguage: "gifts",
      loveLanguageDetails: "Loves baking accessories and exotic spices.",
      expertiseTags: ["Culinary Arts", "Event Organizing"],
      checkInFrequency: 7,
      lastContactDaysAgo: 1,
      interaction: {
        channel: "message",
        daysAgo: 1,
        summary: "Shared a new recipe for sourdough bread.",
        mood: "positive",
        followUps: [],
      },
      occasion: {
        type: "birthday",
        daysFromNow: 3,
        recurring: true,
        giftPreference: "Artisanal baking dish.",
        reminderDaysBefore: 2,
      }
    },
    {
      name: "Kien Trinh",
      email: "kien@example.com",
      category: "community",
      strength: 3,
      tags: ["photography", "media", "video"],
      loveLanguage: "time",
      loveLanguageDetails: "Appreciates photoshoots together in the city.",
      expertiseTags: ["Commercial Video", "Lighting Design"],
      checkInFrequency: 45,
      lastContactDaysAgo: 40,
      interaction: {
        channel: "in_person",
        daysAgo: 40,
        summary: "Met up at a local photography exhibition.",
        mood: "neutral",
        followUps: [],
      }
    },
    {
      name: "Quynh Dinh",
      email: "quynh.d@example.com",
      category: "professional",
      strength: 4,
      tags: ["sales", "b2b", "enterprise"],
      loveLanguage: "words",
      loveLanguageDetails: "Values prompt and structured email replies.",
      expertiseTags: ["Enterprise Sales", "Contract Negotiation"],
      checkInFrequency: 30,
      lastContactDaysAgo: 27,
      interaction: {
        channel: "email",
        daysAgo: 27,
        summary: "Exchanged tips on client relationship management tools.",
        mood: "positive",
        followUps: [],
      }
    }
  ];

  const createdContacts: Contact[] = [];
  const urgentReminders: Contact[] = [];

  for (const c of contactsData) {
    const createdContact = await prisma.contact.create({
      data: {
        userId,
        name: c.name,
        email: c.email,
        category: c.category,
        strength: c.strength,
        tags: c.tags,
        loveLanguage: c.loveLanguage,
        loveLanguageDetails: c.loveLanguageDetails,
        expertiseTags: c.expertiseTags,
        checkInFrequency: c.checkInFrequency,
        lastContactAt: daysAgo(c.lastContactDaysAgo),
        linkedinUrl: c.linkedinUrl || null,
        interactions: c.interaction ? {
          create: [
            {
              channel: c.interaction.channel,
              date: daysAgo(c.interaction.daysAgo),
              summary: c.interaction.summary,
              mood: c.interaction.mood,
              followUps: c.interaction.followUps,
            }
          ]
        } : undefined,
        occasions: c.occasion ? {
          create: [
            {
              type: c.occasion.type,
              date: daysFromNow(c.occasion.daysFromNow),
              recurring: c.occasion.recurring,
              giftPreference: c.occasion.giftPreference,
              reminderDaysBefore: c.occasion.reminderDaysBefore,
            }
          ]
        } : undefined,
      }
    });

    createdContacts.push(createdContact);

    // Check if we should create a check-in reminder
    if (c.lastContactDaysAgo >= c.checkInFrequency) {
      urgentReminders.push(createdContact);
    }
  }

  // Create automatic check-in reminders for contacts that are overdue
  const checkInReminderData = urgentReminders.map(c => buildCheckInReminder(c));
  if (checkInReminderData.length > 0) {
    await prisma.reminder.createMany({
      data: checkInReminderData,
    });
  }

  // Add specific birthday reminders if the contact has a birthday occasion
  for (const contact of createdContacts) {
    const occasionInput = contactsData.find(cd => cd.name === contact.name)?.occasion;
    if (occasionInput && (occasionInput.type === "birthday" || occasionInput.type === "work_anniversary")) {
      const createdOccasion = await prisma.occasion.findFirst({
        where: { contactId: contact.id, type: occasionInput.type }
      });

      if (createdOccasion) {
        await prisma.reminder.create({
          data: {
            contactId: contact.id,
            occasionId: createdOccasion.id,
            type: occasionInput.type === "birthday" ? "birthday" : "custom",
            dueDate: daysFromNow(occasionInput.daysFromNow - 1),
            actionSuggestion: `Prepare gift/message for ${contact.name}'s upcoming ${occasionInput.type}. Prefer: ${occasionInput.giftPreference}`,
            status: "pending",
          }
        });
      }
    }
  }

  console.log(`Seed completed for user ${userId}. Created 20 contacts.`);
}
