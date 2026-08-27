import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sb, isSupabaseEnabled } from "@/lib/supabase";

// GET — validate invite token
export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { valid: false, reason: "No token provided" },
      { status: 400 }
    );
  }

  if (!isSupabaseEnabled()) {
    return NextResponse.json(
      { valid: false, reason: "Database unavailable" },
      { status: 503 }
    );
  }

  const { data: userRow, error } = await sb()
    .from("client_users")
    .select("id, email, name, invite_expires_at")
    .eq("invite_token", token)
    .single();

  if (error || !userRow) {
    return NextResponse.json(
      { valid: false, reason: "Invalid or expired invite link" },
      { status: 200 }
    );
  }

  if (
    !userRow.invite_expires_at ||
    new Date(userRow.invite_expires_at) <= new Date()
  ) {
    return NextResponse.json(
      { valid: false, reason: "This invite link has expired" },
      { status: 200 }
    );
  }

  return NextResponse.json({
    valid: true,
    email: userRow.email,
    name: userRow.name,
  });
}

// POST — set password from invite token
export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!isSupabaseEnabled()) {
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 503 }
    );
  }

  let body: { token?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { token, password } = body;

  if (!token || !password) {
    return NextResponse.json(
      { error: "Token and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const { data: userRow, error } = await sb()
    .from("client_users")
    .select("id, email, client_id, invite_expires_at")
    .eq("invite_token", token)
    .single();

  if (error || !userRow) {
    return NextResponse.json(
      { error: "Invalid or expired invite link" },
      { status: 400 }
    );
  }

  if (
    !userRow.invite_expires_at ||
    new Date(userRow.invite_expires_at) <= new Date()
  ) {
    return NextResponse.json(
      { error: "This invite link has expired" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date().toISOString();

  const { error: updateError } = await sb()
    .from("client_users")
    .update({
      password_hash: passwordHash,
      invite_accepted_at: now,
      invite_token: null,
      invite_expires_at: null,
      updated_at: now,
    })
    .eq("id", userRow.id);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to set password. Please try again." },
      { status: 500 }
    );
  }

  // Enable portal access on the client record
  await sb()
    .from("clients")
    .update({ portal_enabled: true })
    .eq("id", userRow.client_id);

  return NextResponse.json({ success: true, email: userRow.email });
}
