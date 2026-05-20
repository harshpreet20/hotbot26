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
    const now = new Date().toISOString();
    const client = sb();
    // Fetch current row to increment open_count and append to open_history
    const { data: row } = await client
      .from("email_logs")
      .select("opened_at, open_count, open_history")
      .eq("id", id)
      .single();

    const openCount = ((row?.open_count as number | null) ?? 0) + 1;
    const history = (row?.open_history as string[] | null) ?? [];
    history.push(now);

    await client
      .from("email_logs")
      .update({
        opened_at:      row?.opened_at ?? now,
        last_opened_at: now,
        open_count:     openCount,
        open_history:   history,
        status:         "opened",
        last_event:     "opened",
      })
      .eq("id", id);
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
