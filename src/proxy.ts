import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
})

export const config = {
  matcher: [
    // Protect dashboard and contact routes
    "/dashboard/:path*",
    "/contacts/:path*",
    "/reminders/:path*",
    "/api/contacts/:path*",
    "/api/interactions/:path*",
    "/api/occasions/:path*",
    "/api/reminders/:path*",
    // Exclude public routes
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
