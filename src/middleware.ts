import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin dashboard ─────────────────────────────────────────────────────────
  if (pathname.startsWith("/enter/backdrop/dashboard")) {
    // Auth.js JWT session — only active when AUTH_SECRET is configured.
    // Without it the app falls back to the legacy backdrop_auth cookie so
    // existing deployments continue to work without any env-var change.
    if (process.env.AUTH_SECRET) {
      try {
        const { auth } = await import("@/auth");
        const session = await auth();
        if (session?.user) return NextResponse.next();
      } catch {
        // Auth.js misconfigured or JWT invalid — fall through to cookie check
      }
    }

    // Legacy cookie fallback (always checked when Auth.js session is absent)
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
