import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeData } from "@/lib/dashboardAuth";
import { readAll, removeById } from "@/lib/store";
import { isSupabaseEnabled, sb } from "@/lib/supabase";
import type { Contact } from "@/types/dashboard";

export async function GET(req: NextRequest) {
  if (!await authorizeData(extractToken(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ contacts: await readAll<Contact>("contacts") });
}

export async function DELETE(req: NextRequest) {
  if (!await authorizeData(extractToken(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Try Supabase first
  if (isSupabaseEnabled()) {
    const { error } = await sb().from("contacts").delete().eq("id", id);
    if (error) return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // Filesystem fallback
  const all = await readAll<Contact>("contacts");
  if (!all.find((c) => c.id === id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    await removeById("contacts", id);
  } catch (err) {
    console.error("[contacts] delete error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
