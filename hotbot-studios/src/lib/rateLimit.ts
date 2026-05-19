/**
 * Filesystem-based sliding-window rate limiter.
 *
 * Stores hit timestamps in /tmp/hotbot-data/rate_limits.json (Vercel) or
 * ./data/rate_limits.json (local).  Works across serverless invocations
 * within the same region because they share /tmp.
 *
 * Usage:
 *   const result = rateLimit(ip, "forms", { limit: 5, windowMs: 60_000 });
 *   if (!result.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 */

import fs   from "fs";
import path from "path";

const DATA_DIR = process.env.VERCEL
  ? "/tmp/hotbot-data"
  : path.join(process.cwd(), "data");

const STORE_FILE = path.join(DATA_DIR, "rate_limits.json");

/** Hits stored per key. Each value is an array of timestamps (ms). */
type RateLimitStore = Record<string, number[]>;

function readStore(): RateLimitStore {
  try {
    if (!fs.existsSync(STORE_FILE)) return {};
    return JSON.parse(fs.readFileSync(STORE_FILE, "utf-8")) as RateLimitStore;
  } catch {
    return {};
  }
}

function writeStore(store: RateLimitStore): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STORE_FILE, JSON.stringify(store), "utf-8");
}

export interface RateLimitOptions {
  /** Max number of requests allowed within the window. Default: 30 */
  limit?: number;
  /** Window size in milliseconds. Default: 60 000 (1 minute) */
  windowMs?: number;
}

export interface RateLimitResult {
  allowed:   boolean;
  remaining: number;
  resetAt:   number;  // Unix timestamp (ms) when the oldest hit falls out
}

/**
 * Check and record a hit for the given key.
 *
 * @param identifier  Unique key, e.g. an IP address or `${ip}:${route}`
 * @param bucket      Logical bucket name (e.g. "forms", "auth", "api")
 * @param options     Limit and window override
 */
export function rateLimit(
  identifier: string,
  bucket: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const limit    = options.limit    ?? 30;
  const windowMs = options.windowMs ?? 60_000;
  const now      = Date.now();
  const key      = `${bucket}:${identifier}`;
  const cutoff   = now - windowMs;

  const store = readStore();
  const hits  = (store[key] ?? []).filter((ts) => ts > cutoff);

  const allowed = hits.length < limit;
  if (allowed) hits.push(now);

  store[key] = hits;

  // Prune keys with no recent hits to keep the file small
  const pruned: RateLimitStore = {};
  for (const [k, v] of Object.entries(store)) {
    const recent = v.filter((ts) => ts > now - windowMs * 2);
    if (recent.length > 0) pruned[k] = recent;
  }

  try { writeStore(pruned); } catch { /* non-fatal — don't block request */ }

  return {
    allowed,
    remaining: Math.max(0, limit - hits.length),
    resetAt:   hits.length > 0 ? hits[0] + windowMs : now + windowMs,
  };
}

/** Convenience: returns a 429 NextResponse with Retry-After header, or null if allowed. */
export function rateLimitResponse(
  identifier: string,
  bucket: string,
  options?: RateLimitOptions
) {
  const { NextResponse } = require("next/server") as typeof import("next/server");
  const result = rateLimit(identifier, bucket, options);
  if (result.allowed) return null;
  const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
  return NextResponse.json(
    { error: "Too many requests. Please slow down and try again." },
    {
      status: 429,
      headers: {
        "Retry-After":        String(Math.max(1, retryAfter)),
        "X-RateLimit-Limit":  String(options?.limit   ?? 30),
        "X-RateLimit-Reset":  String(result.resetAt),
      },
    }
  );
}
