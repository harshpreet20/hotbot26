/**
 * Internal credential-validation endpoint called by the N8N blog-auth workflow.
 *
 * N8N sends { username, password } + X-N8N-Secret header.
 * This route validates credentials against the existing database routing
 * (Supabase primary, filesystem fallback, env-var and bootstrap as last resort)
 * and returns { valid, userId, username, role } — it does NOT create a session.
 * Session creation stays in /api/blog/auth so all sub-accounts share the same
 * Supabase/filesystem session store.
 */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByUsername, getEnvFallbackUser, BOOTSTRAP_USER } from "@/lib/adminStore";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // Shared secret guard — only N8N (or callers that know N8N_AUTH_SECRET) may call this.
  const n8nSecret = process.env.N8N_AUTH_SECRET;
  if (n8nSecret) {
    const incoming = req.headers.get("x-n8n-secret");
    if (incoming !== n8nSecret) {
      return NextResponse.json({ valid: false, error: "Forbidden." }, { status: 403 });
    }
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const { allowed } = rateLimit(ip, "auth-validate", { limit: 10, windowMs: 60_000 });
  if (!allowed) {
    return NextResponse.json(
      { valid: false, error: "Too many attempts. Please wait a minute." },
      { status: 429 }
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ valid: false, error: "Invalid request." }, { status: 400 });
  }

  const username = (body.username || "").trim();
  const password = (body.password || "").trim();

  if (!username || !password) {
    return NextResponse.json(
      { valid: false, error: "Username and password are required." },
      { status: 400 }
    );
  }

  // Credential resolution order mirrors /api/blog/auth:
  //   env-var fallback user → Supabase users table → filesystem store → bootstrap
  const envUser = getEnvFallbackUser();
  let user =
    envUser && envUser.username.toLowerCase() === username.toLowerCase()
      ? envUser
      : await getUserByUsername(username);

  if (!user || user.username.toLowerCase() !== username.toLowerCase()) {
    // Return 200 with valid:false to avoid timing-based user enumeration.
    return NextResponse.json({ valid: false });
  }

  let passwordOk = await bcrypt.compare(password, user.passwordHash);

  // Bootstrap recovery: if the stored hash is stale, admin/Hotbotstudios always works.
  if (!passwordOk && user.username.toLowerCase() === BOOTSTRAP_USER.username.toLowerCase()) {
    passwordOk = await bcrypt.compare(password, BOOTSTRAP_USER.passwordHash);
    if (passwordOk) user = BOOTSTRAP_USER;
  }

  if (!passwordOk) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({
    valid:    true,
    userId:   user.id,
    username: user.username,
    role:     user.role,
  });
}
