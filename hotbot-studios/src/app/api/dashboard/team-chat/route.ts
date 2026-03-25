import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeData } from "@/lib/dashboardAuth";
import { readAll, writeAll, prepend, newId } from "@/lib/store";
import type { TeamMessage, TeamChannel } from "@/types/dashboard";

const DEFAULT_CHANNELS: TeamChannel[] = [
  { id: "general", name: "general",  description: "Company-wide announcements and discussion", createdBy: "system", createdAt: new Date(0).toISOString() },
  { id: "sales",   name: "sales",    description: "Leads, deals, and client updates",           createdBy: "system", createdAt: new Date(0).toISOString() },
  { id: "dev",     name: "dev",      description: "Engineering and product updates",             createdBy: "system", createdAt: new Date(0).toISOString() },
  { id: "random",  name: "random",   description: "Non-work chatter",                           createdBy: "system", createdAt: new Date(0).toISOString() },
];

export async function GET(req: NextRequest) {
  const session = authorizeData(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type      = searchParams.get("type");       // "channels" | "messages"
  const channelId = searchParams.get("channelId");
  const since     = searchParams.get("since");       // ISO timestamp for polling

  if (type === "channels") {
    const stored   = readAll<TeamChannel>("team_channels");
    const channels = stored.length > 0 ? stored : DEFAULT_CHANNELS;
    return NextResponse.json({ channels });
  }

  // Default: return messages for a channel
  const messages = readAll<TeamMessage>("team_messages");
  let filtered = channelId ? messages.filter((m) => m.channelId === channelId) : messages;
  if (since) {
    const sinceTime = new Date(since).getTime();
    filtered = filtered.filter((m) => new Date(m.createdAt).getTime() > sinceTime);
  }
  // Return newest last (chronological), capped at 100
  const sorted = [...filtered].reverse().slice(-100);
  return NextResponse.json({ messages: sorted });
}

export async function POST(req: NextRequest) {
  const session = authorizeData(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { type?: string; channelId?: string; name?: string; description?: string; text?: string; replyTo?: string };

  // Create channel
  if (body.type === "channel") {
    if (session.role !== "admin" && session.role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!body.name) return NextResponse.json({ error: "name required" }, { status: 400 });
    const channels = readAll<TeamChannel>("team_channels");
    if (channels.some((c) => c.name === body.name)) {
      return NextResponse.json({ error: "Channel already exists" }, { status: 409 });
    }
    const channel: TeamChannel = {
      id:          newId(),
      name:        body.name.toLowerCase().replace(/\s+/g, "-"),
      description: body.description,
      createdBy:   session.username,
      createdAt:   new Date().toISOString(),
    };
    prepend<TeamChannel>("team_channels", channel);
    return NextResponse.json({ channel }, { status: 201 });
  }

  // Post message
  if (!body.channelId) return NextResponse.json({ error: "channelId required" }, { status: 400 });
  if (!body.text?.trim()) return NextResponse.json({ error: "text required" }, { status: 400 });

  const message: TeamMessage = {
    id:        newId(),
    channelId: body.channelId,
    text:      body.text.trim(),
    createdBy: session.username,
    createdAt: new Date().toISOString(),
    replyTo:   body.replyTo,
  };

  prepend<TeamMessage>("team_messages", message);
  return NextResponse.json({ message }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = authorizeData(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { id: string; text: string };
  if (!body.id || !body.text?.trim()) return NextResponse.json({ error: "id and text required" }, { status: 400 });

  const messages = readAll<TeamMessage>("team_messages");
  const idx = messages.findIndex((m) => m.id === body.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (messages[idx].createdBy !== session.username && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  messages[idx] = { ...messages[idx], text: body.text.trim(), editedAt: new Date().toISOString() };
  writeAll<TeamMessage>("team_messages", messages);
  return NextResponse.json({ message: messages[idx] });
}

export async function DELETE(req: NextRequest) {
  const session = authorizeData(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const messages = readAll<TeamMessage>("team_messages");
  const msg = messages.find((m) => m.id === id);
  if (!msg) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (msg.createdBy !== session.username && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  writeAll<TeamMessage>("team_messages", messages.filter((m) => m.id !== id));
  return NextResponse.json({ ok: true });
}
