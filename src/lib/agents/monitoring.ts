/**
 * Monitoring Agent - Audit logging and activity tracking.
 * Stores to Supabase `audit_logs` table (or filesystem fallback).
 */
import { insert, readAll, readWhere } from "@/lib/store";
import type { AuditLog, Role, SessionInfo } from "@/types/dashboard";

export function newAuditId(): string {
  return `al-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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
    await insert<AuditLog>("audit_logs", entry);
  } catch (err) {
    console.error("[monitoring] Failed to write audit log:", err);
  }
}

/** Fetch all audit logs, newest first (admin/super_admin only). */
export async function getAuditLogs(limit = 200): Promise<AuditLog[]> {
  const all = await readAll<AuditLog>("audit_logs");
  return all.slice(0, limit);
}

/** Fetch audit logs for a specific actor. */
export async function getUserActivity(userId: string, limit = 100): Promise<AuditLog[]> {
  const rows = await readWhere<AuditLog>("audit_logs", "actor_id", userId);
  return rows.slice(0, limit);
}

/** Fetch audit logs filtered by action prefix (e.g. "user." or "impersonate."). */
export async function getLogsByAction(actionPrefix: string, limit = 100): Promise<AuditLog[]> {
  const all = await readAll<AuditLog>("audit_logs");
  return all.filter((l) => l.action.startsWith(actionPrefix)).slice(0, limit);
}
