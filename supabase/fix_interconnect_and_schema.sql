-- =============================================================================
-- HotBot Studios — Interconnect & Schema Fixes
-- Run in: https://supabase.com/dashboard/project/wsucqpunleplgyrrroae/sql/new
-- Fixes broken admin→portal data flows and missing DB columns
-- =============================================================================


-- ── Fix 1: FK constraints for project_update_comments / reactions ─────────────
-- Without declared FK constraints, Supabase PostgREST refuses the nested embed
-- syntax used in admin and portal project routes:
--   .select("*, project_update_comments(*), project_update_reactions(*)")
-- PostgREST needs an FK to auto-discover the relationship.
-- ON DELETE CASCADE: removing a project_update removes all its comments/reactions.

ALTER TABLE project_update_comments
  ADD CONSTRAINT IF NOT EXISTS fk_puc_update_id
  FOREIGN KEY (update_id) REFERENCES project_updates(id) ON DELETE CASCADE;

ALTER TABLE project_update_reactions
  ADD CONSTRAINT IF NOT EXISTS fk_pur_update_id
  FOREIGN KEY (update_id) REFERENCES project_updates(id) ON DELETE CASCADE;


-- ── Fix 2: Add invite_accepted_at and invited_by to client_users ──────────────
-- Referenced in /api/customers/invite/route.ts and /api/customers/auth/verify.
-- invite_accepted_at: set when a user completes their setup (token consumed).
-- invited_by:         stores the admin username who sent the invite for audit trail.

ALTER TABLE client_users
  ADD COLUMN IF NOT EXISTS invite_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS invited_by         TEXT;


-- ── Fix 3: Add portal_enabled flag to clients ─────────────────────────────────
-- Set to TRUE when an invite is sent. Used for portal access checks and
-- admin UI badge ("Portal Enabled").

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS portal_enabled BOOLEAN NOT NULL DEFAULT FALSE;


-- =============================================================================
-- SUMMARY
-- =============================================================================
-- 1. FK constraints added: project_update_comments/reactions → project_updates
--    (enables PostgREST nested embeds in admin and portal project routes)
-- 2. client_users gains invite_accepted_at + invited_by columns
-- 3. clients gains portal_enabled boolean flag
-- =============================================================================
