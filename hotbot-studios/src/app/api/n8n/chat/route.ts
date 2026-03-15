import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prepend, newId } from "@/lib/store";
import type { ChatSession, ChatMessage } from "@/types/dashboard";

const SYSTEM_PROMPT = `You are HotBot, the AI assistant for HotBot Studios — a digital marketing and AI automation agency serving global clients. Help visitors learn about services, answer pricing and process questions, and guide them toward action (booking a call, filling a form, or contacting via WhatsApp).

Services: AI Automation (n8n workflows), AI Chatbots, Voice AI (Sarvam AI), SEO, PPC, Social Media, Content Strategy, PR, UI/UX, Software Development.

Keep responses concise (2–4 sentences), warm, and action-oriented. If unsure, suggest WhatsApp (+91 97000 01534) or a callback.`;

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  let body: { message?: string; history?: { role: string; content: string }[]; sessionId?: string };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  const message = (body.message || "").trim();
  if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

  const history = (body.history || []).slice(-10);
  let botReply = "Thanks for reaching out! Our team will connect via WhatsApp or Telegram shortly.";

  if (anthropic) {
    try {
      const aiMessages = [
        ...history.map((m) => ({
          role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
          content: m.content,
        })),
        { role: "user" as const, content: message },
      ];
      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: aiMessages,
      });
      const block = response.content[0];
      if (block.type === "text") botReply = block.text;
    } catch (err) {
      console.error("[chat] Anthropic error:", err);
    }
  }

  const now = new Date().toISOString();
  const sessionId = body.sessionId || newId();
  const allMsgs: ChatMessage[] = [
    ...history.map((m) => ({ role: (m.role === "user" ? "user" : "bot") as "user" | "bot", text: m.content, ts: Date.now() })),
    { role: "user" as const, text: message,  ts: Date.now() },
    { role: "bot"  as const, text: botReply, ts: Date.now() + 1 },
  ];
  prepend<ChatSession>("chats", { id: sessionId, messages: allMsgs, ip, startedAt: now, lastMessageAt: now });

  // Forward session to N8N Chat workflow (async — does not block response)
  const n8nChatUrl = process.env.N8N_WEBHOOK_CHAT || "https://hotbotst.app.n8n.cloud/webhook/hotbotstudios-chat";
  fetch(n8nChatUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, message, botReply, ip, history }),
  }).catch((err) => console.error("N8N forward error (chat):", err));

  return NextResponse.json({ message: botReply, sessionId });
}
