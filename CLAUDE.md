# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rules

- Do what has been asked; nothing more, nothing less
- NEVER create files unless absolutely necessary — prefer editing existing files
- NEVER create documentation files unless explicitly requested
- NEVER save working files or tests to root — use `/src`, `/tests`, `/docs`, `/config`, `/scripts`
- ALWAYS read a file before editing it
- NEVER commit secrets, credentials, or .env files
- NEVER add a `Co-Authored-By` trailer to user commits
- Keep files under 500 lines
- Validate input at system boundaries

## Commands

```bash
npm run dev              # Next.js dev server
npm run build            # Production build (run before committing)
npm run lint             # ESLint via next lint
npm test                 # Vitest (all tests, node env)
npm run test:watch       # Vitest watch mode
npm run test:coverage    # Coverage report (v8, includes src/lib + src/app/api)
npm run setup:password   # Interactive bcrypt hash generator → writes to .env.local
```

Run a single test file:
```bash
npx vitest run src/__tests__/lib/sessions.test.ts
```

## Architecture

This is a **Next.js 14 App Router** monolith with two separate authenticated portals plus a public-facing site.

### Three Surfaces

| Surface | Route | Auth |
|---------|-------|------|
| **Public site** | `/` | None |
| **Admin dashboard (Backdrop)** | `/enter/backdrop/dashboard/*` | HttpOnly cookie `backdrop_auth` + sessionStorage token |
| **Customer portal** | `/customers/*` | HttpOnly cookie `hotbot_portal` (HMAC-SHA256 signed, stateless) |

### Data Layer — Dual-Mode Store

All data access goes through one of two paths depending on env vars:

