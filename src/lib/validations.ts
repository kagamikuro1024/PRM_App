import { z } from "zod"

const optionalText = z.string().optional().or(z.literal(""))
const optionalEmail = z.string().email().optional().or(z.literal(""))
const optionalUrl = z.string().url().optional().or(z.literal(""))
const optionalPositiveInt = z.number().int().positive().optional()

const contactFields = {
  name: z.string().trim().min(1, "Name is required"),
  email: optionalEmail,
  phone: optionalText,
  linkedinUrl: optionalUrl,
  facebookUrl: optionalUrl,
  otherSocials: z.any().optional(),
  category: z.enum(["professional", "personal", "mentor", "mentee", "community", "family"]),
  strength: z.number().int().min(1).max(5),
  tags: z.array(z.string().trim().min(1)).optional(),
  loveLanguage: z.enum(["gifts", "words", "time", "acts", "touch"]).optional(),
  loveLanguageDetails: optionalText,
  expertiseTags: z.array(z.string().trim().min(1)).optional(),
  notes: z.any().optional(),
  checkInFrequency: optionalPositiveInt,
}

export const clientContactSchema = z.object({
  ...contactFields,
  category: contactFields.category.default("professional"),
  strength: contactFields.strength.default(3),
  tags: contactFields.tags.default([]),
  expertiseTags: contactFields.expertiseTags.default([]),
  checkInFrequency: optionalPositiveInt.default(30),
}).strict()

export const clientUpdateContactSchema = z.object(contactFields).partial().strict()

export const createContactSchema = clientContactSchema.extend({
  userId: z.string(),
})

export const updateContactSchema = clientUpdateContactSchema

export function normalizeContactPayload<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      typeof value === "string" && value.trim() === "" ? null : value,
    ])
  ) as T
}

export const contactResponseSchema = createContactSchema.extend({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  relationshipHealthScore: z.number().optional().nullable(),
  lastContactAt: z.date().optional().nullable(),
})
