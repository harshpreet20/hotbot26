#!/usr/bin/env node
/**
 * run-missing-tables-migration.mjs
 * Executes the 16 missing-tables SQL statements against Supabase
 * using the service role key (bypasses RLS).
 *
 * Usage:
 *   SUPABASE_URL=https://wsucqpunleplgyrrroae.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=<your-key> \
 *   node scripts/run-missing-tables-migration.mjs
 */

const SUPABASE_URL = process.env.SUPABASE_URL || "https://wsucqpunleplgyrrroae.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error("ERROR: SUPABASE_SERVICE_ROLE_KEY is not set.");
  process.exit(1);
}

const SQL_ENDPOINT = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;

// Use the management API's SQL endpoint
async function execSQL(label, sql) {
  const url = `${SUPABASE_URL}/rest/v1/rpc/pg_query`;
  // Supabase doesn't expose a raw SQL endpoint via PostgREST directly,
  // so we use the pg-meta / SQL API via the management endpoint.
  // For service-role access, we call the SQL via pg-meta if available,
  // or via a custom RPC. As an alternative, use the Supabase SQL HTTP API:
  const sqlApiUrl = SUPABASE_URL.replace("https://", "https://") + "/rest/v1/";

  // Primary approach: use the Supabase Database REST endpoint via POST to pg-meta SQL
  const pgMetaUrl = `${SUPABASE_URL.replace(".supabase.co", ".supabase.co")}/rest/v1/`;

  // Use the management API SQL execution endpoint (requires service role)
  const mgmtUrl = `https://api.supabase.com/v1/projects/wsucqpunleplgyrrroae/database/query`;

  // Actually use the direct SQL execution via PostgREST's rpc with a helper function,
  // or better: use the Supabase JS client's `db.execute(sql)` pattern.
  // Since we can use `fetch` directly, POST to the /sql endpoint:
  const directSqlUrl = `${SUPABASE_URL}/rest/v1/`;

  // The cleanest approach without extra packages: use node's built-in fetch
  // against Supabase's direct SQL API (available since Supabase >= 2023)
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SERVICE_KEY}`,
      "apikey": SERVICE_KEY,
    },
    body: JSON.stringify({ sql }),
  });

  if (!response.ok) {
    // Try the pg-meta SQL endpoint
    const pgResponse = await fetch(`${SUPABASE_URL.replace("supabase.co", "supabase.co")}/pg-meta/v1/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SERVICE_KEY}`,
        "apikey": SERVICE_KEY,
        "x-pg-meta-connection-string": `postgresql://postgres:${SERVICE_KEY}@db.wsucqpunleplgyrrroae.supabase.co:5432/postgres`,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!pgResponse.ok) {
      const errText = await pgResponse.text();
      return { ok: false, error: errText };
    }
    return { ok: true, data: await pgResponse.json() };
  }

  return { ok: true, data: await response.json() };
}

