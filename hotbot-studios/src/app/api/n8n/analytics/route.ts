import { NextRequest, NextResponse } from "next/server";
import { triggerN8n } from "@/lib/n8n";

// Analytics event tracking — routes to the unified FORMS pipeline with type:"analytics"
// Fire-and-forget: always returns 200 immediately; n8n logs the event to Google Sheets.
// Previously this route was MISSING (trackEvent() in utils.ts called it but got 404s).
export async function POST(req: NextRequest) {
  // Respond immediately — analytics must never block the user
  const response = NextResponse.json({ success: true });

  // Process asynchronously (fire and forget)
  req.json()
    .then((body: Record<string, unknown>) => {
      return triggerN8n("forms", {
        type:       "analytics",
        event:      body.event      || "unknown",
        properties: body.properties || {},
        page:       body.page       || "",
        sessionId:  body.sessionId  || "",
        referrer:   body.referrer   || "",
      }, { timeout: 5_000 });
    })
    .catch((err: unknown) => {
      console.error("Forms (analytics) pipeline error:", err);
    });

  return response;
}
