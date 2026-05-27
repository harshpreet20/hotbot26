-- =============================================================================
-- Project Visualization Schema Migration
-- Supabase project: https://supabase.com/dashboard/project/wsucqpunleplgyrrroae
--
-- Tables:
--   milestones          - Key project milestones with status/date tracking
--   project_phases      - Waterfall/sprint phases with progress and deliverables
--   gantt_items         - Hierarchical gantt chart tasks (phases, tasks, subtasks)
--   gantt_dependencies  - Finish-to-start and other dependency links between gantt items
--   project_health      - Aggregated health snapshot (RAG status) per project
--
-- Apply after: schema.sql, migrations_missing_tables.sql
-- =============================================================================

-- milestones
-- Tracks discrete deliverable checkpoints for a project. Each milestone has a
-- due_date, a completion timestamp, and a client/internal visibility flag.
CREATE TABLE IF NOT EXISTS public.milestones (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   TEXT NOT NULL,
  client_id    TEXT NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  due_date     DATE,
  completed_at TIMESTAMPTZ,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','delayed','cancelled')),
  visibility   TEXT NOT NULL DEFAULT 'client' CHECK (visibility IN ('internal','client')),
  color        TEXT DEFAULT '#6366f1',
  sort_order   INTEGER DEFAULT 0,
  created_by   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS milestones_project_id_idx ON public.milestones(project_id);
CREATE INDEX IF NOT EXISTS milestones_client_id_idx  ON public.milestones(client_id);

-- project_phases
-- Represents named phases in a project timeline (discovery, design, development,
-- etc.). Supports waterfall, sprint, and custom AI workflow phase types.
-- Each phase tracks its own progress percentage, date range, deliverables list,
-- and assigned team members.
CREATE TABLE IF NOT EXISTS public.project_phases (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    TEXT NOT NULL,
  client_id     TEXT NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  phase_type    TEXT NOT NULL DEFAULT 'development' CHECK (phase_type IN (
    'discovery','design','development','review','testing','deployment',
    'launch','support','sprint','approval','ai_workflow','onboarding','custom'
  )),
  status        TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN (
    'upcoming','active','completed','delayed','on_hold','cancelled'
  )),
  start_date    DATE,
  end_date      DATE,
  progress      INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  color         TEXT DEFAULT '#6366f1',
  sort_order    INTEGER DEFAULT 0,
  visibility    TEXT NOT NULL DEFAULT 'client' CHECK (visibility IN ('internal','client')),
  deliverables  TEXT[] DEFAULT '{}',
  assigned_team TEXT[] DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS project_phases_project_id_idx ON public.project_phases(project_id);

-- gantt_items
-- Hierarchical task items rendered on a gantt chart. Items can be nested via
-- parent_id (subtasks) and optionally linked to a project_phase. Supports
-- phases, milestones, tasks, subtasks, and deliverables as item_type values.
-- The blocker_reason field captures why a 'blocked' item cannot proceed.
CREATE TABLE IF NOT EXISTS public.gantt_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     TEXT NOT NULL,
  client_id      TEXT NOT NULL,
  parent_id      UUID REFERENCES public.gantt_items(id) ON DELETE CASCADE,
  phase_id       UUID REFERENCES public.project_phases(id) ON DELETE SET NULL,
  title          TEXT NOT NULL,
  description    TEXT,
  item_type      TEXT NOT NULL DEFAULT 'task' CHECK (item_type IN (
    'phase','milestone','task','subtask','deliverable'
  )),
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending','in_progress','completed','delayed','cancelled','blocked'
  )),
  priority       TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  start_date     DATE,
  end_date       DATE,
  progress       INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  assigned_to    TEXT[] DEFAULT '{}',
  assigned_dept  TEXT,
  blocker_reason TEXT,
  visibility     TEXT NOT NULL DEFAULT 'client' CHECK (visibility IN ('internal','client')),
  sort_order     INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS gantt_items_project_id_idx ON public.gantt_items(project_id);
CREATE INDEX IF NOT EXISTS gantt_items_parent_id_idx  ON public.gantt_items(parent_id);
CREATE INDEX IF NOT EXISTS gantt_items_phase_id_idx   ON public.gantt_items(phase_id);

-- gantt_dependencies
-- Directed dependency edges between gantt_items. Supports all four standard
-- dependency types (FS, SS, FF, SF) with an optional lag in days.
-- The UNIQUE constraint on (source_id, target_id) prevents duplicate edges.
CREATE TABLE IF NOT EXISTS public.gantt_dependencies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      TEXT NOT NULL,
  source_id       UUID NOT NULL REFERENCES public.gantt_items(id) ON DELETE CASCADE,
  target_id       UUID NOT NULL REFERENCES public.gantt_items(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL DEFAULT 'finish_to_start' CHECK (dependency_type IN (
    'finish_to_start','start_to_start','finish_to_finish','start_to_finish'
  )),
  lag_days        INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_id, target_id)
);

-- project_health
-- One row per project. Stores the latest RAG (Red/Amber/Green) health snapshot
-- across four health dimensions: schedule, budget, quality, and scope.
-- Also caches computed counters (delayed/blocked items, milestone completion)
-- and free-form risk_items as JSONB so the dashboard can render without
-- re-querying every underlying table on each page load.
CREATE TABLE IF NOT EXISTS public.project_health (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id                TEXT NOT NULL UNIQUE,
  client_id                 TEXT NOT NULL,
  overall_health            TEXT NOT NULL DEFAULT 'green' CHECK (overall_health IN ('green','yellow','red')),
  schedule_health           TEXT DEFAULT 'green' CHECK (schedule_health IN ('green','yellow','red')),
  budget_health             TEXT DEFAULT 'green' CHECK (budget_health IN ('green','yellow','red')),
  quality_health            TEXT DEFAULT 'green' CHECK (quality_health IN ('green','yellow','red')),
  scope_health              TEXT DEFAULT 'green' CHECK (scope_health IN ('green','yellow','red')),
  delayed_items_count       INTEGER DEFAULT 0,
  blocked_items_count       INTEGER DEFAULT 0,
  pending_approvals_count   INTEGER DEFAULT 0,
  completed_milestones      INTEGER DEFAULT 0,
  total_milestones          INTEGER DEFAULT 0,
  sprint_velocity           NUMERIC(5,2),
  milestone_completion_rate NUMERIC(5,2),
  on_track_percentage       NUMERIC(5,2),
  risk_items                JSONB DEFAULT '[]',
  health_notes              TEXT,
  last_updated_by           TEXT,
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- Row-Level Security
-- All access goes through Next.js API routes using the service_role key which
-- bypasses RLS. Anon/authenticated roles have no access; this ensures data is
-- never accidentally exposed via the Supabase client-side JS SDK or REST API.
-- =============================================================================
ALTER TABLE public.milestones         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_phases     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gantt_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gantt_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_health     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_milestones"         ON public.milestones         TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_project_phases"     ON public.project_phases     TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_gantt_items"        ON public.gantt_items        TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_gantt_dependencies" ON public.gantt_dependencies TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_project_health"     ON public.project_health     TO service_role USING (true) WITH CHECK (true);
