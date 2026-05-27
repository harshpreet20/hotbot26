/**
 * Legacy portal auth — used by /api/portal/* (old /portal/* pages).
 * New code should use portal-session.ts instead.
 *
 * NOTE: Token format is base64(email:timestamp:hmac) — different from
 * portal-session.ts (base64url, expiry-based). Both modules must share
 * PORTAL_SESSION_SECRET and the same default to avoid split-brain.
 */
import crypto from 'crypto';

const SECRET = process.env.PORTAL_SESSION_SECRET || 'portal-session-secret-change-me';
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function createPortalSession(email: string): string {
  const payload = `${email}:${Date.now()}`;
  const hmac = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${hmac}`).toString('base64');
}

export function verifyPortalSession(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const lastColon = decoded.lastIndexOf(':');
    const payload = decoded.slice(0, lastColon);
    const storedHmac = decoded.slice(lastColon + 1);
    const expectedHmac = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');

    // Timing-safe comparison — prevents timing oracle on HMAC verification
    if (storedHmac.length !== 64 || expectedHmac.length !== 64) return null;
    const storedBuf   = Buffer.from(storedHmac, 'hex');
    const expectedBuf = Buffer.from(expectedHmac, 'hex');
    if (!crypto.timingSafeEqual(storedBuf, expectedBuf)) return null;

    // Extract email from payload (email:timestamp — use lastIndexOf to handle emails with colons)
    const sepIdx = payload.lastIndexOf(':');
    const email  = payload.slice(0, sepIdx);
    const ts     = parseInt(payload.slice(sepIdx + 1), 10);
    if (isNaN(ts) || Date.now() - ts > TTL_MS) return null;
    return email || null;
  } catch { return null; }
}
