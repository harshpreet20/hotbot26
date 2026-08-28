import { NextRequest, NextResponse } from "next/server";
import { isSupabaseEnabled, sb } from "@/lib/supabase";
import { requireAuth } from "@/lib/dashboardAuth";

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);

  const checks: Record<string, { ok: boolean; detail?: string }> = {};

  // Supabase connectivity
  checks.supabase_configured = { ok: isSupabaseEnabled() };

  if (isSupabaseEnabled()) {
    // Test service role key: try reading sessions table (should bypass RLS)
    const { error: sessErr } = await sb().from("sessions").select("token").limit(1);
    checks.supabase_sessions_readable = {
      ok: !sessErr,
      detail: sessErr
        ? sessErr.message.includes("permission denied")
          ? "SUPABASE_SERVICE_ROLE_KEY is the anon key — set the service_role secret key"
          : sessErr.message
        : undefined,
    };

    // Test a data table
    const { error: dataErr } = await sb().from("leads").select("id").limit(1);
    checks.supabase_data_readable = {
      ok: !dataErr,
      detail: dataErr
        ? dataErr.message.includes("permission denied")
          ? "SUPABASE_SERVICE_ROLE_KEY is the anon key — RLS blocks data tables"
          : dataErr.message
        : undefined,
    };
  }

  // Auth
  checks.auth_secret_configured = { ok: !!process.env.AUTH_SECRET };
  checks.session_valid = { ok: !!session };

  const allOk = Object.values(checks).every((c) => c.ok);

  return NextResponse.json({ ok: allOk, checks }, { status: allOk ? 200 : 503 });
}
