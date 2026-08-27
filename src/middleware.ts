import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin dashboard ─────────────────────────────────────────────────────────
  if (pathname.startsWith("/enter/backdrop/dashboard")) {
    const session = await auth();
    if (session?.user) return NextResponse.next();
    // Fallback: accept legacy backdrop_auth cookie during transition period
    if (req.cookies.get("backdrop_auth")?.value) return NextResponse.next();
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/enter/backdrop";
    loginUrl.search   = "";
    return NextResponse.redirect(loginUrl);
  }

  // ── Customer portal dashboard ────────────────────────────────────────────────
  if (pathname.startsWith("/portal/dashboard")) {
    if (req.cookies.get("portal_session")?.value) return NextResponse.next();
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
