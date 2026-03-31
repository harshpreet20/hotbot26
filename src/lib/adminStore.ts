/**
 * User and publish-secret management.
 * Primary:  Supabase `users` + `app_config` tables.
 * Fallback: Local admin.json file (dev mode / migration).
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import type { AdminStore, UserRecord, Role } from "@/types/dashboard";

// ── Filesystem fallback path ──────────────────────────────────────────────────

const ADMIN_FILE = process.env.VERCEL
  ? "/tmp/hotbot-data/admin.json"
  : path.join(process.cwd(), "data", "admin.json");

// Bundled read-only defaults (committed to repo, always available in the
// deployed build). Used as last-resort fallback when no writable store exists.
const ADMIN_DEFAULTS_FILE = path.join(process.cwd(), "data", "admin.defaults.json");

// ── Bootstrap credential (code-level last resort) ─────────────────────────────
// Used only when Supabase, env vars, and all filesystem paths are unavailable.
// Hash = bcrypt(cost=12) of "Hotbotstudios". Change via Backdrop Settings after
// first login.
const BOOTSTRAP_HASH = "$2b$12$nMk6oS00R.r9/qLpZbClSODAXxibghu4SBa7fv.QqVFUUJqay6Qiu";
const BOOTSTRAP_USER: UserRecord = {
  id:           "bootstrap",
  username:     "admin",
  passwordHash: BOOTSTRAP_HASH,
  role:         "admin",
  createdAt:    "",
};

interface LegacyAdminCreds {
  username: string;
  passwordHash: string;
  publishSecret: string;
  createdAt: string;
}

function ensureAdminDir() {
  const dir = path.dirname(ADMIN_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function parseAdminStore(raw: string, writeable: boolean): AdminStore | null {
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    // Migrate legacy single-user format
    if (typeof data.username === "string" && !Array.isArray(data.users)) {
      const legacy = data as unknown as LegacyAdminCreds;
      const migrated: AdminStore = {
        publishSecret: legacy.publishSecret || crypto.randomBytes(32).toString("hex"),
        users: [{
          id:           `${Date.now()}-legacy`,
          username:     legacy.username,
          passwordHash: legacy.passwordHash,
          role:         "admin" as Role,
          createdAt:    legacy.createdAt || new Date().toISOString(),
        }],
      };
      if (writeable) fsWriteAdmin(migrated);
      return migrated;
    }
    return data as unknown as AdminStore;
  } catch {
    return null;
  }
}

function fsReadAdmin(): AdminStore | null {
  // 1. Try the writable store (dev: data/admin.json, Vercel: /tmp/…)
  try {
    const raw = fs.readFileSync(ADMIN_FILE, "utf-8");
    const store = parseAdminStore(raw, true);
    if (store) return store;
  } catch { /* not found — fall through */ }

  // 2. Fall back to the bundled read-only defaults (always present in the deployment)
  try {
    const raw = fs.readFileSync(ADMIN_DEFAULTS_FILE, "utf-8");
    return parseAdminStore(raw, false);
  } catch { /* defaults file missing */ }

  return null;
}

function fsWriteAdmin(store: AdminStore): void {
  ensureAdminDir();
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(store, null, 2), { encoding: "utf-8", mode: 0o600 });
}

// ── Publish secret (always read from env; DB is optional secondary) ───────────

export function getPublishSecret(): string | null {
  return process.env.BLOG_PUBLISH_SECRET || null;
}

// ── User CRUD ─────────────────────────────────────────────────────────────────

export async function getAllUsers(): Promise<UserRecord[]> {
  if (isSupabaseEnabled()) {
    const { data, error } = await sb()
      .from("users")
      .select("id, username, password_hash, role, created_at")
      .order("created_at", { ascending: true });
    if (error) { console.error("[adminStore] getAllUsers:", error.message); return []; }
    return (data ?? []).map((u: Record<string, string>) => ({
      id:           u.id,
      username:     u.username,
      passwordHash: u.password_hash,
      role:         u.role as Role,
      createdAt:    u.created_at,
    }));
  }
  return fsReadAdmin()?.users ?? [];
}

export async function getUserByUsername(username: string): Promise<UserRecord | null> {
  if (isSupabaseEnabled()) {
    const { data, error } = await sb()
      .from("users")
      .select("id, username, password_hash, role, created_at")
      .ilike("username", username)
      .single();
    if (!error && data) {
      const u = data as Record<string, string>;
      return {
        id:           u.id,
        username:     u.username,
        passwordHash: u.password_hash,
        role:         u.role as Role,
        createdAt:    u.created_at,
      };
    }
    // Supabase returned no result (table missing, user not found, etc.) —
    // fall through to filesystem / bootstrap fallback.
  }
  const store = fsReadAdmin();
  const found = store?.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (found) return found;

  // Bootstrap fallback: always available, requires no configuration.
  if (username.toLowerCase() === BOOTSTRAP_USER.username.toLowerCase()) {
    return BOOTSTRAP_USER;
  }
  return null;
}

export async function createUser(user: UserRecord): Promise<void> {
  if (isSupabaseEnabled()) {
    const { error } = await sb().from("users").insert({
      id:            user.id,
      username:      user.username,
      password_hash: user.passwordHash,
      role:          user.role,
      created_at:    user.createdAt,
    });
    if (error) throw new Error(`[adminStore] createUser: ${error.message}`);
    return;
  }
  const store = fsReadAdmin() ?? { publishSecret: crypto.randomBytes(32).toString("hex"), users: [] };
  store.users.push(user);
  fsWriteAdmin(store);
}

export async function updateUserRole(userId: string, role: Role): Promise<void> {
  if (isSupabaseEnabled()) {
    const { error } = await sb().from("users").update({ role }).eq("id", userId);
    if (error) throw new Error(`[adminStore] updateUserRole: ${error.message}`);
    return;
  }
  const store = fsReadAdmin();
  if (!store) throw new Error("Admin store not initialised.");
  const user = store.users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found.");
  user.role = role;
  fsWriteAdmin(store);
}

export async function deleteUser(userId: string): Promise<void> {
  if (isSupabaseEnabled()) {
    const { error } = await sb().from("users").delete().eq("id", userId);
    if (error) throw new Error(`[adminStore] deleteUser: ${error.message}`);
    return;
  }
  const store = fsReadAdmin();
  if (!store) throw new Error("Admin store not initialised.");
  store.users = store.users.filter((u) => u.id !== userId);
  fsWriteAdmin(store);
}

export async function isSetupNeeded(): Promise<boolean> {
  // Bootstrap user is always available, so setup is never strictly needed.
  return false;
}

/** Env-var fallback user for when no DB is set up yet. */
export function getEnvFallbackUser(): UserRecord | null {
  const hash = process.env.BLOG_ADMIN_PASSWORD_HASH || "";
  if (!hash) return null;
  return {
    id:           "env-user",
    username:     process.env.BLOG_ADMIN_USERNAME || "admin",
    passwordHash: hash,
    role:         "admin",
    createdAt:    "",
  };
}

// ── Legacy sync helpers (kept for backwards compatibility) ────────────────────

/** @deprecated Use async functions above. */
export function readAdminStore(): AdminStore | null {
  return fsReadAdmin();
}

/** @deprecated Use async functions above. */
export function writeAdminStore(store: AdminStore): void {
  fsWriteAdmin(store);
}
