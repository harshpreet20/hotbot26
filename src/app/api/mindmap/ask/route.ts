import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const SYSTEM = `You are HotBot, the AI guide for the HotBot Studios Platform Map — an interactive 3D visualization of the platform architecture.

When answering, append a [highlight:nodeId1,nodeId2] tag at the very end of your reply to light up relevant nodes on the map. Use exact IDs from this list:
core, heka, seo-ai, ai-analyst, gpt, content-intel, ai-detect, leads, clients, contacts, callbacks, chats, email-engine, pixel, click, email-logs, newsletter, invoices, tickets, tasks, team-chat, analytics, journey, activity, blog, knowledge, mcp-supabase, mcp-github, mcp-vercel, mcp-n8n, supabase, vercel, n8n, openai, sarvam, resend, rbac, sessions, rls

Rules:
- Keep replies to 2-3 sentences max
- Always include the [highlight:...] tag even if highlighting just one node
- Be enthusiastic and specific about what was built`;

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json() as {
      message?: string;
      history?: { role: string; content: string }[];
    };
    if (!message?.trim()) return NextResponse.json({ error: "No message" }, { status: 400 });

    if (!openai) return NextResponse.json({ reply: "OpenAI not configured. [highlight:core]" });

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM },
      ...((history ?? []).slice(-8).map(m => ({
        role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
        content: m.content,
      }))),
      { role: "user", content: message.trim() },
    ];

    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 180,
      temperature: 0.7,
    });

    const reply = res.choices[0]?.message?.content ?? "Let me think about that. [highlight:core]";
    return NextResponse.json({ reply });
  } catch (e) {
    console.error("[mindmap/ask]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
