-- ─────────────────────────────────────────────────────────────────────────────
-- HotBot Studios — role grants for the ugusopwzziztnxhqlotp Supabase project
--
-- Run this in the SQL Editor AFTER 001_new_project_schema.sql.
--
-- Why this is needed: the tables were created by `postgres` in the SQL Editor,
-- and this project has no default privileges granting the PostgREST roles
-- access to them. Without the grants below, every request through the REST API
-- fails with 42501 "permission denied for table ...", including the data copy.
--
-- Prisma is unaffected either way — it connects as the table owner over a
-- direct Postgres connection and bypasses PostgREST entirely.
--
-- Safe to re-run: GRANT is idempotent.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── service_role: required ───────────────────────────────────────────────────
-- Used by every server-side path (src/lib/supabase.ts) and by
-- scripts/migrate-supabase-data.mjs. The service_role key is server-only and
-- never reaches the browser, and this role bypasses RLS by design, so these
-- grants widen nothing that the key does not already imply.

GRANT USAGE ON SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON ALL TABLES IN SCHEMA public
  TO service_role;

-- Keep future tables working without having to remember this file.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;


-- ── anon: a decision, not a default ──────────────────────────────────────────
-- Left commented out deliberately. Read this before uncommenting.
--
-- The browser subscribes to realtime postgres_changes on four tables — the
-- Backdrop badge counts (src/components/backdrop/DashboardShell.tsx:456) and
-- the chat widget (src/components/chat/HotBotChat.tsx:333). Those subscriptions
-- run as `anon`, because the browser client is built from the publishable anon
-- key. Realtime delivers a change event only if the subscribing role could
-- SELECT the row, so without a SELECT grant the badges and live chat stay
-- silent — no error, just nothing.
--
-- The cost of granting it: the anon key ships inside the client bundle, so
-- anyone who views source can read it and then read these tables directly
-- through PostgREST. leads, callbacks and chats all hold customer contact
-- details. Since 001 creates these tables without RLS, a plain grant means
-- unauthenticated public read access to that data.
--
-- Three ways to resolve it, in increasing order of effort and safety:
--
--   A. Grant anon SELECT and leave RLS off. Realtime works. The four tables
--      become publicly readable. This is the likely status quo on the old
--      project — verify before assuming it is acceptable rather than
--      inheriting it by accident.
--
--   B. Grant anon SELECT, then enable RLS on the four tables and add policies
--      that expose only what the UI needs. The badge counts need no row
--      contents, so a policy returning rows without sensitive columns, or a
--      count via a SECURITY DEFINER function, closes most of the exposure.
--
--   C. Grant nothing to anon. The four tables stay private, and the badge
--      counts and live chat need reworking onto a server-side channel — the
--      badges already refetch through an API route, so this is smaller than it
--      sounds.
--
-- Option A, if you choose it knowingly:
--
-- GRANT USAGE ON SCHEMA public TO anon;
-- GRANT SELECT ON public.leads, public.tickets, public.callbacks, public.chats TO anon;
--
-- `authenticated` is not granted anything here either. Backdrop sessions are
-- Auth.js/JWT rather than Supabase Auth sessions, so the browser client acts as
-- `anon` even for a logged-in admin; granting `authenticated` would have no
-- effect on the behaviour above.
