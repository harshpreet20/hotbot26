import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/dashboardAuth";
import { sb, isSupabaseEnabled } from "@/lib/supabase";

// In-memory store for one-time impersonation tokens (60s TTL)
const impersonateTokens = new Map<string, { clientEmail: string; expiresAt: number }>();

function cleanup() {
  const now = Date.now();
  for (const [k, v] of impersonateTokens) {
    if (v.expiresAt < now) impersonateTokens.delete(k);
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "super_admin") {
    return NextResponse.json({ error: "Super admin only" }, { status: 403 });
  }

  const { clientEmail } = await req.json() as { clientEmail?: string };
  if (!clientEmail) return NextResponse.json({ error: "clientEmail required" }, { status: 400 });

  if (!isSupabaseEnabled()) {
    return NextResponse.json({ error: "Supabase required for impersonation" }, { status: 503 });
  }

  // Verify the client_user exists and is active
  const { data: userRow } = await sb()
    .from("client_users")
    .select("id, email, name")
    .eq("email", clientEmail.toLowerCase().trim())
    .eq("is_active", true)
    .single();

  if (!userRow) {
    return NextResponse.json({ error: "Client portal account not found" }, { status: 404 });
  }

  cleanup();
  const token = crypto.randomUUID();
  impersonateTokens.set(token, { clientEmail: userRow.email as string, expiresAt: Date.now() + 60_000 });

  return NextResponse.json({ token, redirectUrl: `/portal/impersonate?t=${token}` });
}

// Used by the impersonate page to exchange token for email (internal)
export async function GET(req: NextRequest) {
  // Allow either an authenticated admin session or a trusted internal call.
  // INTERNAL_SECRET must be set in env — no insecure fallback.
  const internalSecret = process.env.INTERNAL_SECRET;
  const providedSecret = req.headers.get("x-internal-secret");
  const isInternal = internalSecret != null && providedSecret === internalSecret;
  if (!isInternal) {
    const session = await requireAuth(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const t = new URL(req.url).searchParams.get("t");
  if (!t) return NextResponse.json({ error: "token required" }, { status: 400 });

  cleanup();
  const entry = impersonateTokens.get(t);
  if (!entry || entry.expiresAt < Date.now()) {
    return NextResponse.json({ error: "Token expired or invalid" }, { status: 401 });
  }

  impersonateTokens.delete(t); // one-time use
  return NextResponse.json({ clientEmail: entry.clientEmail });
}
