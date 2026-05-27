-- ============================================================
-- Behavioral Analytics Tables
-- Apply via Supabase dashboard SQL editor:
--   supabase.com/dashboard/project/wsucqpunleplgyrrroae/editor
-- ============================================================

-- visitor_profiles: enriched profiles linking sessions to known emails
CREATE TABLE IF NOT EXISTS public.visitor_profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT UNIQUE NOT NULL,
  first_seen_at    TIMESTAMPTZ,
  last_seen_at     TIMESTAMPTZ,
  total_sessions   INTEGER DEFAULT 0,
  total_pageviews  INTEGER DEFAULT 0,
  total_events     INTEGER DEFAULT 0,
  avg_session_ms   NUMERIC(12,2) DEFAULT 0,
  max_scroll_depth NUMERIC(5,2) DEFAULT 0,
  pages_visited    TEXT[] DEFAULT '{}',
  journey_stages   TEXT[] DEFAULT '{}',
  engagement_score NUMERIC(5,2) DEFAULT 0,
  lead_id          TEXT,
  client_id        TEXT,
  is_client        BOOLEAN DEFAULT FALSE,
  last_ip          TEXT,
  country          TEXT,
  city             TEXT,
  device           TEXT,
  browser          TEXT,
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS visitor_profiles_email_idx   ON public.visitor_profiles(email);
CREATE INDEX IF NOT EXISTS visitor_profiles_lead_id_idx ON public.visitor_profiles(lead_id);

-- portal_events: behavioral events inside the client portal
CREATE TABLE IF NOT EXISTS public.portal_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  client_id   TEXT NOT NULL,
  event_type  TEXT NOT NULL CHECK (event_type IN (
    'page_view','project_view','update_view','invoice_view','file_download',
    'ticket_create','milestone_ack','approval','login','comment','task_create',
    'notification_read','file_upload'
  )),
  entity_type TEXT,
  entity_id   TEXT,
  page        TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS portal_events_email_idx      ON public.portal_events(email);
CREATE INDEX IF NOT EXISTS portal_events_client_id_idx  ON public.portal_events(client_id);
CREATE INDEX IF NOT EXISTS portal_events_event_type_idx ON public.portal_events(event_type);
CREATE INDEX IF NOT EXISTS portal_events_created_at_idx ON public.portal_events(created_at DESC);

-- lead_engagement_scores: scored behavioral snapshot per lead/visitor
CREATE TABLE IF NOT EXISTS public.lead_engagement_scores (
  email            TEXT PRIMARY KEY,
  lead_id          TEXT,
  client_id        TEXT,
  engagement_score NUMERIC(5,2) DEFAULT 0,
  intent_score     NUMERIC(5,2) DEFAULT 0,
  sessions_count   INTEGER DEFAULT 0,
  pageviews_count  INTEGER DEFAULT 0,
  events_count     INTEGER DEFAULT 0,
  pricing_visits   INTEGER DEFAULT 0,
  proposal_views   INTEGER DEFAULT 0,
  return_visits    INTEGER DEFAULT 0,
  days_since_last_visit INTEGER,
  lead_quality     TEXT DEFAULT 'cold' CHECK (lead_quality IN ('cold','warm','hot')),
  portal_active    BOOLEAN DEFAULT FALSE,
  last_activity    TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.visitor_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_engagement_scores ENABLE ROW LEVEL SECURITY;

-- Service role bypass (same pattern as other tables)
CREATE POLICY "service_role_all_visitor_profiles"
  ON public.visitor_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_portal_events"
  ON public.portal_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_lead_engagement_scores"
  ON public.lead_engagement_scores
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
