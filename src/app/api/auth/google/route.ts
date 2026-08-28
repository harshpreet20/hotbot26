import { NextRequest, NextResponse } from "next/server";
import { extractToken, requireAuth } from "@/lib/dashboardAuth";
import { getAuthUrl } from "@/lib/googleAuth";

// GET /api/auth/google?secret=<token>&returnTo=<path>
// Initiates Google OAuth2 flow. Token passed via ?secret= because this is
// a browser navigation (no Authorization header available).
export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "Google OAuth not configured — set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET" },
      { status: 503 },
    );
  }

  const token    = extractToken(req) ?? "";
  const returnTo = req.nextUrl.searchParams.get("returnTo") ?? "/enter/backdrop/dashboard/meetings";
  const state    = Buffer.from(JSON.stringify({ token, returnTo })).toString("base64url");
  const url      = getAuthUrl(state);

  return NextResponse.redirect(url);
}
