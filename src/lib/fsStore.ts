/**
 * Synchronous JSON-file storage.
 *
 * This is a development-mode fallback only, used by `src/lib/sessions.ts` when no
 * database is configured and by `src/lib/logger.ts` when the log table is
 * unreachable. It is deliberately separate from `src/lib/store.ts`, which is now
 * purely Prisma.
 *
 * On Vercel DATA_DIR is /tmp, which is per-instance and cleared on every cold
 * start — anything written here in production is lost almost immediately. That is
 * acceptable for a log fallback, and is precisely why sessions no longer fall back
 * to it.
 */
import fs from "fs";
import path from "path";

const DATA_DIR = process.env.VERCEL
  ? "/tmp/hotbot-data"
  : path.join(process.cwd(), "data");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function fp(name: string) {
  return path.join(DATA_DIR, `${name}.json`);
}

/** Read an array from a JSON file; returns [] for missing or malformed files. */
export function fsRead<T>(store: string): T[] {
  try {
    const raw = fs.readFileSync(fp(store), "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

/** Replace a JSON file's contents with `items`. */
export function fsWrite<T>(store: string, items: T[]): void {
  ensureDir();
  fs.writeFileSync(fp(store), JSON.stringify(items, null, 2), "utf-8");
}

// Legacy aliases — the previous names when these lived in store.ts.
export { fsRead as _fsRead, fsWrite as _fsWrite };
