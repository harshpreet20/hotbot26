/**
 * Validates the publish secret sent by dashboard API calls.
 * Reads active credentials from data/admin.json, with env-var fallback.
 */
import fs from "fs";
import path from "path";

interface AdminCreds { publishSecret: string }

function getPublishSecret(): string | null {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "data", "admin.json"), "utf-8");
    const creds = JSON.parse(raw) as AdminCreds;
    return creds.publishSecret || null;
  } catch {
    return process.env.BLOG_PUBLISH_SECRET || null;
  }
}

export function isAuthorized(secret: string | null | undefined): boolean {
  if (!secret) return false;
  const active = getPublishSecret();
  if (!active) return false;
  return secret === active;
}
