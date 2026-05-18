import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { rateLimitResponse } from "@/lib/rateLimit";
import Anthropic from "@anthropic-ai/sdk";

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const limited = rateLimitResponse(getIp(req), "scan-card", { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Vision AI not configured" }, { status: 503 });
  }

  let imageBase64: string | undefined;
  try {
    const body = await req.json() as { imageBase64?: string };
    imageBase64 = body.imageBase64;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!imageBase64) {
    return NextResponse.json({ error: "Missing imageBase64" }, { status: 400 });
  }

  try {
    const anthropic = new Anthropic();
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: "image/jpeg", data: imageBase64 },
            },
            {
              type: "text",
              text: "Extract contact information from this business card. Return ONLY a JSON object with these fields (use empty string if not found): name, email, phone, company, title, website. No markdown, no explanation.",
            },
          ],
        },
      ],
    });

    const block = response.content[0];
    if (block.type !== "text") {
      return NextResponse.json({ error: "No text response" }, { status: 500 });
    }

    const parsed = JSON.parse(block.text.trim()) as {
      name: string;
      email: string;
      phone: string;
      company: string;
      title: string;
      website: string;
    };

    return NextResponse.json({ contact: parsed });
  } catch {
    return NextResponse.json({ error: "Failed to scan card" }, { status: 500 });
  }
}
