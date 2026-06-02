"use client"

import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
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
import { Contact } from "@prisma/client"

export const occasionSchema = z.object({
  type: z.enum(["birthday", "anniversary", "work_anniversary", "milestone", "custom"]),
  name: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  recurring: z.boolean(),
  giftPreference: z.string().optional(),
  reminderDaysBefore: z.number().int().positive(),
}).superRefine((data, ctx) => {
  if (data.type === "custom" && !data.name?.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["name"],
      message: "Custom occasions require a name",
    })
  }
})

const occasionTypeLabels: Record<string, string> = {
  birthday: "Birthday",
  anniversary: "Anniversary",
  work_anniversary: "Work Anniversary",
  milestone: "Milestone",
  custom: "Custom",
}

interface OccasionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contactId: string
  contact?: Contact | null
  onSubmit: (data: z.infer<typeof occasionSchema>) => Promise<void>
}

export function OccasionForm({
  open,
  onOpenChange,
  contact,
  onSubmit,
}: OccasionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof occasionSchema>>({
    resolver: zodResolver(occasionSchema),
    defaultValues: {
      type: "birthday",
      name: "",
      date: "",
      recurring: true,
      giftPreference: "",
      reminderDaysBefore: 7,
    },
  })

  const occasionType = useWatch({
    control: form.control,
    name: "type",
  })

  const handleSubmit = async (data: z.infer<typeof occasionSchema>) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create occasion:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show hint based on contact's love language
  const showGiftHint = contact?.loveLanguage === "gifts"
  const hideGiftHint = contact?.loveLanguage && !contact.loveLanguage.includes("gifts")

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Occasion</SheetTitle>
          <SheetDescription>
            Track important dates and events
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type *</FormLabel>
                  <Select onValueChange={(v) => field.onChange(v as "birthday" | "anniversary" | "work_anniversary" | "milestone" | "custom")} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(Object.keys(occasionTypeLabels) as Array<keyof typeof occasionTypeLabels>).map((type) => (
                        <SelectItem key={type} value={type}>
                          {occasionTypeLabels[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {occasionType === "custom" && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Project Launch" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Recurring</FormLabel>
                    <p className="text-sm text-gray-500">
                      Repeat every year
                    </p>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="p-3 rounded-lg bg-gray-50">
              <p className="text-sm font-medium mb-2">Reminder</p>
              <FormField
                control={form.control}
                name="reminderDaysBefore"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={(v) => field.onChange(parseInt(v ?? '', 10))} defaultValue={field.value?.toString()}>
                        <SelectTrigger>
                          <SelectValue placeholder="Days before" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 days before</SelectItem>
                          <SelectItem value="7">7 days before</SelectItem>
                          <SelectItem value="14">14 days before</SelectItem>
                          <SelectItem value="30">30 days before</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="giftPreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gift Preference</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ideas for gifts..."
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  {showGiftHint && (
                    <p className="text-xs text-orange-600 mt-1">
                      💡 This person values gifts — consider something thoughtful!
                    </p>
                  )}
                  {hideGiftHint && (
                    <p className="text-xs text-gray-500 mt-1">
                      💡 This person doesn&apos;t particularly value gifts — a heartfelt message may be more meaningful.
                    </p>
                  )}
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
                {isSubmitting ? "Saving..." : "Add Occasion"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
