/**
 * Tests for POST /api/blog/newsletter/send
 *
 * Covers: auth guard, email-not-configured, missing subject/body/subscribers,
 *         successful send with 2 subscribers.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/lib/store", () => ({
  insert:     vi.fn().mockResolvedValue(undefined),
  readAll:    vi.fn().mockResolvedValue([]),
  removeById: vi.fn().mockResolvedValue(undefined),
  newId:      vi.fn().mockReturnValue("test-id"),
}));

vi.mock("@/lib/dashboardAuth", () => ({
  extractToken:   vi.fn().mockReturnValue("token"),
  requireRole: vi.fn().mockResolvedValue({ userId: "admin-id", username: "admin", role: "admin" }),
}));

vi.mock("@/lib/newsletterEmail", () => ({
  isNewsletterEmailConfigured: vi.fn().mockReturnValue(true),
  sendNewsletter: vi.fn().mockResolvedValue({ sent: 2, failed: 0, errors: [] }),
}));

import { readAll } from "@/lib/store";
import { extractToken, requireRole } from "@/lib/dashboardAuth";
import { isNewsletterEmailConfigured, sendNewsletter } from "@/lib/newsletterEmail";
import { POST } from "@/app/api/blog/newsletter/send/route";

// ── Helpers ───────────────────────────────────────────────────────────────────

function postReq(body: unknown) {
  return new NextRequest("http://localhost/api/blog/newsletter/send", {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": "Bearer admin-token",
    },
    body: JSON.stringify(body),
  });
}

const SUBSCRIBERS = [
  { id: "s1", name: "Alice", email: "alice@example.com", whatsapp: "", whatsappOptIn: false, source: "newsletter-signup", createdAt: "" },
  { id: "s2", name: "Bob",   email: "bob@example.com",   whatsapp: "", whatsappOptIn: false, source: "newsletter-signup", createdAt: "" },
];

beforeEach(() => {
  vi.mocked(requireRole).mockResolvedValue({ userId: "admin-id", username: "admin", role: "admin" });
  vi.mocked(isNewsletterEmailConfigured).mockReturnValue(true);
  vi.mocked(readAll).mockResolvedValue(SUBSCRIBERS as never);
  vi.mocked(sendNewsletter).mockResolvedValue({ sent: 2, failed: 0, errors: [] });
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/blog/newsletter/send", () => {

  it("returns 403 without auth", async () => {
    vi.mocked(requireRole).mockResolvedValue(null);

    const res  = await POST(postReq({ subject: "Hello", bodyHtml: "<p>Hi</p>" }));
    const body = await res.json() as Record<string, unknown>;

    expect(res.status).toBe(403);
    expect(body.error).toBeTruthy();
  });

  it("returns 503 when email not configured (GMAIL_FROM_EMAIL unset)", async () => {
    vi.mocked(isNewsletterEmailConfigured).mockReturnValue(false);

    const res  = await POST(postReq({ subject: "Hello", bodyHtml: "<p>Hi</p>" }));
    const body = await res.json() as Record<string, unknown>;

    expect(res.status).toBe(503);
    expect(body.error).toMatch(/not configured/i);
  });

  it("returns 400 when subject is missing", async () => {
    const res  = await POST(postReq({ bodyHtml: "<p>Hi</p>" }));
    const body = await res.json() as Record<string, unknown>;

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/subject/i);
  });

  it("returns 400 when bodyHtml is missing", async () => {
    const res  = await POST(postReq({ subject: "Hello" }));
    const body = await res.json() as Record<string, unknown>;

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/body/i);
  });

  it("returns 400 when there are no subscribers", async () => {
    vi.mocked(readAll).mockResolvedValue([]);

    const res  = await POST(postReq({ subject: "Hello", bodyHtml: "<p>Hi</p>" }));
    const body = await res.json() as Record<string, unknown>;

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/no subscribers/i);
  });

  it("calls sendNewsletter and returns { success, sent, failed, total } for 2 subscribers", async () => {
    const res  = await POST(postReq({ subject: "Monthly Update", bodyHtml: "<p>News!</p>" }));
    const body = await res.json() as Record<string, unknown>;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.sent).toBe(2);
    expect(body.failed).toBe(0);
    expect(body.total).toBe(2);

    expect(vi.mocked(sendNewsletter)).toHaveBeenCalledOnce();
    expect(vi.mocked(sendNewsletter)).toHaveBeenCalledWith("Monthly Update", "<p>News!</p>", SUBSCRIBERS);
  });
});
