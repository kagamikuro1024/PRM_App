"use client"

import { useState } from "react"
import { Contact, Interaction, Occasion } from "@prisma/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Mail,
  Phone,
  Link2,
  Star,
  Pencil,
  MessageSquare,
  Calendar,
  Gift,
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { ContactForm } from "@/components/contact/ContactForm"
import { InteractionSheet, interactionSchema } from "@/components/contact/InteractionSheet"
import { OccasionForm, occasionSchema } from "@/components/contact/OccasionForm"
import type { z } from "zod"

interface ContactDetailClientProps {
  contact: Contact & {
    interactions: Interaction[]
    occasions: Occasion[]
  }
}

const categoryColors: Record<string, string> = {
  professional: "bg-blue-100 text-blue-800",
  personal: "bg-green-100 text-green-800",
  mentor: "bg-purple-100 text-purple-800",
  mentee: "bg-orange-100 text-orange-800",
  community: "bg-teal-100 text-teal-800",
  family: "bg-pink-100 text-pink-800",
}

const channelIcons: Record<string, string> = {
  in_person: "👥",
  call: "📞",
  message: "💬",
  email: "📧",
  social: "📱",
}

const occasionTypeIcons: Record<string, string> = {
  birthday: "🎂",
  anniversary: "💍",
  work_anniversary: "💼",
  milestone: "🎯",
  custom: "📌",
}

