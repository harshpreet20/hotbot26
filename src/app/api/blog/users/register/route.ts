import { NextRequest, NextResponse } from "next/server";
import { insert, newId } from "@/lib/store";
import type { PendingUser, Role } from "@/types/dashboard";

const VALID_ROLES: Role[] = ["manager", "sales", "crm_operator", "finance", "editor", "contributor", "agent"];

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

  let body: { name?: string; email?: string; requestedRole?: string };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 }); }

  const name          = (body.name || "").trim();
  const email         = (body.email || "").trim().toLowerCase();
  const requestedRole = (body.requestedRole || "contributor") as Role;

  if (!name || name.length < 2)
    return NextResponse.json({ success: false, error: "Full name is required." }, { status: 400 });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ success: false, error: "A valid email address is required." }, { status: 400 });
  if (!VALID_ROLES.includes(requestedRole))
    return NextResponse.json({ success: false, error: "Invalid role requested." }, { status: 400 });

  const pending: PendingUser = {
    id:            newId(),
    name,
    email,
    requestedRole,
    status:        "pending",
    createdAt:     new Date().toISOString(),
  };

  await insert<PendingUser>("pending_users", pending);
  return NextResponse.json({ success: true, message: "Request submitted. The admin will review and grant access." });
}
