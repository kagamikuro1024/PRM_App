"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full"
      type="button"
      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign out
    </Button>
  )
}
