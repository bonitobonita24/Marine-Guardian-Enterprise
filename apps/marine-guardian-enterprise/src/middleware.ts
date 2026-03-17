import { auth } from "./auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = req.auth != null
  const isOnApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isOnLoginPage = nextUrl.pathname === "/login"
  const isOnRootPage = nextUrl.pathname === "/"

  // Always allow NextAuth callback routes
  if (isOnApiAuthRoute) return NextResponse.next()

  // Logged-in users on root → redirect to their active tenant slug (done client-side via page.tsx)
  if (isOnRootPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // Redirect logged-in users away from login page
  if (isOnLoginPage && isLoggedIn) {
    const activeTenantSlug = req.auth?.user?.activeTenantSlug
    if (activeTenantSlug != null) {
      return NextResponse.redirect(new URL(`/${activeTenantSlug}`, nextUrl))
    }
    return NextResponse.next()
  }

  // Unauthenticated users requesting protected pages → send to login
  if (!isLoggedIn && !isOnLoginPage) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search)
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
