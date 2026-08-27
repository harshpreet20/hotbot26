import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { readAll, insert, updateById, removeById, newId } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import type { Meeting } from "@/types/dashboard";
import { createCalendarMeetEvent, updateCalendarMeetEvent, cancelCalendarMeetEvent } from "@/lib/googleCalendar";

function ip(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function GET(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientId  = searchParams.get("clientId");
  const upcoming  = searchParams.get("upcoming");
  const projectId = searchParams.get("projectId");

  let meetings = await readAll<Meeting>("meetings");
  if (clientId)  meetings = meetings.filter((m) => m.clientId === clientId || m.clientEmail === clientId);
  if (projectId) meetings = meetings.filter((m) => (m as { projectId?: string }).projectId === projectId);
  if (upcoming === "true") {
    const now = new Date().toISOString();
    meetings = meetings.filter((m) => m.startTime >= now && m.status === "scheduled");
  }

  return NextResponse.json({ meetings });
}

export async function POST(req: NextRequest) {
  const limited = await rateLimitResponse(ip(req), "dashboard-writes", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Partial<Meeting> & { createGoogleMeet?: boolean };
  if (!body.title?.trim()) return NextResponse.json({ error: "title required" }, { status: 400 });
  if (!body.startTime)     return NextResponse.json({ error: "startTime required" }, { status: 400 });
  if (!body.endTime)       return NextResponse.json({ error: "endTime required" }, { status: 400 });

  const now = new Date().toISOString();
  const meeting: Meeting & { projectId?: string } = {
    id:           newId(),
    title:        body.title.trim(),
    description:  body.description?.trim(),
    clientId:     body.clientId,
    clientEmail:  body.clientEmail,
    clientName:   body.clientName,
    hostUsername: session.username,
    attendees:    body.attendees ?? [],
    startTime:    body.startTime,
    endTime:      body.endTime,
    meetLink:     body.meetLink?.trim(),
    status:       "scheduled",
    notes:        body.notes?.trim(),
    projectId:    (body as { projectId?: string }).projectId,
    createdAt:    now,
    updatedAt:    now,
  };

  // Auto-create Google Meet via Calendar API if requested and user has Google connected
  if (body.createGoogleMeet !== false && !meeting.meetLink) {
    try {
      const calResult = await createCalendarMeetEvent(session.userId, {
        title:       meeting.title,
        description: meeting.description,
        startTime:   meeting.startTime,
        endTime:     meeting.endTime,
        attendees:   meeting.attendees,
      });
      if (calResult) {
        meeting.meetLink       = calResult.meetLink;
        meeting.googleEventId  = calResult.googleEventId;
        (meeting as Meeting & { googleHtmlLink?: string }).googleHtmlLink = calResult.htmlLink;
      }
    } catch (err) {
      console.error("[meetings] Google Calendar create failed:", err);
      // Non-fatal — meeting is still saved without a Meet link
    }
  }

  try {
    await insert<Meeting>("meetings", meeting);
  } catch (err) {
    console.error("[meetings] insert error:", err);
    return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 });
  }
  return NextResponse.json({ meeting }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const limited = await rateLimitResponse(ip(req), "dashboard-writes", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Partial<Meeting> & { id: string };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const all = await readAll<Meeting>("meetings");
  const existing = all.find((m) => m.id === body.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated: Meeting = {
    ...existing,
    title:       body.title?.trim()   ?? existing.title,
    description: body.description     ?? existing.description,
    startTime:   body.startTime       ?? existing.startTime,
    endTime:     body.endTime         ?? existing.endTime,
    meetLink:    body.meetLink        ?? existing.meetLink,
    status:      body.status          ?? existing.status,
    notes:       body.notes           ?? existing.notes,
    attendees:   body.attendees       ?? existing.attendees,
    updatedAt:   new Date().toISOString(),
  };

  // Sync title/time changes to Google Calendar (fire-and-forget)
  if (existing.googleEventId) {
    updateCalendarMeetEvent(session.userId, existing.googleEventId, {
      title:       body.title       !== undefined ? updated.title       : undefined,
      description: body.description !== undefined ? updated.description : undefined,
      startTime:   body.startTime   !== undefined ? updated.startTime   : undefined,
      endTime:     body.endTime     !== undefined ? updated.endTime     : undefined,
    }).catch((err) => console.error("[meetings] Google Calendar sync failed:", err));
  }

  try {
    await updateById<Meeting>("meetings", body.id, updated);
  } catch (err) {
    console.error("[meetings] update error:", err);
    return NextResponse.json({ error: "Failed to update meeting" }, { status: 500 });
  }
  return NextResponse.json({ meeting: updated });
}

export async function DELETE(req: NextRequest) {
  const limited = await rateLimitResponse(ip(req), "dashboard-writes", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const all = await readAll<Meeting>("meetings");
  const existing = all.find((m) => m.id === id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Cancel Google Calendar event (fire-and-forget)
  if (existing.googleEventId) {
    cancelCalendarMeetEvent(session.userId, existing.googleEventId).catch((err) =>
      console.error("[meetings] Google Calendar cancel failed:", err)
    );
  }

  try {
    await removeById("meetings", id);
  } catch (err) {
    console.error("[meetings] delete error:", err);
    return NextResponse.json({ error: "Failed to delete meeting" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
