import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { sb } from "@/lib/supabase";

// Table → column mapping for meet_url
const TABLE_MAP: Record<string, { table: string; idCol: string }> = {
  project: { table: "projects", idCol: "id" },
  lead:    { table: "leads",    idCol: "id" },
  ticket:  { table: "tickets",  idCol: "id" },
};

// Generate a Google Meet-compatible room code (10 chars: xxx-xxxx-xxx)
function generateMeetCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const seg = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${seg(3)}-${seg(4)}-${seg(3)}`;
}

// PATCH /api/dashboard/meet — set or generate a meet URL for an entity
export async function PATCH(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    entityType: string;
    entityId: string;
    meetUrl?: string;         // if provided, use this URL; otherwise generate
    scheduledAt?: string;     // ISO datetime
    action?: "generate" | "clear";
  };

  const mapping = TABLE_MAP[body.entityType];
  if (!mapping) return NextResponse.json({ error: "Invalid entityType" }, { status: 400 });
  if (!body.entityId) return NextResponse.json({ error: "Missing entityId" }, { status: 400 });

  let meetUrl: string | null = null;
  if (body.action === "clear") {
    meetUrl = null;
  } else if (body.meetUrl) {
    meetUrl = body.meetUrl;
  } else {
    // Auto-generate a Google Meet URL
    meetUrl = `https://meet.google.com/${generateMeetCode()}`;
  }

  const updatePayload: Record<string, unknown> = { meet_url: meetUrl };
  if ("scheduledAt" in body) updatePayload.meet_scheduled_at = body.scheduledAt ?? null;

  const { data, error } = await sb()
    .from(mapping.table)
    .update(updatePayload)
    .eq(mapping.idCol, body.entityId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log the action in crm_updates if it's a lead
  if (body.entityType === "lead" && meetUrl) {
    await sb().from("crm_updates").insert({
      lead_id:    body.entityId,
      type:       "meeting",
      content:    `Google Meet scheduled: ${meetUrl}${body.scheduledAt ? ` at ${new Date(body.scheduledAt).toLocaleString("en-IN")}` : ""}`,
      created_by: session.username,
    }).catch(() => null);
  }

  return NextResponse.json({ meetUrl, entity: data });
}
