import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { ContactDetailClient } from "./contact-detail-client"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { title: "Unauthorized" }
  }

  const contact = await prisma.contact.findFirst({
    where: { id, userId: session.user.id, isArchived: false },
    select: { name: true },
  })

  if (!contact) {
    return { title: "Contact Not Found" }
  }

  return {
    title: `${contact.name} — PRM`,
  }
}

export default async function ContactDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    notFound()
  }

  const { id } = await params

  const contact = await prisma.contact.findFirst({
    where: { id, userId: session.user.id, isArchived: false },
    include: {
      interactions: {
        orderBy: { date: "desc" },
        take: 20,
      },
      occasions: {
        orderBy: { date: "asc" },
      },
    },
  })

  if (!contact) {
    notFound()
  }

  return <ContactDetailClient contact={contact} />
}