const STATEMENTS = [
  {
    label: "1. leads",
    sql: `CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  company TEXT,
  service TEXT,
  budget TEXT,
  message TEXT,
  form_type TEXT,
  source TEXT DEFAULT 'manual',
  ip TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','proposal','negotiation','won','lost','converted')),
  assigned_to TEXT,
  notes TEXT,
  tags TEXT[],
  last_updated_at TIMESTAMPTZ,
  last_updated_by TEXT,
  session_id TEXT,
  journey_stage TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
)`,
  },
  {
    label: "2. contacts",
    sql: `CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  company TEXT,
  message TEXT,
  form_type TEXT,
  source TEXT,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
)`,
  },
  {
    label: "3. callbacks",
    sql: `CREATE TABLE IF NOT EXISTS callbacks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT,
  phone TEXT,
  email TEXT,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','called','missed')),
  source TEXT,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
)`,
  },
  {
    label: "4. tickets",
    sql: `CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ticket_number TEXT UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'open' CHECK (status IN ('draft','open','in_progress','waiting','resolved','closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  category TEXT DEFAULT 'general' CHECK (category IN ('bug','feature','support','billing','general')),
  requester_name TEXT,
  requester_email TEXT,
  assigned_to TEXT,
  labels TEXT[],
  due_date TEXT,
  client_id TEXT,
  ip TEXT,
  is_internal BOOLEAN DEFAULT FALSE,
  raised_against TEXT,
  raised_by TEXT,
  resolved_at TIMESTAMPTZ,
  comments JSONB DEFAULT '[]',
  activity JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
)`,
  },
  {
    label: "5. invoices",
    sql: `CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  invoice_number TEXT UNIQUE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','overdue','cancelled')),
  client_name TEXT NOT NULL DEFAULT '',
  client_email TEXT NOT NULL DEFAULT '',
  client_phone TEXT,
  client_company TEXT,
  client_address TEXT,
  line_items JSONB DEFAULT '[]',
  subtotal NUMERIC(14,2) DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(14,2) DEFAULT 0,
  discount NUMERIC(14,2) DEFAULT 0,
  total NUMERIC(14,2) DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  issued_date TEXT,
  due_date TEXT,
  paid_date TEXT,
  notes TEXT,
  terms TEXT,
  lead_id TEXT,
  created_by TEXT,
  last_updated_at TIMESTAMPTZ,
  last_updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
)`,
  },
  {
    label: "6. credit_notes",
    sql: `CREATE TABLE IF NOT EXISTS credit_notes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  credit_note_number TEXT UNIQUE,
  invoice_id TEXT,
  client_name TEXT NOT NULL DEFAULT '',
  client_email TEXT NOT NULL DEFAULT '',
  amount NUMERIC(14,2) DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  reason TEXT,
  status TEXT DEFAULT 'created' CHECK (status IN ('created','applied','cancelled')),
  issued_date TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
)`,
  },
  {
    label: "7. newsletter",
    sql: `CREATE TABLE IF NOT EXISTS newsletter (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','unsubscribed')),
  source TEXT,
  ip TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
)`,
  },
  {
    label: "8. chats",
    sql: `CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  messages JSONB DEFAULT '[]',
  status TEXT DEFAULT 'open' CHECK (status IN ('open','closed','resolved')),
  assigned_to TEXT,
  source TEXT,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
)`,
  },
  {
    label: "9. crm_tasks",
    sql: `CREATE TABLE IF NOT EXISTS crm_tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','in_progress','done','cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  assigned_to TEXT,
  due_date TEXT,
  lead_id TEXT,
  client_id TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
)`,
  },
  {
    label: "10. team_channels",
    sql: `CREATE TABLE IF NOT EXISTS team_channels (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
)`,
  },
  {
    label: "11. team_messages",
    sql: `CREATE TABLE IF NOT EXISTS team_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  channel_id TEXT NOT NULL DEFAULT 'general',
  text TEXT NOT NULL,
  author_username TEXT NOT NULL,
  author_role TEXT,
  reply_to TEXT,
  edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
)`,
  },
  {
    label: "12. site_page_views",
    sql: `CREATE TABLE IF NOT EXISTS site_page_views (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id TEXT,
  path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  ip TEXT,
  country TEXT,
  device TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
)`,
  },
  {
    label: "13. site_sessions",
    sql: `CREATE TABLE IF NOT EXISTS site_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  path TEXT,
  referrer TEXT,
  source TEXT,
  medium TEXT,
  campaign TEXT,
  ip TEXT,
  country TEXT,
  device TEXT,
  is_bounce BOOLEAN DEFAULT TRUE,
  duration_ms INTEGER DEFAULT 0,
  page_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
)`,
  },
  {
    label: "14. site_events",
    sql: `CREATE TABLE IF NOT EXISTS site_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id TEXT,
  event_name TEXT NOT NULL,
  category TEXT,
  label TEXT,
  value NUMERIC,
  path TEXT,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
)`,
  },
  {
    label: "15. client_resources",
    sql: `CREATE TABLE IF NOT EXISTS client_resources (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_id TEXT NOT NULL,
  project_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  mime_type TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('general','contract','design','report','deliverable','invoice','other')),
  uploaded_by TEXT,
  uploaded_by_type TEXT DEFAULT 'team' CHECK (uploaded_by_type IN ('team','client')),
  visibility TEXT DEFAULT 'client' CHECK (visibility IN ('internal','client')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
)`,
  },
  {
    label: "16. invoice_schedules",
    sql: `CREATE TABLE IF NOT EXISTS invoice_schedules (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_name TEXT NOT NULL DEFAULT '',
  client_email TEXT NOT NULL DEFAULT '',
  amount NUMERIC(14,2) DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('weekly','monthly','quarterly','annually')),
  next_date TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','paused','cancelled')),
  description TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
)`,
  },
];

// Use @supabase/supabase-js to execute raw SQL via rpc or storage
// The cleanest way: use supabase.from() doesn't work for DDL.
// We need to use the Postgres direct connection or the Management API.
// Let's use the Management API's SQL endpoint:

async function runMigrations() {
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Running ${STATEMENTS.length} CREATE TABLE IF NOT EXISTS statements...\n`);

  const results = { success: [], failed: [] };

  for (const { label, sql } of STATEMENTS) {
    process.stdout.write(`  ${label} ... `);

    // Use the Supabase Management API SQL endpoint
    // This requires a Personal Access Token (not service role key)
    // We'll try both approaches:

    // Approach 1: Management API (needs PAT)
    const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
    if (accessToken) {
      try {
        const res = await fetch(
          `https://api.supabase.com/v1/projects/wsucqpunleplgyrrroae/database/query`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ query: sql }),
          }
        );
        if (res.ok) {
          console.log("OK");
          results.success.push(label);
          continue;
        }
        const err = await res.text();
        console.log(`FAILED (management API): ${err.substring(0, 100)}`);
        results.failed.push({ label, error: err });
        continue;
      } catch (e) {
        console.log(`ERROR: ${e.message}`);
        results.failed.push({ label, error: e.message });
        continue;
      }
    }

    // Approach 2: PostgREST rpc (needs a custom exec_sql function in DB)
    // This won't work without a pre-existing function.
    // Instead, output instructions:
    console.log("SKIPPED (no SUPABASE_ACCESS_TOKEN set)");
    results.failed.push({ label, error: "No credentials available" });
  }

  console.log("\n=== RESULTS ===");
  console.log(`Succeeded: ${results.success.length}/${STATEMENTS.length}`);
  console.log(`Failed:    ${results.failed.length}/${STATEMENTS.length}`);

  if (results.success.length > 0) {
    console.log("\nSucceeded:");
    results.success.forEach(l => console.log(`  + ${l}`));
  }
  if (results.failed.length > 0) {
    console.log("\nFailed:");
    results.failed.forEach(({ label, error }) =>
      console.log(`  - ${label}: ${error.substring(0, 80)}`)
    );
  }

  if (!accessToken) {
    console.log(`
To run this migration, set SUPABASE_ACCESS_TOKEN to your Supabase Personal Access Token
(found at https://supabase.com/dashboard/account/tokens) and re-run:

  SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/run-missing-tables-migration.mjs

Alternatively, paste the SQL from supabase/migrations_missing_tables.sql
into the Supabase SQL Editor at:
  https://supabase.com/dashboard/project/wsucqpunleplgyrrroae/sql/new
`);
  }
}

runMigrations().catch(console.error);
