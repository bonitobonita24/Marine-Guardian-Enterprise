import { auth } from "./auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isOnAuthRoute = nextUrl.pathname.startsWith("/login")
  const isOnApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")

  // Skip auth check for auth routes and static files
  if (isOnApiAuthRoute || isOnAuthRoute) {
    return NextResponse.next()
  }

  // Redirect logged in users away from login page
  if (isOnAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl))
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn && !isOnAuthRoute) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search)
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
