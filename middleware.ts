import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Get the pathname
    const path = req.nextUrl.pathname

    // Allow public access to view-only idea pages
    if (path.startsWith('/ideas/') && !path.includes('/edit') && !path.includes('/create')) {
      return NextResponse.next()
    }

    // If the user is authenticated, allow access to protected routes
    if (req.nextauth.token) {
      return NextResponse.next()
    }

    // If not authenticated, redirect to sign in
    const signInUrl = new URL("/auth/signin", req.url)
    signInUrl.searchParams.set("callbackUrl", req.url)
    return NextResponse.redirect(signInUrl)
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow public access to view-only idea pages
        if (req.nextUrl.pathname.startsWith('/ideas/') && 
            !req.nextUrl.pathname.includes('/edit') && 
            !req.nextUrl.pathname.includes('/create')) {
          return true
        }
        return !!token
      },
    },
  },
)

// Update matcher to be more specific
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/ideas/create/:path*',
    '/ideas/edit/:path*',
    '/ideas/:path*/edit',
    '/projects/:path*',
  ]
}
