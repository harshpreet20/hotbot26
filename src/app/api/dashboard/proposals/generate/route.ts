import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { rateLimitResponse } from "@/lib/rateLimit";
import Anthropic from "@anthropic-ai/sdk";

const ALLOWED_ROLES = ["super_admin", "admin", "manager", "sales"];

function ip(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(req: NextRequest) {
  const limited = await rateLimitResponse(ip(req), "proposal-generate", { limit: 5, windowMs: 60_000 });
  if (limited) return limited;

  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ALLOWED_ROLES.includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json() as {
    clientName?: string;
    projectName?: string;
    brief: string;
    budget?: string;
    timeline?: string;
    services?: string;
  };

  if (!body.brief?.trim()) return NextResponse.json({ error: "brief required" }, { status: 400 });

  if (!process.env.ANTHROPIC_API_KEY) {
    const fallback = `# Proposal: ${body.projectName || "Project"}\n\n*AI generation unavailable — ANTHROPIC_API_KEY not configured.*\n\n## Client\n${body.clientName || "—"}\n\n## Brief\n${body.brief}`;
    return NextResponse.json({ content: fallback });
  }

  try {
    const client = new Anthropic();
    const contextLines = [
      body.clientName  && `**Client:** ${body.clientName}`,
      body.projectName && `**Project:** ${body.projectName}`,
      body.services    && `**Services:** ${body.services}`,
      body.budget      && `**Budget:** ${body.budget}`,
      body.timeline    && `**Timeline:** ${body.timeline}`,
    ].filter(Boolean).join("\n");

    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: `You are a senior business development consultant at a top digital agency. Write polished, persuasive business proposals in markdown format. Structure: Executive Summary, Understanding of Requirements, Proposed Solution & Scope, Deliverables, Timeline, Pricing, Why Us, Terms & Next Steps. Tone: professional, confident, client-focused. Do not use placeholder text — write real, substantive content based on the brief.`,
      messages: [{
        role: "user",
        content: `Write a comprehensive business proposal with the following context:\n\n${contextLines}\n\n**Project Brief:**\n${body.brief}`,
      }],
    });

    const content = msg.content[0].type === "text" ? msg.content[0].text : "";
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: "AI generation failed. Please try again." }, { status: 502 });
  }
}
