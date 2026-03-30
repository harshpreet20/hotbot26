/**
 * Per-user session tokens.
 * Primary:  Supabase `sessions` table (all instances share state).
 * Fallback: Local JSON file (dev mode).
 *
 * Sessions expire after 30 days of inactivity (sliding window).
 */
import crypto from "crypto";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import { _fsRead, _fsWrite } from "@/lib/store";
import type { Role, SessionInfo } from "@/types/dashboard";

const TTL_MS        = 30 * 24 * 60 * 60 * 1000; // 30 days
const REFRESH_AFTER =       60 * 60 * 1000;       // slide after 1 h idle

// ── Internal session shape (maps 1-to-1 with the `sessions` Supabase table) ──

interface StoredSession {
  token:          string;
  user_id:        string;
  username:       string;
  role:           Role;
  created_at:     string;
  expires_at:     string;
  last_access_at: string;
}

// ── Filesystem fallback helpers ───────────────────────────────────────────────

function fsActive(): StoredSession[] {
  const now = Date.now();
  return _fsRead<StoredSession>("sessions").filter(
    (s) => new Date(s.expires_at).getTime() > now
  );
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function createSession(
  userId: string,
  username: string,
  role: Role
): Promise<string> {
  const token = crypto.randomBytes(40).toString("hex");
  const now   = new Date();
  const session: StoredSession = {
    token,
    user_id:        userId,
    username,
    role,
    created_at:     now.toISOString(),
    expires_at:     new Date(now.getTime() + TTL_MS).toISOString(),
    last_access_at: now.toISOString(),
  };

  if (isSupabaseEnabled()) {
    const { error } = await sb().from("sessions").insert(session);
    if (error) {
      // Supabase insert failed (e.g. schema not yet applied, FK violation for
      // env-fallback user, or table missing) — silently fall back to filesystem.
      console.warn("[sessions] Supabase insert failed, using filesystem fallback:", error.message);
      const sessions = fsActive();
      sessions.push(session);
      _fsWrite("sessions", sessions);
    }
  } else {
    const sessions = fsActive();
    sessions.push(session);
    _fsWrite("sessions", sessions);
  }

  return token;
}

export async function getSession(token: string): Promise<SessionInfo | null> {
  if (!token) return null;

  if (isSupabaseEnabled()) {
    const { data, error } = await sb()
      .from("sessions")
      .select("*")
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (!error && data) {
      const session = data as StoredSession;
      const now = Date.now();
      if (now - new Date(session.last_access_at).getTime() > REFRESH_AFTER) {
        await Promise.resolve(
          sb()
            .from("sessions")
            .update({
              expires_at:     new Date(now + TTL_MS).toISOString(),
              last_access_at: new Date(now).toISOString(),
            })
            .eq("token", token)
        ).catch(() => {});
      }
      return { userId: session.user_id, username: session.username, role: session.role };
    }

    // Token not found in Supabase — also check filesystem fallback.
    // This handles the case where the session was created via filesystem
    // (e.g. because schema wasn't applied yet or FK constraint failed).
  }

  // Filesystem fallback
  const sessions = fsActive();
  const idx = sessions.findIndex((s) => s.token === token);
  if (idx === -1) return null;

  const session = sessions[idx];
  const now = Date.now();
  if (now - new Date(session.last_access_at).getTime() > REFRESH_AFTER) {
    sessions[idx] = {
      ...session,
      expires_at:     new Date(now + TTL_MS).toISOString(),
      last_access_at: new Date(now).toISOString(),
    };
    try { _fsWrite("sessions", sessions); } catch { /* non-fatal */ }
  }

  return { userId: session.user_id, username: session.username, role: session.role };
}

export async function deleteSession(token: string): Promise<void> {
  if (isSupabaseEnabled()) {
    await Promise.resolve(sb().from("sessions").delete().eq("token", token)).catch(() => {});
  }
  // Always clean filesystem too — session may have been stored there as fallback.
  _fsWrite("sessions", fsActive().filter((s) => s.token !== token));
}

export async function revokeAllSessions(userId: string): Promise<void> {
  if (isSupabaseEnabled()) {
    await sb().from("sessions").delete().eq("user_id", userId);
    return;
  }
  _fsWrite("sessions", fsActive().filter((s) => s.user_id !== userId));
}
