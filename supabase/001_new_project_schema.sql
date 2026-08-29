-- ─────────────────────────────────────────────────────────────────────────────
-- HotBot Studios — schema for the ugusopwzziztnxhqlotp Supabase project
--
-- Run this ONCE in the new project's SQL Editor (Dashboard → SQL Editor → New
-- query → paste → Run), then copy the data with:
--     node scripts/migrate-supabase-data.mjs
--
-- Generated from the live wsucqpunleplgyrrroae database via its PostgREST
-- OpenAPI description, which is authoritative for column names, types,
-- nullability, defaults, primary keys and foreign keys.
--
-- WHAT THIS FILE DOES NOT CARRY OVER, because the OpenAPI description does not
-- expose it. None of it is required for the application to run, but review it
-- before treating the new project as a complete replica:
--   * secondary indexes (primary keys ARE included)
--   * CHECK and UNIQUE constraints other than the primary key
--   * triggers and database functions
--   * RLS policies — see the note at the foot of this file
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public."ai_knowledge_base" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL,
  "content" text NOT NULL,
  "category" text DEFAULT 'general' NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "priority" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "created_by" text,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."audit_logs" (
  "id" text NOT NULL,
  "action" text NOT NULL,
  "entity" text DEFAULT '' NOT NULL,
  "entity_id" text DEFAULT '' NOT NULL,
  "user_id" text DEFAULT '' NOT NULL,
  "username" text DEFAULT '' NOT NULL,
  "role" text DEFAULT '' NOT NULL,
  "ip" text DEFAULT '' NOT NULL,
  "details" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."backdrop_users" (
  "id" text NOT NULL,
  "email" text NOT NULL,
  "username" text DEFAULT '' NOT NULL,
  "role" text DEFAULT 'agent' NOT NULL,
  "status" text DEFAULT 'pending_email' NOT NULL,
  "approved_by" text,
  "approved_at" timestamp with time zone,
  "invited_by" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "password_hash" text,
  "permissions" jsonb,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."callbacks" (
  "id" text NOT NULL,
  "name" text NOT NULL,
  "phone" text NOT NULL,
  "source" text DEFAULT 'chatbot-call-tab' NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."chats" (
  "id" text NOT NULL,
  "messages" jsonb NOT NULL,
  "ip" text DEFAULT '' NOT NULL,
  "started_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_message_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "needs_human" boolean DEFAULT false NOT NULL,
  "agent_username" text,
  "agent_took_over_at" timestamp with time zone,
  "guest_name" text,
  "guest_email" text,
  "guest_phone" text,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."client_resources" (
  "id" text DEFAULT (gen_random_uuid()) NOT NULL,
  "client_id" text NOT NULL,
  "project_id" text,
  "name" text NOT NULL,
  "description" text,
  "file_url" text NOT NULL,
  "file_name" text NOT NULL,
  "file_size" bigint,
  "mime_type" text NOT NULL,
  "category" text DEFAULT 'general' NOT NULL,
  "uploaded_by" text,
  "uploaded_by_type" text DEFAULT 'team' NOT NULL,
  "visibility" text DEFAULT 'client' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."clients" (
  "id" text NOT NULL,
  "client_id" text NOT NULL,
  "name" text DEFAULT '' NOT NULL,
  "email" text DEFAULT '' NOT NULL,
  "phone" text DEFAULT '' NOT NULL,
  "company" text DEFAULT '' NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "notes" text DEFAULT '' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "lead_id" text,
  "onboarding_stage" text DEFAULT 'prospect',
  "account_manager" text,
  "portal_enabled" boolean DEFAULT false,
  "portal_invite_sent_at" timestamp with time zone,
  "subscription_status" text DEFAULT 'active',
  "industry" text,
  "website" text,
  "address" text,
  "avatar_url" text,
  "tags" text[],
  "custom_fields" jsonb,
  "client_type" text DEFAULT 'business',
  "total_revenue" numeric DEFAULT 0,
  "outstanding_balance" numeric DEFAULT 0,
  "last_activity_at" timestamp with time zone,
  "account_status" text DEFAULT 'active' NOT NULL,
  "suspended_at" timestamp with time zone,
  "suspension_reason" text,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."contacts" (
  "id" text NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text DEFAULT '' NOT NULL,
  "subject" text DEFAULT '' NOT NULL,
  "message" text DEFAULT '' NOT NULL,
  "source" text DEFAULT 'contact-page' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "session_id" text,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."crm_tasks" (
  "id" text NOT NULL,
  "title" text NOT NULL,
  "description" text DEFAULT '' NOT NULL,
  "status" text DEFAULT 'open' NOT NULL,
  "priority" text DEFAULT 'medium' NOT NULL,
  "due_date" timestamp with time zone,
  "assigned_to" text DEFAULT '' NOT NULL,
  "tags" text[] NOT NULL,
  "lead_id" text,
  "created_by" text DEFAULT '' NOT NULL,
  "updated_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "completed_at" timestamp with time zone,
  "invoice_id" text,
  "ticket_id" text,
  "client_id" text,
  "blog_id" text,
  "callback_id" text,
  "newsletter_id" text,
  "linked_entity_type" text,
  "linked_entity_label" text DEFAULT '' NOT NULL,
  "project_id" text,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."crm_updates" (
  "id" text NOT NULL,
  "lead_id" text NOT NULL,
  "type" text DEFAULT 'note' NOT NULL,
  "content" text DEFAULT '' NOT NULL,
  "author" text DEFAULT '' NOT NULL,
  "author_id" text DEFAULT '' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "metadata" jsonb,
  "project_id" text,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."documents" (
  "id" text NOT NULL,
  "title" text NOT NULL,
  "type" text DEFAULT 'proposal',
  "status" text DEFAULT 'draft',
  "content" text DEFAULT '',
  "client_id" text NOT NULL,
  "client_email" text,
  "client_name" text,
  "comments" jsonb,
  "suggestions" jsonb,
  "signatures" jsonb,
  "created_by" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "project_id" text,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."google_tokens" (
  "id" text NOT NULL,
  "access_token" text NOT NULL,
  "refresh_token" text NOT NULL,
  "expiry_date" double precision NOT NULL,
  "scope" text NOT NULL,
  "email" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."invoices" (
  "id" text NOT NULL,
  "invoice_number" text NOT NULL,
  "client_name" text NOT NULL,
  "client_email" text NOT NULL,
  "client_phone" text DEFAULT '' NOT NULL,
  "client_company" text DEFAULT '' NOT NULL,
  "line_items" jsonb NOT NULL,
  "subtotal" numeric DEFAULT 0 NOT NULL,
  "tax" numeric DEFAULT 0 NOT NULL,
  "discount" numeric DEFAULT 0 NOT NULL,
  "total" numeric DEFAULT 0 NOT NULL,
  "status" text DEFAULT 'draft' NOT NULL,
  "currency" text DEFAULT 'INR' NOT NULL,
  "notes" text DEFAULT '' NOT NULL,
  "due_date" timestamp with time zone,
  "paid_at" timestamp with time zone,
  "created_by" text DEFAULT '' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "tax_rate" numeric DEFAULT 0 NOT NULL,
  "tax_amount" numeric DEFAULT 0 NOT NULL,
  "issued_date" text,
  "client_address" text,
  "terms" text,
  "paid_date" text,
  "lead_id" text,
  "last_updated_at" timestamp with time zone,
  "last_updated_by" text,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."leads" (
  "id" text NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text DEFAULT '' NOT NULL,
  "company" text DEFAULT '' NOT NULL,
  "service" text DEFAULT '' NOT NULL,
  "budget" text DEFAULT '' NOT NULL,
  "message" text DEFAULT '' NOT NULL,
  "form_type" text DEFAULT 'get-started' NOT NULL,
  "source" text DEFAULT 'unknown' NOT NULL,
  "ip" text DEFAULT '' NOT NULL,
  "status" text DEFAULT 'new' NOT NULL,
  "tags" text[] NOT NULL,
  "notes" text DEFAULT '' NOT NULL,
  "last_updated_at" timestamp with time zone,
  "last_updated_by" text DEFAULT '' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "assigned_to" text,
  "session_id" text,
  "journey_stage" text DEFAULT 'lead',
  "meet_url" text,
  "meet_scheduled_at" timestamp with time zone,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."meeting_attachments" (
  "id" text NOT NULL,
  "meeting_id" text NOT NULL,
  "name" text NOT NULL,
  "file_url" text NOT NULL,
  "file_name" text NOT NULL,
  "file_size" bigint NOT NULL,
  "mime_type" text NOT NULL,
  "category" text DEFAULT 'other' NOT NULL,
  "uploaded_by" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."meetings" (
  "id" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "client_id" text,
  "client_email" text,
  "client_name" text,
  "host_username" text NOT NULL,
  "attendees" jsonb,
  "start_time" timestamp with time zone NOT NULL,
  "end_time" timestamp with time zone NOT NULL,
  "meet_link" text,
  "google_event_id" text,
  "status" text DEFAULT 'scheduled',
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "project_id" text,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."newsletter" (
  "id" text NOT NULL,
  "name" text DEFAULT '' NOT NULL,
  "email" text NOT NULL,
  "whatsapp" text DEFAULT '' NOT NULL,
  "whatsapp_opt_in" boolean DEFAULT false NOT NULL,
  "source" text DEFAULT 'newsletter-signup' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."project_sops" (
  "id" text NOT NULL,
  "project_id" text NOT NULL,
  "client_id" text NOT NULL,
  "title" text NOT NULL,
  "brief" text DEFAULT '',
  "content" text DEFAULT '',
  "created_by" text NOT NULL,
  "last_edited_by" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."projects" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "project_number" text,
  "client_id" text,
  "name" text NOT NULL,
  "description" text,
  "status" text DEFAULT 'active',
  "stage" text DEFAULT 'discovery',
  "priority" text DEFAULT 'medium',
  "progress" integer DEFAULT 0,
  "start_date" date,
  "target_date" date,
  "completed_date" date,
  "assigned_to" text[],
  "account_manager" text,
  "budget" numeric,
  "currency" text DEFAULT 'INR',
  "tags" text[],
  "metadata" jsonb,
  "created_by" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "whiteboard_data" jsonb,
  "meet_url" text,
  "meet_scheduled_at" timestamp with time zone,
  "collab_notes" text,
  "end_date" date,
  "color" text DEFAULT '#6366f1',
  "client_email" text,
  "client_name" text,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."sessions" (
  "token" text NOT NULL,
  "user_id" text NOT NULL,
  "username" text NOT NULL,
  "role" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "last_access_at" timestamp with time zone DEFAULT now() NOT NULL,
  "is_impersonating" boolean DEFAULT false NOT NULL,
  "original_user_id" text,
  "original_username" text,
  "original_role" text,
  PRIMARY KEY ("token")
);

CREATE TABLE IF NOT EXISTS public."system_logs" (
  "id" text NOT NULL,
  "level" text DEFAULT 'info' NOT NULL,
  "event" text NOT NULL,
  "message" text DEFAULT '' NOT NULL,
  "ip" text DEFAULT '' NOT NULL,
  "username" text DEFAULT '' NOT NULL,
  "user_id" text DEFAULT '' NOT NULL,
  "details" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."team_channels" (
  "id" text NOT NULL,
  "name" text NOT NULL,
  "description" text DEFAULT '' NOT NULL,
  "created_by" text DEFAULT 'system' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."team_messages" (
  "id" text NOT NULL,
  "channel" text DEFAULT 'general' NOT NULL,
  "user_id" text DEFAULT '' NOT NULL,
  "username" text DEFAULT '' NOT NULL,
  "role" text DEFAULT '' NOT NULL,
  "text" text DEFAULT '' NOT NULL,
  "attachments" jsonb NOT NULL,
  "reactions" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "channel_id" text,
  "created_by" text,
  "edited_at" timestamp with time zone,
  "reply_to" text,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."tickets" (
  "id" text DEFAULT (gen_random_uuid()) NOT NULL,
  "number" text DEFAULT '',
  "subject" text DEFAULT '',
  "description" text DEFAULT '' NOT NULL,
  "status" text DEFAULT 'open' NOT NULL,
  "priority" text DEFAULT 'medium' NOT NULL,
  "category" text DEFAULT 'general' NOT NULL,
  "client_name" text DEFAULT '',
  "client_email" text DEFAULT '',
  "assigned_to" text DEFAULT '',
  "tags" text[],
  "comments" jsonb,
  "activity" jsonb,
  "created_by" text DEFAULT '',
  "resolved_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "ticket_number" text,
  "title" text DEFAULT '',
  "requester_name" text,
  "requester_email" text,
  "labels" text[],
  "due_date" text,
  "ip" text,
  "approval_status" text DEFAULT 'approved',
  "approved_by" text,
  "approved_at" timestamp with time zone,
  "rejection_reason" text,
  "source" text DEFAULT 'admin',
  "client_id" text,
  "whiteboard_data" jsonb,
  "meet_url" text,
  "is_internal" boolean DEFAULT false,
  "raised_against" text,
  "raised_by" text,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."user_permissions" (
  "id" text NOT NULL,
  "user_id" text NOT NULL,
  "grants" text[] NOT NULL,
  "revokes" text[] NOT NULL,
  "updated_by" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."whiteboards" (
  "id" text NOT NULL,
  "name" text NOT NULL,
  "client_id" text,
  "client_email" text,
  "elements" text DEFAULT '[]',
  "created_by" text NOT NULL,
  "last_edited_by" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "project_id" text,
  PRIMARY KEY ("id")
);

-- Foreign keys (added after all tables exist)
ALTER TABLE public."projects" ADD CONSTRAINT "projects_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES public."clients"("client_id");

-- ── Realtime ─────────────────────────────────────────────────────────────────
-- The Backdrop shell subscribes to postgres_changes on leads/tickets/callbacks/
-- chats for its badge counts (src/components/backdrop/DashboardShell.tsx:456),
-- and the chat widget subscribes on chats (src/components/chat/HotBotChat.tsx:333).
-- CREATE TABLE alone does not put a table in the realtime publication, so
-- without this the dashboard badges and live chat go quiet with no error.

ALTER PUBLICATION supabase_realtime ADD TABLE
  public.leads, public.tickets, public.callbacks, public.chats;

-- ── A decision you need to make: RLS ─────────────────────────────────────────
-- These tables are created WITHOUT row level security, which is Postgres's
-- default and matches how the application reaches them today: Prisma connects
-- as the table owner and the server-side Supabase client uses the service_role
-- key, and both bypass RLS entirely.
--
-- The catch is the anon key. With RLS off, anyone holding the publishable anon
-- key — which ships in the browser bundle — can read these tables directly
-- through PostgREST. If that is not acceptable, enable RLS:
--
--     ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;
--
-- Enabling it with no policies leaves the server paths working untouched, but
-- it also stops the anon key receiving realtime events, which breaks the badge
-- counts and live chat above. Those two subscriptions need a SELECT policy for
-- anon on leads/tickets/callbacks/chats to keep working.
--
-- Whichever way you go, apply it deliberately rather than by omission, and
-- confirm what the old project did before assuming this file matches it.
