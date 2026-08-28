import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/dashboardAuth";
import { readWhere, updateById } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import type { ChatSession, ChatMessage } from "@/types/dashboard";

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const limited = await rateLimitResponse(getIp(req), "dashboard-writes", {
    limit: 60,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const session = await requireAuth(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { sessionId?: string; message?: string };
  const { sessionId, message } = body;

  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }
  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  const results = await readWhere<ChatSession>("chats", "id", sessionId);
  const chatSession = results[0];
  if (!chatSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const newMsg: ChatMessage = {
    role: "bot",
    text: message.trim(),
    ts: Date.now(),
  };

  await updateById<ChatSession>("chats", sessionId, {
    messages: [...chatSession.messages, newMsg],
    lastMessageAt: new Date().toISOString(),
    agentUsername: session.username,
    agentTookOverAt: chatSession.agentTookOverAt ?? new Date().toISOString(),
    needsHuman: false,
  });

  return NextResponse.json({ ok: true, message: newMsg });
}
