-- HotBot Studios — Supabase Database Schema
-- Run this in the Supabase SQL Editor for project wsucqpunleplgyrrroae
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Users (custom bcrypt auth — queried by src/lib/adminStore.ts) ─────────────
-- Columns must match exactly: id, username, password_hash, role, created_at

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'admin' CHECK (role IN (
    'admin','manager','sales','crm_operator','finance','editor','contributor','agent'
  )),
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Seed default admin: username=admin / password=Hotbotstudios (bcrypt cost 12)
-- Regenerate hash: node -e "require('bcryptjs').hash('YourPassword',12).then(console.log)"
INSERT INTO users (id, username, password_hash, role)
VALUES (
  'admin-seed',
  'admin',
  '$2b$12$nMk6oS00R.r9/qLpZbClSODAXxibghu4SBa7fv.QqVFUUJqay6Qiu',
  'admin'
)
ON CONFLICT (username) DO NOTHING;

-- ── Sessions (queried by src/lib/sessions.ts) ─────────────────────────────────

CREATE TABLE IF NOT EXISTS sessions (
  token          TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL,
  username       TEXT NOT NULL,
  role           TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at     TIMESTAMPTZ NOT NULL,
  last_access_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);

-- ── Pending Users (registration requests) ────────────────────────────────────

CREATE TABLE IF NOT EXISTS pending_users (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username       TEXT NOT NULL,
  email          TEXT NOT NULL,
  requested_role TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── CRM — Leads ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leads (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name            TEXT NOT NULL DEFAULT '',
  email           TEXT NOT NULL DEFAULT '',
  phone           TEXT NOT NULL DEFAULT '',
  company         TEXT NOT NULL DEFAULT '',
  service         TEXT NOT NULL DEFAULT '',
  budget          TEXT NOT NULL DEFAULT '',
  message         TEXT NOT NULL DEFAULT '',
  form_type       TEXT NOT NULL DEFAULT '',
  source          TEXT NOT NULL DEFAULT '',
  ip              TEXT NOT NULL DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
    'new','contacted','qualified','proposal','negotiation','won','lost'
  )),
  assigned_to     TEXT,
  notes           TEXT,
  tags            TEXT[],
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_updated_at TIMESTAMPTZ,
  last_updated_by TEXT
);

CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);

-- ── CRM — Contacts ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contacts (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name       TEXT NOT NULL DEFAULT '',
  email      TEXT NOT NULL DEFAULT '',
  phone      TEXT NOT NULL DEFAULT '',
  subject    TEXT NOT NULL DEFAULT '',
  message    TEXT NOT NULL DEFAULT '',
  source     TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── CRM — Newsletter ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS newsletter (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name       TEXT NOT NULL DEFAULT '',
  email      TEXT NOT NULL,
  source     TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (email)
);

-- ── CRM — Callbacks ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS callbacks (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name       TEXT NOT NULL DEFAULT '',
  phone      TEXT NOT NULL DEFAULT '',
  source     TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','called')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── CRM — Chats ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS chats (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  messages        JSONB NOT NULL DEFAULT '[]',
  ip              TEXT NOT NULL DEFAULT '',
  started_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── Invoices ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS invoices (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  invoice_number  TEXT UNIQUE NOT NULL,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft','sent','viewed','paid','overdue','cancelled'
  )),
  client_name     TEXT NOT NULL DEFAULT '',
  client_email    TEXT NOT NULL DEFAULT '',
  client_phone    TEXT,
  client_company  TEXT,
  client_address  TEXT,
  line_items      JSONB NOT NULL DEFAULT '[]',
  subtotal        NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_rate        NUMERIC(6,2)  NOT NULL DEFAULT 18,
  tax_amount      NUMERIC(14,2) NOT NULL DEFAULT 0,
  discount        NUMERIC(14,2) NOT NULL DEFAULT 0,
  total           NUMERIC(14,2) NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'INR',
  issued_date     TEXT NOT NULL DEFAULT '',
  due_date        TEXT NOT NULL DEFAULT '',
  paid_date       TEXT,
  notes           TEXT,
  terms           TEXT,
  lead_id         TEXT REFERENCES leads(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by      TEXT NOT NULL DEFAULT '',
  last_updated_at TIMESTAMPTZ,
  last_updated_by TEXT
);

CREATE INDEX IF NOT EXISTS invoices_status_idx ON invoices(status);
CREATE INDEX IF NOT EXISTS invoices_created_at_idx ON invoices(created_at DESC);

-- ── CRM Tasks ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS crm_tasks (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title        TEXT NOT NULL,
  description  TEXT,
  priority     TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status       TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','done','cancelled')),
  assigned_to  TEXT,
  created_by   TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  due_date     TEXT,
  completed_at TIMESTAMPTZ,
  lead_id      TEXT REFERENCES leads(id) ON DELETE SET NULL,
  invoice_id   TEXT REFERENCES invoices(id) ON DELETE SET NULL
);

-- ── CRM Updates (activity log) ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS crm_updates (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  lead_id    TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN (
    'note','call','email','meeting','status_change','assignment','task_linked','invoice_linked'
  )),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  metadata   JSONB
);

CREATE INDEX IF NOT EXISTS crm_updates_lead_id_idx ON crm_updates(lead_id);

-- ── Support Tickets ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tickets (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ticket_number   TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
    'open','in_progress','waiting','resolved','closed'
  )),
  priority        TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  category        TEXT NOT NULL DEFAULT 'general' CHECK (category IN (
    'bug','feature','support','billing','general'
  )),
  requester_name  TEXT NOT NULL DEFAULT '',
  requester_email TEXT NOT NULL DEFAULT '',
  assigned_to     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  resolved_at     TIMESTAMPTZ,
  ip              TEXT,
  comments        JSONB NOT NULL DEFAULT '[]'
);

