import { NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE = 'hb_session'

// Routes that require authentication
const PROTECTED_PREFIXES = [
  '/api/crm/',
  '/api/invoices/',
]

// Blog writes require auth; reads are public
const BLOG_WRITE_METHODS = new Set(['POST', 'PATCH', 'DELETE', 'PUT'])

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const { method } = req

  // Check if this is a protected CRM or invoices route
  const isProtected = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix))

  // Blog writes need auth; GET /api/blog is public
  const isBlogWrite = pathname.startsWith('/api/blog') && BLOG_WRITE_METHODS.has(method)

  // Auth management routes (signup requires super_admin — handled inside the route itself)
  // login/logout/me are always public from middleware perspective
  const isAuthWrite = pathname.startsWith('/api/auth/signup')

  if (isProtected || isBlogWrite || isAuthWrite) {
    const token = req.cookies.get(SESSION_COOKIE)?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Full session validation happens inside each route handler
    // Middleware only does the lightweight cookie presence check
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/crm/:path*', '/api/invoices/:path*', '/api/blog/:path*', '/api/auth/signup'],
}
