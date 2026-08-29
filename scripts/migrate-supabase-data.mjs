#!/usr/bin/env node
/**
 * Copies this application's tables from one Supabase project to another over
 * PostgREST. Written for the wsucqpunleplgyrrroae → ugusopwzziztnxhqlotp move,
 * but takes both endpoints from the environment so it is not tied to them.
 *
 * The destination schema must already exist — this script copies rows, it does
 * not create tables. See supabase/MIGRATION.md.
 *
 * Usage:
 *   OLD_SUPABASE_URL=https://<old>.supabase.co OLD_SERVICE_KEY=... \
 *   NEW_SUPABASE_URL=https://<new>.supabase.co NEW_SERVICE_KEY=... \
 *   node scripts/migrate-supabase-data.mjs [--dry-run] [--only=table1,table2]
 *
 * Re-running is safe: rows are upserted on their primary key, so a partial run
 * can be resumed without duplicating anything.
 */

const { OLD_SUPABASE_URL, OLD_SERVICE_KEY, NEW_SUPABASE_URL, NEW_SERVICE_KEY } = process.env;

const missing = Object.entries({ OLD_SUPABASE_URL, OLD_SERVICE_KEY, NEW_SUPABASE_URL, NEW_SERVICE_KEY })
  .filter(([, v]) => !v)
  .map(([k]) => k);
if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry-run");
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const ONLY = onlyArg ? onlyArg.slice("--only=".length).split(",").map((s) => s.trim()) : null;

// FK-safe order: clients must land before projects (projects.client_id →
// clients.client_id) and before client_users (client_users.client_id → the same
// column). Everything else is independent, so alphabetical.
//
// The last six are reached through the Supabase client rather than Prisma, so
// they are absent from prisma/schema.prisma. They need supabase/004_missing_tables.sql
// applied first — client_users in particular is what the client portal logs in against.
const TABLES = [
  "clients",
  "ai_knowledge_base", "audit_logs", "backdrop_users", "callbacks", "chats",
  "client_resources", "contacts", "crm_tasks", "crm_updates", "documents",
  "google_tokens", "invoices", "leads", "meeting_attachments", "meetings",
  "newsletter", "project_sops", "projects", "sessions", "system_logs",
  "team_channels", "team_messages", "tickets", "user_permissions", "whiteboards",
  "client_users", "email_logs", "site_sessions", "site_page_views",
  "site_events", "site_journey_events",
];

const PAGE = 500;

function headers(key, extra = {}) {
  return { apikey: key, Authorization: `Bearer ${key}`, ...extra };
}

async function readAll(table) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const url = `${OLD_SUPABASE_URL}/rest/v1/${table}?select=*`;
    const res = await fetch(url, {
      headers: headers(OLD_SERVICE_KEY, { Range: `${from}-${from + PAGE - 1}` }),
    });
    if (!res.ok) throw new Error(`read ${table}: ${res.status} ${await res.text()}`);
    const batch = await res.json();
    rows.push(...batch);
    if (batch.length < PAGE) return rows;
  }
}

async function writeAll(table, rows) {
  for (let i = 0; i < rows.length; i += PAGE) {
    const chunk = rows.slice(i, i + PAGE);
    const res = await fetch(`${NEW_SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: headers(NEW_SERVICE_KEY, {
        "Content-Type": "application/json",
        // Upsert so a re-run resumes instead of failing on rows already copied.
        Prefer: "resolution=merge-duplicates,return=minimal",
      }),
      body: JSON.stringify(chunk),
    });
    if (!res.ok) throw new Error(`write ${table}: ${res.status} ${await res.text()}`);
  }
}

async function count(base, key, table) {
  const res = await fetch(`${base}/rest/v1/${table}?select=*`, {
    headers: headers(key, { Prefer: "count=exact", Range: "0-0" }),
  });
  if (!res.ok) return null;
  const cr = res.headers.get("content-range");
  return cr ? Number(cr.split("/")[1]) : null;
}

const targets = ONLY ? TABLES.filter((t) => ONLY.includes(t)) : TABLES;
if (ONLY) {
  const unknown = ONLY.filter((t) => !TABLES.includes(t));
  if (unknown.length) {
    console.error(`Unknown table(s): ${unknown.join(", ")}`);
    process.exit(1);
  }
}

let copied = 0;
const failures = [];

for (const table of targets) {
  process.stdout.write(`  ${table.padEnd(22)}`);
  try {
    const rows = await readAll(table);
    if (rows.length === 0) {
      console.log("0 rows — skipped");
      continue;
    }
    if (DRY_RUN) {
      console.log(`${rows.length} rows (dry run — not written)`);
      copied += rows.length;
      continue;
    }
    await writeAll(table, rows);
    const dest = await count(NEW_SUPABASE_URL, NEW_SERVICE_KEY, table);
    const ok = dest === rows.length;
    console.log(`${rows.length} rows -> ${dest ?? "?"} at destination ${ok ? "OK" : "MISMATCH"}`);
    if (!ok) failures.push(`${table}: expected ${rows.length}, destination has ${dest ?? "unknown"}`);
    copied += rows.length;
  } catch (err) {
    console.log(`FAILED — ${err.message}`);
    failures.push(`${table}: ${err.message}`);
  }
}

console.log(`\n${DRY_RUN ? "Would copy" : "Copied"} ${copied} rows across ${targets.length} tables.`);
if (failures.length) {
  console.error(`\n${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
