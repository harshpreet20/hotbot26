import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { insert, updateById, readWhere, readAll, newId } from "@/lib/store";
import type { ChatSession, ChatMessage, Lead, KnowledgeEntry, Ticket, Client } from "@/types/dashboard";

const SYSTEM_PROMPT = `You are HotBot, the AI assistant for HotBot Studios - a digital marketing and AI automation agency. Help visitors learn about services, answer pricing and process questions, and guide them toward action (booking a call, filling a form, or contacting via WhatsApp).

Services: AI Automation, AI Chatbots, Voice AI, SEO, PPC, Social Media, Content Strategy, PR, UI/UX, Software Development.

Keep responses concise (2–4 sentences), warm, and action-oriented. If unsure, suggest WhatsApp (+91 97000 01534) or a callback.`;

const HANDOFF_TRIGGERS = [
  "talk to human",
  "speak to agent",
  "human support",
  "real person",
  "live agent",
  "speak to someone",
  "connect me to",
  "human please",
  "agent please",
  "customer support",
  "talk to a person",
];

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";

  let body: {
    message?: string;
    history?: { role: string; content: string }[];
    sessionId?: string;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
  };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  const message = (body.message || "").trim();
  if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

  // Create/update CRM lead from pre-form data (first message only)
  if (body.guestName && body.guestEmail && !body.history?.length) {
    const lead: Lead = {
      id:          newId(),
      name:        body.guestName.trim(),
      email:       body.guestEmail.trim(),
      phone:       body.guestPhone?.trim() || "",
      company:     "",
      service:     "AI Chat",
      budget:      "",
      message:     `Chat started: "${message}"`,
      formType:    "chat",
      source:      "chatbot-chat-tab",
      ip,
      createdAt:   new Date().toISOString(),
      status:      "new",
    };
    await insert<Lead>("leads", lead).catch((err) =>
      console.error("[chat] lead insert failed:", err)
    );
  }

  // ── Ticket / Client ID lookup ─────────────────────────────────────────────
  const ticketMatch = message.match(/\bTKT-\d{4,}\b/i);
  const clientMatch = message.match(/\bHBS-[A-Z0-9]{5}\b/i);

  let ticketContext = "";
  let clientContext = "";

  if (ticketMatch) {
    const ticketId = ticketMatch[0];
    try {
      const tickets = await readAll<Ticket>("tickets");
      const ticket = tickets.find(t => t.ticketNumber.toUpperCase() === ticketId.toUpperCase());
      ticketContext = ticket
        ? `\n\n[TICKET LOOKUP]\nTicket ${ticket.ticketNumber}: "${ticket.title}"\nStatus: ${ticket.status} | Priority: ${ticket.priority} | Category: ${ticket.category}\nCreated: ${ticket.createdAt}\nLast Updated: ${ticket.updatedAt}`
        : `\n\n[TICKET LOOKUP]\nNo ticket found with ID ${ticketId}.`;
    } catch (err) {
      console.error("[chat] ticket lookup failed:", err);
    }
  }

  if (clientMatch) {
    const clientId = clientMatch[0];
    try {
      const clients = await readAll<Client>("clients");
      const client = clients.find(c => c.clientId.toUpperCase() === clientId.toUpperCase());
      clientContext = client
        ? `\n\n[CLIENT LOOKUP]\nClient ${client.clientId}: ${client.name} (${client.company})\nStatus: ${client.status}`
        : `\n\n[CLIENT LOOKUP]\nNo client found with ID ${clientId}.`;
    } catch (err) {
      console.error("[chat] client lookup failed:", err);
    }
  }

  // ── Knowledge base injection ──────────────────────────────────────────────
  let knowledgeContext = "";
  try {
    const knowledge = await readAll<KnowledgeEntry>("ai_knowledge_base");
    const activeKnowledge = knowledge
      .filter(k => k.active)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 10);
    if (activeKnowledge.length > 0) {
      knowledgeContext = `\n\n[KNOWLEDGE BASE]\n${activeKnowledge.map(k => `### ${k.title}\n${k.content}`).join('\n\n')}`;
    }
  } catch (err) {
    console.error("[chat] knowledge base fetch failed:", err);
  }

  const dynamicSystemPrompt = SYSTEM_PROMPT + knowledgeContext + ticketContext + clientContext;

  const history = (body.history || []).slice(-10);

  // ── Human handoff detection ───────────────────────────────────────────────
  const wantsHuman = HANDOFF_TRIGGERS.some(t => message.toLowerCase().includes(t));

  let botReply = "Thanks for reaching out! Our team will connect with you shortly.";
  let needsHuman = false;

  if (wantsHuman) {
    botReply = "I'm connecting you with a human agent right now. Please hold on — someone from our team will join this conversation shortly. You can continue chatting and they'll see everything.";
    needsHuman = true;
  } else if (openai) {
    try {
      const aiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: dynamicSystemPrompt },
        ...history.map((m) => ({
          role:    (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
          content: m.content,
        })),
        { role: "user", content: message },
      ];
      const response = await openai.chat.completions.create({
        model:      "gpt-4o-mini",
        max_tokens: 300,
        messages:   aiMessages,
      });
      botReply = response.choices[0]?.message?.content ?? botReply;
    } catch (err) {
      console.error("[chat] OpenAI error:", err);
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

  // ── Session persistence ───────────────────────────────────────────────────
  if (body.sessionId) {
    // Check if session exists; update if so
    try {
      const existing = await readWhere<ChatSession>("chats", "id", body.sessionId);
      if (existing.length > 0) {
        await updateById<ChatSession>("chats", sessionId, {
          messages:      allMsgs,
          lastMessageAt: now,
          ...(needsHuman ? { needsHuman: true } : {}),
        });
      } else {
        // sessionId provided but not found — insert as new
        await insert<ChatSession>("chats", {
          id:            sessionId,
          messages:      allMsgs,
          ip,
          startedAt:     now,
          lastMessageAt: now,
          guestName:     body.guestName,
          guestEmail:    body.guestEmail,
          guestPhone:    body.guestPhone,
          ...(needsHuman ? { needsHuman: true } : {}),
        });
      }
    } catch (err) {
      console.error("[chat] session update failed:", err);
    }
  } else {
    // First message — insert new session
    await insert<ChatSession>("chats", {
      id:            sessionId,
      messages:      allMsgs,
      ip,
      startedAt:     now,
      lastMessageAt: now,
      guestName:     body.guestName,
      guestEmail:    body.guestEmail,
      guestPhone:    body.guestPhone,
      ...(needsHuman ? { needsHuman: true } : {}),
    }).catch((err) => console.error("[chat] session insert failed:", err));
  }

  return NextResponse.json({ message: botReply, sessionId, needsHuman });
}
