/**
 * Unified async data store.
 *
 * Primary:  Supabase (when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set)
 * Fallback: Local JSON files  (dev / no-Supabase mode)
 *
 * camelCase ↔ snake_case conversion is handled automatically so TypeScript
 * types (camelCase) match Postgres column names (snake_case) transparently.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { sb, isSupabaseEnabled, toSnake, toCamel } from "@/lib/supabase";

// ── Filesystem helpers ─────────────────────────────────────────────────────────

const DATA_DIR = process.env.VERCEL
  ? "/tmp/hotbot-data"
  : path.join(process.cwd(), "data");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function fp(name: string) {
  return path.join(DATA_DIR, `${name}.json`);
}

function fsRead<T>(store: string): T[] {
  try {
    const raw = fs.readFileSync(fp(store), "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function fsWrite<T>(store: string, items: T[]): void {
  ensureDir();
  fs.writeFileSync(fp(store), JSON.stringify(items, null, 2), "utf-8");
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Read all rows from a table, newest first. */
export async function readAll<T>(table: string): Promise<T[]> {
  if (isSupabaseEnabled()) {
    const { data, error } = await sb()
      .from(table)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(`[store] readAll(${table}):`, error.message);
      return [];
    }
    return ((data ?? []) as Record<string, unknown>[]).map(toCamel<T>);
  }
  return fsRead<T>(table);
}

/** Read rows filtered by a single column equality. */
export async function readWhere<T>(
  table: string,
  column: string,
  value: string
): Promise<T[]> {
  if (isSupabaseEnabled()) {
    const { data, error } = await sb()
      .from(table)
      .select("*")
      .eq(column, value)
      .order("created_at", { ascending: false });
    if (error) {
      console.error(`[store] readWhere(${table}):`, error.message);
      return [];
    }
    return ((data ?? []) as Record<string, unknown>[]).map(toCamel<T>);
  }
  // Filesystem fallback — filter in memory
  const items = fsRead<Record<string, unknown>>(table);
  return items.filter((i) => i[column] === value) as T[];
}

/** Insert one row (newest first in filesystem fallback). */
export async function insert<T>(table: string, item: T): Promise<void> {
  if (isSupabaseEnabled()) {
    const { error } = await sb()
      .from(table)
      .insert(toSnake(item as Record<string, unknown>));
    if (error) throw new Error(`[store] insert(${table}): ${error.message}`);
    return;
  }
  const items = fsRead<T>(table);
  items.unshift(item);
  fsWrite(table, items);
}

/** Update a single row by its `id` field. */
export async function updateById<T>(
  table: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  if (isSupabaseEnabled()) {
    const { error } = await sb()
      .from(table)
      .update(toSnake(data as Record<string, unknown>))
      .eq("id", id);
    if (error) throw new Error(`[store] updateById(${table}): ${error.message}`);
    return;
  }
  const items = fsRead<T & { id: string }>(table);
  const idx = items.findIndex((i) => i.id === id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...data };
    fsWrite(table, items);
  }
}

/** Delete a single row by its `id` field. */
export async function removeById(table: string, id: string): Promise<void> {
  if (isSupabaseEnabled()) {
    const { error } = await sb().from(table).delete().eq("id", id);
    if (error) throw new Error(`[store] removeById(${table}): ${error.message}`);
    return;
  }
  const items = fsRead<{ id: string }>(table);
  fsWrite(table, items.filter((i) => i.id !== id));
}

/** Remove rows where `column` equals `value`. */
export async function removeWhere(
  table: string,
  column: string,
  value: string
): Promise<void> {
  if (isSupabaseEnabled()) {
    const { error } = await sb().from(table).delete().eq(column, value);
    if (error) throw new Error(`[store] removeWhere(${table}): ${error.message}`);
    return;
  }
  const items = fsRead<Record<string, unknown>>(table);
  fsWrite(table, items.filter((i) => i[column] !== value));
}

/** Generate a time-sortable unique id (filesystem compat; Supabase uses its own). */
export function newId(): string {
  return `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
}

// ── Sync helpers (sessions.ts internal use only) ───────────────────────────────

/** @internal Synchronous filesystem read — used only by sessions.ts fallback. */
export function _fsRead<T>(store: string): T[] {
  return fsRead<T>(store);
}

/** @internal Synchronous filesystem write — used only by sessions.ts fallback. */
export function _fsWrite<T>(store: string, items: T[]): void {
  fsWrite(store, items);
}

// ── Sync filesystem wrappers (for backwards-compatible usage) ─────────────────

/** Synchronous write — replaces entire store with given items array. */
export function writeAll<T>(store: string, items: T[]): void {
  fsWrite(store, items);
}

/** Synchronous prepend — inserts item at the front of the filesystem store. */
export function prepend<T>(store: string, item: T): void {
  const items = fsRead<T>(store);
  items.unshift(item);
  fsWrite(store, items);
}
