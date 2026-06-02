import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getOpenAIClient } from "@/lib/openai"
import { getNextOccasionDate } from "@/lib/date-utils"

// POST /api/advisor — Get AI suggestions for who to reach out to
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { query } = await request.json()

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "AI service is temporarily unavailable. Please try again later." },
        { status: 503 }
      )
    }

    const trimmedQuery = query.trim()

    // Check rate limit: max 10 queries per day per user
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const queryCount = await prisma.advisorQuery.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    if (queryCount >= 10) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Maximum 10 queries per day." },
        { status: 429 }
      )
    }

    // Fetch user's contacts (limit to 50 for context)
    const contacts = await prisma.contact.findMany({
      where: {
        userId: session.user.id,
        isArchived: false,
      },
      include: {
        interactions: {
          orderBy: { date: "desc" },
          take: 3,
        },
        occasions: true,
      },
      take: 50,
    })

    if (contacts.length === 0) {
      return NextResponse.json({
        suggestions: [],
        message: "You don't have any contacts yet. Add some contacts to get advice!",
      })
    }

    // Format contacts for the prompt
    const contactsSummary = contacts.map((c) => {
      const lastInteraction = c.interactions[0]
      return {
        id: c.id,
        name: c.name,
        category: c.category,
        expertiseTags: c.expertiseTags,
        strength: c.strength,
        loveLanguage: c.loveLanguage,
        lastContact: c.lastContactAt
          ? new Date(c.lastContactAt).toISOString().split("T")[0]
          : "Never",
        recentInteraction: lastInteraction
          ? {
              date: new Date(lastInteraction.date).toISOString().split("T")[0],
              summary: lastInteraction.summary,
            }
          : null,
        upcomingOccasions: c.occasions
          .map((o) => ({
            type: o.type,
            date: getNextOccasionDate(o.date, o.recurring),
          }))
          .filter((o) => o.date >= new Date()),
      }
    })

    // Build system prompt
    const systemPrompt = `You are a personal relationship advisor for a professional. Given a list of contacts and a question/need from the user, suggest the TOP 3 most suitable people to reach out to.

For each suggestion provide:
1. contactName (exact name from the list)
2. reason: Why they are suitable (specific, based on their profile)
3. approach: A suggested opening message or approach (personalized, actionable)
4. timing: When would be a good time to contact based on recent interaction history

Be specific and actionable. Reference actual details from their profile.
Respond with a JSON object containing a "suggestions" array of exactly 3 objects (or fewer if fewer suitable contacts exist).
Each suggestion object must have: contactName, reason, approach, timing.

Important: Only suggest people from the provided contact list. If no one is suitable, explain why and suggest broadening the network.`

    const userPrompt = `User query: "${trimmedQuery}"

My contacts:
${JSON.stringify(contactsSummary, null, 2)}`

    // Call OpenAI API
    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error("Empty response from AI")
    }

    let suggestions: Array<{
      contactName: string
      reason: string
      approach: string
      timing: string
      contactId?: string
    }>
    try {
      const parsed = JSON.parse(content)
      const parsedSuggestions = Array.isArray(parsed) ? parsed : parsed.suggestions || []
      suggestions = parsedSuggestions
        .filter((suggestion: unknown) => suggestion && typeof suggestion === "object")
        .slice(0, 3)
        .map((suggestion: {
          contactName?: string
          reason?: string
          approach?: string
          timing?: string
        }) => {
          const contact = contacts.find((c) => c.name === suggestion.contactName)
          return {
            contactName: suggestion.contactName || "Unknown contact",
            reason: suggestion.reason || "",
            approach: suggestion.approach || "",
            timing: suggestion.timing || "",
            contactId: contact?.id,
          }
        })
    } catch {
      console.error("Failed to parse AI response:", content)
      suggestions = []
    }

    // Log the query for rate limiting
    await prisma.advisorQuery.create({
      data: {
        userId: session.user.id,
        query: trimmedQuery,
        responseCount: suggestions.length,
      },
    })

    return NextResponse.json({
      suggestions,
      query: trimmedQuery,
    })
  } catch (error) {
    console.error("Error in advisor:", error)

    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { error: "AI service is temporarily unavailable. Please try again later." },
          { status: 503 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Failed to get advice" },
      { status: 500 }
    )
  }
}
