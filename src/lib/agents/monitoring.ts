/**
 * Monitoring Agent - Audit logging and activity tracking.
 *
 * The `audit_logs` table and the app-level `AuditLog` shape use different names,
 * so this module translates between them. Writing the app-level names straight
 * to the table silently discarded every entry: the columns actor_id,
 * actor_username, actor_role, resource_type, resource_id, is_impersonating and
 * impersonator_id do not exist, so each insert failed on an unknown column and
 * was swallowed by the catch below.
 *
 * Real columns: id, action, entity, entity_id, user_id, username, role, ip,
 * details, created_at. The table has no home for impersonation context, so it
 * rides along inside `details`.
 */
import { insert, readAll, readWhere } from "@/lib/store";
import type { AuditLog, Role, SessionInfo } from "@/types/dashboard";

/** A row exactly as it exists in the audit_logs table. */
interface AuditLogRow {
  id:        string;
  action:    string;
  entity:    string;
  entityId:  string;
  userId:    string;
  username:  string;
  role:      string;
  ip:        string;
  details:   Record<string, unknown>;
  createdAt: string;
}

export function newAuditId(): string {
  return `al-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toRow(entry: AuditLog): AuditLogRow {
  const details = { ...entry.details };
  if (entry.isImpersonating) details.isImpersonating = true;
  if (entry.impersonatorId)  details.impersonatorId  = entry.impersonatorId;

  return {
    id:        entry.id,
    action:    entry.action,
    entity:    entry.resourceType,
    entityId:  entry.resourceId ?? "",
    userId:    entry.actorId,
    username:  entry.actorUsername,
    role:      entry.actorRole,
    ip:        entry.ip,
    details,
    createdAt: entry.createdAt,
  };
}

function fromRow(row: AuditLogRow): AuditLog {
  const { isImpersonating, impersonatorId, ...details } = row.details ?? {};
  return {
    id:              row.id,
    actorId:         row.userId,
    actorUsername:   row.username,
    actorRole:       row.role as Role,
    action:          row.action,
    resourceType:    row.entity,
    resourceId:      row.entityId || undefined,
    details:         details as Record<string, unknown>,
    ip:              row.ip,
    createdAt:       row.createdAt,
    isImpersonating: isImpersonating === true || undefined,
    impersonatorId:  typeof impersonatorId === "string" ? impersonatorId : undefined,
  };
}

export interface LogActionParams {
  session: SessionInfo;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ip?: string;
}

/** Write an audit log entry (fire-and-forget in non-critical paths). */
export async function logAction(params: LogActionParams): Promise<void> {
  const { session, action, resourceType, resourceId, details = {}, ip = "unknown" } = params;
  const entry: AuditLog = {
    id:             newAuditId(),
    actorId:        session.userId,
    actorUsername:  session.username,
    actorRole:      session.role as Role,
    action,
    resourceType,
    resourceId,
    details,
    ip,
    createdAt:      new Date().toISOString(),
    isImpersonating: session.isImpersonating,
    impersonatorId:  session.originalUserId,
  };
  try {
    await insert<AuditLogRow>("audit_logs", toRow(entry));
  } catch (err) {
    console.error("[monitoring] Failed to write audit log:", err);
  }
}

/** Fetch all audit logs, newest first (admin/super_admin only). */
export async function getAuditLogs(limit = 200): Promise<AuditLog[]> {
  const rows = await readAll<AuditLogRow>("audit_logs");
  return rows.slice(0, limit).map(fromRow);
}

/** Fetch audit logs for a specific actor. */
export async function getUserActivity(userId: string, limit = 100): Promise<AuditLog[]> {
  const rows = await readWhere<AuditLogRow>("audit_logs", "user_id", userId);
  return rows.slice(0, limit).map(fromRow);
}

/** Fetch audit logs filtered by action prefix (e.g. "user." or "impersonate."). */
export async function getLogsByAction(actionPrefix: string, limit = 100): Promise<AuditLog[]> {
  const rows = await readAll<AuditLogRow>("audit_logs");
  return rows.filter((r) => r.action.startsWith(actionPrefix)).slice(0, limit).map(fromRow);
}
