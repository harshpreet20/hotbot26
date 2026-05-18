/**
 * User and publish-secret management.
 * Primary:  Supabase backdrop_users table.
 * Fallback: local admin.json (bcrypt) for dev.
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

const ADMIN_DEFAULTS_FILE = path.join(process.cwd(), "data", "admin.defaults.json");

// ── Bootstrap credential (bcrypt fallback only) ───────────────────────────────
const BOOTSTRAP_HASH = "$2b$12$nMk6oS00R.r9/qLpZbClSODAXxibghu4SBa7fv.QqVFUUJqay6Qiu";
export const BOOTSTRAP_USER: UserRecord = {
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
  try {
    const raw = fs.readFileSync(ADMIN_FILE, "utf-8");
    const store = parseAdminStore(raw, true);
    if (store) return store;
  } catch { /* not found */ }

  try {
    const raw = fs.readFileSync(ADMIN_DEFAULTS_FILE, "utf-8");
    return parseAdminStore(raw, false);
  } catch { /* defaults missing */ }

  return null;
}

function fsWriteAdmin(store: AdminStore): void {
  ensureAdminDir();
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(store, null, 2), { encoding: "utf-8", mode: 0o600 });
}

// ── Publish secret ────────────────────────────────────────────────────────────

export function getPublishSecret(): string | null {
  return process.env.BLOG_PUBLISH_SECRET || null;
}

// ── User CRUD ─────────────────────────────────────────────────────────────────

export async function getAllUsers(): Promise<UserRecord[]> {
  if (isSupabaseEnabled()) {
    const { data, error } = await sb()
      .from("backdrop_users")
      .select("id, email, username, role, status, created_at")
      .order("created_at", { ascending: true });
    if (error) { console.error("[adminStore] getAllUsers:", error.message); return []; }
    return (data ?? []).map((u: Record<string, string>) => ({
      id:           u.id,
      username:     u.username || (u.email ?? "").split("@")[0],
      passwordHash: "",
      role:         u.role as Role,
      createdAt:    u.created_at,
    }));
  }
  return fsReadAdmin()?.users ?? [];
}

export async function getUserByUsername(username: string): Promise<UserRecord | null> {
  if (isSupabaseEnabled()) {
    const { data, error } = await sb()
      .from("backdrop_users")
      .select("id, email, username, role, status, created_at")
      .ilike("username", username)
      .maybeSingle();
    if (!error && data) {
      const u = data as Record<string, string>;
      return {
        id:           u.id,
        username:     u.username || (u.email ?? "").split("@")[0],
        passwordHash: "",
        role:         u.role as Role,
        createdAt:    u.created_at,
      };
    }
  }

  const store = fsReadAdmin();
  const found = store?.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (found) return found;

  if (username.toLowerCase() === BOOTSTRAP_USER.username.toLowerCase()) {
    return BOOTSTRAP_USER;
  }
  return null;
}

export async function createUser(opts: {
  username: string;
  password: string;
  role: Role;
}): Promise<UserRecord> {
  if (isSupabaseEnabled()) {
    const internalEmail = `${opts.username.toLowerCase()}@hotbotstudios.internal`;
    const { data: authData, error: authError } = await sb().auth.admin.createUser({
      email:         internalEmail,
      password:      opts.password,
      email_confirm: true,
    });
    if (authError || !authData?.user) {
      throw new Error(`[adminStore] createUser auth: ${authError?.message ?? "unknown"}`);
    }
    const now = new Date().toISOString();
    const { error: dbError } = await sb().from("backdrop_users").insert({
      id:         authData.user.id,
      email:      internalEmail,
      username:   opts.username,
      role:       opts.role,
      status:     "approved",
      created_at: now,
      updated_at: now,
    });
    if (dbError) {
      await sb().auth.admin.deleteUser(authData.user.id).catch(() => {});
      throw new Error(`[adminStore] createUser db: ${dbError.message}`);
    }
    return {
      id:           authData.user.id,
      username:     opts.username,
      passwordHash: "",
      role:         opts.role,
      createdAt:    now,
    };
  }

  // Filesystem fallback (dev only)
  const { default: bcrypt2 } = await import("bcryptjs");
  const fsHash = await bcrypt2.hash(opts.password, 12);
  const fsUser: UserRecord = {
    id:           `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    username:     opts.username,
    passwordHash: fsHash,
    role:         opts.role,
    createdAt:    new Date().toISOString(),
  };
  const store = fsReadAdmin() ?? { publishSecret: crypto.randomBytes(32).toString("hex"), users: [] };
  store.users.push(fsUser);
  fsWriteAdmin(store);
  return fsUser;
}

export async function updateUserRole(userId: string, role: Role): Promise<void> {
  if (isSupabaseEnabled()) {
    const { error } = await sb().from("backdrop_users").update({ role, updated_at: new Date().toISOString() }).eq("id", userId);
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
    await sb().from("backdrop_users").delete().eq("id", userId);
    await sb().auth.admin.deleteUser(userId).catch(() => {});
    return;
  }
  const store = fsReadAdmin();
  if (!store) throw new Error("Admin store not initialised.");
  store.users = store.users.filter((u) => u.id !== userId);
  fsWriteAdmin(store);
}

export async function isSetupNeeded(): Promise<boolean> {
  return false;
}

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

/** @deprecated Use async functions above. */
export function readAdminStore(): AdminStore | null {
  return fsReadAdmin();
}

/** @deprecated Use async functions above. */
export function writeAdminStore(store: AdminStore): void {
  fsWriteAdmin(store);
}
