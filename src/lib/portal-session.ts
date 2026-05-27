/**
 * Portal session management for /customers client portal.
 * Uses HMAC-SHA256 signed tokens stored in an HTTP-only cookie.
 * Token format (before base64): email:expires_ms:hmac
 */
import crypto from "crypto";
import { NextRequest } from "next/server";

const SECRET = process.env.PORTAL_SESSION_SECRET || "portal-session-secret-change-me";
const COOKIE  = "hotbot_portal";
const TTL_MS  = 7 * 24 * 60 * 60 * 1000; // 7 days

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

/** Timing-safe comparison of two HMAC strings to prevent timing oracle attacks. */
function hmacEqual(a: string, b: string): boolean {
  // Validate both are full 64-char hex strings (SHA-256 output) before converting.
  // Buffer.from(odd-length-hex, "hex") silently truncates — the length check below
  // would then pass for a manipulated shorter input that coincidentally matches length.
  if (a.length !== 64 || b.length !== 64) return false;
  try {
    const aBuf = Buffer.from(a, "hex");
    const bBuf = Buffer.from(b, "hex");
    return crypto.timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}

/** Create a signed session token valid for 7 days. */
export function createPortalSession(email: string): string {
  const expires = Date.now() + TTL_MS;
  const payload = `${email}:${expires}`;
  const hmac    = sign(payload);
  return Buffer.from(`${payload}:${hmac}`).toString("base64url");
}

/** Verify a token string → return email or null. */
export function verifyPortalToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    // Last segment is hmac, rest is payload
    const lastColon = decoded.lastIndexOf(":");
    const payload   = decoded.slice(0, lastColon);
    const hmac      = decoded.slice(lastColon + 1);
    if (!hmacEqual(sign(payload), hmac)) return null;

    // payload = email:expires
    const idx     = payload.lastIndexOf(":");
    const email   = payload.slice(0, idx);
    const expires = parseInt(payload.slice(idx + 1), 10);
    if (Date.now() > expires) return null;
    return email;
  } catch {
    return null;
  }
}

/** Read session from cookie OR Authorization: Bearer header. */
export function verifyPortalSession(req: NextRequest | Request): string | null {
  // Try cookie first
  let token: string | null = null;

  if ("cookies" in req && typeof (req as NextRequest).cookies?.get === "function") {
    token = (req as NextRequest).cookies.get(COOKIE)?.value ?? null;
  } else {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
    token = match ? decodeURIComponent(match[1]) : null;
  }

  if (!token) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth.startsWith("Bearer ")) token = auth.slice(7);
  }

  if (!token) return null;
  return verifyPortalToken(token);
}

/** Build the Set-Cookie header string. */
export function buildPortalCookie(token: string): string {
  const maxAge = Math.floor(TTL_MS / 1000);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE}=${token}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Lax${secure}`;
}

/** Clear cookie value. */
export function clearPortalCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax${secure}`;
}
