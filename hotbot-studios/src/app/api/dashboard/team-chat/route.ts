import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { readAll, insert, updateById, removeById, newId } from "@/lib/store";
import type { TeamMessage, TeamChannel } from "@/types/dashboard";

const DEFAULT_CHANNELS: TeamChannel[] = [
  { id: "general", name: "general",  description: "Company-wide announcements and discussion", createdBy: "system", createdAt: new Date(0).toISOString() },
  { id: "sales",   name: "sales",    description: "Leads, deals, and client updates",           createdBy: "system", createdAt: new Date(0).toISOString() },
  { id: "dev",     name: "dev",      description: "Engineering and product updates",             createdBy: "system", createdAt: new Date(0).toISOString() },
  { id: "random",  name: "random",   description: "Non-work chatter",                           createdBy: "system", createdAt: new Date(0).toISOString() },
];

export async function GET(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params    = new URL(req.url).searchParams;
  const type      = params.get("type");
  const channelId = params.get("channelId");
  const since     = params.get("since");

  if (type === "channels") {
    const stored   = await readAll<TeamChannel>("team_channels");
    return NextResponse.json({ channels: stored.length > 0 ? stored : DEFAULT_CHANNELS });
  }

  const messages = await readAll<TeamMessage>("team_messages");
  let filtered   = channelId ? messages.filter((m) => m.channelId === channelId) : messages;
  if (since) {
    const sinceTime = new Date(since).getTime();
    filtered = filtered.filter((m) => new Date(m.createdAt).getTime() > sinceTime);
  }
  // Return chronological (oldest first), capped at 100
  const sorted = [...filtered].reverse().slice(-100);
  return NextResponse.json({ messages: sorted });
}

export async function POST(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    type?: string;
    channelId?: string;
    name?: string;
    description?: string;
    text?: string;
    replyTo?: string;
  };

  // Create channel
  if (body.type === "channel") {
    if (!["admin", "manager"].includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!body.name) return NextResponse.json({ error: "name required" }, { status: 400 });

    const channels = await readAll<TeamChannel>("team_channels");
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
    await insert<TeamChannel>("team_channels", channel);
    return NextResponse.json({ channel }, { status: 201 });
  }

  // Post message
  if (!body.channelId) return NextResponse.json({ error: "channelId required" }, { status: 400 });
  if (!body.text?.trim()) return NextResponse.json({ error: "text required" }, { status: 400 });
  if (body.text.trim().length > 4000) {
    return NextResponse.json({ error: "Message too long (max 4000 chars)" }, { status: 400 });
  }

  const message: TeamMessage = {
    id:        newId(),
    channelId: body.channelId,
    text:      body.text.trim(),
    createdBy: session.username,
    createdAt: new Date().toISOString(),
    replyTo:   body.replyTo,
  };

  await insert<TeamMessage>("team_messages", message);
  return NextResponse.json({ message }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { id: string; text: string };
  if (!body.id || !body.text?.trim()) {
    return NextResponse.json({ error: "id and text required" }, { status: 400 });
  }

  const messages = await readAll<TeamMessage>("team_messages");
  const msg = messages.find((m) => m.id === body.id);
  if (!msg) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (msg.createdBy !== session.username && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = { ...msg, text: body.text.trim(), editedAt: new Date().toISOString() };
  await updateById<TeamMessage>("team_messages", body.id, updated);
  return NextResponse.json({ message: updated });
}

export async function DELETE(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const messages = await readAll<TeamMessage>("team_messages");
  const msg = messages.find((m) => m.id === id);
  if (!msg) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (msg.createdBy !== session.username && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await removeById("team_messages", id);
  return NextResponse.json({ ok: true });
}
