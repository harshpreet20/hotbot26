import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { insert, newId } from "@/lib/store";
import type { ChatSession, ChatMessage } from "@/types/dashboard";

const SYSTEM_PROMPT = `You are HotBot, the AI assistant for HotBot Studios - a digital marketing and AI automation agency. Help visitors learn about services, answer pricing and process questions, and guide them toward action (booking a call, filling a form, or contacting via WhatsApp).

Services: AI Automation, AI Chatbots, Voice AI, SEO, PPC, Social Media, Content Strategy, PR, UI/UX, Software Development.

Keep responses concise (2–4 sentences), warm, and action-oriented. If unsure, suggest WhatsApp (+91 97000 01534) or a callback.`;

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";

  let body: { message?: string; history?: { role: string; content: string }[]; sessionId?: string };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  const message = (body.message || "").trim();
  if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

  const history = (body.history || []).slice(-10);
  let botReply = "Thanks for reaching out! Our team will connect with you shortly.";

  if (anthropic) {
    try {
      const aiMessages = [
        ...history.map((m) => ({
          role:    (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
          content: m.content,
        })),
        { role: "user" as const, content: message },
      ];
      const response = await anthropic.messages.create({
        model:      "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system:     SYSTEM_PROMPT,
        messages:   aiMessages,
      });
      const block = response.content[0];
      if (block.type === "text") botReply = block.text;
    } catch (err) {
      console.error("[chat] Anthropic error:", err);
    }
  }

  const now       = new Date().toISOString();
  const sessionId = body.sessionId || newId();
  const allMsgs: ChatMessage[] = [
    ...history.map((m) => ({
      role: (m.role === "user" ? "user" : "bot") as "user" | "bot",
      text: m.content,
      ts:   Date.now(),
    })),
    { role: "user" as const, text: message,  ts: Date.now() },
    { role: "bot"  as const, text: botReply, ts: Date.now() + 1 },
  ];

  await insert<ChatSession>("chats", {
    id:            sessionId,
    messages:      allMsgs,
    ip,
    startedAt:     now,
    lastMessageAt: now,
  });

  return NextResponse.json({ message: botReply, sessionId });
}
