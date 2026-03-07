/**
 * Per-user session tokens stored in data/sessions.json.
 * Sessions expire after 30 days and are cleaned up on creation.
 */
import crypto from "crypto";
import { readAll, writeAll } from "@/lib/store";
import type { Role, SessionInfo } from "@/types/dashboard";

const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface StoredSession {
  token: string;
  userId: string;
  username: string;
  role: Role;
  createdAt: string;
  expiresAt: string;
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
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + TTL_MS).toISOString(),
  };
  const sessions = activeSessions(); // prune expired automatically
  sessions.push(session);
  writeAll("sessions", sessions);
  return token;
}

export function getSession(token: string): SessionInfo | null {
  if (!token) return null;
  const session = activeSessions().find((s) => s.token === token);
  if (!session) return null;
  return { userId: session.userId, username: session.username, role: session.role };
}

export function deleteSession(token: string): void {
  writeAll("sessions", activeSessions().filter((s) => s.token !== token));
}
