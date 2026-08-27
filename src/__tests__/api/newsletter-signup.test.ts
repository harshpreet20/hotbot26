/**
 * Tests for POST /api/forms/newsletter
 *
 * Covers: valid signup, whatsappOptIn, duplicate email, missing/invalid email,
 *         rate limiting, CRM lead creation.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/lib/store", () => ({
  insert:     vi.fn().mockResolvedValue(undefined),
  readAll:    vi.fn().mockResolvedValue([]),
  removeById: vi.fn().mockResolvedValue(undefined),
  newId:      vi.fn().mockReturnValue("test-id"),
}));

vi.mock("@/lib/rateLimit", () => ({
  rateLimitResponse: vi.fn().mockResolvedValue(null),
}));

import { insert, readAll, newId } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import { POST } from "@/app/api/forms/newsletter/route";

// ── Helpers ───────────────────────────────────────────────────────────────────

function postReq(body: unknown, ip = "1.2.3.4") {
  return new NextRequest("http://localhost/api/forms/newsletter", {
    method:  "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body:    JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.mocked(readAll).mockResolvedValue([]);
  vi.mocked(rateLimitResponse).mockResolvedValue(null);
  vi.mocked(newId).mockReturnValue("test-id");
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/forms/newsletter", () => {

  it("inserts a NewsletterSubscriber AND a Lead for valid email", async () => {
    const res  = await POST(postReq({ email: "user@example.com", name: "Test User" }));
    const body = await res.json() as Record<string, unknown>;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);

    // insert called twice: once for newsletter, once for leads
    expect(vi.mocked(insert)).toHaveBeenCalledTimes(2);

    const [firstCall, secondCall] = vi.mocked(insert).mock.calls;
    expect(firstCall[0]).toBe("newsletter");
    expect((firstCall[1] as Record<string, unknown>).email).toBe("user@example.com");

    expect(secondCall[0]).toBe("leads");
    expect((secondCall[1] as Record<string, unknown>).email).toBe("user@example.com");
  });

  it("stores whatsapp in subscriber AND Lead.phone AND adds whatsapp-opted-in tag when whatsappOptIn=true", async () => {
    const res = await POST(postReq({
      email:         "wa@example.com",
      name:          "WA User",
      whatsapp:      "+1234567890",
      whatsappOptIn: true,
    }));
    expect(res.status).toBe(200);

    const calls = vi.mocked(insert).mock.calls;

    // Subscriber record
    const subRecord = calls[0][1] as Record<string, unknown>;
    expect(subRecord.whatsapp).toBe("+1234567890");
    expect(subRecord.whatsappOptIn).toBe(true);

    // Lead record
    const leadRecord = calls[1][1] as Record<string, unknown>;
    expect(leadRecord.phone).toBe("+1234567890");
    expect((leadRecord.tags as string[])).toContain("whatsapp-opted-in");
  });

  it("stores empty whatsapp in subscriber, Lead has no whatsapp-opted-in tag when whatsappOptIn=false", async () => {
    const res = await POST(postReq({
      email:         "noopt@example.com",
      name:          "No Opt User",
      whatsapp:      "+9876543210",
      whatsappOptIn: false,
    }));
    expect(res.status).toBe(200);

    const calls = vi.mocked(insert).mock.calls;

    const subRecord  = calls[0][1] as Record<string, unknown>;
    expect(subRecord.whatsapp).toBe("");
    expect(subRecord.whatsappOptIn).toBe(false);

    const leadRecord = calls[1][1] as Record<string, unknown>;
    expect(leadRecord.phone).toBe("");
    expect((leadRecord.tags as string[])).not.toContain("whatsapp-opted-in");
  });

  it("returns { success: true, message: \"You're already subscribed!\" } for duplicate email and does NOT insert again", async () => {
    vi.mocked(readAll).mockResolvedValue([
      {
        id:            "existing-id",
        name:          "Old User",
        email:         "dup@example.com",
        whatsapp:      "",
        whatsappOptIn: false,
        source:        "newsletter-signup",
        createdAt:     new Date().toISOString(),
      },
    ] as never);

    const res  = await POST(postReq({ email: "dup@example.com" }));
    const body = await res.json() as Record<string, unknown>;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("You're already subscribed!");
    expect(vi.mocked(insert)).not.toHaveBeenCalled();
  });

  it("returns 400 when email is missing", async () => {
    const res  = await POST(postReq({ name: "No Email" }));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(400);
    expect(body.error).toBeTruthy();
  });

  it("returns 400 for invalid email format", async () => {
    const res  = await POST(postReq({ email: "not-an-email" }));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(400);
    expect(body.error).toBeTruthy();
  });

  it("returns 429 on second POST from same IP within 60s (rate limited)", async () => {
    const { NextResponse } = await import("next/server");
    vi.mocked(rateLimitResponse).mockResolvedValueOnce(
      NextResponse.json({ error: "Too many requests. Please slow down and try again." }, { status: 429 }),
    );

    const res = await POST(postReq({ email: "rate@example.com" }, "5.5.5.5"));
    expect(res.status).toBe(429);
    expect(vi.mocked(insert)).not.toHaveBeenCalled();
  });
});
