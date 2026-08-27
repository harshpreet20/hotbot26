import { NextRequest, NextResponse } from "next/server";
import { authorizeAny } from "@/lib/dashboardAuth";
import { exchangeCode, saveGoogleToken } from "@/lib/googleAuth";

// GET /api/auth/google/callback — Google OAuth2 callback
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(
      new URL(`/enter/backdrop/dashboard/meetings?google_error=${encodeURIComponent(error ?? "cancelled")}`, req.url),
    );
  }

  let token: string;
  let returnTo = "/enter/backdrop/dashboard/meetings";
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString("utf8")) as {
      token?: string;
      returnTo?: string;
    };
    token   = decoded.token ?? "";
    returnTo = decoded.returnTo ?? returnTo;
  } catch {
    return NextResponse.redirect(new URL("/enter/backdrop/dashboard/meetings?google_error=invalid_state", req.url));
  }

  // Validate the dashboard session from state
  const session = await authorizeAny(token);
  if (!session) {
    return NextResponse.redirect(new URL("/enter/backdrop?google_error=session_expired", req.url));
  }

  try {
    const data = await exchangeCode(code);
    await saveGoogleToken(session.userId, data);
    return NextResponse.redirect(new URL(`${returnTo}?google_connected=1`, req.url));
  } catch (err) {
    console.error("[google/callback] token exchange error:", err);
    return NextResponse.redirect(
      new URL(`${returnTo}?google_error=exchange_failed`, req.url),
    );
  }
}
