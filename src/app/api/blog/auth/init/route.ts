/**
 * One-time admin initialisation endpoint.
 * Firebase has been removed — user management now goes through Supabase.
 * This endpoint is kept as a stub to avoid 404s on existing integrations.
 */
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Firebase has been removed. Manage users via the Backdrop dashboard at /enter/backdrop/dashboard/users." },
    { status: 410 },
  );
}
