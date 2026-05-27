-- =============================================================================
-- HotBot Studios — Missing Tables Migration
-- Run this in the Supabase SQL Editor for project wsucqpunleplgyrrroae
-- Generated: 2026-05-26
-- =============================================================================
-- This file adds all tables the application code references that are NOT
-- in the current schema.sql baseline. It is safe to run multiple times
-- (all statements use CREATE TABLE IF NOT EXISTS or ALTER ... IF NOT EXISTS).
-- =============================================================================


-- ── 1. Fix tickets.id — add gen_random_uuid() default if missing ─────────────
-- The schema defines id as TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text
-- If the column exists without a default, alter it:
ALTER TABLE tickets ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;


-- ── 2. Backdrop Users (Supabase Auth mirror — admin dashboard access) ─────────
-- Referenced by: src/app/api/blog/users/register/route.ts,
--               src/app/api/blog/auth/route.ts, src/lib/adminStore.ts

CREATE TABLE IF NOT EXISTS backdrop_users (
  id           TEXT PRIMARY KEY,          -- mirrors Supabase Auth user UUID
  email        TEXT UNIQUE NOT NULL,
  username     TEXT,
  role         TEXT NOT NULL DEFAULT 'contributor' CHECK (role IN (
    'super_admin','admin','manager','sales','crm_operator',
    'finance','editor','contributor','agent'
  )),
  status       TEXT NOT NULL DEFAULT 'pending_email' CHECK (status IN (
    'pending_email','pending_approval','active','suspended','rejected'
  )),
  password_hash TEXT,                     -- null when using Supabase Auth
  permissions  JSONB,                     -- { grants: [], revokes: [] }
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS backdrop_users_email_idx  ON backdrop_users(email);
CREATE INDEX IF NOT EXISTS backdrop_users_status_idx ON backdrop_users(status);
CREATE INDEX IF NOT EXISTS backdrop_users_role_idx   ON backdrop_users(role);

ALTER TABLE backdrop_users DISABLE ROW LEVEL SECURITY;


-- ── 3. Clients (CRM — converted leads / active clients) ───────────────────────
-- Referenced by: src/app/api/dashboard/clients/route.ts,
--               src/app/api/dashboard/projects/route.ts, etc.

CREATE TABLE IF NOT EXISTS clients (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_id           TEXT UNIQUE NOT NULL,        -- e.g. "HBS-AB123"
  name                TEXT NOT NULL DEFAULT '',
  email               TEXT NOT NULL DEFAULT '',
  phone               TEXT NOT NULL DEFAULT '',
  company             TEXT NOT NULL DEFAULT '',
  status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active','old','reactivation_needed'
  )),
  notes               TEXT,
  lead_id             TEXT,                        -- soft ref to leads.id
  onboarding_stage    TEXT CHECK (onboarding_stage IN (
    'prospect','onboarded','active','vip'
  )),
  account_manager     TEXT,
  portal_enabled      BOOLEAN NOT NULL DEFAULT FALSE,
  portal_invite_sent_at TIMESTAMPTZ,
  subscription_status TEXT CHECK (subscription_status IN (
    'none','trial','active','paused','cancelled'
  )),
  industry            TEXT,
  website             TEXT,
  address             TEXT,
  avatar_url          TEXT,
  tags                TEXT[],
  custom_fields       JSONB,
  client_type         TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS clients_client_id_idx  ON clients(client_id);
CREATE INDEX IF NOT EXISTS clients_email_idx      ON clients(email);
CREATE INDEX IF NOT EXISTS clients_status_idx     ON clients(status);
CREATE INDEX IF NOT EXISTS clients_created_at_idx ON clients(created_at DESC);

ALTER TABLE clients DISABLE ROW LEVEL SECURITY;


-- ── 4. Client Users (portal login credentials per client) ─────────────────────
-- Referenced by: src/app/api/customers/tasks/route.ts,
--               src/app/api/dashboard/clients/route.ts

CREATE TABLE IF NOT EXISTS client_users (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email               TEXT UNIQUE NOT NULL,
  name                TEXT,
  client_id           TEXT NOT NULL,               -- FK → clients.client_id
  role                TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN (
    'owner','admin','member','viewer'
  )),
  invite_token        TEXT,
  invite_expires_at   TIMESTAMPTZ,
  invite_accepted_at  TIMESTAMPTZ,                 -- set when setup token is consumed
  invited_by          TEXT,                        -- admin username who sent invite
  password_hash       TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at       TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS client_users_email_idx     ON client_users(email);
