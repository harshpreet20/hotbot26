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
    // Strip optional impersonation columns from the base insert payload.
    // The fix_sessions_and_data.sql migration adds them; until then we omit them.
    const { is_impersonating, original_user_id, original_username, original_role, ...coreSession } = session;
    const insertPayload = is_impersonating ? session : coreSession;

    const { error } = await sb().from("sessions").insert(insertPayload);
    if (error) {
      // FK violation: sessions table has a legacy user_id FK constraint that
      // blocks Supabase Auth UUIDs (they live in backdrop_users, not users).
      // Permanent fix: run supabase/fix_sessions_and_data.sql to drop the FK.
      // Workaround: ensure the user row exists in backdrop_users, then retry.
      if (error.code === "23503" || error.message.includes("violates foreign key constraint")) {
        await Promise.resolve(
          sb().from("backdrop_users").upsert(
            {
              id:         userId,
              email:      `${username.toLowerCase()}@hotbotstudios.internal`,
              username,
              role,
              status:     "approved",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id", ignoreDuplicates: true }
          )
        ).catch(() => {});

        const { error: retryError } = await sb().from("sessions").insert(insertPayload);
        if (!retryError) return token;

        // Retry also failed — FK is on users (not backdrop_users).
        // Surface the error so login fails cleanly instead of fake-succeeding.
        throw new Error(
          `Session FK constraint unresolved. Run supabase/fix_sessions_and_data.sql. (${retryError.message})`
        );
      }

      // Any other error (column missing, table missing, permissions, etc.)
      if (!process.env.VERCEL) {
        console.warn("[sessions] Supabase insert failed (dev), using filesystem:", error.message);
        const sessions = fsActive();
        sessions.push(session);
        _fsWrite("sessions", sessions);
        return token;
      }

      // On Vercel: throw so login returns 500 rather than returning a fake token
      // that will immediately cause 401 on every subsequent API call.
      throw new Error(
        `Supabase session insert failed — run fix_sessions_and_data.sql. (${error.message})`
      );
    }
    return token;
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
      return {
        userId:           session.user_id,
        username:         session.username,
        role:             session.role,
        isImpersonating:  session.is_impersonating,
        originalUserId:   session.original_user_id,
        originalUsername: session.original_username,
        originalRole:     session.original_role,
      };
    }

    // Token not found in Supabase - also check filesystem fallback.
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

  return {
    userId:           session.user_id,
    username:         session.username,
    role:             session.role,
    isImpersonating:  session.is_impersonating,
    originalUserId:   session.original_user_id,
    originalUsername: session.original_username,
    originalRole:     session.original_role,
  };
}

/** Create an impersonation session for super_admin to act as another user. */
export async function createImpersonationSession(
  impersonator: { userId: string; username: string; role: Role },
  target: { userId: string; username: string; role: Role },
): Promise<string> {
  const token = crypto.randomBytes(40).toString("hex");
  const now   = new Date();
  const IMPERSONATION_TTL = 2 * 60 * 60 * 1000; // 2 hours max
  const session: StoredSession = {
    token,
    user_id:            target.userId,
    username:           target.username,
    role:               target.role,
    created_at:         now.toISOString(),
    expires_at:         new Date(now.getTime() + IMPERSONATION_TTL).toISOString(),
    last_access_at:     now.toISOString(),
    is_impersonating:   true,
    original_user_id:   impersonator.userId,
    original_username:  impersonator.username,
    original_role:      impersonator.role,
  };

  if (isSupabaseEnabled()) {
    const { error } = await sb().from("sessions").insert(session);
    if (!error) return token;
    if (error.message.includes("violates foreign key constraint") || error.code === "23503") {
      try {
        await sb()
          .from("users")
          .upsert(
            { id: target.userId, username: target.username, password_hash: "disabled", role: target.role, created_at: new Date().toISOString() },
            { onConflict: "id" }
          );
      } catch { /* ignore */ }
      const { error: retryError } = await sb().from("sessions").insert({ ...session });
      if (!retryError) return token;
    }
    console.warn("[sessions] Impersonation session Supabase insert failed:", error.message);
    // Last resort: filesystem (ephemeral on Vercel — impersonation may not survive cross-instance)
  }
  const sessions = fsActive();
  sessions.push(session);
  _fsWrite("sessions", sessions);
  return token;
}

export async function deleteSession(token: string): Promise<void> {
  if (isSupabaseEnabled()) {
    await Promise.resolve(sb().from("sessions").delete().eq("token", token)).catch(() => {});
  }
  // Always clean filesystem too - session may have been stored there as fallback.
  _fsWrite("sessions", fsActive().filter((s) => s.token !== token));
}

export async function revokeAllSessions(userId: string): Promise<void> {
  if (isSupabaseEnabled()) {
    await sb().from("sessions").delete().eq("user_id", userId);
    return;
  }
  _fsWrite("sessions", fsActive().filter((s) => s.user_id !== userId));
}
