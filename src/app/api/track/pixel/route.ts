import { NextRequest, NextResponse } from "next/server";
import { sb, isSupabaseEnabled } from "@/lib/supabase";

// 1×1 transparent GIF
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (id && isSupabaseEnabled()) {
    sb()
      .from("email_logs")
      .update({ opened_at: new Date().toISOString(), status: "opened", last_event: "opened" })
      .eq("id", id)
      .is("opened_at", null)
      .then(() => {})
      .catch(() => {});
  }

  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      "Content-Type":  "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma":        "no-cache",
      "Expires":       "0",
    },
  });
}
