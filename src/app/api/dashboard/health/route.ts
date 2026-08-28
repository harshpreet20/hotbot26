import { NextRequest, NextResponse } from "next/server";
import { isSupabaseEnabled, sb } from "@/lib/supabase";
import { requireAuth } from "@/lib/dashboardAuth";

/**
 * Which database is this serverless instance actually talking to?
 *
 * Returns the Supabase project ref and the Postgres host alongside the
 * connectivity checks, so a migration cutover can be confirmed with one request
 * — and so it can be confirmed that *every* instance agrees, rather than a warm
 * one still holding the previous configuration.
 *
 * Both values are non-secret identifiers already visible in any browser network
 * tab. Keys and passwords are never returned.
 */

/** `https://abcd.supabase.co` → `abcd`. Never returns credentials. */
function projectRef(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.split(".")[0] || null;
  } catch {
    return null;
  }
}

/** Host of a Postgres URI, without user, password, or database name. */
function pgHost(uri: string | undefined): string | null {
  if (!uri) return null;
  try {
    const u = new URL(uri);
    return u.port ? `${u.hostname}:${u.port}` : u.hostname;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checks: Record<string, { ok: boolean; detail?: string }> = {};

  checks.supabase_configured = { ok: isSupabaseEnabled() };

  if (isSupabaseEnabled()) {
    // Service role key must bypass RLS to read the sessions table.
    const { error: sessErr } = await sb().from("sessions").select("token").limit(1);
    checks.supabase_sessions_readable = {
      ok: !sessErr,
      detail: sessErr
        ? sessErr.message.includes("permission denied")
          ? "SUPABASE_SERVICE_ROLE_KEY is the anon key — set the service_role secret key"
          : sessErr.message
        : undefined,
    };

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

  checks.auth_secret_configured = { ok: !!process.env.AUTH_SECRET };
  checks.prisma_configured      = { ok: !!process.env.POSTGRES_PRISMA_URL };

  const allOk = Object.values(checks).every((c) => c.ok);

  return NextResponse.json(
    {
      ok: allOk,
      connectedTo: {
        supabaseProjectRef: projectRef(process.env.SUPABASE_URL),
        postgresHost:       pgHost(process.env.POSTGRES_PRISMA_URL),
        vercelRegion:       process.env.VERCEL_REGION ?? null,
      },
      checks,
    },
    { status: allOk ? 200 : 503 },
  );
}