CREATE INDEX IF NOT EXISTS client_users_client_id_idx ON client_users(client_id);

ALTER TABLE client_users DISABLE ROW LEVEL SECURITY;


-- ── 5. Tasks (client-portal task requests) ────────────────────────────────────
-- Referenced by: src/app/api/customers/tasks/route.ts
-- NOTE: Different from crm_tasks (internal CRM tasks)

CREATE TABLE IF NOT EXISTS tasks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  description    TEXT,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending','in_progress','done','cancelled'
  )),
  priority       TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN (
    'low','medium','high'
  )),
  client_id      TEXT,                             -- FK → clients.client_id
  client_email   TEXT,
  requester_name TEXT,
  requester_email TEXT,
  assigned_to    TEXT,
  due_date       DATE,
  source         TEXT NOT NULL DEFAULT 'portal',
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS tasks_client_id_idx  ON tasks(client_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx     ON tasks(status);
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON tasks(created_at DESC);

ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;


-- ── 6. Projects ───────────────────────────────────────────────────────────────
-- Referenced by: src/app/api/dashboard/projects/route.ts,
--               src/app/api/customers/projects/route.ts

CREATE TABLE IF NOT EXISTS projects (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_number   TEXT,
  client_id        TEXT NOT NULL,                  -- FK → clients.client_id
  name             TEXT NOT NULL,
  description      TEXT,
  status           TEXT NOT NULL DEFAULT 'planning' CHECK (status IN (
    'planning','active','on_hold','completed','cancelled'
  )),
  stage            TEXT DEFAULT 'discovery' CHECK (stage IN (
    'discovery','design','development','review','launch','support'
  )),
  priority         TEXT DEFAULT 'medium' CHECK (priority IN (
    'low','medium','high','critical'
  )),
  progress         INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  start_date       TEXT,
  target_date      TEXT,
  completed_date   TEXT,
  assigned_to      TEXT[],
  account_manager  TEXT,
  budget           NUMERIC(14,2),
  currency         TEXT DEFAULT 'INR',
  tags             TEXT[],
  created_by       TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS projects_client_id_idx  ON projects(client_id);
CREATE INDEX IF NOT EXISTS projects_status_idx     ON projects(status);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON projects(created_at DESC);

ALTER TABLE projects DISABLE ROW LEVEL SECURITY;


-- ── 7. Project Updates (milestone/progress posts on a project) ────────────────
-- Referenced by: src/app/api/dashboard/projects/[id]/updates/route.ts,
--               src/app/api/customers/projects/[id]/route.ts

CREATE TABLE IF NOT EXISTS project_updates (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id   TEXT NOT NULL,                      -- FK → projects.id
  client_id    TEXT,                               -- FK → clients.client_id
  type         TEXT NOT NULL DEFAULT 'update' CHECK (type IN (
    'update','milestone','issue','review','launch'
  )),
  title        TEXT,
  content      TEXT NOT NULL,
  visibility   TEXT NOT NULL DEFAULT 'internal' CHECK (visibility IN (
    'internal','client'
  )),
  progress     INTEGER,
  author_email TEXT,
  author_name  TEXT,
  author_type  TEXT NOT NULL DEFAULT 'team' CHECK (author_type IN ('team','client')),
  attachments  JSONB NOT NULL DEFAULT '[]',
  pinned       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS project_updates_project_id_idx ON project_updates(project_id);
CREATE INDEX IF NOT EXISTS project_updates_created_at_idx ON project_updates(created_at DESC);

ALTER TABLE project_updates DISABLE ROW LEVEL SECURITY;


-- ── 8. Project Update Comments ────────────────────────────────────────────────
-- Referenced by: src/app/api/customers/projects/[id]/comment/route.ts

CREATE TABLE IF NOT EXISTS project_update_comments (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  update_id    TEXT NOT NULL REFERENCES project_updates(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  author_email TEXT,
  author_name  TEXT,
  author_type  TEXT NOT NULL DEFAULT 'client' CHECK (author_type IN ('team','client')),
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS project_update_comments_update_idx ON project_update_comments(update_id);

ALTER TABLE project_update_comments DISABLE ROW LEVEL SECURITY;


-- ── 9. Project Update Reactions ───────────────────────────────────────────────
-- Referenced by: src/app/api/customers/projects/[id]/react/route.ts

CREATE TABLE IF NOT EXISTS project_update_reactions (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  update_id    TEXT NOT NULL REFERENCES project_updates(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  author_name  TEXT,
  author_type  TEXT NOT NULL DEFAULT 'client' CHECK (author_type IN ('team','client')),
  emoji        TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (update_id, author_email, emoji)
);

CREATE INDEX IF NOT EXISTS project_update_reactions_update_idx ON project_update_reactions(update_id);

ALTER TABLE project_update_reactions DISABLE ROW LEVEL SECURITY;


-- ── 10. Project Files ─────────────────────────────────────────────────────────
-- Referenced by: src/app/api/customers/files/route.ts,
--               src/app/api/dashboard/projects/[id]/route.ts

CREATE TABLE IF NOT EXISTS project_files (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id   TEXT NOT NULL,                      -- FK → projects.id
  client_id    TEXT,
  name         TEXT NOT NULL,
  url          TEXT NOT NULL,
  size         INTEGER,
  mime_type    TEXT,
  visibility   TEXT NOT NULL DEFAULT 'internal' CHECK (visibility IN (
    'internal','client'
  )),
  uploaded_by  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS project_files_project_id_idx ON project_files(project_id);
CREATE INDEX IF NOT EXISTS project_files_created_at_idx ON project_files(created_at DESC);

ALTER TABLE project_files DISABLE ROW LEVEL SECURITY;


-- ── 11. Client Announcements (shared notes / portal messages) ─────────────────
-- Referenced by: src/app/api/customers/communications/route.ts

CREATE TABLE IF NOT EXISTS client_announcements (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_id    TEXT NOT NULL,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'shared_note' CHECK (type IN (
    'announcement','shared_note','update','warning'
  )),
  author_type  TEXT NOT NULL DEFAULT 'team' CHECK (author_type IN ('team','client')),
  author_name  TEXT,
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS client_announcements_client_id_idx ON client_announcements(client_id);
CREATE INDEX IF NOT EXISTS client_announcements_created_at_idx ON client_announcements(created_at DESC);

ALTER TABLE client_announcements DISABLE ROW LEVEL SECURITY;


-- ── 12. CRM Notifications (push/in-app notifications for clients/team) ────────
-- Referenced by: src/app/api/customers/notifications/route.ts,
--               src/app/api/dashboard/projects/[id]/updates/route.ts

CREATE TABLE IF NOT EXISTS crm_notifications (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  recipient_email TEXT NOT NULL,
  recipient_type  TEXT NOT NULL DEFAULT 'client' CHECK (recipient_type IN ('client','team')),
  type            TEXT NOT NULL,                   -- 'project_update','invoice','comment', etc.
  title           TEXT NOT NULL,
  body            TEXT,
  link            TEXT,
  entity_type     TEXT,
  entity_id       TEXT,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS crm_notifications_recipient_idx   ON crm_notifications(recipient_email);
CREATE INDEX IF NOT EXISTS crm_notifications_created_at_idx  ON crm_notifications(created_at DESC);

ALTER TABLE crm_notifications DISABLE ROW LEVEL SECURITY;


-- ── 13. Payments ──────────────────────────────────────────────────────────────
-- Referenced by: src/app/api/customers/invoices/route.ts

CREATE TABLE IF NOT EXISTS payments (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  invoice_id     TEXT NOT NULL,                    -- FK → invoices.id
  amount         NUMERIC(14,2) NOT NULL,
  currency       TEXT NOT NULL DEFAULT 'INR',
  gateway        TEXT NOT NULL DEFAULT 'manual',   -- 'razorpay','paypal','manual'
  gateway_order_id   TEXT,
  gateway_payment_id TEXT,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending','completed','failed','refunded'
  )),
  paid_at        TIMESTAMPTZ,
  metadata       JSONB,
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS payments_invoice_id_idx  ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS payments_status_idx      ON payments(status);
CREATE INDEX IF NOT EXISTS payments_created_at_idx  ON payments(created_at DESC);

ALTER TABLE payments DISABLE ROW LEVEL SECURITY;


-- ── 14. Invoice Schedules (recurring invoice automation) ──────────────────────
-- Referenced by: src/app/api/dashboard/invoice-schedules/route.ts

CREATE TABLE IF NOT EXISTS invoice_schedules (
  id                   TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name                 TEXT NOT NULL,
  client_name          TEXT NOT NULL DEFAULT '',
  client_email         TEXT NOT NULL,
  client_phone         TEXT,
  client_company       TEXT,
  client_address       TEXT,
  line_items           JSONB NOT NULL DEFAULT '[]',
  tax_rate             NUMERIC(6,2) NOT NULL DEFAULT 0,
  discount             NUMERIC(14,2) NOT NULL DEFAULT 0,
  currency             TEXT NOT NULL DEFAULT 'INR',
  notes                TEXT,
  terms                TEXT,
  frequency            TEXT NOT NULL CHECK (frequency IN (
    'weekly','monthly','quarterly','annually'
  )),
  start_date           TEXT NOT NULL,
  end_date             TEXT,
  next_invoice_date    TEXT,
  payment_terms_days   INTEGER NOT NULL DEFAULT 30,
  lead_id              TEXT,
  active               BOOLEAN NOT NULL DEFAULT TRUE,
  invoices_generated   INTEGER NOT NULL DEFAULT 0,
  last_generated_at    TIMESTAMPTZ,
  created_by           TEXT NOT NULL DEFAULT '',
  created_at           TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS invoice_schedules_client_email_idx ON invoice_schedules(client_email);
CREATE INDEX IF NOT EXISTS invoice_schedules_active_idx       ON invoice_schedules(active);

ALTER TABLE invoice_schedules DISABLE ROW LEVEL SECURITY;


-- ── 15. Invoice Reminders (sent payment reminder log) ─────────────────────────
-- Referenced by: src/app/api/dashboard/invoices/remind/route.ts

CREATE TABLE IF NOT EXISTS invoice_reminders (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  invoice_id   TEXT NOT NULL,                      -- FK → invoices.id
  channel      TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email','whatsapp')),
  status       TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','failed')),
  message_id   TEXT,
  sent_by      TEXT,
  sent_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS invoice_reminders_invoice_id_idx ON invoice_reminders(invoice_id);
CREATE INDEX IF NOT EXISTS invoice_reminders_sent_at_idx    ON invoice_reminders(sent_at DESC);

ALTER TABLE invoice_reminders DISABLE ROW LEVEL SECURITY;


-- ── 16. Invoice AI Insights ───────────────────────────────────────────────────
-- Referenced by: src/app/api/dashboard/invoices/ai-insights/route.ts

CREATE TABLE IF NOT EXISTS invoice_ai_insights (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  invoice_id   TEXT NOT NULL UNIQUE,               -- FK → invoices.id
  insights     JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE invoice_ai_insights DISABLE ROW LEVEL SECURITY;


-- ── 17. Credit Notes ──────────────────────────────────────────────────────────
-- Referenced by: src/app/api/dashboard/credit-notes/route.ts

CREATE TABLE IF NOT EXISTS credit_notes (
  id                 TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  credit_note_number TEXT UNIQUE NOT NULL,
  invoice_id         TEXT,                         -- FK → invoices.id (nullable)
  client_name        TEXT NOT NULL,
  client_email       TEXT NOT NULL,
  reason             TEXT NOT NULL,
  line_items         JSONB NOT NULL DEFAULT '[]',
  subtotal           NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_rate           NUMERIC(6,2) NOT NULL DEFAULT 0,
  tax_amount         NUMERIC(14,2) NOT NULL DEFAULT 0,
  discount           NUMERIC(14,2) NOT NULL DEFAULT 0,
  total              NUMERIC(14,2) NOT NULL DEFAULT 0,
  currency           TEXT NOT NULL DEFAULT 'INR',
  status             TEXT NOT NULL DEFAULT 'issued' CHECK (status IN (
    'issued','applied','voided'
  )),
  issued_date        TEXT NOT NULL DEFAULT '',
  notes              TEXT,
  created_by         TEXT NOT NULL DEFAULT '',
  created_at         TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS credit_notes_invoice_id_idx  ON credit_notes(invoice_id);
CREATE INDEX IF NOT EXISTS credit_notes_created_at_idx  ON credit_notes(created_at DESC);

ALTER TABLE credit_notes DISABLE ROW LEVEL SECURITY;


-- ── 18. Automations ──────────────────────────────────────────────────────────
-- Referenced by: src/app/api/dashboard/automations/route.ts

CREATE TABLE IF NOT EXISTS automations (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name         TEXT NOT NULL,
  trigger      TEXT NOT NULL,
  action       TEXT NOT NULL,
  config       JSONB NOT NULL DEFAULT '{}',
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  last_run_at  TIMESTAMPTZ,
  run_count    INTEGER NOT NULL DEFAULT 0,
  created_by   TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS automations_active_idx     ON automations(active);
CREATE INDEX IF NOT EXISTS automations_created_at_idx ON automations(created_at DESC);

ALTER TABLE automations DISABLE ROW LEVEL SECURITY;


-- ── 19. System Logs (structured application log) ─────────────────────────────
-- Schema documented in: src/lib/logger.ts

CREATE TABLE IF NOT EXISTS system_logs (
  id         TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  level      TEXT NOT NULL CHECK (level IN ('info','warn','error')),
  event      TEXT NOT NULL,
  message    TEXT NOT NULL,
  details    JSONB,
  ip         TEXT,
  user_id    TEXT,
  username   TEXT
);

CREATE INDEX IF NOT EXISTS system_logs_created_at_idx ON system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS system_logs_level_idx      ON system_logs(level);
CREATE INDEX IF NOT EXISTS system_logs_event_idx      ON system_logs(event);

ALTER TABLE system_logs DISABLE ROW LEVEL SECURITY;


-- ── 20. Site Journey Events (marketing funnel tracking) ───────────────────────
-- Referenced by: src/lib/journey.ts

CREATE TABLE IF NOT EXISTS site_journey_events (
  id             TEXT PRIMARY KEY,
  session_id     TEXT,
  email          TEXT,
  stage          TEXT NOT NULL,
  lead_id        TEXT,
  client_id      TEXT,
  invoice_id     TEXT,
  revenue_amount NUMERIC(14,2),
  currency       TEXT,
  source         TEXT,
  page           TEXT,
  metadata       JSONB,
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS site_journey_events_email_idx      ON site_journey_events(email);
CREATE INDEX IF NOT EXISTS site_journey_events_stage_idx      ON site_journey_events(stage);
CREATE INDEX IF NOT EXISTS site_journey_events_created_at_idx ON site_journey_events(created_at DESC);

ALTER TABLE site_journey_events DISABLE ROW LEVEL SECURITY;


-- ── 21. Customer Portal Tokens (magic-link invoice portal access) ─────────────
-- Referenced by: src/app/api/portal/request-access/route.ts,
--               src/app/api/portal/verify/route.ts

CREATE TABLE IF NOT EXISTS customer_portal_tokens (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email      TEXT NOT NULL,
  token      TEXT UNIQUE NOT NULL,
  used_at    TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS customer_portal_tokens_token_idx   ON customer_portal_tokens(token);
CREATE INDEX IF NOT EXISTS customer_portal_tokens_email_idx   ON customer_portal_tokens(email);
CREATE INDEX IF NOT EXISTS customer_portal_tokens_expires_idx ON customer_portal_tokens(expires_at);

ALTER TABLE customer_portal_tokens DISABLE ROW LEVEL SECURITY;


-- ── 22. Voice Transcripts ─────────────────────────────────────────────────────
-- Referenced by: src/app/api/voice-transcripts/route.ts

CREATE TABLE IF NOT EXISTS voice_transcripts (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id   TEXT,
  user_message TEXT,
  ai_reply     TEXT,
  language     TEXT DEFAULT 'en',
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS voice_transcripts_session_idx    ON voice_transcripts(session_id);
CREATE INDEX IF NOT EXISTS voice_transcripts_created_at_idx ON voice_transcripts(created_at DESC);

ALTER TABLE voice_transcripts DISABLE ROW LEVEL SECURITY;


-- ── 23. Knowledge Base (AI chat context store) ────────────────────────────────
-- Referenced by: src/app/api/voice-transcripts/route.ts,
--               src/app/api/dashboard/knowledge/route.ts (as "ai_knowledge_base")
-- NOTE: code uses both "knowledge_base" and "ai_knowledge_base" as table names.
-- Creating "knowledge_base" (matches direct queries in voice-transcripts route).

CREATE TABLE IF NOT EXISTS knowledge_base (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  category   TEXT,
  source     TEXT,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  priority   INTEGER NOT NULL DEFAULT 10,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS knowledge_base_category_idx   ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS knowledge_base_active_idx     ON knowledge_base(active);
CREATE INDEX IF NOT EXISTS knowledge_base_created_at_idx ON knowledge_base(created_at DESC);

ALTER TABLE knowledge_base DISABLE ROW LEVEL SECURITY;

-- Also create the alias name used by the knowledge/route.ts ("ai_knowledge_base")
-- This is a separate table since the route uses readAll() which calls store.ts
-- and that function hits Supabase directly with the table name passed in.
-- If you want a single source of truth, use a VIEW instead:
-- CREATE VIEW ai_knowledge_base AS SELECT * FROM knowledge_base;
-- For simplicity, create as a separate table:
CREATE TABLE IF NOT EXISTS ai_knowledge_base (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  category   TEXT,
  source     TEXT,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  priority   INTEGER NOT NULL DEFAULT 10,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE ai_knowledge_base DISABLE ROW LEVEL SECURITY;


-- ── 24. Customer Portal Sessions (new portal auth system) ─────────────────────
-- Referenced by: src/lib/portal-session.ts (token-based, stored as cookie)
-- No dedicated table needed — tokens are JWT-like signed strings.
-- But the old portal auth used customer_portal_tokens (created above, #21).


-- ── 25. Client Resources (file/resource library per client) ──────────────────
-- Referenced by: src/app/api/dashboard/resources/route.ts,
--               src/app/api/customers/resources/route.ts

CREATE TABLE IF NOT EXISTS client_resources (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_id        TEXT NOT NULL,                    -- FK → clients.client_id
  project_id       TEXT,                             -- optional FK → projects.id
  name             TEXT NOT NULL,
  description      TEXT,
  file_url         TEXT NOT NULL,
  file_name        TEXT NOT NULL,
  file_size        BIGINT,
  mime_type        TEXT NOT NULL,
  category         TEXT NOT NULL DEFAULT 'general' CHECK (category IN (
    'general','contract','design','report','deliverable','invoice','other'
  )),
  uploaded_by      TEXT,
  uploaded_by_type TEXT NOT NULL DEFAULT 'team' CHECK (uploaded_by_type IN ('team','client')),
  visibility       TEXT NOT NULL DEFAULT 'client' CHECK (visibility IN ('internal','client')),
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS client_resources_client_id_idx  ON client_resources(client_id);
CREATE INDEX IF NOT EXISTS client_resources_project_id_idx ON client_resources(project_id);
CREATE INDEX IF NOT EXISTS client_resources_created_at_idx ON client_resources(created_at DESC);

ALTER TABLE client_resources DISABLE ROW LEVEL SECURITY;


-- =============================================================================
-- SUMMARY: Tables created by this migration
-- =============================================================================
-- backdrop_users          — admin dashboard users (mirrors Supabase Auth)
-- clients                 — converted leads / active clients
-- client_users            — portal login credentials per client
-- tasks                   — portal task requests (NOT crm_tasks)
-- projects                — client projects
-- project_updates         — milestone/progress posts on projects
-- project_update_comments — client comments on project updates
-- project_update_reactions— emoji reactions on project updates
-- project_files           — files attached to projects
-- client_announcements    — shared notes / portal messages
-- crm_notifications       — in-app notifications for clients/team
-- payments                — payment records linked to invoices
-- invoice_schedules       — recurring invoice configuration
-- invoice_reminders       — sent payment reminder log
-- invoice_ai_insights     — AI-generated insights per invoice
-- credit_notes            — credit notes against invoices
-- automations             — workflow automation rules
-- system_logs             — structured application logs
-- site_journey_events     — marketing funnel tracking
-- customer_portal_tokens  — magic-link invoice portal tokens
-- voice_transcripts       — Sarvam voice chat transcripts
-- knowledge_base          — AI chat context entries
-- ai_knowledge_base       — alias used by /api/dashboard/knowledge
-- client_resources         — file/resource library per client (upload by team or client)
-- =============================================================================
-- Already in schema.sql (no action needed):
-- users, sessions, pending_users, leads, contacts, newsletter, callbacks,
-- chats, invoices, crm_tasks, crm_updates, tickets, team_channels,
-- team_messages, posts, email_logs, site_sessions, site_page_views, site_events
-- =============================================================================
