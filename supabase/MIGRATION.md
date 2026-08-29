# Supabase project migration

`wsucqpunleplgyrrroae` (old) → `ugusopwzziztnxhqlotp` (new)

Status as of the last run. Steps 1–2 are done and verified; step 3 needs one
manual action before steps 4–6 can run.

| # | Step | Status |
|---|---|---|
| 1 | Repository references repointed | **Done** |
| 2 | Storage buckets and objects copied | **Done, verified** |
| 3 | Schema created on the new project | **Blocked — needs you** |
| 4 | Table data copied | Ready, waiting on 3 |
| 5 | Auth users | **Needs a decision** — see below |
| 6 | Deployment env vars + verification | Waiting on 3–5 |

The new project was empty when this started: no tables, no buckets, no data.
Nothing was overwritten.

---

## What the old project actually contains

Worth knowing before you weigh how careful to be: this is a small database.

- **146 rows** across the 26 tables this app uses — and 103 of those are
  `system_logs`. The business data is roughly 25 rows: 7 leads, 3 clients,
  4 team channels, 2 crm tasks, 2 backdrop users, 1 each of invoice, callback,
  project, project SOP, team message and ticket. 19 rows are login sessions.
- **~150 KB of storage** — 2 files, both in `partner-logos`.
- The `public` schema holds **133 tables shared with unrelated applications**
  (a sports app among them — `admin@racquetsclubcommunity.com` is one of the
  auth users). This app uses 26. Only those 26 are being moved, which is why
  the old project cannot simply be switched off afterwards.

---

## 1. Repository references — done

Every checked-in reference points at `ugusopwzziztnxhqlotp`. Application code
needed no changes; it reads the project URL from the environment throughout.

Two `.env.example` defects were fixed at the same time, both of which would
have broken this migration quietly:

- `DATABASE_URL`/`DIRECT_URL` were documented but are read by nothing. The real
  names are `POSTGRES_PRISMA_URL`/`POSTGRES_URL_NON_POOLING`. Setting the
  documented ones leaves the app falling back to the local JSON store.
- `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` were undocumented
  despite three client components using them — the browser would have stayed on
  the old project while the server moved.

## 2. Storage — done and verified

All four buckets were recreated on the new project with identical visibility,
size limits and MIME restrictions:

| Bucket | Public | Size limit | Objects copied |
|---|---|---|---|
| `partner-logos` | yes | 5 MB | 2 |
| `project-files` | no | 50 MB | 0 (empty) |
| `client-resources` | yes | 50 MB | 0 (empty) |
| `client-files` | yes | none | 0 (empty) |

Both objects were re-downloaded from the new project and confirmed
byte-identical by SHA-256, and the public URL serves correctly.

> **Latent bug, not caused by this migration.** The code writes meeting
> attachments to a `meeting-files` bucket
> (`src/app/api/dashboard/meetings/attachments/route.ts:90`), but that bucket
> does not exist on the old project either. Meeting attachment uploads are
> therefore already failing in production. It was not created here because that
> is a fix, not a migration — but it is a one-line fix worth making.

## 3. Schema — needs one manual step

**Open the new project's SQL Editor and run
[`supabase/001_new_project_schema.sql`](./001_new_project_schema.sql).**

Dashboard → SQL Editor → New query → paste the file → Run. It is idempotent
(`CREATE TABLE IF NOT EXISTS`), so re-running it is harmless.

This step cannot be automated from here. Creating tables requires SQL
execution, and none of the three routes to it are open: port 5432 is
unreachable from this environment, the Supabase Management API needs a personal
access token (`sbp_…`) rather than a service-role key, and PostgREST does not
execute DDL. A service-role key is enough to read and write *rows*, but not to
create tables.

If you would rather it were automated, either of these unblocks it: a Supabase
personal access token, or the new project's database password plus a network
path to port 5432.

The file covers all 26 tables with their real column types, defaults,
nullability, primary keys and the one foreign key
(`projects.client_id → clients.client_id`). Read its header for what it does
*not* carry over (secondary indexes, CHECK/UNIQUE constraints, triggers), and
its footer for the **RLS decision you need to make** — the short version is
that these tables are created without RLS, which matches how the app reaches
them today, but leaves them readable by anyone holding the public anon key.

