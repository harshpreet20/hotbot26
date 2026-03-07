/**
 * Centralised read/write for data/admin.json.
 * Handles automatic migration from the legacy single-admin flat format.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { AdminStore, UserRecord, Role } from "@/types/dashboard";

const ADMIN_FILE = path.join(process.cwd(), "data", "admin.json");

function ensureDir() {
  const dir = path.dirname(ADMIN_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Legacy format written by the original auth route
interface LegacyAdminCreds {
  username: string;
  passwordHash: string;
  publishSecret: string;
  createdAt: string;
}

export function readAdminStore(): AdminStore | null {
  try {
    const raw  = fs.readFileSync(ADMIN_FILE, "utf-8");
    const data = JSON.parse(raw) as Record<string, unknown>;

    // ── Migrate legacy single-user format ──────────────────────────────────
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
      writeAdminStore(migrated);  // persist new format immediately
      return migrated;
    }

    return data as unknown as AdminStore;
  } catch {
    return null;
  }
}

export function writeAdminStore(store: AdminStore): void {
  ensureDir();
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(store, null, 2), { encoding: "utf-8", mode: 0o600 });
}

export function isSetupNeeded(): boolean {
  const store = readAdminStore();
  if (store && store.users.length > 0) return false;
  // Also accept env-var credentials as a valid "setup"
  return !(process.env.BLOG_ADMIN_PASSWORD_HASH && process.env.BLOG_PUBLISH_SECRET);
}

export function getPublishSecret(): string | null {
  const store = readAdminStore();
  if (store?.publishSecret) return store.publishSecret;
  return process.env.BLOG_PUBLISH_SECRET || null;
}

/** Returns env-var user as a fallback when admin.json doesn't exist */
export function getEnvFallbackUser(): UserRecord | null {
  const hash   = process.env.BLOG_ADMIN_PASSWORD_HASH || "";
  const secret = process.env.BLOG_PUBLISH_SECRET || "";
  if (!hash || !secret) return null;
  return {
    id:           "env-user",
    username:     process.env.BLOG_ADMIN_USERNAME || "admin",
    passwordHash: hash,
    role:         "admin",
    createdAt:    "",
  };
}