**`src/lib/store.ts`** — generic async CRUD (`readAll`, `insert`, `updateById`, `removeById`, `removeWhere`). When `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set, queries Supabase; otherwise falls back to `/data/*.json` files (dev) or `/tmp/hotbot-data/*.json` (Vercel). The fallback is **ephemeral on Vercel** — any table not in Supabase is lost on cold start.

**`src/lib/supabase.ts`** — `sb()` returns a singleton Supabase client (service role, bypasses RLS). `isSupabaseEnabled()` guards every conditional. `toSnake()`/`toCamel()` convert between camelCase TypeScript and snake_case Postgres automatically.

Portal routes use `sb()` directly (not `store.ts`) because they need Supabase-specific queries (joins, filtered selects).

### Auth Architecture

**Admin auth** (`src/lib/sessions.ts`):
- Login at `/api/blog/auth` → creates row in `sessions` Supabase table → returns token
- Token stored in `sessionStorage` (UI display) AND `backdrop_auth` HttpOnly cookie (server verification)
- Middleware at `src/middleware.ts` gates `/enter/backdrop/dashboard/*` on the cookie alone
- API routes call `extractToken(req)` → `authorizeAny/authorizeAdmin/authorizeSuperAdmin` from `src/lib/dashboardAuth.ts`
- `extractToken` accepts Bearer header, `backdrop_auth` cookie, or `?secret=` query param (legacy N8N)

**Portal auth** (`src/lib/portal-session.ts`):
- Stateless HMAC-SHA256 signed token: `base64url(email:expires_ms:hmac)`
- Stored in `hotbot_portal` HttpOnly cookie; no DB lookup needed on every request
- `verifyPortalSession(req)` → returns email string or null
- Portal users live in `client_users` table (not `backdrop_users`)

**Roles** (admin only): `super_admin | admin | manager | sales | crm_operator | finance | editor | contributor | agent`. Read from `backdrop_users.role` on login; stored in sessionStorage as `backdrop_role` for client-side UI gating only — server always re-validates from DB via `authorizeRole()`.

### Database Schema

All SQL lives in `supabase/`. Apply in this order if setting up fresh:
1. `schema.sql` — core tables (users, sessions, leads, contacts, newsletter, callbacks, invoices, tickets, posts, etc.)
2. `migrations_missing_tables.sql` — extended tables (backdrop_users, clients, projects, tasks, client_users, client_announcements, project_files, credit_notes, crm_notifications, client_resources, and ~15 more)
3. `fix_sessions_and_data.sql` — drops legacy FK on `sessions.user_id`; adds impersonation columns
4. `fix_schema_mismatches.sql` — adds missing columns (newsletter.whatsapp, leads.session_id, tickets portal columns, storage bucket)
5. `security_fixes.sql` — pg_net schema, RLS consolidation

Supabase project ID: `wsucqpunleplgyrrroae`

### API Route Patterns

**Admin routes** (`/api/dashboard/*`): Bearer token from sessionStorage → `authorizeAny(extractToken(req))`

**Portal routes** (`/api/customers/*`): `verifyPortalSession(req)` → email string

**Form routes** (`/api/forms/*`): Public, rate-limited, reCAPTCHA-verified. Each form also fires a `fireJourneyEvent()` and a background analytics event to `/api/track`.

**Blog routes** (`/api/blog/*`): Mix of `authorizeBlogPublish` (admin/editor) and `authorizeBlogDraft` (admin/editor/contributor). Posts are stored in GitHub via `src/lib/githubStore.ts` and mirrored to Supabase `posts` table.

### Key Libraries

| File | Purpose |
|------|---------|
| `src/lib/sessions.ts` | Admin session create/get/delete (Supabase primary, fs fallback) |
| `src/lib/adminStore.ts` | User CRUD against `backdrop_users` (Supabase Auth + mirror table) |
| `src/lib/postsStore.ts` | Blog post CRUD via GitHub API |
| `src/lib/resend.ts` | Transactional email (Resend API) |
| `src/lib/journey.ts` | Lead journey events (session → lead → proposal) |
| `src/lib/permissions.ts` | Fine-grained module:action permission checking |
| `src/lib/rateLimit.ts` | In-memory per-IP rate limiting |
| `src/lib/n8n.ts` | N8N webhook integration |
| `src/lib/supabase-portal.ts` | Anon Supabase client for browser Realtime (portal only) |

### File Upload (Customer Portal)

Files go through a **signed URL flow** — never through the Vercel function body:
1. `GET /api/customers/resources/upload-url` — server creates Supabase Storage signed URL via service role
2. Client PUT directly to Supabase Storage using the signed URL
3. Client POST metadata to `/api/customers/resources` to save the DB record
Bucket: `client-resources` (public, 50MB limit).

### Environment Variables

Required for full functionality:
```
SUPABASE_URL                   # Supabase project URL (server)
SUPABASE_SERVICE_ROLE_KEY      # Service role key — bypasses RLS (server only)
NEXT_PUBLIC_SUPABASE_URL       # Same URL, exposed to browser
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Anon key for browser Realtime
PORTAL_SESSION_SECRET          # HMAC secret for customer portal cookies
RESEND_API_KEY                 # Transactional email
BLOG_PUBLISH_SECRET            # Static secret for N8N/external blog publishes
```

Without `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` the app falls back to filesystem — this works locally but **all data is lost on Vercel redeploy**.

## Agent Comms (SendMessage-First Coordination)

Named agents coordinate via `SendMessage`, not polling or shared state.

### Spawning a Coordinated Team

```javascript
Agent({ prompt: "Research the codebase. SendMessage findings to 'architect'.",
  subagent_type: "researcher", name: "researcher", run_in_background: true })
Agent({ prompt: "Wait for 'researcher'. Design solution. SendMessage to 'coder'.",
  subagent_type: "system-architect", name: "architect", run_in_background: true })
Agent({ prompt: "Wait for 'architect'. Implement it. SendMessage to 'tester'.",
  subagent_type: "coder", name: "coder", run_in_background: true })
// Kick off
SendMessage({ to: "researcher", summary: "Start", message: "[task context]" })
```

| Pattern | Flow | Use When |
|---------|------|----------|
| **Pipeline** | A → B → C → D | Sequential dependencies |
| **Fan-out** | Lead → A, B, C → Lead | Independent parallel work |
| **Supervisor** | Lead ↔ workers | Ongoing coordination |

- Spawn ALL agents in ONE message with `run_in_background: true`
- After spawning: STOP, tell user what's running, wait for results

### When to Swarm
- **YES**: 3+ files, new features, cross-module refactoring, API changes, security, performance
- **NO**: single file edits, 1-2 line fixes, docs updates, config changes, questions
