/**
 * Sliding-window rate limiter.
 *
 * Primary (when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set):
 *   Uses @upstash/ratelimit — works correctly across all Vercel serverless instances.
 *
 * Fallback (no Upstash env vars):
 *   Filesystem-based store in /tmp/hotbot-data/rate_limits.json (Vercel) or
 *   ./data/rate_limits.json (local). Approximate — not shared across instances.
 *
 * Usage:
 *   const result = await rateLimit(ip, "forms", { limit: 5, windowMs: 60_000 });
 *   if (!result.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 */

import { NextResponse } from "next/server";
import fs   from "fs";
import path from "path";

export interface RateLimitOptions {
  /** Max requests allowed within the window. Default: 30 */
  limit?: number;
  /** Window size in milliseconds. Default: 60 000 (1 minute) */
  windowMs?: number;
}

export interface RateLimitResult {
  allowed:   boolean;
  remaining: number;
  resetAt:   number;  // Unix timestamp (ms) when the window resets
}

// ---------------------------------------------------------------------------
// Upstash implementation
// ---------------------------------------------------------------------------

function msToUpstashDuration(ms: number): `${number} s` | `${number} m` | `${number} h` {
  if (ms >= 3_600_000 && ms % 3_600_000 === 0) return `${ms / 3_600_000} h`;
  if (ms >= 60_000)  return `${Math.round(ms / 60_000)} m`;
  return `${Math.round(ms / 1_000)} s`;
}

// Lazily created Upstash clients, keyed by "limit:windowStr" to allow different configs.
const upstashLimiters = new Map<string, import("@upstash/ratelimit").Ratelimit>();

async function rateLimitUpstash(
  identifier: string,
  bucket: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis }     = await import("@upstash/redis");

  const limit    = options.limit    ?? 30;
  const windowMs = options.windowMs ?? 60_000;
  const window   = msToUpstashDuration(windowMs);
  const cacheKey = `${limit}:${window}`;

  let limiter = upstashLimiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(limit, window),
      prefix: "rl",
    });
    upstashLimiters.set(cacheKey, limiter);
  }

  const { success, remaining, reset } = await limiter.limit(`${bucket}:${identifier}`);
  return {
    allowed:   success,
    remaining: remaining,
    resetAt:   reset,
  };
}

// ---------------------------------------------------------------------------
// Filesystem fallback implementation
// ---------------------------------------------------------------------------

const DATA_DIR = process.env.VERCEL
  ? "/tmp/hotbot-data"
  : path.join(process.cwd(), "data");

const STORE_FILE = path.join(DATA_DIR, "rate_limits.json");

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

async function rateLimitFilesystem(
  identifier: string,
  bucket: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
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

  const pruned: RateLimitStore = {};
  for (const [k, v] of Object.entries(store)) {
    const recent = v.filter((ts) => ts > now - windowMs * 2);
    if (recent.length > 0) pruned[k] = recent;
  }

  try { writeStore(pruned); } catch { /* non-fatal */ }

  return {
    allowed,
    remaining: Math.max(0, limit - hits.length),
    resetAt:   hits.length > 0 ? hits[0] + windowMs : now + windowMs,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const useUpstash =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

/**
 * Check and record a hit for the given key.
 *
 * @param identifier  Unique key, e.g. an IP address or `${ip}:${route}`
 * @param bucket      Logical bucket name (e.g. "forms", "auth", "api")
 * @param options     Limit and window override
 */
export async function rateLimit(
  identifier: string,
  bucket: string,
  options: RateLimitOptions = {}
): Promise<RateLimitResult> {
  if (useUpstash) return rateLimitUpstash(identifier, bucket, options);
  return rateLimitFilesystem(identifier, bucket, options);
}

/** Convenience: returns a 429 NextResponse with Retry-After header, or null if allowed. */
export async function rateLimitResponse(
  identifier: string,
  bucket: string,
  options?: RateLimitOptions
): Promise<NextResponse | null> {
  const result = await rateLimit(identifier, bucket, options);
  if (result.allowed) return null;
  const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
  return NextResponse.json(
    { error: "Too many requests. Please slow down and try again." },
    {
      status: 429,
      headers: {
        "Retry-After":       String(Math.max(1, retryAfter)),
        "X-RateLimit-Limit": String(options?.limit ?? 30),
        "X-RateLimit-Reset": String(result.resetAt),
      },
    }
  );
}