It also adds `leads`, `tickets`, `callbacks` and `chats` to the
`supabase_realtime` publication. `CREATE TABLE` alone does not do this, and
without it the dashboard badge counts and the live chat widget stop updating
silently — no error, just nothing.

## 4. Data — ready to run

Once step 3 is done:

```bash
OLD_SUPABASE_URL=https://wsucqpunleplgyrrroae.supabase.co OLD_SERVICE_KEY=<old service_role key> \
NEW_SUPABASE_URL=https://ugusopwzziztnxhqlotp.supabase.co NEW_SERVICE_KEY=<new service_role key> \
node scripts/migrate-supabase-data.mjs
```

Add `--dry-run` to read from the old project and report counts without writing
anything. The read path has already been exercised this way and returns all 146
rows correctly.

Rows are upserted on their primary key, so a partial or repeated run resumes
rather than duplicating. The script copies `clients` before `projects` to
respect the foreign key, and verifies each table's destination count against
the source, exiting non-zero on any mismatch.

`sessions` (19 rows) are live login sessions. Copying them is harmless, but
skipping them (`--only=…` without it) just means everyone logs in again.

## 5. Auth users — read this before deciding

**Password hashes cannot be moved.** The Auth Admin API does not expose
`encrypted_password`; the user object it returns has no such field. Recreating
these users through the API therefore gives them no password, whatever else is
preserved. Moving passwords needs a `pg_dump` of `auth.users`, which needs the
database access described in step 3.

**The old project's auth is partly broken already.** Listing users returns
HTTP 500 `Database error finding users` beyond the sixth record. Six users are
readable one page at a time; roughly three more exist but cannot be read
through the API at all. This is pre-existing damage in the source project, not
something this migration caused, and it is worth investigating separately.

**Only two of those users belong to this app** — the two rows in
`backdrop_users`, one `super_admin` and one `contributor`. Both are readable
through the Auth Admin API despite the fault above. Query the source project for
their ids and emails when you run the migration:

```sql
SELECT id, email, role FROM backdrop_users;
```

They are deliberately not listed here; there is no reason to keep personal
addresses in version control when the database has them. The rest of the auth
users belong to the other applications sharing the project.

`backdrop_users.id` **is** the auth user UUID — it is written straight from
`auth.admin.createUser()` in `src/lib/adminStore.ts:157`. So whatever you do,
the ids of these two rows must survive. Recreate the users with their `id`
specified explicitly; if they are allowed to get fresh UUIDs, both
`backdrop_users` rows orphan and nobody can log into Backdrop, on a database
that looks perfectly populated.

Given two users and no recoverable passwords, the realistic option is to
recreate both with these exact UUIDs and have them set new passwords. Say the
word and that can be done from here — it needs no access beyond the keys
already in use.

## 6. Deployment and verification

Update all six variables in Vercel → Settings → Environment Variables:

| Variable | Value |
|---|---|
| `POSTGRES_PRISMA_URL` | new project, port **6543**, `?pgbouncer=true&connection_limit=1` |
| `POSTGRES_URL_NON_POOLING` | new project, port **5432** |
| `SUPABASE_URL` | `https://ugusopwzziztnxhqlotp.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | new project's `service_role` key |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ugusopwzziztnxhqlotp.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | new project's anon key |

The two `NEXT_PUBLIC_*` values are inlined into the client bundle at build
time, so they need a **redeploy**, not a restart.

Then regenerate the Prisma client against the new database:

```bash
npx prisma db pull && npx prisma generate
```

`prisma db pull` will also reveal anything the generated schema missed —
worth diffing against `prisma/schema.prisma` before deploying.

Verify:

```bash
curl -s https://<deployment>/api/dashboard/health | jq
```

`connectedTo.supabaseProjectRef` must read `ugusopwzziztnxhqlotp`, every entry
in `checks` should be `ok: true`, and the route returns 503 while any is false.

The health check does not cover these, so confirm by hand:

- Log in to Backdrop — proves the auth UUID linkage survived step 5.
- Watch a dashboard badge change — proves the realtime publication took.
- Load a partner logo — proves storage.

## 7. Before retiring the old project

Don't. Not yet, and probably not at all in its current form: **133 tables and
several other applications still live there**, including whatever
`admin@racquetsclubcommunity.com` belongs to. This migration moved a 26-table
subset into a project of its own. Confirm every other consumer has been
accounted for before touching `wsucqpunleplgyrrroae`.
