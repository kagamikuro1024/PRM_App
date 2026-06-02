import { serve } from "inngest/next"
import { inngestClient, generateDailyReminders } from "@/inngest/functions"

export const { GET, POST, PUT } = serve({
  client: inngestClient,
  functions: [generateDailyReminders],
})
