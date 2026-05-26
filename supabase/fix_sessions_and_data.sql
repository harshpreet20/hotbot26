-- =============================================================================
-- HotBot Studios — Sessions Fix + Data Recovery Helpers
-- Run in: https://supabase.com/dashboard/project/wsucqpunleplgyrrroae/sql/new
-- =============================================================================
-- Fixes the Team section "keeps refreshing / logging out" bug.
-- Root cause: sessions table FK constraint or missing columns causes Supabase
-- insert to fail → session falls back to Vercel /tmp → lost on next request
-- (Vercel serverless instances don't share /tmp).
-- =============================================================================


-- ── 1. Drop any FK constraint on sessions.user_id ─────────────────────────────
-- The schema.sql intentionally has NO FK here (admin users can be bootstrap/env
-- users that don't exist in the users table). If one was added manually or by
-- an older migration, drop it.

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT conname
    FROM   pg_constraint
    WHERE  conrelid = 'public.sessions'::regclass
    AND    contype  = 'f'
  LOOP
    EXECUTE format('ALTER TABLE public.sessions DROP CONSTRAINT %I', r.conname);
    RAISE NOTICE 'Dropped FK constraint: %', r.conname;
  END LOOP;
END $$;


-- ── 2. Add missing impersonation columns to sessions ─────────────────────────
-- sessions.ts inserts these optional fields; if the columns are missing
-- the insert fails silently and falls back to filesystem.

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS is_impersonating  BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS original_user_id  TEXT,
  ADD COLUMN IF NOT EXISTS original_username TEXT,
  ADD COLUMN IF NOT EXISTS original_role     TEXT;


-- ── 3. Ensure backdrop_users has all required columns ─────────────────────────
-- Some environments may have created the table without all columns.

ALTER TABLE public.backdrop_users
  ADD COLUMN IF NOT EXISTS username     TEXT,
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS permissions  JSONB;


-- ── 4. Clean up expired sessions ─────────────────────────────────────────────
-- Remove stale sessions to keep the table clean.

DELETE FROM public.sessions WHERE expires_at < NOW();


-- ── 5. Verify fix ─────────────────────────────────────────────────────────────
-- After running, confirm no FK constraints on sessions:
-- SELECT conname, contype FROM pg_constraint WHERE conrelid = 'public.sessions'::regclass;
-- Should return ONLY the PRIMARY KEY (contype = 'p'), no 'f' rows.

-- Check columns exist:
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'sessions' AND table_schema = 'public'
-- ORDER BY ordinal_position;


-- =============================================================================
-- DATA NOTE
-- =============================================================================
-- Old data (invoices, tickets, callbacks, contacts, etc.) that appeared to work
-- before was stored in Vercel's /tmp/hotbot-data/*.json — which is ephemeral
-- and wiped on every cold start and redeploy. That data was never durably
-- persisted. It is NOT deleted by any migration; it simply never survived
-- server restarts on Vercel without Supabase as the backend.
--
-- All NEW data entered after deploying will persist correctly in Supabase.
-- To check if old data exists in Supabase, query:
--   SELECT COUNT(*) FROM invoices;
--   SELECT COUNT(*) FROM tickets;
--   SELECT COUNT(*) FROM leads;
--   etc.
-- =============================================================================
