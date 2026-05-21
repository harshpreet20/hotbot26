import { NextRequest, NextResponse } from "next/server";
import { sb } from "@/lib/supabase";
import { verifyPortalSession } from "@/lib/portal-session";

export async function GET(req: NextRequest) {
  const email = verifyPortalSession(req);
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: notifications, error } = await sb()
    .from("crm_notifications")
    .select("id, type, title, body, link, entity_type, entity_id, read_at, created_at")
    .eq("recipient_email", email)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ notifications: notifications ?? [] });
}

export async function PATCH(req: NextRequest) {
  const email = verifyPortalSession(req);
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids } = (await req.json()) as { ids?: string[] };
  if (!ids?.length) return NextResponse.json({ error: "ids required" }, { status: 400 });

  const { error } = await sb()
    .from("crm_notifications")
    .update({ read_at: new Date().toISOString() })
    .in("id", ids)
    .eq("recipient_email", email);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
