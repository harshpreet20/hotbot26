/**
 * Structured system logger.
 *
 * Primary:  Supabase `system_logs` table
 * Fallback: /tmp/hotbot-data/system_logs.json  (filesystem)
 *
 * All writes are fire-and-forget — a log failure never breaks the caller.
 *
 * SQL to create the Supabase table:
 *
 *   CREATE TABLE system_logs (
 *     id          TEXT PRIMARY KEY,
 *     created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *     level       TEXT NOT NULL,          -- 'info' | 'warn' | 'error'
 *     event       TEXT NOT NULL,          -- e.g. 'auth.attempt'
 *     message     TEXT NOT NULL,
 *     details     JSONB,
 *     ip          TEXT,
 *     user_id     TEXT,
 *     username    TEXT
 *   );
 *   CREATE INDEX ON system_logs (created_at DESC);
 *   CREATE INDEX ON system_logs (level);
 *   CREATE INDEX ON system_logs (event);
 */
import crypto from "crypto";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import { _fsRead, _fsWrite } from "@/lib/fsStore";

// ── Types ─────────────────────────────────────────────────────────────────────

export type LogLevel = "info" | "warn" | "error";

export interface LogEntry {
  id:         string;
  createdAt:  string;       // ISO-8601
  level:      LogLevel;
  event:      string;       // dot-notation: 'auth.attempt', 'auth.failure', etc.
  message:    string;
  details:    Record<string, unknown>;
  ip:         string;
  userId:     string;
  username:   string;
}

// ── Filesystem cap ────────────────────────────────────────────────────────────

const FS_CAP = 500;

function fsTrim(entries: LogEntry[]): LogEntry[] {
  return entries.slice(0, FS_CAP);
}

// ── Supabase row shape (snake_case) ───────────────────────────────────────────

interface LogRow {
  id:         string;
  created_at: string;
  level:      string;
  event:      string;
  message:    string;
  details:    Record<string, unknown>;
  ip:         string;
  user_id:    string;
  username:   string;
}

function toRow(e: LogEntry): LogRow {
  return {
    id:         e.id,
    created_at: e.createdAt,
    level:      e.level,
    event:      e.event,
    message:    e.message,
    details:    e.details,
    ip:         e.ip,
    user_id:    e.userId,
    username:   e.username,
  };
}

function fromRow(r: LogRow): LogEntry {
  return {
    id:        r.id,
    createdAt: r.created_at,
    level:     r.level as LogLevel,
    event:     r.event,
    message:   r.message,
    details:   r.details ?? {},
    ip:        r.ip ?? "",
    userId:    r.user_id ?? "",
    username:  r.username ?? "",
  };
}

// ── Core write ────────────────────────────────────────────────────────────────

async function writeLog(entry: LogEntry): Promise<void> {
  if (isSupabaseEnabled()) {
    const { error } = await sb().from("system_logs").insert(toRow(entry));
    if (!error) return;
    // Supabase failed (table may not exist yet) — fall through to filesystem
  }
  try {
    const entries = _fsRead<LogEntry>("system_logs");
    entries.unshift(entry);
    _fsWrite("system_logs", fsTrim(entries));
  } catch {
    // Filesystem also failed — swallow silently; logging must never crash the app
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

interface LogOptions {
  details?: Record<string, unknown>;
  ip?:      string;
  userId?:  string;
  username?: string;
}

function emit(level: LogLevel, event: string, message: string, opts: LogOptions = {}): void {
  const entry: LogEntry = {
    id:        `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    createdAt: new Date().toISOString(),
    level,
    event,
    message,
    details:  opts.details  ?? {},
    ip:       opts.ip       ?? "",
    userId:   opts.userId   ?? "",
    username: opts.username ?? "",
  };

  // Fire-and-forget — never await in hot paths
  writeLog(entry).catch(() => {});

  // Always mirror to console for Vercel Function logs
  const consoleFn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  consoleFn(`[${event}] ${message}`, Object.keys(entry.details).length ? entry.details : "");
}

export const log = {
  info:  (event: string, message: string, opts?: LogOptions) => emit("info",  event, message, opts),
  warn:  (event: string, message: string, opts?: LogOptions) => emit("warn",  event, message, opts),
  error: (event: string, message: string, opts?: LogOptions) => emit("error", event, message, opts),
};

// ── Read API (for dashboard) ──────────────────────────────────────────────────

export interface LogQuery {
  limit?:  number;   // default 200
  level?:  LogLevel;
  event?:  string;   // prefix match, e.g. "auth"
  since?:  string;   // ISO-8601 — only entries after this timestamp
}

export async function getLogs(query: LogQuery = {}): Promise<LogEntry[]> {
  const limit = Math.min(query.limit ?? 200, 1000);

  if (isSupabaseEnabled()) {
    let q = sb()
      .from("system_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (query.level)  q = q.eq("level", query.level);
    if (query.event)  q = q.like("event", `${query.event}%`);
    if (query.since)  q = q.gt("created_at", query.since);

    const { data, error } = await q;
    if (!error && data) return (data as LogRow[]).map(fromRow);
    // Fall through to filesystem on table-missing error
  }

  let entries = _fsRead<LogEntry>("system_logs");
  if (query.level) entries = entries.filter((e) => e.level === query.level);
  if (query.event) entries = entries.filter((e) => e.event.startsWith(query.event!));
  if (query.since) entries = entries.filter((e) => e.createdAt > query.since!);
  return entries.slice(0, limit);
}
