/**
 * Per-user session tokens.
 * Primary:  Prisma / direct PostgreSQL (POSTGRES_PRISMA_URL) — bypasses RLS,
 *           works reliably across all Vercel serverless instances.
 * Fallback: Local JSON file (dev mode / no DB configured).
 *
 * Sessions expire after 30 days of inactivity (sliding window).
 */
import crypto from "crypto";
import { _fsRead, _fsWrite } from "@/lib/store";
import type { Role, SessionInfo } from "@/types/dashboard";

const TTL_MS        = 30 * 24 * 60 * 60 * 1000; // 30 days
const REFRESH_AFTER =       60 * 60 * 1000;       // slide after 1 h idle

function isPrismaEnabled(): boolean {
  return !!process.env.POSTGRES_PRISMA_URL;
}

async function db() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

// ── Filesystem fallback ───────────────────────────────────────────────────────

interface FsSession {
  token:              string;
  user_id:            string;
  username:           string;
  role:               Role;
  created_at:         string;
  expires_at:         string;
  last_access_at:     string;
  is_impersonating?:  boolean;
  original_user_id?:  string;
  original_username?: string;
  original_role?:     Role;
}

function fsActive(): FsSession[] {
  const now = Date.now();
  return _fsRead<FsSession>("sessions").filter(
    (s) => new Date(s.expires_at).getTime() > now
  );
}

function toSessionInfo(s: { userId: string; username: string; role: string; isImpersonating?: boolean | null; originalUserId?: string | null; originalUsername?: string | null; originalRole?: string | null }): SessionInfo {
  return {
    userId:           s.userId,
    username:         s.username,
    role:             s.role as Role,
    isImpersonating:  s.isImpersonating ?? undefined,
    originalUserId:   s.originalUserId ?? undefined,
    originalUsername: s.originalUsername ?? undefined,
    originalRole:     s.originalRole as Role | undefined,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function createSession(
  userId: string,
  username: string,
  role: Role
): Promise<string> {
  const token = crypto.randomBytes(40).toString("hex");
  const now   = new Date();
  const expiresAt = new Date(now.getTime() + TTL_MS);

  if (isPrismaEnabled()) {
    const client = await db();
    await client.session.create({
      data: { token, userId, username, role, createdAt: now, expiresAt, lastAccessAt: now },
    });
    return token;
  }

  const sessions = fsActive();
  sessions.push({ token, user_id: userId, username, role, created_at: now.toISOString(), expires_at: expiresAt.toISOString(), last_access_at: now.toISOString() });
  _fsWrite("sessions", sessions);
  return token;
}

export async function getSession(token: string): Promise<SessionInfo | null> {
  if (!token) return null;

  if (isPrismaEnabled()) {
    try {
      const client = await db();
      const session = await client.session.findFirst({
        where: { token, expiresAt: { gt: new Date() } },
      });
      if (session) {
        const now = Date.now();
        if (now - session.lastAccessAt.getTime() > REFRESH_AFTER) {
          client.session.update({
            where: { token },
            data: { expiresAt: new Date(now + TTL_MS), lastAccessAt: new Date(now) },
          }).catch(() => {});
        }
        return toSessionInfo(session);
      }
      return null;
    } catch (err) {
      console.error("[sessions] Prisma getSession error:", err instanceof Error ? err.message : err);
      return null;
    }
  }

  // Filesystem fallback (dev mode only — POSTGRES_PRISMA_URL not set)
  try {
    const sessions = fsActive();
    const idx = sessions.findIndex((s) => s.token === token);
    if (idx === -1) return null;

    const s = sessions[idx];
    const now = Date.now();
    if (now - new Date(s.last_access_at).getTime() > REFRESH_AFTER) {
      sessions[idx] = { ...s, expires_at: new Date(now + TTL_MS).toISOString(), last_access_at: new Date(now).toISOString() };
      try { _fsWrite("sessions", sessions); } catch { /* non-fatal */ }
    }

    return {
      userId:           s.user_id,
      username:         s.username,
      role:             s.role,
      isImpersonating:  s.is_impersonating,
      originalUserId:   s.original_user_id,
      originalUsername: s.original_username,
      originalRole:     s.original_role,
    };
  } catch {
    return null;
  }
}

export async function createImpersonationSession(
  impersonator: { userId: string; username: string; role: Role },
  target: { userId: string; username: string; role: Role },
): Promise<string> {
  const token = crypto.randomBytes(40).toString("hex");
  const now   = new Date();
  const IMPERSONATION_TTL = 2 * 60 * 60 * 1000;
  const expiresAt = new Date(now.getTime() + IMPERSONATION_TTL);

  if (isPrismaEnabled()) {
    const client = await db();
    await client.session.create({
      data: {
        token,
        userId:           target.userId,
        username:         target.username,
        role:             target.role,
        createdAt:        now,
        expiresAt,
        lastAccessAt:     now,
        isImpersonating:  true,
        originalUserId:   impersonator.userId,
        originalUsername: impersonator.username,
        originalRole:     impersonator.role,
      },
    });
    return token;
  }

  const sessions = fsActive();
  sessions.push({
    token,
    user_id:           target.userId,
    username:          target.username,
    role:              target.role,
    created_at:        now.toISOString(),
    expires_at:        expiresAt.toISOString(),
    last_access_at:    now.toISOString(),
    is_impersonating:  true,
    original_user_id:  impersonator.userId,
    original_username: impersonator.username,
    original_role:     impersonator.role,
  });
  _fsWrite("sessions", sessions);
  return token;
}

export async function deleteSession(token: string): Promise<void> {
  if (isPrismaEnabled()) {
    try {
      const client = await db();
      await client.session.deleteMany({ where: { token } });
      return;
    } catch { /* non-fatal */ }
  }
  _fsWrite("sessions", fsActive().filter((s) => s.token !== token));
}

export async function revokeAllSessions(userId: string): Promise<void> {
  if (isPrismaEnabled()) {
    try {
      const client = await db();
      await client.session.deleteMany({ where: { userId } });
      return;
    } catch { /* non-fatal — fall through to fs cleanup */ }
  }
  _fsWrite("sessions", fsActive().filter((s) => s.user_id !== userId));
}
