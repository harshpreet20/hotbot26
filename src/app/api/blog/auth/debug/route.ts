/**
 * Auth diagnostics endpoint — protected by SETUP_SECRET.
 * Shows Supabase connectivity, user list, and backdrop_users status.
 *
 * Usage:
 *   GET /api/blog/auth/debug?secret=YOUR_SETUP_SECRET
 */
import { NextRequest, NextResponse } from "next/server";
import { sb, isSupabaseEnabled } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const secret = process.env.SETUP_SECRET;
  if (!secret || req.nextUrl.searchParams.get("secret") !== secret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result: Record<string, unknown> = {
    supabase_enabled: isSupabaseEnabled(),
    has_supabase_url: !!process.env.SUPABASE_URL,
    has_service_key:  !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  if (!isSupabaseEnabled()) {
    result.note = "Supabase not configured — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY";
    return NextResponse.json(result);
  }

  // List backdrop users
  try {
    const { data: users, error } = await sb()
      .from("backdrop_users")
      .select("id, email, username, role, status, created_at, approved_by, approved_at")
      .order("created_at", { ascending: false });

    if (error) {
      result.backdrop_users_error = error.message;
    } else {
      result.backdrop_users       = users;
      result.backdrop_users_count = users?.length ?? 0;
    }
  } catch (err) {
    result.backdrop_users_error = err instanceof Error ? err.message : String(err);
  }

  // Test sessions table connectivity
  try {
    const { count, error } = await sb()
      .from("sessions")
      .select("*", { count: "exact", head: true });
    result.sessions_count = error ? `error: ${error.message}` : count;
  } catch (err) {
    result.sessions_error = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(result, { status: 200 });
}
