import { NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE = 'hb_session'

// Routes that require authentication (write operations)
const PROTECTED_PREFIXES = [
  '/api/crm',
  '/api/invoices',
  '/api/auth/signup', // only super_admin can create users
]

// Blog write operations need auth; GET is public
const BLOG_PREFIX = '/api/blog'

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl
  const method = req.method

  // Public routes — always allow
  if (pathname === '/api/auth/login' || pathname === '/api/auth/logout' || pathname === '/api/auth/me') {
    return NextResponse.next()
  }

  // n8n webhook routes — always allow (public-facing forms/chat)
  if (pathname.startsWith('/api/n8n/') || pathname === '/api/health') {
    return NextResponse.next()
  }

  // Blog GET requests are public (reading posts)
  if (pathname.startsWith(BLOG_PREFIX) && method === 'GET' && searchParams.get('all') !== '1') {
    return NextResponse.next()
  }

  // Check if route needs protection
  const needsAuth =
    PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) ||
    (pathname.startsWith(BLOG_PREFIX) && method !== 'GET')

  if (!needsAuth) return NextResponse.next()

  // Check session cookie exists (actual validation happens in the route via auth helpers)
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
