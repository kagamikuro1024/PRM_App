import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { seedUserData } from "@/lib/user-seed"

const prismaAdapter = PrismaAdapter(prisma) as unknown as NextAuthOptions["adapter"]

export const authOptions: NextAuthOptions = {
  adapter: prismaAdapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET ?? process.env.NEXT_AUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      // When a user signs in for the first time (or anytime), ensure they have sample data
      // This will only seed if the user has no contacts yet
      if (user?.id) {
        try {
          await seedUserData(user.id);
        } catch (error) {
          console.error("Failed to seed sample data for user:", user.id, error);
          // Don't block sign in if seeding fails
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id
      }
      return token
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
