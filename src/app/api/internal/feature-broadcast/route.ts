import { NextRequest, NextResponse } from "next/server";
import { authorizeRole } from "@/lib/dashboardAuth";
import { extractToken } from "@/lib/dashboardAuth";
import { sendFeatureBroadcast } from "@/lib/resend";

const SEGMENTS = ["Tickets","Leads","Analytics","Team Chat","Callbacks","Blog","Tasks","Invoices","Users","Clients","CRM","General"] as const;

export async function POST(req: NextRequest) {
  const session = await authorizeRole(extractToken(req), "super_admin", "admin");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { segment?: string; changes?: string[]; version?: string };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const { segment, changes = [], version } = body;
  if (!segment) return NextResponse.json({ error: "segment is required." }, { status: 400 });
  if (!changes.length) return NextResponse.json({ error: "changes array must not be empty." }, { status: 400 });

  const rawEmails = process.env.TEAM_NOTIFY_EMAILS ?? "";
  const recipients = rawEmails.split(",").map((e) => e.trim()).filter(Boolean);
  if (!recipients.length) {
    return NextResponse.json({ error: "TEAM_NOTIFY_EMAILS env var not configured." }, { status: 503 });
  }

  await sendFeatureBroadcast({ segment, changes, pushedBy: session.username, recipients, version });

  return NextResponse.json({ success: true, sent: recipients.length, segment });
}
