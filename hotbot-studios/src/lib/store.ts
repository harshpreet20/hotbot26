/**
 * Generic JSON file store for persisting data to disk.
 * Files live in {cwd}/data/ — outside public/, never HTTP-accessible.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Vercel's project root (/var/task) is read-only; use /tmp for writable storage
const DATA_DIR = process.env.VERCEL
  ? "/tmp/hotbot-data"
  : path.join(process.cwd(), "data");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function filePath(name: string) {
  return path.join(DATA_DIR, `${name}.json`);
}

export function readAll<T>(store: string): T[] {
  try {
    const raw = fs.readFileSync(filePath(store), "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function writeAll<T>(store: string, items: T[]): void {
  ensureDir();
  fs.writeFileSync(filePath(store), JSON.stringify(items, null, 2), "utf-8");
}

/** Prepend a new item (newest first) */
export function prepend<T>(store: string, item: T): void {
  const items = readAll<T>(store);
  items.unshift(item);
  writeAll(store, items);
}

export function newId(): string {
  return `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
}
