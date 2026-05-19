import { NextRequest, NextResponse } from "next/server";

const WA_NUMBER = "919700001534";

// Redirect /api/wa?text=... → https://wa.me/<number>?text=...
// Used in transactional emails so all links are on the sending domain,
// avoiding Resend's "URLs don't match sending domain" spam-filter warning.
export function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get("text") ?? "";
  const dest  = `https://wa.me/${WA_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  return NextResponse.redirect(dest, { status: 302 });
}
