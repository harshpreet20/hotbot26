import { NextRequest, NextResponse } from "next/server";
import { prepend, newId } from "@/lib/store";
import type { PendingUser, Role } from "@/types/dashboard";

const VALID_ROLES: Role[] = ["editor", "contributor", "agent", "manager"];

// Rate limit: 3 registrations per IP per hour
const regAttempts = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const rec = regAttempts.get(ip);
  if (!rec || now > rec.resetAt) { regAttempts.set(ip, { count: 1, resetAt: now + 3_600_000 }); return true; }
  if (rec.count >= 3) return false;
  rec.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ success: false, error: "Too many registration attempts. Try again later." }, { status: 429 });
  }

  let body: { username?: string; email?: string; requestedRole?: string };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 }); }

  const username      = (body.username || "").trim();
  const email         = (body.email || "").trim().toLowerCase();
  const requestedRole = (body.requestedRole || "contributor") as Role;

  if (!username || username.length < 3)
    return NextResponse.json({ success: false, error: "Username must be at least 3 characters." }, { status: 400 });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ success: false, error: "A valid email address is required." }, { status: 400 });
  if (!VALID_ROLES.includes(requestedRole))
    return NextResponse.json({ success: false, error: "Invalid role requested." }, { status: 400 });

  const pending: PendingUser = {
    id:            newId(),
    username,
    email,
    requestedRole,
    status:        "pending",
    createdAt:     new Date().toISOString(),
  };

  prepend<PendingUser>("pending_users", pending);

  // Notify N8N → admin email + user confirmation
  const n8nUrl = process.env.N8N_WEBHOOK_WA_INCOMING || "https://hotbotst.app.n8n.cloud/webhook/wa-incoming";
  fetch(n8nUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type:    "user-register",
      id:      pending.id,
      username,
      email,
      requestedRole,
      createdAt: pending.createdAt,
    }),
  }).catch((err) => console.error("N8N forward error (user-register):", err));

  return NextResponse.json({ success: true, message: "Registration submitted! The admin will review your request and you'll hear back via email." });
}
