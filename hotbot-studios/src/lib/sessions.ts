/**
 * Per-user session tokens stored in data/sessions.json.
 * Sessions expire after 30 days of inactivity (sliding window).
 * Accessing a session extends it by another 30 days.
 */
import crypto from "crypto";
import { readAll, writeAll } from "@/lib/store";
import type { Role, SessionInfo } from "@/types/dashboard";

const TTL_MS       = 30 * 24 * 60 * 60 * 1000; // 30 days
const REFRESH_AFTER = 60 * 60 * 1000;           // refresh expiresAt if last touch > 1 h ago

interface StoredSession {
  token: string;
  userId: string;
  username: string;
  role: Role;
  createdAt: string;
  expiresAt: string;
  lastAccessAt: string;
}

function activeSessions(): StoredSession[] {
  const now = Date.now();
  return readAll<StoredSession>("sessions").filter((s) => new Date(s.expiresAt).getTime() > now);
}

export function createSession(userId: string, username: string, role: Role): string {
  const token = crypto.randomBytes(40).toString("hex");
  const now   = new Date();
  const session: StoredSession = {
    token,
    userId,
    username,
    role,
    createdAt:    now.toISOString(),
    expiresAt:    new Date(now.getTime() + TTL_MS).toISOString(),
    lastAccessAt: now.toISOString(),
  };
  const sessions = activeSessions(); // prune expired automatically
  sessions.push(session);
  writeAll("sessions", sessions);
  return token;
}

export function getSession(token: string): SessionInfo | null {
  if (!token) return null;
  const sessions = activeSessions();
  const idx = sessions.findIndex((s) => s.token === token);
  if (idx === -1) return null;

  const session = sessions[idx];
  const now     = Date.now();

  // Sliding expiry: extend session if it hasn't been refreshed recently
  const lastAccess = new Date(session.lastAccessAt).getTime();
  if (now - lastAccess > REFRESH_AFTER) {
    sessions[idx] = {
      ...session,
      expiresAt:    new Date(now + TTL_MS).toISOString(),
      lastAccessAt: new Date(now).toISOString(),
    };
    try { writeAll("sessions", sessions); } catch { /* non-fatal */ }
  }

  return { userId: session.userId, username: session.username, role: session.role };
}

export function deleteSession(token: string): void {
  writeAll("sessions", activeSessions().filter((s) => s.token !== token));
}

/** Revoke all sessions for a given userId (e.g. on password change or role update). */
export function revokeAllSessions(userId: string): void {
  writeAll("sessions", activeSessions().filter((s) => s.userId !== userId));
}
