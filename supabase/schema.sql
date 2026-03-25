-- ══════════════════════════════════════════════════════════════════════════════
-- HotBot Studios — Supabase Schema
-- Run this in your Supabase SQL editor to initialise all tables.
-- All tables use snake_case columns; the Next.js store layer auto-converts to/from camelCase.
-- ══════════════════════════════════════════════════════════════════════════════

-- ── Auth ──────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN (
    'admin','manager','sales','crm_operator','finance','editor','contributor','agent'
  )),
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token          TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username       TEXT NOT NULL,
  role           TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at     TIMESTAMPTZ NOT NULL,
  last_access_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS pending_users (
  id             TEXT PRIMARY KEY,
  username       TEXT NOT NULL,
  email          TEXT NOT NULL,
  requested_role TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── CRM ───────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leads (
  id              TEXT PRIMARY KEY,
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

CREATE TABLE IF NOT EXISTS contacts (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL DEFAULT '',
  email      TEXT NOT NULL DEFAULT '',
  phone      TEXT NOT NULL DEFAULT '',
  subject    TEXT NOT NULL DEFAULT '',
  message    TEXT NOT NULL DEFAULT '',
  source     TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS newsletter (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL DEFAULT '',
  email      TEXT NOT NULL,
  source     TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS callbacks (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL DEFAULT '',
  phone      TEXT NOT NULL DEFAULT '',
  source     TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','called')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS chats (
  id              TEXT PRIMARY KEY,
  messages        JSONB NOT NULL DEFAULT '[]',
  ip              TEXT NOT NULL DEFAULT '',
  started_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── Invoices ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS invoices (
  id              TEXT PRIMARY KEY,
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
  tax_rate        NUMERIC(6,2)  NOT NULL DEFAULT 0,
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

-- ── Tasks ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS crm_tasks (
  id           TEXT PRIMARY KEY,
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

CREATE TABLE IF NOT EXISTS crm_updates (
  id         TEXT PRIMARY KEY,
  lead_id    TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN (
    'note','call','email','meeting','status_change','assignment','task_linked','invoice_linked'
  )),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  metadata   JSONB
);

-- ── Tickets ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tickets (
  id              TEXT PRIMARY KEY,
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
  id          TEXT PRIMARY KEY,
  name        TEXT UNIQUE NOT NULL,
  description TEXT,
  created_by  TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS team_messages (
  id         TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL,
  text       TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  edited_at  TIMESTAMPTZ,
  reply_to   TEXT REFERENCES team_messages(id) ON DELETE SET NULL
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_leads_created_at    ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status        ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to   ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_updates_lead    ON crm_updates(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_updates_time    ON crm_updates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_lead      ON crm_tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_status    ON crm_tasks(status);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_assignee  ON crm_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_invoices_status     ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_lead       ON invoices(lead_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status      ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_team_msg_channel    ON team_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_team_msg_time       ON team_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user       ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires    ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_callbacks_status    ON callbacks(status);

-- ── Row-Level Security (all access via service_role key — RLS is a safety net) ─

ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_users  ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads          ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter     ENABLE ROW LEVEL SECURITY;
ALTER TABLE callbacks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats          ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices       ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_tasks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_updates    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_channels  ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_messages  ENABLE ROW LEVEL SECURITY;

-- No public policies — service_role key bypasses RLS; anon access is blocked.
-- To grant N8N direct access, create a dedicated Supabase role with limited permissions.

-- ── Seed default team channels (idempotent) ───────────────────────────────────

INSERT INTO team_channels (id, name, description, created_by, created_at) VALUES
  ('general', 'general', 'Company-wide announcements and discussion', 'system', NOW()),
  ('sales',   'sales',   'Leads, deals, and client updates',           'system', NOW()),
  ('dev',     'dev',     'Engineering and product updates',            'system', NOW()),
  ('random',  'random',  'Non-work chatter',                           'system', NOW())
ON CONFLICT (id) DO NOTHING;
