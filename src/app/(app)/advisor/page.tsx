"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Copy } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

interface Suggestion {
  contactName: string
  reason: string
  approach: string
  timing: string
  contactId?: string
}

function AdvisorContent() {
  const searchParams = useSearchParams()
  const q = searchParams.get("q")
  
  const [query, setQuery] = useState(q || "")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const triggerSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setError(null)
    setSuggestions([])

    try {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to get advice")
      }

      setSuggestions(data.suggestions || [])
      if (data.suggestions?.length === 0) {
        setError("No suitable contacts found. Try broadening your query or add more contacts with expertise tags.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }, [])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (q) {
      triggerSearch(q)
    }
  }, [q, triggerSearch])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await triggerSearch(query)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Message copied to clipboard!")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Advisor</h1>
        <p className="text-gray-600">
          Ask who&apos;s the best person in your network to help with something
        </p>
      </div>

      {/* Query Input */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Who can help me with fundraising advice? or Who knows about Python?"
              className="flex-1 text-lg py-6"
              disabled={isLoading}
            />
            <Button type="submit" size="lg" disabled={isLoading || !query.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Ask AI"
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            The AI will analyze your network and suggest the best contacts based on their expertise, relationship strength, and recent interactions.
          </p>
        </form>
      </Card>

      {/* Results */}
      {error && (
        <Card className="p-6 border-red-200 bg-red-50">
          <p className="text-red-800">{error}</p>
        </Card>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Top Recommendations</h2>
          {suggestions.map((suggestion, idx) => (
            <Card
              key={idx}
              className="p-6 border-2 bg-gradient-to-r from-blue-50 to-orange-50"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center text-white font-bold">
                    {suggestion.contactName?.slice(0, 2).toUpperCase() || "??"}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{suggestion.contactName}</h3>
                    {suggestion.contactId && (
                      <Link
                        href={`/contacts/${suggestion.contactId}`}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-muted hover:text-foreground h-8 px-3 py-1"
                      >
                        View Profile
                      </Link>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Why this person?</p>
                      <p className="text-sm text-gray-600">{suggestion.reason}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Suggested approach</p>
                      <p className="text-sm text-gray-600 italic">&quot;{suggestion.approach}&quot;</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => copyToClipboard(suggestion.approach)}
                      >
                        <Copy className="h-3 w-3 mr-2" />
                        Copy message
                      </Button>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Timing</p>
                      <p className="text-sm text-gray-600">{suggestion.timing}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && suggestions.length === 0 && !error && (
        <Card className="p-12 text-center">
          <h3 className="font-medium text-gray-900 mb-2">Ask me anything about your network</h3>
          <p className="text-gray-600 mb-4">
            I know about your contacts, their expertise, and your relationship history. Ask me who would be best to reach out to for advice, introductions, or help.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <span className="px-3 py-1 bg-gray-100 rounded-full">Who can review my code?</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">Who knows investors?</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">Who should I ask about marketing?</span>
          </div>
        </Card>
      )}
    </div>
  )
}

export default function AdvisorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <AdvisorContent />
    </Suspense>
  )
}
