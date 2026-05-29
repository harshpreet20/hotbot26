import { NextRequest, NextResponse } from "next/server";
import { getPortalUser } from "@/lib/portalAuth";
import { readAll, insert, newId } from "@/lib/store";
import type { Meeting } from "@/types/dashboard";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const user = await getPortalUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const all = await readAll<Meeting>("meetings");
  const meetings = all.filter(
    (m) => m.clientId === user.clientRef || m.clientId === user.clientId || m.clientEmail === user.email
  );

  return NextResponse.json({ meetings });
}

// POST — customer requests a meeting
export async function POST(req: NextRequest): Promise<NextResponse> {
  const user = await getPortalUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { title?: string; description?: string; preferredTime?: string };
  if (!body.title?.trim()) return NextResponse.json({ error: "title required" }, { status: 400 });

  const now = new Date().toISOString();
  const meeting: Meeting = {
    id:           newId(),
    title:        body.title.trim(),
    description:  body.description?.trim() ?? `Meeting request from ${user.name} (${user.email})`,
    clientId:     user.clientRef || user.clientId,
    clientEmail:  user.email,
    clientName:   user.name,
    hostUsername: "admin",
    attendees:    [user.email],
    startTime:    body.preferredTime ?? now,
    endTime:      body.preferredTime ?? now,
    status:       "scheduled",
    notes:        body.preferredTime ? `Preferred time: ${new Date(body.preferredTime).toLocaleString()}` : "Time TBD — awaiting confirmation",
    createdAt:    now,
    updatedAt:    now,
  };

  await insert<Meeting>("meetings", meeting);
  return NextResponse.json({ meeting }, { status: 201 });
}
