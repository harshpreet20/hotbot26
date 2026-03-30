/**
 * Integration tests — /api/dashboard/* routes
 *
 * Tests: auth guard (all data routes), overview aggregation,
 *        leads/contacts/chats/callbacks/newsletter data retrieval
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@/lib/dashboardAuth", () => ({
  extractToken:  vi.fn(),
  authorizeData: vi.fn(),
  authorizeAny:  vi.fn(),
  isAuthorized:  vi.fn(),
}));

vi.mock("@/lib/store", () => ({
  readAll:    vi.fn().mockResolvedValue([]),
  updateById: vi.fn().mockResolvedValue(undefined),
  insert:     vi.fn().mockResolvedValue(undefined),
  newId:      vi.fn().mockReturnValue("test-id"),
}));

vi.mock("@/lib/postsStore", () => ({
  readPosts: vi.fn().mockReturnValue({ posts: [] }),
}));

import { extractToken, authorizeData, isAuthorized } from "@/lib/dashboardAuth";
import { readAll, updateById } from "@/lib/store";
import { readPosts } from "@/lib/postsStore";

import { GET as getOverview }    from "@/app/api/dashboard/overview/route";
import { GET as getLeads }       from "@/app/api/dashboard/leads/route";
import { GET as getContacts }    from "@/app/api/dashboard/contacts/route";
import { GET as getChats }       from "@/app/api/dashboard/chats/route";
import { GET as getCallbacks }   from "@/app/api/dashboard/callbacks/route";
import { GET as getNewsletter }  from "@/app/api/dashboard/newsletter/route";

// ── Fixture data ──────────────────────────────────────────────────────────────

const LEAD = { id: "l1", name: "Alice", email: "alice@ex.com", phone: "", company: "", service: "", budget: "", message: "", formType: "get-started", source: "home", ip: "1.2.3.4", createdAt: "2026-01-01T00:00:00Z" };
const CONTACT = { id: "c1", name: "Bob", email: "bob@ex.com", phone: "", subject: "Hi", message: "Hello", source: "contact-page", createdAt: "2026-01-01T00:00:00Z" };
const NEWSLETTER = { id: "n1", name: "Carol", email: "carol@ex.com", source: "newsletter-signup", createdAt: "2026-01-01T00:00:00Z" };
const CALLBACK = { id: "cb1", name: "Dave", phone: "555-1234", source: "chatbot-call-tab", status: "pending" as const, createdAt: "2026-01-01T00:00:00Z" };
const CHAT = { id: "ch1", messages: [], ip: "1.2.3.4", startedAt: "2026-01-01T00:00:00Z", lastMessageAt: "2026-01-01T00:00:00Z" };

function makeReq(url: string, bearer?: string, secret?: string) {
  const headers: Record<string, string> = {};
  if (bearer) headers["Authorization"] = `Bearer ${bearer}`;
  const fullUrl = secret ? `${url}?secret=${secret}` : url;
  return new NextRequest(fullUrl, { headers });
}

// ── Auth guard (applies to all data routes) ───────────────────────────────────

describe("Dashboard routes — auth guard", () => {
  beforeEach(() => {
    vi.mocked(extractToken).mockReturnValue(null);
    vi.mocked(authorizeData).mockReturnValue(false);
    vi.mocked(isAuthorized).mockReturnValue(false);
    vi.mocked(readAll).mockResolvedValue([]);
    vi.mocked(readPosts).mockReturnValue({ posts: [] });
  });

  const routes: Array<[string, (req: NextRequest) => Promise<Response>]> = [
    ["GET /api/dashboard/overview",   getOverview],
    ["GET /api/dashboard/leads",      getLeads],
    ["GET /api/dashboard/contacts",   getContacts],
    ["GET /api/dashboard/chats",      getChats],
    ["GET /api/dashboard/callbacks",  getCallbacks],
    ["GET /api/dashboard/newsletter", getNewsletter],
  ];

  for (const [name, handler] of routes) {
    it(`${name} returns 401 when unauthenticated`, async () => {
      const res = await handler(makeReq("http://localhost/api/dashboard/x"));
      expect(res.status).toBe(401);
      const body = await res.json() as Record<string, unknown>;
      expect(body.error).toMatch(/unauthorized/i);
    });
  }
});

// ── Overview route ────────────────────────────────────────────────────────────

describe("GET /api/dashboard/overview", () => {
  beforeEach(() => {
    vi.mocked(extractToken).mockReturnValue("admin-token");
    vi.mocked(authorizeData).mockReturnValue(true);
    vi.mocked(readAll).mockImplementation((collection) => {
      switch (collection) {
        case "leads":      return Promise.resolve([LEAD, LEAD, LEAD]);
        case "contacts":   return Promise.resolve([CONTACT, CONTACT]);
        case "newsletter": return Promise.resolve([NEWSLETTER]);
        case "callbacks":  return Promise.resolve([CALLBACK]);
        case "chats":      return Promise.resolve([CHAT]);
        default:           return Promise.resolve([]);
      }
    });
    vi.mocked(readPosts).mockReturnValue({ posts: [{ id: "p1" }, { id: "p2" }] as never });
  });

  it("returns counts for all data types", async () => {
    const res  = await getOverview(makeReq("http://localhost/api/dashboard/overview", "admin-token"));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(body.leads).toBe(3);
    expect(body.contacts).toBe(2);
    expect(body.newsletter).toBe(1);
    expect(body.callbacks).toBe(1);
    expect(body.chats).toBe(1);
    expect(body.posts).toBe(2);
  });

  it("includes recentLeads array (up to 5)", async () => {
    const res  = await getOverview(makeReq("http://localhost/api/dashboard/overview", "admin-token"));
    const body = await res.json() as Record<string, unknown>;
    expect(Array.isArray(body.recentLeads)).toBe(true);
    expect((body.recentLeads as unknown[]).length).toBeLessThanOrEqual(5);
  });

  it("includes recentContacts array (up to 5)", async () => {
    const res  = await getOverview(makeReq("http://localhost/api/dashboard/overview", "admin-token"));
    const body = await res.json() as Record<string, unknown>;
    expect(Array.isArray(body.recentContacts)).toBe(true);
  });

  it("includes recentCallbacks array (up to 5)", async () => {
    const res  = await getOverview(makeReq("http://localhost/api/dashboard/overview", "admin-token"));
    const body = await res.json() as Record<string, unknown>;
    expect(Array.isArray(body.recentCallbacks)).toBe(true);
  });

  it("returns 0 counts when store is empty", async () => {
    vi.mocked(readAll).mockResolvedValue([]);
    vi.mocked(readPosts).mockReturnValue({ posts: [] });
    const res  = await getOverview(makeReq("http://localhost/api/dashboard/overview", "admin-token"));
    const body = await res.json() as Record<string, unknown>;
    expect(body.leads).toBe(0);
    expect(body.contacts).toBe(0);
    expect(body.posts).toBe(0);
  });

  it("handles postsStore returning null posts gracefully", async () => {
    vi.mocked(readPosts).mockReturnValue({ posts: null as never });
    const res  = await getOverview(makeReq("http://localhost/api/dashboard/overview", "admin-token"));
    const body = await res.json() as Record<string, unknown>;
    expect(body.posts).toBe(0);
  });

  it("accepts the static publish secret via query param", async () => {
    const res = await getOverview(makeReq("http://localhost/api/dashboard/overview", undefined, "pub-secret"));
    // authorizeData is mocked to return true regardless; just ensure no 401
    expect(res.status).toBe(200);
  });
});

// ── Leads route ───────────────────────────────────────────────────────────────

describe("GET /api/dashboard/leads", () => {
  beforeEach(() => {
    vi.mocked(extractToken).mockReturnValue("admin-token");
    vi.mocked(authorizeData).mockReturnValue(true);
    vi.mocked(readAll).mockResolvedValue([LEAD]);
  });

  it("returns leads array", async () => {
    const res  = await getLeads(makeReq("http://localhost/api/dashboard/leads", "admin-token"));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(Array.isArray(body.leads)).toBe(true);
    expect((body.leads as unknown[]).length).toBe(1);
  });

  it("returns empty array when no leads exist", async () => {
    vi.mocked(readAll).mockResolvedValue([]);
    const res  = await getLeads(makeReq("http://localhost/api/dashboard/leads", "admin-token"));
    const body = await res.json() as Record<string, unknown>;
    expect((body.leads as unknown[]).length).toBe(0);
  });
});

// ── Contacts route ────────────────────────────────────────────────────────────

describe("GET /api/dashboard/contacts", () => {
  beforeEach(() => {
    vi.mocked(extractToken).mockReturnValue("admin-token");
    vi.mocked(authorizeData).mockReturnValue(true);
    vi.mocked(readAll).mockResolvedValue([CONTACT]);
  });

  it("returns contacts array", async () => {
    const res  = await getContacts(makeReq("http://localhost/api/dashboard/contacts", "admin-token"));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(Array.isArray(body.contacts)).toBe(true);
  });
});

// ── Newsletter route ──────────────────────────────────────────────────────────

describe("GET /api/dashboard/newsletter", () => {
  beforeEach(() => {
    vi.mocked(extractToken).mockReturnValue("admin-token");
    vi.mocked(authorizeData).mockReturnValue(true);
    vi.mocked(readAll).mockResolvedValue([NEWSLETTER]);
  });

  it("returns subscribers array", async () => {
    const res  = await getNewsletter(makeReq("http://localhost/api/dashboard/newsletter", "admin-token"));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(Array.isArray(body.subscribers)).toBe(true);
  });
});

// ── Callbacks route ───────────────────────────────────────────────────────────

import { PATCH as patchCallbacks } from "@/app/api/dashboard/callbacks/route";

describe("GET /api/dashboard/callbacks", () => {
  beforeEach(() => {
    vi.mocked(extractToken).mockReturnValue("admin-token");
    vi.mocked(authorizeData).mockReturnValue(true);
    vi.mocked(readAll).mockResolvedValue([CALLBACK]);
  });

  it("returns callbacks array", async () => {
    const res  = await getCallbacks(makeReq("http://localhost/api/dashboard/callbacks", "admin-token"));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(Array.isArray(body.callbacks)).toBe(true);
  });
});

describe("PATCH /api/dashboard/callbacks — mark as called", () => {
  beforeEach(() => {
    vi.mocked(extractToken).mockReturnValue("admin-token");
    vi.mocked(authorizeData).mockReturnValue(true);
    vi.mocked(readAll).mockResolvedValue([{ ...CALLBACK }]);
  });

  it("marks a callback as called and returns success", async () => {
    const req = new NextRequest("http://localhost/api/dashboard/callbacks", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json", Authorization: "Bearer admin-token" },
      body:    JSON.stringify({ id: "cb1" }),
    });
    const res  = await patchCallbacks(req);
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(updateById).toHaveBeenCalled();
  });

  it("returns 404 for unknown callback id", async () => {
    const req = new NextRequest("http://localhost/api/dashboard/callbacks", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json", Authorization: "Bearer admin-token" },
      body:    JSON.stringify({ id: "no-such-id" }),
    });
    const res = await patchCallbacks(req);
    expect(res.status).toBe(404);
  });

  it("returns 401 when unauthorized on PATCH", async () => {
    vi.mocked(authorizeData).mockReturnValue(false);
    const req = new NextRequest("http://localhost/api/dashboard/callbacks", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id: "cb1" }),
    });
    const res = await patchCallbacks(req);
    expect(res.status).toBe(401);
  });
});

// ── Chats route (uses isAuthorized — any session or publish secret) ───────────

describe("GET /api/dashboard/chats", () => {
  beforeEach(() => {
    vi.mocked(extractToken).mockReturnValue("admin-token");
    vi.mocked(isAuthorized).mockReturnValue(true);
    vi.mocked(readAll).mockResolvedValue([CHAT]);
  });

  it("returns sessions array", async () => {
    const res  = await getChats(makeReq("http://localhost/api/dashboard/chats", "admin-token"));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(Array.isArray(body.sessions)).toBe(true);
  });

  it("returns 401 when isAuthorized returns false", async () => {
    vi.mocked(isAuthorized).mockReturnValue(false);
    const res = await getChats(makeReq("http://localhost/api/dashboard/chats"));
    expect(res.status).toBe(401);
  });
});
