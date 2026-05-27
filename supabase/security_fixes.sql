-- =============================================================================
-- HotBot Studios — Security Fixes
-- Run in: https://supabase.com/dashboard/project/wsucqpunleplgyrrroae/sql/new
-- Addresses all advisories from Supabase Security Advisor
-- =============================================================================


-- ── FIX 1: Move pg_net extension out of public schema ─────────────────────────
-- RISK: pg_net in public schema allows any database role (including anon via
-- PostgREST) to call net.http_post() / net.http_get() and exfiltrate data or
-- make server-side HTTP requests to internal services (SSRF vector).
-- FIX: Move to the extensions schema, which is not exposed via PostgREST.

CREATE SCHEMA IF NOT EXISTS extensions;

ALTER EXTENSION pg_net SET SCHEMA extensions;

-- Verify:
-- SELECT nspname FROM pg_namespace n JOIN pg_extension e ON e.extnamespace = n.oid
-- WHERE e.extname = 'pg_net';
-- Should return "extensions", not "public".


-- ── FIX 2: Consolidate duplicate RLS policies on public.site_settings ─────────
-- RISK: Two permissive SELECT policies for the anon role (public_read_recaptcha_site_key
-- and public_read_settings) are evaluated with OR logic on EVERY anon SELECT.
-- PostgreSQL must check both conditions, doubling execution cost and making
-- the effective policy hard to audit.
-- FIX: Drop both, replace with a single clear policy.

DROP POLICY IF EXISTS "public_read_recaptcha_site_key" ON public.site_settings;
DROP POLICY IF EXISTS "public_read_settings"           ON public.site_settings;

-- One consolidated policy — anon can read public settings rows
CREATE POLICY "anon_read_public_settings" ON public.site_settings
  FOR SELECT
  TO anon
  USING (true);

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
