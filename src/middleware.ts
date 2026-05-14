import { NextRequest, NextResponse } from "next/server";

// AUTH TEMPORARILY DISABLED — middleware cookie guard bypassed
// Restore by reverting this file
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/enter/backdrop/dashboard/:path*"],
};
