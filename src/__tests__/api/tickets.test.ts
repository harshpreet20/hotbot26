/**
 * Integration tests - ticket system
 *
 * POST/GET/PATCH/DELETE /api/dashboard/tickets  - staff (authenticated) tickets
 * POST/GET              /api/tickets             - public ticket submission & lookup
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/dashboardAuth", () => ({
  extractToken: vi.fn(),
  authorizeAny: vi.fn(),
}));

vi.mock("@/lib/store", () => ({
  readAll:    vi.fn().mockResolvedValue([]),
  insert:     vi.fn().mockResolvedValue(undefined),
  updateById: vi.fn().mockResolvedValue(undefined),
  removeById: vi.fn().mockResolvedValue(undefined),
  newId:      vi.fn().mockReturnValue("tkt-new-id"),
}));

vi.mock("@/lib/rateLimit", () => ({
  rateLimitResponse: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/ticketEmail", () => ({
  sendTicketConfirmation:     vi.fn().mockResolvedValue(undefined),
  sendStaffReplyNotification: vi.fn().mockResolvedValue(undefined),
  sendStatusUpdateNotification: vi.fn().mockResolvedValue(undefined),
}));

import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { readAll, insert, updateById, removeById } from "@/lib/store";
import {
  GET as dashGet,
  POST as dashPost,
  PATCH as dashPatch,
  DELETE as dashDelete,
} from "@/app/api/dashboard/tickets/route";
import {
  GET as pubGet,
  POST as pubPost,
} from "@/app/api/tickets/route";
import { sendTicketConfirmation, sendStaffReplyNotification } from "@/lib/ticketEmail";

const ADMIN_SESSION = { userId: "u1", username: "admin", role: "admin" as const };
const AGENT_SESSION = { userId: "u2", username: "agent", role: "agent" as const };

const TICKET_FIXTURE = {
  id:             "tkt-1",
  ticketNumber:   "TKT-0001",
  title:          "Bug in login",
  description:    "Cannot log in",
  status:         "open"   as const,
  priority:       "medium" as const,
  category:       "bug"    as const,
  requesterName:  "Alice",
  requesterEmail: "alice@example.com",
  createdAt:      "2026-01-01T00:00:00Z",
  updatedAt:      "2026-01-01T00:00:00Z",
  comments:       [],
  activity:       [],
};

function makeReq(method: string, url: string, body?: unknown, bearer?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json", "x-forwarded-for": "1.2.3.4" };
  if (bearer) headers["Authorization"] = `Bearer ${bearer}`;
  return new NextRequest(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

beforeEach(() => {
  vi.mocked(extractToken).mockReturnValue("test-token");
  vi.mocked(authorizeAny).mockResolvedValue(ADMIN_SESSION);
  vi.mocked(readAll).mockResolvedValue([TICKET_FIXTURE]);
  vi.mocked(insert).mockClear();
  vi.mocked(updateById).mockClear();
  vi.mocked(removeById).mockClear();
});

// ── Dashboard GET ─────────────────────────────────────────────────────────────

describe("GET /api/dashboard/tickets", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(authorizeAny).mockResolvedValue(null);
    const res = await dashGet(makeReq("GET", "http://localhost/api/dashboard/tickets"));
    expect(res.status).toBe(401);
  });

  it("returns all tickets", async () => {
    const res  = await dashGet(makeReq("GET", "http://localhost/api/dashboard/tickets", undefined, "tok"));
    const body = await res.json() as { tickets: unknown[] };
    expect(res.status).toBe(200);
    expect(body.tickets).toHaveLength(1);
  });

  it("filters by status", async () => {
    vi.mocked(readAll).mockResolvedValue([
      { ...TICKET_FIXTURE, id: "t1", status: "open"   as const },
      { ...TICKET_FIXTURE, id: "t2", status: "closed" as const },
    ]);
    const res  = await dashGet(makeReq("GET", "http://localhost/api/dashboard/tickets?status=open"));
    const body = await res.json() as { tickets: { id: string }[] };
    expect(body.tickets).toHaveLength(1);
    expect(body.tickets[0].id).toBe("t1");
  });

  it("returns single ticket by id", async () => {
    const res  = await dashGet(makeReq("GET", "http://localhost/api/dashboard/tickets?id=tkt-1"));
    const body = await res.json() as { ticket: { id: string } };
    expect(res.status).toBe(200);
    expect(body.ticket.id).toBe("tkt-1");
  });

  it("returns 404 for unknown ticket id", async () => {
    const res = await dashGet(makeReq("GET", "http://localhost/api/dashboard/tickets?id=no-such"));
    expect(res.status).toBe(404);
  });
});

// ── Dashboard POST ────────────────────────────────────────────────────────────

describe("POST /api/dashboard/tickets", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(authorizeAny).mockResolvedValue(null);
    const res = await dashPost(makeReq("POST", "http://localhost/api/dashboard/tickets", { title: "T" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when title is missing", async () => {
    const res = await dashPost(makeReq("POST", "http://localhost/api/dashboard/tickets", {}));
    expect(res.status).toBe(400);
  });

  it("creates a ticket and returns 201", async () => {
    vi.mocked(readAll).mockResolvedValue([]);
    const res  = await dashPost(makeReq("POST", "http://localhost/api/dashboard/tickets", {
      title:       "Fix nav bug",
      description: "Navbar breaks on mobile",
      priority:    "high",
      category:    "bug",
    }));
    const body = await res.json() as { ticket: { ticketNumber: string; title: string; status: string } };
    expect(res.status).toBe(201);
    expect(body.ticket.ticketNumber).toBe("TKT-0001");
    expect(body.ticket.title).toBe("Fix nav bug");
    expect(body.ticket.status).toBe("draft");
    expect(insert).toHaveBeenCalledWith("tickets", expect.objectContaining({ title: "Fix nav bug" }));
  });

  it("uses requesterName from session when not provided", async () => {
    vi.mocked(readAll).mockResolvedValue([]);
    const res  = await dashPost(makeReq("POST", "http://localhost/api/dashboard/tickets", { title: "My Ticket" }));
    const body = await res.json() as { ticket: { requesterName: string } };
    expect(body.ticket.requesterName).toBe("admin");
  });

  it("ticket number does not collide after deletion (uses max+1 not length+1)", async () => {
    // Simulate: had TKT-0001 to TKT-0003, TKT-0002 deleted → length=2 but max=3
    vi.mocked(readAll).mockResolvedValue([
      { ...TICKET_FIXTURE, id: "t1", ticketNumber: "TKT-0001" },
      { ...TICKET_FIXTURE, id: "t3", ticketNumber: "TKT-0003" },
    ]);
    const res  = await dashPost(makeReq("POST", "http://localhost/api/dashboard/tickets", { title: "New" }));
    const body = await res.json() as { ticket: { ticketNumber: string } };
    expect(body.ticket.ticketNumber).toBe("TKT-0004"); // NOT TKT-0003 (length=2+1=3)
  });
});

// ── Dashboard PATCH ───────────────────────────────────────────────────────────

describe("PATCH /api/dashboard/tickets - update fields", () => {
  it("returns 400 when id is missing", async () => {
    const res = await dashPatch(makeReq("PATCH", "http://localhost/api/dashboard/tickets", {}));
    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown ticket id", async () => {
    vi.mocked(readAll).mockResolvedValue([]);
    const res = await dashPatch(makeReq("PATCH", "http://localhost/api/dashboard/tickets", { id: "no-such" }));
    expect(res.status).toBe(404);
  });

  it("updates status and returns updated ticket", async () => {
    const res  = await dashPatch(makeReq("PATCH", "http://localhost/api/dashboard/tickets", {
      id:     "tkt-1",
      status: "in_progress",
    }));
    const body = await res.json() as { ticket: { status: string } };
    expect(res.status).toBe(200);
    expect(body.ticket.status).toBe("in_progress");
    expect(updateById).toHaveBeenCalledWith("tickets", "tkt-1", expect.objectContaining({ status: "in_progress" }));
  });

  it("sets resolvedAt when status changes to resolved", async () => {
    const res  = await dashPatch(makeReq("PATCH", "http://localhost/api/dashboard/tickets", {
      id:     "tkt-1",
      status: "resolved",
    }));
    const body = await res.json() as { ticket: { resolvedAt: string } };
    expect(body.ticket.resolvedAt).toBeDefined();
  });
});

describe("PATCH /api/dashboard/tickets - add comment", () => {
  it("adds a public staff comment to a ticket", async () => {
    const res  = await dashPatch(makeReq("PATCH", "http://localhost/api/dashboard/tickets", {
      id:   "tkt-1",
      type: "comment",
      text: "Looking into this now.",
    }));
    const body = await res.json() as { comment: { text: string; isStaff: boolean } };
    expect(res.status).toBe(200);
    expect(body.comment.text).toBe("Looking into this now.");
    expect(body.comment.isStaff).toBe(true);
    expect(sendStaffReplyNotification).toHaveBeenCalled();
  });

  it("adds an internal note (not visible to requester)", async () => {
    const res  = await dashPatch(makeReq("PATCH", "http://localhost/api/dashboard/tickets", {
      id:   "tkt-1",
      type: "internal_note",
      text: "Internal note here.",
    }));
    const body = await res.json() as { comment: { isInternal: boolean } };
    expect(res.status).toBe(200);
    expect(body.comment.isInternal).toBe(true);
    // Internal notes do NOT trigger email notification
    expect(sendStaffReplyNotification).not.toHaveBeenCalled();
  });

  it("returns 400 when comment text is empty", async () => {
    const res = await dashPatch(makeReq("PATCH", "http://localhost/api/dashboard/tickets", {
      id:   "tkt-1",
      type: "comment",
      text: "",
    }));
    expect(res.status).toBe(400);
  });
});

// ── Dashboard DELETE ──────────────────────────────────────────────────────────

describe("DELETE /api/dashboard/tickets", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(authorizeAny).mockResolvedValue(null);
    const res = await dashDelete(makeReq("DELETE", "http://localhost/api/dashboard/tickets?id=tkt-1"));
    expect(res.status).toBe(401);
  });

  it("returns 403 when role is not admin", async () => {
    vi.mocked(authorizeAny).mockResolvedValue(AGENT_SESSION);
    const res = await dashDelete(makeReq("DELETE", "http://localhost/api/dashboard/tickets?id=tkt-1"));
    expect(res.status).toBe(403);
  });

  it("returns 400 when id is missing", async () => {
    const res = await dashDelete(makeReq("DELETE", "http://localhost/api/dashboard/tickets"));
    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown ticket id", async () => {
    vi.mocked(readAll).mockResolvedValue([]);
    const res = await dashDelete(makeReq("DELETE", "http://localhost/api/dashboard/tickets?id=no-such"));
    expect(res.status).toBe(404);
  });

  it("deletes ticket and returns ok:true", async () => {
    const res  = await dashDelete(makeReq("DELETE", "http://localhost/api/dashboard/tickets?id=tkt-1"));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(removeById).toHaveBeenCalledWith("tickets", "tkt-1");
  });
});

// ── Public ticket submission ──────────────────────────────────────────────────

const MOCK_CLIENT = { id: "c-1", clientId: "CLIENT-001", name: "Test Client", email: "client@test.com" };

describe("POST /api/tickets - public submission", () => {
  beforeEach(() => {
    vi.mocked(readAll).mockImplementation(async (table: string) => {
      if (table === "clients") return [MOCK_CLIENT] as unknown as typeof TICKET_FIXTURE[];
      return [];
    });
    vi.mocked(sendTicketConfirmation).mockClear();
  });

  it("creates ticket and returns 201 with ticket details", async () => {
    const res  = await pubPost(makeReq("POST", "http://localhost/api/tickets", {
      title:          "Invoice issue",
      description:    "Wrong amount charged",
      requesterName:  "Bob",
      requesterEmail: "bob@example.com",
      category:       "billing",
      clientId:       "CLIENT-001",
    }));
    const body = await res.json() as { ticket: { ticketNumber: string; status: string } };
    expect(res.status).toBe(201);
    expect(body.ticket.ticketNumber).toMatch(/^TKT-\d{4}$/);
    expect(body.ticket.status).toBe("open");
    expect(insert).toHaveBeenCalled();
    expect(sendTicketConfirmation).toHaveBeenCalled();
  });

  it("returns 400 when title is missing", async () => {
    const res = await pubPost(makeReq("POST", "http://localhost/api/tickets", {
      requesterName: "Bob", requesterEmail: "bob@example.com",
    }));
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toMatch(/title/i);
  });

  it("returns 400 when requesterName is missing", async () => {
    const res = await pubPost(makeReq("POST", "http://localhost/api/tickets", {
      title: "Test", requesterEmail: "bob@example.com",
    }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when requesterEmail is missing", async () => {
    const res = await pubPost(makeReq("POST", "http://localhost/api/tickets", {
      title: "Test", requesterName: "Bob",
    }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid email format", async () => {
    const res = await pubPost(makeReq("POST", "http://localhost/api/tickets", {
      title: "Test", requesterName: "Bob", requesterEmail: "not-an-email",
    }));
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toMatch(/email/i);
  });

  it("defaults priority to medium and category to general", async () => {
    await pubPost(makeReq("POST", "http://localhost/api/tickets", {
      title: "T", requesterName: "X", requesterEmail: "x@x.com", clientId: "CLIENT-001",
    }));
    expect(insert).toHaveBeenCalledWith("tickets", expect.objectContaining({
      priority: "medium",
      category: "general",
    }));
  });
});

describe("POST /api/tickets - add public comment", () => {
  beforeEach(() => {
    vi.mocked(readAll).mockResolvedValue([TICKET_FIXTURE]);
  });

  it("adds a public comment to an existing ticket", async () => {
    const res  = await pubPost(makeReq("POST", "http://localhost/api/tickets", {
      type:          "comment",
      ticketId:      "tkt-1",
      text:          "Any update?",
      requesterName: "Alice",
    }));
    const body = await res.json() as { comment: { text: string; isStaff: boolean } };
    expect(res.status).toBe(201);
    expect(body.comment.text).toBe("Any update?");
    expect(body.comment.isStaff).toBe(false);
    expect(updateById).toHaveBeenCalled();
  });

  it("returns 404 if ticket not found when commenting", async () => {
    vi.mocked(readAll).mockResolvedValue([]);
    const res = await pubPost(makeReq("POST", "http://localhost/api/tickets", {
      type: "comment", ticketId: "no-such", text: "Hi", requesterName: "X",
    }));
    expect(res.status).toBe(404);
  });
});

// ── Public ticket lookup ──────────────────────────────────────────────────────

describe("GET /api/tickets - public lookup", () => {
  beforeEach(() => {
    vi.mocked(readAll).mockResolvedValue([TICKET_FIXTURE]);
  });

  it("returns ticket by id", async () => {
    const res  = await pubGet(makeReq("GET", "http://localhost/api/tickets?id=tkt-1"));
    const body = await res.json() as { ticket: { id: string } };
    expect(res.status).toBe(200);
    expect(body.ticket.id).toBe("tkt-1");
  });

  it("returns ticket by ticketNumber (case-insensitive)", async () => {
    const res  = await pubGet(makeReq("GET", "http://localhost/api/tickets?id=tkt-0001"));
    const body = await res.json() as { ticket: { ticketNumber: string } };
    expect(res.status).toBe(200);
    expect(body.ticket.ticketNumber).toBe("TKT-0001");
  });

  it("returns 400 when id param is missing", async () => {
    const res = await pubGet(makeReq("GET", "http://localhost/api/tickets"));
    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown id", async () => {
    const res = await pubGet(makeReq("GET", "http://localhost/api/tickets?id=unknown"));
    expect(res.status).toBe(404);
  });

  it("strips internal ip field from response", async () => {
    vi.mocked(readAll).mockResolvedValue([{ ...TICKET_FIXTURE, ip: "192.168.1.1" }]);
    const res  = await pubGet(makeReq("GET", "http://localhost/api/tickets?id=tkt-1"));
    const body = await res.json() as { ticket: Record<string, unknown> };
    expect(body.ticket.ip).toBeUndefined();
  });
});
