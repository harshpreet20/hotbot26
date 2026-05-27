/**
 * Fire-and-forget behavioral event tracking for the client portal.
 * Calls POST /api/customers/portal-events — never throws or awaits.
 */
export function trackPortalEvent(
  eventType: string,
  options: {
    entityType?: string;
    entityId?: string;
    page?: string;
    metadata?: Record<string, unknown>;
  } = {}
): void {
  if (typeof window === "undefined") return;
  // Don't block — fire and forget
  fetch("/api/customers/portal-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_type: eventType,
      entity_type: options.entityType,
      entity_id: options.entityId,
      page: window.location.pathname,
      metadata: options.metadata,
    }),
  }).catch(() => {}); // completely silent
}
