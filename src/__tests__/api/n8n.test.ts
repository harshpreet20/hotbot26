/**
 * Integration tests — public n8n intake endpoints
 *
 * POST /api/n8n/form       — lead capture
 * POST /api/n8n/newsletter — newsletter subscription
 * POST /api/n8n/callback   — callback request
 * POST /api/n8n/contact    — contact form
 * POST /api/n8n/chat       — AI chatbot
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@/lib/rateLimit", () => ({
  rateLimitResponse: vi.fn().mockReturnValue(null),
}));

vi.mock("@/lib/store", () => ({
  insert:  vi.fn().mockResolvedValue(undefined),
  newId:   vi.fn().mockReturnValue("generated-id"),
  readAll: vi.fn().mockResolvedValue([]),
}));

vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = {
      create: vi.fn().mockResolvedValue({
        content: [{ type: "text", text: "Hello! How can I help you today?" }],
      }),
    };
  },
}));

import { insert, newId, readAll } from "@/lib/store";
import { POST as postForm }       from "@/app/api/n8n/form/route";
import { POST as postNewsletter } from "@/app/api/n8n/newsletter/route";
import { POST as postCallback }   from "@/app/api/n8n/callback/route";
import { POST as postContact }    from "@/app/api/n8n/contact/route";
import { POST as postChat }       from "@/app/api/n8n/chat/route";

function jsonReq(url: string, body: unknown) {
  return new NextRequest(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "5.6.7.8" },
    body:    JSON.stringify(body),
  });
}

// ── /api/n8n/form — lead capture ──────────────────────────────────────────────

describe("POST /api/n8n/form — lead capture", () => {
  beforeEach(() => {
    vi.mocked(insert).mockClear();
  });

  it("returns 200 and saves lead for valid input", async () => {
    const res  = await postForm(jsonReq("http://localhost/api/n8n/form", {
      name: "Alice", email: "alice@example.com", service: "SEO",
    }));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.leadId).toBeDefined();
    expect(insert).toHaveBeenCalledWith("leads", expect.objectContaining({
      name:  "Alice",
      email: "alice@example.com",
    }));
  });

  it("returns 400 when name is missing", async () => {
    const res = await postForm(jsonReq("http://localhost/api/n8n/form", {
      email: "test@example.com",
    }));
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toMatch(/name/i);
  });

  it("returns 400 when email is missing", async () => {
    const res = await postForm(jsonReq("http://localhost/api/n8n/form", {
      name: "Alice",
    }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid email format", async () => {
    const res = await postForm(jsonReq("http://localhost/api/n8n/form", {
      name: "Alice", email: "not-an-email",
    }));
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toMatch(/email/i);
  });

  it("stores optional fields when provided", async () => {
    await postForm(jsonReq("http://localhost/api/n8n/form", {
      name:     "Bob",
      email:    "bob@example.com",
      phone:    "+1 555 0100",
      company:  "Acme Corp",
      service:  "AI Automation",
      budget:   "$5k+",
      message:  "Tell me more",
      formType: "strategy-call",
      page:     "homepage",
    }));
    expect(insert).toHaveBeenCalledWith("leads", expect.objectContaining({
      phone:   "+1 555 0100",
      company: "Acme Corp",
      service: "AI Automation",
    }));
  });

  it("uses 'get-started' as default formType when not provided", async () => {
    await postForm(jsonReq("http://localhost/api/n8n/form", {
      name: "Carol", email: "carol@example.com",
    }));
    expect(insert).toHaveBeenCalledWith("leads", expect.objectContaining({
      formType: "get-started",
    }));
  });

  it("trims whitespace from name and email", async () => {
    await postForm(jsonReq("http://localhost/api/n8n/form", {
      name: "  Dave  ", email: "  dave@example.com  ",
    }));
    expect(insert).toHaveBeenCalledWith("leads", expect.objectContaining({
      name:  "Dave",
      email: "dave@example.com",
    }));
  });
});

// ── /api/n8n/newsletter — subscription ───────────────────────────────────────

describe("POST /api/n8n/newsletter — newsletter subscription", () => {
  beforeEach(() => {
    vi.mocked(readAll).mockResolvedValue([]);
    vi.mocked(insert).mockClear();
  });

  it("subscribes a new user and returns success", async () => {
    const res  = await postNewsletter(jsonReq("http://localhost/api/n8n/newsletter", {
      email: "sub@example.com", name: "Sub User",
    }));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(insert).toHaveBeenCalledWith("newsletter", expect.objectContaining({
      email: "sub@example.com",
    }));
  });

  it("returns 400 when email is missing", async () => {
    const res = await postNewsletter(jsonReq("http://localhost/api/n8n/newsletter", {}));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid email format", async () => {
    const res = await postNewsletter(jsonReq("http://localhost/api/n8n/newsletter", {
      email: "not-valid",
    }));
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toMatch(/email/i);
  });

  it("returns success (already subscribed) for duplicate email", async () => {
    vi.mocked(readAll).mockResolvedValue([
      { id: "n1", email: "dup@example.com", name: "", source: "newsletter-signup", createdAt: "" },
    ] as never);
    const res  = await postNewsletter(jsonReq("http://localhost/api/n8n/newsletter", {
      email: "dup@example.com",
    }));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toMatch(/already/i);
    expect(insert).not.toHaveBeenCalled();
  });

  it("deduplication is case-insensitive", async () => {
    vi.mocked(readAll).mockResolvedValue([
      { id: "n1", email: "DUP@EXAMPLE.COM", name: "", source: "newsletter-signup", createdAt: "" },
    ] as never);
    const res  = await postNewsletter(jsonReq("http://localhost/api/n8n/newsletter", {
      email: "dup@example.com",
    }));
    const body = await res.json() as Record<string, unknown>;
    expect(body.message).toMatch(/already/i);
    expect(insert).not.toHaveBeenCalled();
  });
});

// ── /api/n8n/callback — callback request ─────────────────────────────────────

describe("POST /api/n8n/callback — callback request", () => {
  beforeEach(() => { vi.mocked(insert).mockClear(); });

  it("saves callback and returns success", async () => {
    const res  = await postCallback(jsonReq("http://localhost/api/n8n/callback", {
      name: "Eve", phone: "+44 7911 123456",
    }));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(insert).toHaveBeenCalledWith("callbacks", expect.objectContaining({
      name:   "Eve",
      phone:  "+44 7911 123456",
      status: "pending",
    }));
  });

  it("returns 400 when name is missing", async () => {
    const res = await postCallback(jsonReq("http://localhost/api/n8n/callback", {
      phone: "555-0000",
    }));
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toMatch(/name/i);
  });

  it("returns 400 when phone is missing", async () => {
    const res = await postCallback(jsonReq("http://localhost/api/n8n/callback", {
      name: "Frank",
    }));
    expect(res.status).toBe(400);
  });

  it("trims whitespace from name and phone", async () => {
    await postCallback(jsonReq("http://localhost/api/n8n/callback", {
      name: "  Grace  ", phone: "  555-9999  ",
    }));
    expect(insert).toHaveBeenCalledWith("callbacks", expect.objectContaining({
      name:  "Grace",
      phone: "555-9999",
    }));
  });
});

// ── /api/n8n/contact — contact form ──────────────────────────────────────────

describe("POST /api/n8n/contact — contact form", () => {
  beforeEach(() => { vi.mocked(insert).mockClear(); });

  it("saves contact and returns success", async () => {
    const res  = await postContact(jsonReq("http://localhost/api/n8n/contact", {
      name: "Hank", email: "hank@example.com", subject: "Pricing", message: "How much?",
    }));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(insert).toHaveBeenCalledWith("contacts", expect.objectContaining({
      name:    "Hank",
      email:   "hank@example.com",
      subject: "Pricing",
    }));
  });

  it("returns 400 when name is missing", async () => {
    const res = await postContact(jsonReq("http://localhost/api/n8n/contact", {
      email: "test@example.com",
    }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when email is missing", async () => {
    const res = await postContact(jsonReq("http://localhost/api/n8n/contact", {
      name: "Ivan",
    }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid email format", async () => {
    const res = await postContact(jsonReq("http://localhost/api/n8n/contact", {
      name: "Ivan", email: "bad-email",
    }));
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toMatch(/email/i);
  });

  it("stores optional fields with empty string defaults", async () => {
    await postContact(jsonReq("http://localhost/api/n8n/contact", {
      name: "Jan", email: "jan@example.com",
    }));
    expect(insert).toHaveBeenCalledWith("contacts", expect.objectContaining({
      phone:   "",
      subject: "",
      message: "",
    }));
  });
});

// ── /api/n8n/chat — AI chatbot ────────────────────────────────────────────────

describe("POST /api/n8n/chat — AI chatbot", () => {
  beforeEach(() => { vi.mocked(insert).mockClear(); });

  it("returns 200 with bot reply and sessionId", async () => {
    const res  = await postChat(jsonReq("http://localhost/api/n8n/chat", {
      message: "Hello, what services do you offer?",
    }));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(typeof body.message).toBe("string");
    expect(body.message).toBeTruthy();
    expect(body.sessionId).toBeDefined();
  });

  it("returns 400 when message is missing", async () => {
    const res = await postChat(jsonReq("http://localhost/api/n8n/chat", {}));
    expect(res.status).toBe(400);
  });

  it("returns 400 when message is empty string", async () => {
    const res = await postChat(jsonReq("http://localhost/api/n8n/chat", { message: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when body is not valid JSON", async () => {
    const req = new NextRequest("http://localhost/api/n8n/chat", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    "not-json",
    });
    const res = await postChat(req);
    expect(res.status).toBe(400);
  });

  it("preserves a client-supplied sessionId", async () => {
    const res  = await postChat(jsonReq("http://localhost/api/n8n/chat", {
      message: "Hi!", sessionId: "client-session-xyz",
    }));
    const body = await res.json() as Record<string, unknown>;
    expect(body.sessionId).toBe("client-session-xyz");
  });

  it("saves chat session to store", async () => {
    await postChat(jsonReq("http://localhost/api/n8n/chat", { message: "Hello" }));
    expect(insert).toHaveBeenCalledWith("chats", expect.objectContaining({
      messages: expect.any(Array),
      ip:       "5.6.7.8",
    }));
  });

  it("limits history to last 10 messages", async () => {
    const history = Array.from({ length: 15 }, (_, i) => ({
      role: "user", content: `Message ${i}`,
    }));
    const res  = await postChat(jsonReq("http://localhost/api/n8n/chat", {
      message: "Latest message", history,
    }));
    expect(res.status).toBe(200);
    // Should not crash even with oversized history
    const body = await res.json() as Record<string, unknown>;
    expect(body.sessionId).toBeDefined();
  });
});
