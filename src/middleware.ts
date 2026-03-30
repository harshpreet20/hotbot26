import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware that protects /enter/backdrop/dashboard and sub-routes.
 *
 * Auth strategy:
 *  - The login page (/enter/backdrop) calls /api/blog/auth.
 *  - On success the client stores the token in sessionStorage AND
 *    the server sets a short-lived HttpOnly cookie ("backdrop_auth").
 *  - This middleware checks that cookie so the protection works even
 *    if the user navigates directly or refreshes.
 *
 * Note: The cookie is set by /api/blog/auth on every successful login
 *       and cleared by /api/blog/logout (or the Sign Out button).
 */

const COOKIE_NAME = "backdrop_auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard the dashboard section (not the login page itself)
  if (!pathname.startsWith("/enter/backdrop/dashboard")) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(COOKIE_NAME);
  if (cookie?.value) {
    // Cookie present — let the request through
    return NextResponse.next();
  }

  // No cookie → redirect to login
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/enter/backdrop";
  loginUrl.search   = "";
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/enter/backdrop/dashboard/:path*"],
};
