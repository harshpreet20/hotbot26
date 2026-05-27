export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { sb } from "@/lib/supabase";
import { verifyPortalSession } from "@/lib/portal-session";

export async function GET(req: NextRequest) {
  const email = verifyPortalSession(req);
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: user } = await sb()
    .from("client_users")
    .select("client_id")
    .eq("email", email)
    .single();

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { data: projects, error } = await sb()
    .from("projects")
    .select("id, project_number, name, description, status, stage, priority, progress, start_date, target_date, assigned_to, account_manager, budget, currency")
    .eq("client_id", user.client_id)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ projects: projects ?? [] });
}
