"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Phone, Mail, Users, Globe, type LucideIcon } from "lucide-react"

export const interactionSchema = z.object({
  channel: z.enum(["in_person", "call", "message", "email", "social"]),
  date: z.string().min(1, "Date is required"),
  summary: z.string().optional(),
  mood: z.enum(["positive", "neutral", "negative"]).optional(),
  followUps: z.array(z.string()),
})

const channelIcons: Record<string, LucideIcon> = {
  in_person: Users,
  call: Phone,
  message: MessageSquare,
  email: Mail,
  social: Globe,
}

const channelLabels: Record<string, string> = {
  in_person: "In Person",
  call: "Call",
  message: "Message",
  email: "Email",
  social: "Social",
}

interface InteractionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contactId: string
  onSubmit: (data: z.infer<typeof interactionSchema>) => Promise<void>
}

export function InteractionSheet({
  open,
  onOpenChange,
  onSubmit,
}: InteractionSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof interactionSchema>>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      channel: "message",
      date: (() => {
        const d = new Date()
        const offset = d.getTimezoneOffset() * 60 * 1000
        return new Date(d.getTime() - offset).toISOString().slice(0, 16)
      })(),
      summary: "",
      mood: "neutral",
      followUps: [],
    },
  })

  const handleSubmit = async (data: z.infer<typeof interactionSchema>) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to log interaction:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Log Interaction</SheetTitle>
          <SheetDescription>
            Record details about your recent contact
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-6">
            <FormField
              control={form.control}
              name="channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel *</FormLabel>
                  <Select onValueChange={(v) => field.onChange(v as "in_person" | "call" | "message" | "email" | "social")} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select channel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(Object.keys(channelIcons) as Array<keyof typeof channelIcons>).map((ch) => (
                        <SelectItem key={ch} value={ch}>
                          <span className="flex items-center gap-2">
                            {(() => {
                              const Icon = channelIcons[ch]
                              return Icon ? <Icon className="h-4 w-4" /> : null
                            })()}
                            {channelLabels[ch]}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time *</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What did you talk about?"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mood</FormLabel>
                  <Select onValueChange={(v) => field.onChange(v as "positive" | "neutral" | "negative")} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mood" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="positive">😊 Positive</SelectItem>
                      <SelectItem value="neutral">😐 Neutral</SelectItem>
                      <SelectItem value="negative">😔 Negative</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="followUps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Follow-ups (one per line)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Send that article&#10;Schedule lunch next month"
                      className="min-h-[80px]"
                      value={field.value?.join("\n") || ""}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value ? value.split("\n").filter(Boolean) : [])
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Interaction"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
