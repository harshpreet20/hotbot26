-- =============================================================================
-- HotBot Studios — 16 Missing Tables (requested 2026-05-26)
-- Run each statement SEPARATELY in the Supabase SQL Editor at:
--   https://supabase.com/dashboard/project/wsucqpunleplgyrrroae/sql/new
-- OR run all at once — all use IF NOT EXISTS so it is safe to re-run.
-- =============================================================================

-- 1. leads
CREATE TABLE IF NOT EXISTS leads (
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
);

-- 2. contacts
CREATE TABLE IF NOT EXISTS contacts (
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
);

-- 3. callbacks
CREATE TABLE IF NOT EXISTS callbacks (
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
);

-- 4. tickets
CREATE TABLE IF NOT EXISTS tickets (
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
);

-- 5. invoices
CREATE TABLE IF NOT EXISTS invoices (
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
);

-- 6. credit_notes
CREATE TABLE IF NOT EXISTS credit_notes (
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
);

-- 7. newsletter
CREATE TABLE IF NOT EXISTS newsletter (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','unsubscribed')),
  source TEXT,
  ip TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. chats
CREATE TABLE IF NOT EXISTS chats (
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
);

-- 9. crm_tasks
CREATE TABLE IF NOT EXISTS crm_tasks (
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
);

-- 10. team_channels
CREATE TABLE IF NOT EXISTS team_channels (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. team_messages
CREATE TABLE IF NOT EXISTS team_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  channel_id TEXT NOT NULL DEFAULT 'general',
  text TEXT NOT NULL,
  author_username TEXT NOT NULL,
  author_role TEXT,
  reply_to TEXT,
  edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. site_page_views
CREATE TABLE IF NOT EXISTS site_page_views (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id TEXT,
  path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  ip TEXT,
  country TEXT,
  device TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 13. site_sessions
CREATE TABLE IF NOT EXISTS site_sessions (
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
);

-- 14. site_events
CREATE TABLE IF NOT EXISTS site_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id TEXT,
  event_name TEXT NOT NULL,
  category TEXT,
  label TEXT,
  value NUMERIC,
  path TEXT,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 15. client_resources
CREATE TABLE IF NOT EXISTS client_resources (
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
);

-- 16. invoice_schedules
CREATE TABLE IF NOT EXISTS invoice_schedules (
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
);
