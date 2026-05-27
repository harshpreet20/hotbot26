import crypto from 'crypto';

const SECRET = process.env.PORTAL_SESSION_SECRET || 'portal-session-secret-change-me';

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
    const hmac = decoded.slice(lastColon + 1);
    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    if (hmac !== expected) return null;
    const colonIdx = payload.indexOf(':');
    const email = payload.slice(0, colonIdx);
    const tsStr = payload.slice(colonIdx + 1);
    const ts = parseInt(tsStr);
    // Session valid for 7 days
    if (Date.now() - ts > 7 * 24 * 60 * 60 * 1000) return null;
    return email;
  } catch { return null; }
}
