import crypto from "crypto";
import { NextRequest } from "next/server";
import { sb, isSupabaseEnabled } from "@/lib/supabase";

export interface PortalUser {
  id: string;
  clientId: string;   // internal UUID from clients table
  clientRef: string;  // e.g. "HBS-A1B2C"
  email: string;
  name: string;
  role: string;
}

const sessions = new Map<string, PortalUser & { expiresAt: number }>();

export async function createPortalSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");

  if (isSupabaseEnabled()) {
    await sb()
      .from("client_users")
      .update({
        session_token: token,
        session_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
  }
  // fallback stored in memory; the caller must provide a PortalUser to cache
  // (the memory path is hydrated in getPortalSession / login flow)

  return token;
}

export async function getPortalSession(token: string): Promise<PortalUser | null> {
  if (isSupabaseEnabled()) {
    const { data: userRow, error } = await sb()
      .from("client_users")
      .select("id, client_id, email, name, role, session_expires_at, is_active")
      .eq("session_token", token)
      .single();

    if (error || !userRow) return null;
    if (!userRow.is_active) return null;
    if (!userRow.session_expires_at) return null;
    if (new Date(userRow.session_expires_at) <= new Date()) return null;

    // Resolve client_id (UUID) → clientRef (HBS-xxx)
    const { data: clientRow } = await sb()
      .from("clients")
      .select("id, client_id")
      .eq("id", userRow.client_id)
      .single();

    return {
      id: userRow.id,
      clientId: userRow.client_id,
      clientRef: clientRow?.client_id ?? "",
      email: userRow.email,
      name: userRow.name,
      role: userRow.role,
    };
  }

  // In-memory fallback
  const entry = sessions.get(token);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  const { expiresAt: _expiresAt, ...user } = entry;
  return user;
}

export async function deletePortalSession(token: string): Promise<void> {
  if (isSupabaseEnabled()) {
    await sb()
      .from("client_users")
      .update({ session_token: null, updated_at: new Date().toISOString() })
      .eq("session_token", token);
  } else {
    sessions.delete(token);
  }
}

export async function getPortalUser(req: NextRequest): Promise<PortalUser | null> {
  const token = req.cookies.get("portal_session")?.value;
  if (!token) return null;
  return getPortalSession(token);
}

// Internal helper used by the login route to cache a user in the memory fallback
export function cachePortalSession(
  token: string,
  user: PortalUser,
  expiresAt: number
): void {
  sessions.set(token, { ...user, expiresAt });
}
