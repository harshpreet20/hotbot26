/**
 * Integration tests - leads CRUD
 *
 * GET/POST/PATCH /api/dashboard/leads
 * POST           /api/n8n/form  (website form → lead, already in n8n.test.ts, extras here)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/dashboardAuth", () => ({
  extractToken:  vi.fn(),
  authorizeAny:  vi.fn(),
  authorizeData: vi.fn(),
}));

vi.mock("@/lib/store", () => ({
  readAll:    vi.fn().mockResolvedValue([]),
  insert:     vi.fn().mockResolvedValue(undefined),
  updateById: vi.fn().mockResolvedValue(undefined),
  newId:      vi.fn().mockReturnValue("lead-new-id"),
}));

vi.mock("@/lib/rateLimit", () => ({
  rateLimitResponse: vi.fn().mockReturnValue(null),
}));

import { extractToken, authorizeAny, authorizeData } from "@/lib/dashboardAuth";
import { readAll, insert, updateById, newId } from "@/lib/store";
import { GET, POST, PATCH } from "@/app/api/dashboard/leads/route";

const ADMIN_SESSION   = { userId: "u1", username: "admin",       role: "admin"       as const };
const SALES_SESSION   = { userId: "u2", username: "salesperson",  role: "sales"       as const };
const AGENT_SESSION   = { userId: "u3", username: "agent",        role: "agent"       as const };
const CRM_SESSION     = { userId: "u4", username: "crmop",        role: "crm_operator"as const };

const LEAD_FIXTURE = {
  id:        "lead-1",
  name:      "Alice",
  email:     "alice@example.com",
  phone:     "+1 555 0100",
  company:   "Acme",
  service:   "SEO",
  budget:    "$5k",
  message:   "Need help",
  formType:  "get-started",
  source:    "homepage",
  ip:        "1.2.3.4",
  createdAt: "2026-01-01T00:00:00Z",
  status:    "new" as const,
};

function makeReq(method: string, url: string, body?: unknown, bearer?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
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
  vi.mocked(authorizeData).mockResolvedValue(true);
  vi.mocked(readAll).mockResolvedValue([LEAD_FIXTURE]);
  vi.mocked(insert).mockClear();
  vi.mocked(updateById).mockClear();
  vi.mocked(newId).mockReturnValue("lead-new-id");
});

// ── GET ───────────────────────────────────────────────────────────────────────

describe("GET /api/dashboard/leads - auth guard", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(authorizeData).mockResolvedValue(false);
    const res = await GET(makeReq("GET", "http://localhost/api/dashboard/leads"));
    expect(res.status).toBe(401);
  });
});

describe("GET /api/dashboard/leads", () => {
  it("returns all leads", async () => {
    const res  = await GET(makeReq("GET", "http://localhost/api/dashboard/leads", undefined, "tok"));
    const body = await res.json() as { leads: unknown[] };
    expect(res.status).toBe(200);
    expect(body.leads).toHaveLength(1);
  });

  it("filters by status when query param provided", async () => {
    vi.mocked(readAll).mockResolvedValue([
      { ...LEAD_FIXTURE, id: "l1", status: "new"       as const },
      { ...LEAD_FIXTURE, id: "l2", status: "qualified" as const },
    ]);
    const res  = await GET(makeReq("GET", "http://localhost/api/dashboard/leads?status=new"));
    const body = await res.json() as { leads: { id: string }[] };
    expect(body.leads).toHaveLength(1);
    expect(body.leads[0].id).toBe("l1");
  });

  it("returns empty array when no leads", async () => {
    vi.mocked(readAll).mockResolvedValue([]);
    const res  = await GET(makeReq("GET", "http://localhost/api/dashboard/leads", undefined, "tok"));
    const body = await res.json() as { leads: unknown[] };
    expect(body.leads).toHaveLength(0);
  });
});

// ── POST ──────────────────────────────────────────────────────────────────────

describe("POST /api/dashboard/leads - auth & roles", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(authorizeAny).mockResolvedValue(null);
    const res = await POST(makeReq("POST", "http://localhost/api/dashboard/leads", { name: "X", email: "x@x.com" }));
    expect(res.status).toBe(401);
  });

  it("returns 403 when role is agent (not allowed to create leads)", async () => {
    vi.mocked(authorizeAny).mockResolvedValue(AGENT_SESSION);
    const res = await POST(makeReq("POST", "http://localhost/api/dashboard/leads", { name: "X", email: "x@x.com" }));
    expect(res.status).toBe(403);
  });

  it("returns 403 when role is crm_operator", async () => {
    vi.mocked(authorizeAny).mockResolvedValue(CRM_SESSION);
    const res = await POST(makeReq("POST", "http://localhost/api/dashboard/leads", { name: "X", email: "x@x.com" }));
    expect(res.status).toBe(403);
  });

  it("allows sales role to create a lead", async () => {
    vi.mocked(authorizeAny).mockResolvedValue(SALES_SESSION);
    const res = await POST(makeReq("POST", "http://localhost/api/dashboard/leads", {
      name: "Bob", email: "bob@example.com",
    }));
    expect(res.status).toBe(201);
  });
});

describe("POST /api/dashboard/leads - creation", () => {
  it("creates a lead and returns 201", async () => {
    const res  = await POST(makeReq("POST", "http://localhost/api/dashboard/leads", {
      name:    "Carol",
      email:   "carol@example.com",
      phone:   "+91 9000000000",
      service: "AI Automation",
      budget:  "$10k+",
      message: "Interested in your services",
    }));
    const body = await res.json() as { lead: { id: string; name: string; status: string; source: string } };
    expect(res.status).toBe(201);
    expect(body.lead.id).toBe("lead-new-id");
    expect(body.lead.name).toBe("Carol");
    expect(body.lead.status).toBe("new");
    expect(body.lead.source).toBe("manual");
    expect(insert).toHaveBeenCalledWith("leads", expect.objectContaining({
      name:  "Carol",
      email: "carol@example.com",
    }));
  });

  it("defaults formType to 'manual' when not provided", async () => {
    await POST(makeReq("POST", "http://localhost/api/dashboard/leads", {
      name: "Dave", email: "dave@example.com",
    }));
    expect(insert).toHaveBeenCalledWith("leads", expect.objectContaining({
      formType: "manual",
      source:   "manual",
    }));
  });

  it("accepts pre-set status from body", async () => {
    const res  = await POST(makeReq("POST", "http://localhost/api/dashboard/leads", {
      name: "Eve", email: "eve@example.com", status: "qualified",
    }));
    const body = await res.json() as { lead: { status: string } };
    expect(body.lead.status).toBe("qualified");
  });
});

// ── PATCH ─────────────────────────────────────────────────────────────────────

describe("PATCH /api/dashboard/leads - auth guard", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(authorizeAny).mockResolvedValue(null);
    const res = await PATCH(makeReq("PATCH", "http://localhost/api/dashboard/leads", { id: "lead-1" }));
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/dashboard/leads - update", () => {
  it("returns 400 when id is missing", async () => {
    const res = await PATCH(makeReq("PATCH", "http://localhost/api/dashboard/leads", {}));
    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown lead id", async () => {
    vi.mocked(readAll).mockResolvedValue([]);
    const res = await PATCH(makeReq("PATCH", "http://localhost/api/dashboard/leads", { id: "no-such" }));
    expect(res.status).toBe(404);
  });

  it("updates lead fields and returns updated lead", async () => {
    const res  = await PATCH(makeReq("PATCH", "http://localhost/api/dashboard/leads", {
      id:    "lead-1",
      notes: "Called. Interested in SEO package.",
      tags:  ["hot", "seo"],
    }));
    const body = await res.json() as { lead: { notes: string; tags: string[] } };
    expect(res.status).toBe(200);
    expect(body.lead.notes).toBe("Called. Interested in SEO package.");
    expect(body.lead.tags).toEqual(["hot", "seo"]);
    expect(updateById).toHaveBeenCalledWith("leads", "lead-1", expect.objectContaining({
      notes: "Called. Interested in SEO package.",
    }));
  });

  it("auto-logs status change to crm_updates when status changes", async () => {
    const res  = await PATCH(makeReq("PATCH", "http://localhost/api/dashboard/leads", {
      id:     "lead-1",
      status: "qualified",
    }));
    expect(res.status).toBe(200);
    // insert called twice: one for updateById (via store.updateById mock) + one for CRM activity log
    expect(insert).toHaveBeenCalledWith("crm_updates", expect.objectContaining({
      type:    "status_change",
      leadId:  "lead-1",
    }));
  });

  it("does NOT log status change when status is unchanged", async () => {
    // LEAD_FIXTURE.status is already "new"
    await PATCH(makeReq("PATCH", "http://localhost/api/dashboard/leads", {
      id:     "lead-1",
      status: "new",  // same as existing
    }));
    expect(insert).not.toHaveBeenCalled();
  });

  it("auto-logs assignment change when assignedTo changes", async () => {
    await PATCH(makeReq("PATCH", "http://localhost/api/dashboard/leads", {
      id:         "lead-1",
      assignedTo: "salesperson",
    }));
    expect(insert).toHaveBeenCalledWith("crm_updates", expect.objectContaining({
      type:   "assignment",
      leadId: "lead-1",
    }));
  });

  it("sets lastUpdatedAt and lastUpdatedBy on update", async () => {
    const res  = await PATCH(makeReq("PATCH", "http://localhost/api/dashboard/leads", {
      id:    "lead-1",
      notes: "Updated",
    }));
    const body = await res.json() as { lead: { lastUpdatedBy: string; lastUpdatedAt: string } };
    expect(body.lead.lastUpdatedBy).toBe("admin");
    expect(body.lead.lastUpdatedAt).toBeDefined();
  });
});
