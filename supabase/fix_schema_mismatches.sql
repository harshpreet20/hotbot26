-- =============================================================================
-- HotBot Studios — Schema Mismatch Fixes
-- Run in: https://supabase.com/dashboard/project/wsucqpunleplgyrrroae/sql/new
-- =============================================================================
-- Fixes silent insert failures discovered during form/route audit:
--   1. newsletter  — missing whatsapp columns
--   2. leads       — missing session_id column
--   3. tickets     — portal/contact-form columns missing, ticket_number NOT NULL,
--                    title NOT NULL, status CHECK missing 'draft'
-- =============================================================================


-- ── 1. Newsletter: add WhatsApp opt-in columns ────────────────────────────────
-- newsletter/route.ts inserts whatsapp + whatsapp_opt_in; these columns were
-- missing, causing every WhatsApp-enabled newsletter signup to silently fail.

ALTER TABLE public.newsletter
  ADD COLUMN IF NOT EXISTS whatsapp        TEXT    NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN NOT NULL DEFAULT false;


-- ── 2. Leads: add session_id for analytics tracking ───────────────────────────
-- forms/lead/route.ts inserts { ...lead, sessionId } which becomes session_id
-- after toSnake() conversion. Missing column caused insert to fail for any
-- visitor with an active analytics session (most tracked website visitors).

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS session_id TEXT;

CREATE INDEX IF NOT EXISTS leads_session_id_idx ON public.leads(session_id)
  WHERE session_id IS NOT NULL;


-- ── 3. Tickets: extend schema to support both admin and portal ticket types ────
-- schema.sql has only admin-style columns (ticket_number NOT NULL, title NOT NULL,
-- requester_name, requester_email). Portal and contact-form tickets use a
-- different schema (subject, client_email, client_name, approval_status, source).
-- Both write to the same `tickets` table.

-- 3a. Add portal/contact-form columns
ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS subject         TEXT,
  ADD COLUMN IF NOT EXISTS client_email    TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS client_name     TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS approval_status TEXT CHECK (approval_status IN (
    'pending_approval','approved','rejected'
  )),
  ADD COLUMN IF NOT EXISTS source          TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS client_id       TEXT;

-- 3b. Make ticket_number nullable — portal/contact-form tickets don't have one.
--     Admin-created tickets still get a TKT-NNNN value from the API.
ALTER TABLE public.tickets
  ALTER COLUMN ticket_number DROP NOT NULL;

-- 3c. Make title nullable — portal tickets use subject instead.
ALTER TABLE public.tickets
  ALTER COLUMN title DROP NOT NULL,
  ALTER COLUMN title SET DEFAULT '';

-- 3d. Add 'draft' to the status CHECK — admin dashboard defaults new tickets to
--     'draft' but the original CHECK only had open/in_progress/waiting/resolved/closed.

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.tickets'::regclass
    AND   contype  = 'c'
    AND   conname  LIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE public.tickets DROP CONSTRAINT %I', r.conname);
    RAISE NOTICE 'Dropped constraint: %', r.conname;
  END LOOP;
END $$;

ALTER TABLE public.tickets
  ADD CONSTRAINT tickets_status_check
  CHECK (status IN ('draft','open','in_progress','waiting','resolved','closed'));


-- ── 4. Verify ─────────────────────────────────────────────────────────────────
-- Run these queries after applying to confirm all columns exist:

-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'newsletter'
-- ORDER BY ordinal_position;

-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'leads'
-- ORDER BY ordinal_position;

-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'tickets'
-- ORDER BY ordinal_position;


-- ── 5. Create client-resources Supabase Storage bucket ────────────────────────
-- The customer portal file upload uses this bucket via signed upload URLs
-- (server-side, service role key). The anon public URL is used for serving.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'client-resources',
  'client-resources',
  true,          -- public so file URLs work without auth
  52428800,      -- 50 MB max per file
  null           -- all mime types allowed
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read (bucket is public so this is automatic, but be explicit)
CREATE POLICY "client_resources_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'client-resources');

-- Allow service role to insert (uploads go through our API, never direct anon)
-- RLS is effectively bypassed by service role key — no additional policy needed.

-- =============================================================================
-- ALSO RUN: supabase/migrations_missing_tables.sql
-- =============================================================================
-- The customer portal also needs these tables that are defined there:
--   tasks                — customer portal task tracking
--   client_announcements — shared notes / announcements
--   project_files        — files attached to projects
-- Run that file in the SQL Editor if you haven't already.
