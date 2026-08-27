import { NextRequest, NextResponse } from "next/server";
import { readWhere } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import type { ChatSession } from "@/types/dashboard";

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function GET(req: NextRequest) {
  const limited = await rateLimitResponse(getIp(req), "chat-poll", {
    limit: 60,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const results = await readWhere<ChatSession>("chats", "id", id);
  const session = results[0];
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const { ip: _ip, ...safe } = session;
  return NextResponse.json({ session: safe });
}
