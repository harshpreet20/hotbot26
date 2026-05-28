import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE  = "backdrop_auth";
const PORTAL_COOKIE = "portal_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin dashboard ─────────────────────────────────────────────────────────
  if (pathname.startsWith("/enter/backdrop/dashboard")) {
    if (req.cookies.get(ADMIN_COOKIE)?.value) return NextResponse.next();
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/enter/backdrop";
    loginUrl.search   = "";
    return NextResponse.redirect(loginUrl);
  }

  // ── Customer portal dashboard ────────────────────────────────────────────────
  if (pathname.startsWith("/portal/dashboard")) {
    if (req.cookies.get(PORTAL_COOKIE)?.value) return NextResponse.next();
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/portal/login";
    loginUrl.search   = "";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/enter/backdrop/dashboard/:path*", "/portal/dashboard/:path*"],
};
