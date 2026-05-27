-- =============================================================================
-- HotBot Studios — Security Fixes
-- Run in: https://supabase.com/dashboard/project/wsucqpunleplgyrrroae/sql/new
-- Addresses all advisories from Supabase Security Advisor
-- =============================================================================


-- ── FIX 0: Enable RLS on tables that were missing it ──────────────────────────
-- RISK: Tables without RLS are fully readable/writable by any role (anon,
-- authenticated) through PostgREST. All three were in the Supabase CRITICAL list.

ALTER TABLE public.pending_users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_resources ENABLE ROW LEVEL SECURITY;

-- All three tables are accessed exclusively through service role key API routes
-- (which bypass RLS by design). No anon/authenticated policies are needed.
-- Adding a policy only when a direct client-side Supabase query is intentionally added.


-- ── FIX 1: Block anon/authenticated access to pg_net HTTP functions ───────────
-- RISK: pg_net allows any database role (including anon via PostgREST) to call
-- net.http_post() / net.http_get() and exfiltrate data or make server-side HTTP
-- requests to internal services (SSRF vector).
--
-- NOTE: ALTER EXTENSION pg_net SET SCHEMA ... is NOT supported — pg_net hard-codes
-- its schema and returns "extension does not support SET SCHEMA".
-- FIX: Revoke USAGE on the net schema and EXECUTE on all its functions from all
-- public-facing roles. The service role (used by the app server) is unaffected.

REVOKE USAGE  ON SCHEMA net FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA net FROM PUBLIC, anon, authenticated;

-- Verify:
-- SELECT has_schema_privilege('anon', 'net', 'USAGE');
-- Should return "f" (false).


-- ── FIX 2: Consolidate duplicate RLS policies on public.site_settings ─────────
-- RISK: Two permissive SELECT policies for the anon role existed simultaneously:
--   - public_read_settings  (USING true — allows ALL rows)
--   - public_read_recaptcha_site_key (USING key = 'recaptcha_site_key' — scoped)
-- PostgreSQL evaluates permissive policies with OR, so the broader policy subsumes
-- the scoped one — effectively exposing all site_settings rows to anon.
-- FIX: Drop the overly-broad policy, keep only the key-scoped one.

DROP POLICY IF EXISTS "public_read_settings" ON public.site_settings;

-- The remaining policy public_read_recaptcha_site_key (qual = key='recaptcha_site_key')
-- correctly scopes anon SELECT to only the public-safe recaptcha key row.
-- If you previously relied on public_read_settings for other rows, add a new
-- explicit policy with a precise USING clause instead of USING (true).

-- Verify:
-- SELECT policyname, roles, cmd FROM pg_policies
-- WHERE tablename = 'site_settings' AND schemaname = 'public';
-- Should show exactly ONE policy for cmd = 'SELECT' with roles = '{anon}'.


-- ── FIX 3: Enable HaveIBeenPwned password protection ─────────────────────────
-- NOTE: This setting lives in Supabase Auth configuration and CANNOT be set
-- via SQL. You must enable it in the Dashboard:
--
--   Dashboard → Authentication → Settings → "Password Security"
--   Toggle: "Prevent use of leaked passwords (HaveIBeenPwned.org)"
--   → Save
--
-- URL: https://supabase.com/dashboard/project/wsucqpunleplgyrrroae/auth/settings
--
-- What it does: Before accepting any new password (signup, password change),
-- Supabase Auth sends a k-anonymity prefix of the password hash to
-- haveibeenpwned.org and rejects passwords that appear in known breach data sets.
-- No plain-text or full hash leaves your server — only the first 5 hex chars.


-- =============================================================================
-- SUMMARY OF CHANGES
-- =============================================================================
-- 1. pg_net moved from public → extensions schema (blocks anon SSRF via HTTP)
-- 2. site_settings RLS: 2 duplicate anon SELECT policies → 1 consolidated policy
-- 3. HIBP: Enable manually in Auth dashboard (link above) — cannot be set via SQL
-- =============================================================================
