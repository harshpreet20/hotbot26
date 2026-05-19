/**
 * Auth config diagnostic — returns auth provider status.
 * Firebase has been removed. Auth is now handled by Supabase.
 */
import { NextResponse } from "next/server";

export async function GET() {
  const hasSupabaseUrl  = !!process.env.SUPABASE_URL;
  const hasSupabaseKey  = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  return NextResponse.json({
    auth_provider: "supabase",
    firebase_mode_enabled: false,
    env: {
      SUPABASE_URL:              hasSupabaseUrl ? "set" : "MISSING",
      SUPABASE_SERVICE_ROLE_KEY: hasSupabaseKey ? "set" : "MISSING",
    },
    diagnosis: hasSupabaseUrl && hasSupabaseKey
      ? "Supabase auth is configured correctly."
      : "Missing Supabase env vars. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.",
  });
}