-- ── Team Chat ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS team_channels (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name        TEXT UNIQUE NOT NULL,
  description TEXT,
  created_by  TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS team_messages (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  channel_id TEXT NOT NULL,
  text       TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  edited_at  TIMESTAMPTZ,
  reply_to   TEXT REFERENCES team_messages(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS team_messages_channel_idx ON team_messages(channel_id);
CREATE INDEX IF NOT EXISTS team_messages_created_at_idx ON team_messages(created_at DESC);

-- ── Blog Posts (stored in Supabase as backup to GitHub/filesystem) ────────────

CREATE TABLE IF NOT EXISTS posts (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  content     TEXT,
  excerpt     TEXT,
  cover_image TEXT,
  tags        TEXT[],
  status      TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  author      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS posts_slug_idx ON posts(slug);
CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status);

-- ── RLS: Disable for all tables (service role key bypasses anyway) ─────────────
-- All tables are accessed server-side via SUPABASE_SERVICE_ROLE_KEY.
-- Enable RLS + policies only if you add client-side Supabase access.

ALTER TABLE users          DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions       DISABLE ROW LEVEL SECURITY;
ALTER TABLE pending_users  DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads          DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts       DISABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter     DISABLE ROW LEVEL SECURITY;
ALTER TABLE callbacks      DISABLE ROW LEVEL SECURITY;
ALTER TABLE chats          DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices       DISABLE ROW LEVEL SECURITY;
ALTER TABLE crm_tasks      DISABLE ROW LEVEL SECURITY;
ALTER TABLE crm_updates    DISABLE ROW LEVEL SECURITY;
ALTER TABLE tickets        DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_channels  DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_messages  DISABLE ROW LEVEL SECURITY;
ALTER TABLE posts          DISABLE ROW LEVEL SECURITY;

-- ── Email Logs (sent email tracking) ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS email_logs (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  resend_id      TEXT,
  to_email       TEXT NOT NULL,
  subject        TEXT NOT NULL DEFAULT '',
  email_type     TEXT NOT NULL DEFAULT 'transactional',
  status         TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
    'queued','sent','delivered','opened','clicked','bounced','complained','delayed','failed'
  )),
  last_event     TEXT,
  sent_at        TIMESTAMPTZ,
  delivered_at   TIMESTAMPTZ,
  opened_at      TIMESTAMPTZ,
  last_opened_at TIMESTAMPTZ,
  open_count     INTEGER NOT NULL DEFAULT 0,
  open_history   TIMESTAMPTZ[] NOT NULL DEFAULT '{}',
  clicked_at     TIMESTAMPTZ,
  last_clicked_at TIMESTAMPTZ,
  click_count    INTEGER NOT NULL DEFAULT 0,
  click_history  JSONB NOT NULL DEFAULT '[]',
  bounced_at     TIMESTAMPTZ,
  complained_at  TIMESTAMPTZ,
  metadata       JSONB,
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS email_logs_resend_id_idx   ON email_logs(resend_id);
CREATE INDEX IF NOT EXISTS email_logs_to_email_idx    ON email_logs(to_email);
CREATE INDEX IF NOT EXISTS email_logs_email_type_idx  ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS email_logs_created_at_idx  ON email_logs(created_at DESC);

ALTER TABLE email_logs DISABLE ROW LEVEL SECURITY;

-- Add open + click profiling columns (safe to run on existing tables)
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS last_opened_at  TIMESTAMPTZ;
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS open_count      INTEGER NOT NULL DEFAULT 0;
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS open_history    TIMESTAMPTZ[] NOT NULL DEFAULT '{}';
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS last_clicked_at TIMESTAMPTZ;
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS click_count     INTEGER NOT NULL DEFAULT 0;
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS click_history   JSONB NOT NULL DEFAULT '[]';
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS metadata        JSONB;

-- ── Site Analytics ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS site_sessions (
  id               TEXT PRIMARY KEY,
  first_page       TEXT,
  referrer         TEXT,
  utm_source       TEXT,
  utm_medium       TEXT,
  utm_campaign     TEXT,
  device           TEXT,
  browser          TEXT,
  os               TEXT,
  country          TEXT,
  city             TEXT,
  traffic_category TEXT,
  traffic_source   TEXT,
  timezone         TEXT,
  page_count       INTEGER NOT NULL DEFAULT 1,
  duration_ms      BIGINT  NOT NULL DEFAULT 0,
  is_bounce        BOOLEAN NOT NULL DEFAULT TRUE,
  tab_switches     INTEGER,
  tab_hidden_ms    BIGINT,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_seen_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS site_sessions_created_at_idx ON site_sessions(created_at DESC);

CREATE TABLE IF NOT EXISTS site_page_views (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id      TEXT NOT NULL REFERENCES site_sessions(id) ON DELETE CASCADE,
  page            TEXT NOT NULL,
  referrer        TEXT,
  duration_ms     BIGINT,
  hour_utc        SMALLINT,
  timezone        TEXT,
  max_scroll_depth SMALLINT,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS site_page_views_session_idx    ON site_page_views(session_id);
CREATE INDEX IF NOT EXISTS site_page_views_created_at_idx ON site_page_views(created_at DESC);

CREATE TABLE IF NOT EXISTS site_events (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  page       TEXT,
  properties JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS site_events_session_idx    ON site_events(session_id);
CREATE INDEX IF NOT EXISTS site_events_created_at_idx ON site_events(created_at DESC);

ALTER TABLE site_sessions   DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_page_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_events     DISABLE ROW LEVEL SECURITY;
