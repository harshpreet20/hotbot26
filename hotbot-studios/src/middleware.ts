import { NextRequest, NextResponse } from "next/server";

// Route backdrop.hotbotstudios.com → /backdrop/* within the same Next.js app.
// All other hostnames pass through unchanged.
export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const isBackdrop =
    host === "backdrop.hotbotstudios.com" ||
    host.startsWith("backdrop.hotbotstudios.com:");

  if (!isBackdrop) return NextResponse.next();

  const { pathname, search } = req.nextUrl;

  // Already under /backdrop — pass through
  if (pathname.startsWith("/backdrop")) return NextResponse.next();

  // Rewrite root to /backdrop login
  const url = req.nextUrl.clone();
  url.pathname = `/backdrop${pathname === "/" ? "" : pathname}`;
  url.search = search;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    // Match all routes except static files and Next internals
    "/((?!_next/static|_next/image|favicon.ico|logos|og-image|robots.txt|sitemap).*)",
  ],
};
