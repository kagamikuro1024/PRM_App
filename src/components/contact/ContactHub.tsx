"use client"

import { useState, useEffect, useCallback } from "react"
import { z } from "zod"
import { Contact } from "@prisma/client"
import { ContactCard } from "./ContactCard"
import { ContactForm } from "./ContactForm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, Loader2 } from "lucide-react"
import { clientContactSchema } from "@/lib/validations"

const categoryOptions = [
  "all",
  "professional",
  "personal",
  "mentor",
  "mentee",
  "community",
  "family",
] as const

export function ContactHub() {
  const [contacts, setContacts] = useState<(Contact & { healthScore?: number })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedHealth, setSelectedHealth] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name-asc")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)

  const fetchContacts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/contacts")
      if (!response.ok) {
        throw new Error("Failed to fetch contacts")
      }
      const data = await response.json()
      setContacts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }, [])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Filter and sort contacts based on search, category, health status, and sortBy (derived state)
  const filteredContacts = contacts
    .filter((c) => {
      if (selectedCategory !== "all" && c.category !== selectedCategory) {
        return false
      }
      if (selectedHealth !== "all") {
        const score = c.healthScore || 0
        if (selectedHealth === "healthy" && score < 70) return false
        if (selectedHealth === "warning" && (score < 40 || score >= 70)) return false
        if (selectedHealth === "overdue" && score >= 40) return false
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          c.name.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query) ||
          c.tags?.some((tag) => tag.toLowerCase().includes(query))
        if (!matchesSearch) return false
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name)
      }
      if (sortBy === "name-desc") {
        return b.name.localeCompare(a.name)
      }
      if (sortBy === "health-desc") {
        return (b.healthScore || 0) - (a.healthScore || 0)
      }
      if (sortBy === "health-asc") {
        return (a.healthScore || 0) - (b.healthScore || 0)
      }
      if (sortBy === "last-contact-desc") {
        if (!a.lastContactAt) return 1
        if (!b.lastContactAt) return -1
        return new Date(b.lastContactAt).getTime() - new Date(a.lastContactAt).getTime()
      }
      if (sortBy === "last-contact-asc") {
        if (!a.lastContactAt) return 1
        if (!b.lastContactAt) return -1
        return new Date(a.lastContactAt).getTime() - new Date(b.lastContactAt).getTime()
      }
      return 0
    })

  const handleCreate = async (data: z.infer<typeof clientContactSchema>) => {
    const response = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create contact")
    }

    await fetchContacts()
  }

  const handleUpdate = async (data: z.infer<typeof clientContactSchema>) => {
    if (!editingContact) return

    const response = await fetch(`/api/contacts/${editingContact.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to update contact")
    }

    await fetchContacts()
    setEditingContact(null)
  }

  const handleDelete = async (contactId: string) => {
    if (!confirm("Are you sure you want to archive this contact?")) return

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to archive contact")
      }

      await fetchContacts()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to archive")
    }
  }

  const openEditDialog = (contact: Contact) => {
    setEditingContact(contact)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingContact(null)
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name, email, or tags..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={selectedCategory} onValueChange={(value) => { if (value !== null) setSelectedCategory(value); }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedHealth} onValueChange={(value) => { if (value !== null) setSelectedHealth(value); }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Health" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Health</SelectItem>
              <SelectItem value="healthy">Healthy (≥70)</SelectItem>
              <SelectItem value="warning">Warning (40-69)</SelectItem>
              <SelectItem value="overdue">Overdue (&lt;40)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => { if (value !== null) setSortBy(value); }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="health-desc">Health Score High-Low</SelectItem>
              <SelectItem value="health-asc">Health Score Low-High</SelectItem>
              <SelectItem value="last-contact-desc">Recent Contact</SelectItem>
              <SelectItem value="last-contact-asc">Oldest Contact</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Contact Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-800">
          <p className="font-medium">Error loading contacts</p>
          <p className="mt-1 text-sm">{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchContacts}>
            Retry
          </Button>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <p className="text-gray-600">
            {contacts.length === 0
              ? "No contacts yet. Add your first contact to get started!"
              : "No contacts match your search."}
          </p>
          {contacts.length === 0 && (
            <Button className="mt-4" onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={openEditDialog}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Contact Form Dialog */}
      <ContactForm
        open={isFormOpen}
        onOpenChange={closeForm}
        onSubmit={editingContact ? handleUpdate : handleCreate}
        initialData={editingContact}
      />
    </div>
  )
}
