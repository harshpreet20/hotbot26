export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { sb } from "@/lib/supabase";
import { verifyPortalSession } from "@/lib/portal-session";

export async function GET(req: NextRequest) {
  const email = verifyPortalSession(req);
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: user, error } = await sb()
    .from("client_users")
    .select("id, email, name, role, client_id, avatar_url, created_at")
    .eq("email", email)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data: client } = await sb()
    .from("clients")
    .select("id, client_id, name, company, status, onboarding_stage, account_manager, subscription_status, industry, website, portal_enabled")
    .eq("client_id", user.client_id)
    .single();

  return NextResponse.json({ user, client });
}
