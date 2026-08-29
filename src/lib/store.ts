/**
 * Unified async data store, backed by Prisma.
 *
 * Prisma connects straight to Postgres as the table owner via POSTGRES_PRISMA_URL,
 * so it bypasses PostgREST entirely — no table GRANTs, no RLS, and none of the
 * "permission denied for table x" failures that came with the Supabase client.
 *
 * The public signatures are unchanged from the Supabase implementation, so all
 * ~200 call sites keep working untouched. Prisma's @map handles the
 * camelCase↔snake_case conversion the old toSnake/toCamel helpers did by hand.
 *
 * Note the Supabase client is still the right tool for Supabase Auth and Supabase
 * Storage; only data access moved here.
 */
import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// ── Table name → Prisma delegate ──────────────────────────────────────────────
// Every table reachable through this module. Anything absent is a bug, not a
// silent no-op, so lookups throw rather than returning [].

/* eslint-disable @typescript-eslint/no-explicit-any */
const MODELS: Record<string, () => any> = {
  ai_knowledge_base:   () => prisma.aiKnowledgeBase,
  audit_logs:          () => prisma.auditLog,
  callbacks:           () => prisma.callback,
  chats:               () => prisma.chat,
  client_resources:    () => prisma.clientResource,
  clients:             () => prisma.client,
  contacts:            () => prisma.contact,
  crm_tasks:           () => prisma.crmTask,
  crm_updates:         () => prisma.crmUpdate,
  documents:           () => prisma.document,
  google_tokens:       () => prisma.googleToken,
  invoices:            () => prisma.invoice,
  leads:               () => prisma.lead,
  meeting_attachments: () => prisma.meetingAttachment,
  meetings:            () => prisma.meeting,
  newsletter:          () => prisma.newsletter,
  project_sops:        () => prisma.projectSop,
  projects:            () => prisma.project,
  team_channels:       () => prisma.teamChannel,
  team_messages:       () => prisma.teamMessage,
  tickets:             () => prisma.ticket,
  user_permissions:    () => prisma.userPermission,
  whiteboards:         () => prisma.whiteboard,
};
/* eslint-enable @typescript-eslint/no-explicit-any */

function model(table: string) {
  const delegate = MODELS[table];
  if (!delegate) {
    throw new Error(
      `[store] Unknown table "${table}". Add it to MODELS in src/lib/store.ts.`
    );
  }
  return delegate();
}

/**
 * Give database failures an actionable message.
 *
 * Prisma's own errors surface as a bare 500 with an empty body once they reach a
 * route handler, which says nothing about what went wrong. The two cases worth
 * naming are a database that has no schema (the usual sign of a cutover pointed
 * at an unrestored project) and one that cannot be reached at all.
 */
async function run<T>(table: string, op: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const code = (err as { code?: string }).code;
    const msg  = err instanceof Error ? err.message : String(err);

    if (code === "P2021" || /does not exist in the current database/.test(msg)) {
      const detail =
        `[store] ${op}(${table}): table is missing from the database. ` +
        `POSTGRES_PRISMA_URL points at a database without this schema — ` +
        `typically a migration target that has not been restored yet.`;
      console.error(detail);
      throw new Error(detail);
    }

    if (code === "P1001" || code === "P1002" || /Can't reach database server/.test(msg)) {
      const detail = `[store] ${op}(${table}): cannot reach the database server. Check POSTGRES_PRISMA_URL.`;
      console.error(detail);
      throw new Error(detail);
    }

    console.error(`[store] ${op}(${table}) failed:`, msg);
    throw err;
  }
}

/** Call sites pass database column names; Prisma expects model field names. */
function toField(column: string): string {
  return column.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

// ── Value normalisation ───────────────────────────────────────────────────────
// Prisma returns Decimal for numeric columns and BigInt for bigint. JSON.stringify
// renders Decimal as a quoted string and throws outright on BigInt, while the
// Supabase client returned both as plain numbers. Convert on the way out so API
// response shapes are unchanged.

function normalise<T>(row: T): T {
  if (row === null || typeof row !== "object") return row;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row as Record<string, unknown>)) {
    if (typeof v === "bigint") out[k] = Number(v);
    else if (v instanceof Prisma.Decimal) out[k] = v.toNumber();
    else out[k] = v;
  }
  return out as T;
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Read all rows from a table, newest first. */
export async function readAll<T>(table: string): Promise<T[]> {
  const rows = await run(table, "readAll", () =>
    model(table).findMany({ orderBy: { createdAt: "desc" } })
  );
  return (rows as T[]).map(normalise);
}

/** Read rows filtered by a single column equality, newest first. */
export async function readWhere<T>(
  table: string,
  column: string,
  value: string
): Promise<T[]> {
  const rows = await run(table, "readWhere", () =>
    model(table).findMany({
      where:   { [toField(column)]: value },
      orderBy: { createdAt: "desc" },
    })
  );
  return (rows as T[]).map(normalise);
}

/** Insert one row. */
export async function insert<T>(table: string, item: T): Promise<void> {
  await run(table, "insert", () =>
    model(table).create({ data: item as Record<string, unknown> })
  );
}

/** Update a single row by its `id` field. */
export async function updateById<T>(
  table: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  // updateMany rather than update: a missing row is a no-op here, matching the
  // previous behaviour, whereas update() would throw P2025.
  await run(table, "updateById", () =>
    model(table).updateMany({ where: { id }, data: data as Record<string, unknown> })
  );
}

/** Delete a single row by its `id` field. */
export async function removeById(table: string, id: string): Promise<void> {
  await run(table, "removeById", () => model(table).deleteMany({ where: { id } }));
}

/** Generate a time-sortable unique id. */
export function newId(): string {
  return `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
}
