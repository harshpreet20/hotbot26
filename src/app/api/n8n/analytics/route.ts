import { NextRequest, NextResponse } from "next/server";
import { triggerN8n } from "@/lib/n8n";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Fire and forget — don't block the user
    triggerN8n("analytics", {
      event: body.event,
      properties: body.properties || {},
      userAgent: req.headers.get("user-agent") || "",
      referer: req.headers.get("referer") || "",
    }).catch(() => {}); // Silent fail

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
