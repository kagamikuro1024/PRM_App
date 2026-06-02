"use client"

import { useState, useEffect } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Contact } from "@prisma/client"
import { clientContactSchema } from "@/lib/validations"

const categoryOptions = [
  "professional",
  "personal",
  "mentor",
  "mentee",
  "community",
  "family",
] as const

const loveLanguageOptions = [
  "gifts",
  "words",
  "time",
  "acts",
  "touch",
] as const

const defaultFormValues = {
  name: "",
  email: "",
  phone: "",
  linkedinUrl: "",
  facebookUrl: "",
  otherSocials: {},
  category: "professional" as const,
  strength: 3,
  tags: [] as string[],
  loveLanguage: undefined,
  loveLanguageDetails: "",
  expertiseTags: [] as string[],
  notes: "",
  checkInFrequency: 30,
} satisfies z.infer<typeof clientContactSchema>

function normalizeData(data: Contact): z.infer<typeof clientContactSchema> {
  return {
    name: data.name,
    email: data.email ?? "",
    phone: data.phone ?? "",
    linkedinUrl: data.linkedinUrl ?? "",
    facebookUrl: data.facebookUrl ?? "",
    otherSocials: data.otherSocials ?? {},
    category: data.category,
    strength: data.strength,
    tags: data.tags ?? [],
    loveLanguage: data.loveLanguage ?? undefined,
    loveLanguageDetails: data.loveLanguageDetails ?? "",
    expertiseTags: data.expertiseTags ?? [],
    notes: typeof data.notes === "string" ? data.notes : (data.notes ? JSON.stringify(data.notes) : ""),
    checkInFrequency: data.checkInFrequency ?? 30,
  }
}

interface ContactFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: z.infer<typeof clientContactSchema>) => Promise<void>
  initialData?: Contact | null
}

export function ContactForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = !!initialData

  const form = useForm({
    resolver: zodResolver(clientContactSchema),
    defaultValues: defaultFormValues,
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset(normalizeData(initialData))
      } else {
        form.reset(defaultFormValues)
      }
    }
  }, [open, initialData, form])

  const handleSubmit: SubmitHandler<z.infer<typeof clientContactSchema>> = async (data) => {
    setIsSubmitting(true)
    try {
      const payload = {
        ...data,
        tags: data.tags || [],
        expertiseTags: data.expertiseTags || [],
      }

      await onSubmit(payload)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Contact" : "Add New Contact"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update contact information and preferences."
              : "Add a new person to your relationship network."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Basic Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nguyen Van A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+84 123 456 789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Social Links */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="linkedinUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/in/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="facebookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://facebook.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Relationship Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="strength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship Strength (1-5)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="checkInFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in Frequency (days)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="30"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="startup, tech, investor (comma separated)"
                        {...field}
                        value={Array.isArray(field.value) ? field.value.join(", ") : (field.value ?? "")}
                        onChange={(e) => {
                          const input = e.target.value
                          field.onChange(input ? input.split(",").map(s => s.trim()).filter(Boolean) : [])
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expertiseTags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expertise Areas</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Fundraising, Product Strategy (comma separated)"
                        {...field}
                        value={Array.isArray(field.value) ? field.value.join(", ") : (field.value ?? "")}
                        onChange={(e) => {
                          const input = e.target.value
                          field.onChange(input ? input.split(",").map(s => s.trim()).filter(Boolean) : [])
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="loveLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Love Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loveLanguageOptions.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang.charAt(0).toUpperCase() + lang.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="loveLanguageDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Love Language Details</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Thích nhận quà dịp sinh nhật"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about this contact..."
                      className="min-h-[100px]"
                      {...field}
                      value={
                        typeof field.value === "string"
                          ? field.value
                          : JSON.stringify(field.value, null, 2)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                  ? "Update Contact"
                  : "Add Contact"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