export function ContactDetailClient({ contact }: ContactDetailClientProps) {
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [isInteractionSheetOpen, setIsInteractionSheetOpen] = useState(false)
  const [isOccasionFormOpen, setIsOccasionFormOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"interactions" | "occasions" | "notes">("interactions")

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const renderStars = (strength: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < strength
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ))
  }

  const handleCreateInteraction = async (data: z.infer<typeof interactionSchema>) => {
    const response = await fetch(`/api/contacts/${contact.id}/interactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to create interaction")
    }

    // Refresh page to get updated data
    window.location.reload()
  }

  const handleCreateOccasion = async (data: z.infer<typeof occasionSchema>) => {
    const response = await fetch(`/api/contacts/${contact.id}/occasions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to create occasion")
    }

    // Refresh page to get updated data
    window.location.reload()
  }

  const upcomingOccasions = contact.occasions
    .filter((o) => new Date(o.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Helper for occasion display
  const getOccasionLabel = (occasion: Occasion) => {
    if (occasion.type === "custom" && occasion.name) {
      return occasion.name
    }
    return occasionTypeIcons[occasion.type] + " " + occasion.type.replace("_", " ")
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={contact.avatar || ""} alt={contact.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-lg font-semibold text-white">
                  {getInitials(contact.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{contact.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  {renderStars(contact.strength)}
                </div>
                <Badge
                  className={`mt-2 ${categoryColors[contact.category]} border-none`}
                >
                  {contact.category}
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsEditFormOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Contact Info */}
          <div className="grid gap-3 sm:grid-cols-2">
            {contact.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">{contact.email}</span>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">{contact.phone}</span>
              </div>
            )}
            {contact.linkedinUrl && (
              <div className="flex items-center gap-2 text-sm">
                <Link2 className="h-4 w-4 text-gray-400" />
                <a
                  href={contact.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate"
                >
                  LinkedIn
                </a>
              </div>
            )}
          </div>

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {contact.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Expertise */}
          {contact.expertiseTags && contact.expertiseTags.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Expertise</p>
              <div className="flex flex-wrap gap-2">
                {contact.expertiseTags.map((exp) => (
                  <Badge key={exp} variant="secondary" className="text-xs">
                    {exp}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Love Language */}
          {contact.loveLanguage && (
            <div className="flex items-center gap-2 text-sm">
              <Gift className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">
                <span className="font-medium">Love Language:</span> {contact.loveLanguage}
                {contact.loveLanguageDetails && ` — ${contact.loveLanguageDetails}`}
              </span>
            </div>
          )}

          {/* Last Contact */}
          {contact.lastContactAt && (
            <p className="text-sm text-gray-500">
              Last contact: {formatDistanceToNow(new Date(contact.lastContactAt), { addSuffix: true })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={() => setIsInteractionSheetOpen(true)}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Log Interaction
        </Button>
        <Button variant="outline" onClick={() => setIsOccasionFormOpen(true)}>
          <Calendar className="h-4 w-4 mr-2" />
          Add Occasion
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          <button
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "interactions"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("interactions")}
          >
            Interactions ({contact.interactions.length})
          </button>
          <button
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "occasions"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("occasions")}
          >
            Occasions ({contact.occasions.length})
          </button>
          <button
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "notes"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("notes")}
          >
            Notes
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "interactions" && (
        <div className="space-y-4">
          {contact.interactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No interactions recorded yet.</p>
              <Button variant="link" onClick={() => setIsInteractionSheetOpen(true)}>
                Log your first interaction
              </Button>
            </div>
          ) : (
            contact.interactions.map((interaction) => (
              <Card key={interaction.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{channelIcons[interaction.channel]}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium capitalize">{interaction.channel.replace("_", " ")}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(interaction.date), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                        {interaction.mood && (
                          <span className="text-lg ml-2">
                            {interaction.mood === "positive" ? "😊" : interaction.mood === "negative" ? "😔" : "😐"}
                          </span>
                        )}
                      </div>
                      {interaction.summary && (
                        <p className="text-gray-700 mb-2">{interaction.summary}</p>
                      )}
                      {interaction.followUps && Array.isArray(interaction.followUps) && interaction.followUps.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-500 mb-1">Follow-ups:</p>
                          <ul className="text-sm text-gray-600 list-disc list-inside">
                            {(interaction.followUps as string[]).map((followUp, idx) => (
                              <li key={idx}>{followUp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "occasions" && (
        <div className="space-y-4">
          {upcomingOccasions.length === 0 && contact.occasions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No occasions tracked yet.</p>
              <Button variant="link" onClick={() => setIsOccasionFormOpen(true)}>
                Add an occasion
              </Button>
            </div>
          ) : (
            <>
              {upcomingOccasions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Upcoming</h4>
                  <div className="space-y-3">
                    {upcomingOccasions.map((occasion) => (
                      <Card key={occasion.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{occasionTypeIcons[occasion.type]}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">
                                  {getOccasionLabel(occasion)}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {format(new Date(occasion.date), "MMM d, yyyy")}
                                </Badge>
                                {occasion.recurring && (
                                  <span className="text-xs text-gray-500">(Recurring)</span>
                                )}
                              </div>
                              {occasion.giftPreference && (
                                <p className="text-sm text-gray-600 mb-1">
                                  <span className="font-medium">Gift idea:</span> {occasion.giftPreference}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                Remind {occasion.reminderDaysBefore} days before
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {contact.occasions.some((o) => new Date(o.date) < new Date()) && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Past</h4>
                  <div className="space-y-3">
                    {contact.occasions
                      .filter((o) => new Date(o.date) < new Date())
                      .map((occasion) => (
                        <Card key={occasion.id} className="opacity-60">
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">{occasionTypeIcons[occasion.type]}</span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">
                                    {getOccasionLabel(occasion)}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {format(new Date(occasion.date), "MMM d, yyyy")}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "notes" && (
        <Card>
          <CardContent className="pt-6">
            {contact.notes ? (
              <div className="prose max-w-none text-sm text-gray-700 whitespace-pre-wrap">
                {typeof contact.notes === "string" 
                  ? contact.notes 
                  : JSON.stringify(contact.notes, null, 2)}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No notes recorded for this contact.</p>
                <Button variant="link" onClick={() => setIsEditFormOpen(true)}>
                  Add notes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modals/Sheets */}
      <ContactForm
        open={isEditFormOpen}
        onOpenChange={setIsEditFormOpen}
        onSubmit={async (data) => {
          const response = await fetch(`/api/contacts/${contact.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          })
          if (!response.ok) throw new Error("Failed to update contact")
          window.location.reload()
        }}
        initialData={contact}
      />

      <InteractionSheet
        open={isInteractionSheetOpen}
        onOpenChange={setIsInteractionSheetOpen}
        contactId={contact.id}
        onSubmit={handleCreateInteraction}
      />

      <OccasionForm
        open={isOccasionFormOpen}
        onOpenChange={setIsOccasionFormOpen}
        contactId={contact.id}
        contact={contact}
        onSubmit={handleCreateOccasion}
      />
    </div>
  )
}
