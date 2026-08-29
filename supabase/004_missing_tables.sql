-- ─────────────────────────────────────────────────────────────────────────────
-- HotBot Studios — tables missed by 001, for the ugusopwzziztnxhqlotp project
--
-- Run this in the SQL Editor AFTER 001 and 002. Safe to re-run.
--
-- WHY THESE WERE MISSED: 001 was derived from prisma/schema.prisma, which
-- covers only the tables reached through the Prisma data layer (src/lib/store.ts).
-- These six are reached directly through the Supabase client — sb().from(...) —
-- so they never appeared in that schema and were left out of the first pass.
--
-- WHAT WAS BROKEN WITHOUT THEM:
--   client_users         the ENTIRE client portal authenticates against this
--                        table (src/lib/portalAuth.ts). Without it no client can
--                        log in and every /api/portal/* call fails.
--   email_logs           delivery tracking; the Resend webhook writes here
--   site_sessions        \
--   site_page_views       )  the first-party analytics pipeline behind
--   site_events          /   /api/track/* and the analytics dashboard
--   site_journey_events /
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public."client_users" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "client_id" text,
  "email" text NOT NULL,
  "name" text,
  "role" text DEFAULT 'member',
  "password_hash" text,
  "invite_token" text,
  "invite_expires_at" timestamp with time zone,
  "invite_accepted_at" timestamp with time zone,
  "invited_by" text,
  "last_login_at" timestamp with time zone,
  "session_token" text,
  "session_expires_at" timestamp with time zone,
  "is_active" boolean DEFAULT true,
  "avatar_url" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."email_logs" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "resend_id" text,
  "to_email" text NOT NULL,
  "subject" text NOT NULL,
  "email_type" text NOT NULL,
  "status" text DEFAULT 'queued' NOT NULL,
  "sent_at" timestamp with time zone,
  "delivered_at" timestamp with time zone,
  "opened_at" timestamp with time zone,
  "clicked_at" timestamp with time zone,
  "bounced_at" timestamp with time zone,
  "complained_at" timestamp with time zone,
  "last_event" text,
  "metadata" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_opened_at" timestamp with time zone,
  "open_count" integer DEFAULT 0 NOT NULL,
  "open_history" timestamp with time zone[] NOT NULL,
  "last_clicked_at" timestamp with time zone,
  "click_count" integer DEFAULT 0 NOT NULL,
  "click_history" jsonb NOT NULL,
  "entity_type" character varying,
  "entity_id" character varying,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."site_events" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "session_id" text NOT NULL,
  "event_name" text NOT NULL,
  "page" text,
  "properties" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."site_journey_events" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "session_id" text,
  "email" text,
  "stage" text NOT NULL,
  "lead_id" text,
  "client_id" text,
  "invoice_id" text,
  "revenue_amount" numeric,
  "currency" text DEFAULT 'INR',
  "source" text,
  "page" text,
  "metadata" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."site_page_views" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "session_id" text NOT NULL,
  "page" text NOT NULL,
  "referrer" text,
  "duration_ms" integer,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "hour_utc" smallint,
  "timezone" text,
  "max_scroll_depth" integer,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."site_sessions" (
  "id" text NOT NULL,
  "first_page" text DEFAULT '/' NOT NULL,
  "referrer" text,
  "utm_source" text,
  "utm_medium" text,
  "utm_campaign" text,
  "device" text,
  "browser" text,
  "os" text,
  "country" text,
  "city" text,
  "page_count" integer DEFAULT 1 NOT NULL,
  "duration_ms" integer,
  "is_bounce" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
  "traffic_category" text,
  "traffic_source" text,
  "timezone" text,
  "tab_switches" integer DEFAULT 0 NOT NULL,
  "tab_hidden_ms" bigint DEFAULT 0 NOT NULL,
  PRIMARY KEY ("id")
);
-- ── Foreign key ──────────────────────────────────────────────────────────────
-- client_users.client_id references clients.client_id — the human ref
-- ("HBS-NKG39"), NOT clients.id. 001 added the UNIQUE constraint this needs.
--
-- Worth knowing: src/lib/portalAuth.ts:48 looks this value up with
-- .eq("id", userRow.client_id), matching it against clients.id instead. That
-- never matches, so PortalUser.clientRef is always "". The foreign key below is
-- correct and mirrors the source database; the code is what disagrees with it.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'client_users_client_id_fkey') THEN
    ALTER TABLE public."client_users"
      ADD CONSTRAINT "client_users_client_id_fkey"
      FOREIGN KEY ("client_id") REFERENCES public."clients"("client_id");
  END IF;
END $$;

-- ── Grants ───────────────────────────────────────────────────────────────────
-- 002 set ALTER DEFAULT PRIVILEGES, so tables created afterwards by postgres
-- inherit these automatically. Repeated explicitly so this file stands alone.

GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.client_users,
  public.email_logs,
  public.site_events,
  public.site_journey_events,
  public.site_page_views,
  public.site_sessions
TO service_role;
