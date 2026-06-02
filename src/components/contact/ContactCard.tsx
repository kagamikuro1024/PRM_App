"use client"

import { Contact } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Mail,
  Phone,
  Link2,
  Star,
  Pencil,
  Trash2,
  Heart,
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface ContactCardProps {
  contact: Contact & { healthScore?: number }
  onEdit: (contact: Contact) => void
  onDelete: (contactId: string) => void
}

const categoryColors: Record<string, string> = {
  professional: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  personal: "bg-green-100 text-green-800 hover:bg-green-200",
  mentor: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  mentee: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  community: "bg-teal-100 text-teal-800 hover:bg-teal-200",
  family: "bg-pink-100 text-pink-800 hover:bg-pink-200",
}

export function ContactCard({ contact, onEdit, onDelete }: ContactCardProps) {
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

  const getHealthScoreColor = (score?: number): string => {
    if (!score) return "#ef4444";
    if (score >= 70) return "#22c55e";
    if (score >= 40) return "#eab308";
    return "#ef4444";
  }

  const getLastContactText = () => {
    if (!contact.lastContactAt) return "Never contacted";
    return `Last contact: ${formatDistanceToNow(new Date(contact.lastContactAt), { addSuffix: true })}`;
  }

  const healthScore = contact.healthScore || 0;
  const healthColor = getHealthScoreColor(healthScore);

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-lg h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Health Score Indicator */}
            <div className="relative flex items-center justify-center">
              <svg className="h-10 w-10 transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke={healthColor}
                  strokeWidth="3"
                  strokeDasharray={`${(healthScore / 100) * 100.53} 100.53`}
                  style={{ transition: "stroke-dasharray 0.3s ease" }}
                />
              </svg>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg">
                <Link href={`/contacts/${contact.id}`} className="hover:underline">
                  {contact.name}
                </Link>
              </CardTitle>
              <div className="flex items-center gap-1">
                {renderStars(contact.strength)}
              </div>
              <p className="text-xs text-gray-500">{getLastContactText()}</p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={`${categoryColors[contact.category]} border-none`}
          >
            {contact.category}
          </Badge>
        </div>
      </CardHeader>

        <CardContent className="space-y-3 pb-3">
          {/* Contact Info */}
          <div className="space-y-2 text-sm">
            {contact.email && (
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="truncate">{contact.email}</span>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{contact.phone}</span>
              </div>
            )}
            {contact.linkedinUrl && (
              <div className="flex items-center gap-2 text-gray-600">
                <Link2 className="h-4 w-4 text-gray-400" />
                <span className="truncate">LinkedIn</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {contact.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {contact.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{contact.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Love Language */}
          {contact.loveLanguage && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Heart className="h-3 w-3" />
              <span>{contact.loveLanguage}: {contact.loveLanguageDetails}</span>
            </div>
          )}

          {/* Expertise */}
          {contact.expertiseTags && contact.expertiseTags.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500">Expertise</p>
              <div className="flex flex-wrap gap-1">
                {contact.expertiseTags.slice(0, 2).map((exp) => (
                  <Badge key={exp} variant="secondary" className="text-xs">
                    {exp}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>

      <CardFooter className="border-t bg-gray-50 px-6 py-3">
        <div className="flex w-full justify-between gap-2">
          <Link
            href={`/contacts/${contact.id}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            View
          </Link>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(contact)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(contact.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
