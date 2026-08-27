import { google } from "googleapis";
import { getAuthedClient } from "@/lib/googleAuth";

export interface CalendarEventResult {
  googleEventId: string;
  meetLink: string;
  htmlLink: string;
}

export async function createCalendarMeetEvent(
  userId: string,
  params: {
    title: string;
    description?: string;
    startTime: string;  // ISO datetime
    endTime: string;    // ISO datetime
    attendees?: string[];
    timeZone?: string;
  },
): Promise<CalendarEventResult | null> {
  const auth = await getAuthedClient(userId);
  if (!auth) return null;

  const calendar = google.calendar({ version: "v3", auth });
  const tz = params.timeZone ?? "UTC";

  const res = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    sendUpdates: params.attendees?.length ? "all" : "none",
    requestBody: {
      summary:     params.title,
      description: params.description,
      start:       { dateTime: params.startTime, timeZone: tz },
      end:         { dateTime: params.endTime,   timeZone: tz },
      attendees:   params.attendees?.map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: globalThis.crypto.randomUUID(),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
  });

  const event = res.data;
  const meetLink =
    event.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video")?.uri ?? "";

  return {
    googleEventId: event.id!,
    meetLink,
    htmlLink: event.htmlLink ?? "",
  };
}

export async function updateCalendarMeetEvent(
  userId: string,
  googleEventId: string,
  params: {
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    timeZone?: string;
  },
): Promise<void> {
  const auth = await getAuthedClient(userId);
  if (!auth) return;

  const calendar = google.calendar({ version: "v3", auth });
  const tz = params.timeZone ?? "UTC";
  const patch: Record<string, unknown> = {};
  if (params.title !== undefined)       patch.summary     = params.title;
  if (params.description !== undefined) patch.description = params.description;
  if (params.startTime !== undefined)   patch.start = { dateTime: params.startTime, timeZone: tz };
  if (params.endTime !== undefined)     patch.end   = { dateTime: params.endTime,   timeZone: tz };
  if (!Object.keys(patch).length)      return;

  await calendar.events.patch({
    calendarId: "primary",
    eventId:    googleEventId,
    requestBody: patch,
  });
}

export async function cancelCalendarMeetEvent(
  userId: string,
  googleEventId: string,
): Promise<void> {
  const auth = await getAuthedClient(userId);
  if (!auth) return;

  const calendar = google.calendar({ version: "v3", auth });
  try {
    await calendar.events.delete({ calendarId: "primary", eventId: googleEventId });
  } catch { /* already deleted or not found */ }
}
