import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { getGoogleTokenRecord, revokeGoogleToken } from "@/lib/googleAuth";

// GET — check if current user has Google connected
export async function GET(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const record = await getGoogleTokenRecord(session.userId);
  if (!record) return NextResponse.json({ connected: false });

  return NextResponse.json({
    connected: true,
    email: record.email,
    scope: record.scope,
  });
}

// DELETE — disconnect (revoke) Google account
export async function DELETE(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await revokeGoogleToken(session.userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[google-status] revoke error:", err);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }
}
