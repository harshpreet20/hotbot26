import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware that protects:
 *  1. /enter/backdrop/dashboard/* — admin dashboard (backdrop_auth cookie)
 *  2. /customers/dashboard*      — customer portal pages (hotbot_portal cookie)
 *     (excludes /customers, /customers/login, /customers/setup, /customers/verify
 *      which are the public auth entry points)
 *
 * Note: API routes under /api/customers/* are independently protected via
 * verifyPortalSession() in each route handler. This middleware only guards
 * the Next.js page routes so unauthenticated visitors get a redirect instead
 * of a blank/broken UI.
 */

const ADMIN_COOKIE   = "backdrop_auth";
const PORTAL_COOKIE  = "hotbot_portal";

// Portal paths that must remain publicly accessible (login, invite, verify)
const PORTAL_PUBLIC_PATHS = [
  "/customers",
  "/customers/login",
  "/customers/setup",
  "/customers/verify",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin dashboard guard ─────────────────────────────────────────────────
  if (pathname.startsWith("/enter/backdrop/dashboard")) {
    const cookie = req.cookies.get(ADMIN_COOKIE);
    if (cookie?.value) return NextResponse.next();

    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/enter/backdrop";
    loginUrl.search   = "";
    return NextResponse.redirect(loginUrl);
  }

  // ── Customer portal guard ─────────────────────────────────────────────────
  // Protect /customers/* except the public auth pages listed above.
  if (pathname.startsWith("/customers/")) {
    // Allow exact public paths and their sub-paths
    const isPublic = PORTAL_PUBLIC_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p + "?")
    );
    if (isPublic) return NextResponse.next();

    const cookie = req.cookies.get(PORTAL_COOKIE);
    if (cookie?.value) return NextResponse.next();

    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/customers";
    loginUrl.search   = `?redirect=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/enter/backdrop/dashboard/:path*",
    "/customers/:path*",
  ],
};
