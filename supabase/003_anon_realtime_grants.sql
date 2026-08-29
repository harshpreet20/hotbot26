-- ─────────────────────────────────────────────────────────────────────────────
-- HotBot Studios — anon SELECT grants for the realtime subscriptions
--
-- OPTIONAL, and a security decision. Read this before running it.
--
-- What it fixes: the Backdrop badge counts
-- (src/components/backdrop/DashboardShell.tsx:456) and the chat widget
-- (src/components/chat/HotBotChat.tsx:333) subscribe to realtime
-- postgres_changes on four tables. Those subscriptions run as `anon`, because
-- the browser client is built from the publishable anon key. Realtime only
-- delivers a change event if the subscribing role could SELECT the row, so
-- without these grants the badges and live chat stay silent — no error in the
-- console, just nothing arriving.
--
-- What it costs: the anon key ships inside the client bundle, so anyone who
-- views source can read it. These tables carry no RLS (see 001), so granting
-- SELECT makes them readable by anyone who extracts that key — including
-- customer contact details in leads, callbacks and chats.
--
-- Run this only if that is acceptable. If it is not, see the alternative at the
-- foot of this file.
--
-- Safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

GRANT USAGE ON SCHEMA public TO anon;

GRANT SELECT ON
  public.leads,
  public.tickets,
  public.callbacks,
  public.chats
TO anon;


-- ── The safer alternative ────────────────────────────────────────────────────
-- Keep the grants above, then enable RLS and add policies so anon sees only
-- what the UI needs rather than whole rows. The badge counts render a number
-- and never read row contents, so a policy exposing nothing sensitive is enough
-- to keep them working.
--
-- Sketch, to adapt rather than paste blindly — a policy of `USING (true)`
-- re-exposes everything and would leave you where you started:
--
--   ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
--   CREATE POLICY "anon sees nothing" ON public.leads FOR SELECT TO anon USING (false);
--
-- Note that `USING (false)` stops realtime events too. Getting counts without
-- exposing rows generally means a SECURITY DEFINER function returning the count
-- and a subscription reworked onto it, or moving the badge refresh onto the
-- server-side API route it already calls. That is the honest cost of closing
-- this properly.
