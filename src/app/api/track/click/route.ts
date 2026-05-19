import { NextRequest, NextResponse } from "next/server";
import { sb, isSupabaseEnabled } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const id  = req.nextUrl.searchParams.get("id");
  const url = req.nextUrl.searchParams.get("url");

  if (id && isSupabaseEnabled()) {
    const now    = new Date().toISOString();
    const client = sb();

    const { data: row } = await client
      .from("email_logs")
      .select("clicked_at, click_count, click_history")
      .eq("id", id)
      .single();

    const clickCount   = ((row?.click_count as number | null) ?? 0) + 1;
    const history      = (row?.click_history as Array<{ url: string; at: string }> | null) ?? [];
    history.push({ url: url ?? "", at: now });

    void client
      .from("email_logs")
      .update({
        clicked_at:      row?.clicked_at ?? now,
        last_clicked_at: now,
        click_count:     clickCount,
        click_history:   history,
        status:          "clicked",
        last_event:      "clicked",
      })
      .eq("id", id);
  }

  // Redirect to the original destination (fall back to homepage if missing/invalid)
  const dest = url && /^https?:\/\//.test(url) ? url : process.env.NEXT_PUBLIC_SITE_URL ?? "/";
  return NextResponse.redirect(dest, { status: 302 });
}
