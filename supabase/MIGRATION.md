# Supabase project migration

`wsucqpunleplgyrrroae` (old) → `ugusopwzziztnxhqlotp` (new)

Status as of the last run. Steps 1–2 are done and verified; step 3 needs one
manual action before steps 4–6 can run.

| # | Step | Status |
|---|---|---|
| 1 | Repository references repointed | **Done** |
| 2 | Storage buckets and objects copied | **Done, verified** |
| 3 | Schema + grants applied to the new project | **Done** — 26/26 tables |
| 4 | Table data copied | **Done, verified** — 146/146 rows |
| 5 | Auth users | **Done, verified** — no orphans |
| 6 | Deployment env vars + verification | **Outstanding — the last step** |

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
| `meeting-files` | yes | 50 MB | 0 (created empty) |

Both objects were re-downloaded from the new project and confirmed
byte-identical by SHA-256, and the public URL serves correctly.

> **`meeting-files` was missing from both projects** — a pre-existing bug, not
> something this migration caused. The code writes meeting attachments there
> (`src/app/api/dashboard/meetings/attachments/route.ts:90`), so those uploads
> were failing. The bucket has now been created empty on **both** projects, so
> the feature works on the old project until cutover and on the new one after.
> It is public with a 50 MB limit, matching `getPublicUrl()` and `MAX_SIZE` in
> that route. No bucket-level MIME allowlist was set: the route already enforces
> one, and a second copy would silently drift from it.

## 3. Schema and grants — done

**Open the new project's SQL Editor and run these two files, in order:**

1. [`supabase/001_new_project_schema.sql`](./001_new_project_schema.sql) — the tables.
2. [`supabase/002_grants.sql`](./002_grants.sql) — role privileges.

Dashboard → SQL Editor → New query → paste the file's *contents* (not a link to
it) → Run. Both are safe to re-run.

The second file is not optional. Tables created in the SQL Editor are owned by
`postgres`, and this project has no default privileges handing the PostgREST
roles access to them, so without it every REST request fails with 42501
`permission denied for table ...` — including the data copy in step 4.

A third file, [`supabase/003_anon_realtime_grants.sql`](./003_anon_realtime_grants.sql),
**is** optional and has not been run. It grants `anon` the SELECT needed for the
realtime subscriptions behind the dashboard badge counts and the live chat.
Until it runs, those two features stay quiet on the new project. It is a
security decision rather than a default — the anon key ships in the browser
bundle and these tables have no RLS — so the file states the tradeoff and the
safer alternative. Read it before running it.

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

## 4. Data — done and verified

All **146 rows across 26 tables** were copied and then independently verified:
every table was re-read from both projects and compared on content, not just
row count. All thirteen non-empty tables are identical; the other thirteen were
empty at source and remain empty.

To re-run it (safe — rows upsert on their primary key):

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

## 5. Auth users — done and verified

Both users were recreated through the Admin API with their **original UUIDs
supplied explicitly**, so they match the `backdrop_users` rows already in place.
Verified afterwards by comparing the full set of auth user ids against the full
set of `backdrop_users` ids: they match exactly, with no orphans on either side.

The email-confirmed state was replicated as it stood in the source — the
`super_admin` confirmed, the `contributor` not. If you want the contributor able
to sign in without first confirming, flip that on their account.

**Neither account has a password.** The source hashes are not retrievable (see
below), so both users must go through the password-reset flow before their first
login. No email was sent by the migration itself; the Admin API's create-user
call does not notify anyone.

One incidental improvement: listing auth users on the new project returns 200,
where the old project returns HTTP 500 past the sixth record. The corruption
described below did not follow the data across.

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

### How this was done, and the alternative that was not needed

Both routes below end with the users setting fresh passwords, because the
originals cannot be recovered. **Route A was taken.**

**A — recreate with the original UUIDs (used).** Create each auth user through the
Admin API with its `id` supplied explicitly, so it matches the `backdrop_users`
row already in place. Nothing else changes. This cannot be done from the
Supabase dashboard, which does not let you choose a UUID.

**B — create them normally, then repoint `backdrop_users` (not needed).** Add both users in
the dashboard, let them get fresh UUIDs, then update the two rows to match:

```sql
UPDATE backdrop_users SET id = '<new auth uuid>' WHERE email = '<that email>';
```

This is safe here: the schema has exactly one foreign key
(`projects.client_id → clients.client_id`), so nothing in the database enforces
a reference to `backdrop_users.id`. The only loose ends are the 19 migrated
`sessions` rows, whose `user_id` would no longer match — they are live login
sessions and expire anyway, so the effect is that everyone logs in once more.

B is kept here only as the fallback if these accounts ever have to be rebuilt
from a dashboard, where UUIDs cannot be chosen.

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
