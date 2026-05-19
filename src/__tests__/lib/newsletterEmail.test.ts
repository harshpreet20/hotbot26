/**
 * Unit tests for src/lib/newsletterEmail.ts
 *
 * Covers: isNewsletterEmailConfigured, unsubToken, emailFromToken,
 *         generateNewsletterHtml, sendNewsletter (empty + 2 subscribers).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockSend = vi.fn().mockResolvedValue({ data: { id: "resend-test-id" }, error: null });

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}));

vi.mock("@/lib/supabase", () => ({
  isSupabaseEnabled: vi.fn().mockReturnValue(false),
  sb: vi.fn(),
}));

// Import the module under test AFTER mocks are set up
import {
  isNewsletterEmailConfigured,
  unsubToken,
  emailFromToken,
  generateNewsletterHtml,
  sendNewsletter,
} from "@/lib/newsletterEmail";
import type { NewsletterSubscriber } from "@/types/dashboard";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeSubscriber(email: string, name = ""): NewsletterSubscriber {
  return {
    id:            "s-" + email,
    name,
    email,
    whatsapp:      "",
    whatsappOptIn: false,
    source:        "newsletter-signup",
    createdAt:     new Date().toISOString(),
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("isNewsletterEmailConfigured()", () => {
  const origKey = process.env.RESEND_API_KEY;

  afterEach(() => {
    if (origKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = origKey;
  });

  it("returns false when RESEND_API_KEY is unset", () => {
    delete process.env.RESEND_API_KEY;
    expect(isNewsletterEmailConfigured()).toBe(false);
  });

  it("returns true when RESEND_API_KEY is set", () => {
    process.env.RESEND_API_KEY = "re_test_key";
    expect(isNewsletterEmailConfigured()).toBe(true);
  });
});

describe("unsubToken(email)", () => {
  it("returns the base64url encoding of the lowercased email", () => {
    const email    = "Alice@Example.COM";
    const expected = Buffer.from(email.toLowerCase()).toString("base64url");
    expect(unsubToken(email)).toBe(expected);
  });
});

describe("emailFromToken(token)", () => {
  it("round-trips correctly", () => {
    const email = "test@roundtrip.com";
    const token = unsubToken(email);
    expect(emailFromToken(token)).toBe(email);
  });

  it("returns null on garbage input that throws", () => {
    const spy = vi.spyOn(Buffer, "from").mockImplementationOnce(() => {
      throw new Error("decode error");
    });
    expect(emailFromToken("!!invalid!!")).toBeNull();
    spy.mockRestore();
  });
});

describe("generateNewsletterHtml(subject, bodyHtml, name, email)", () => {
  it("contains the subject", () => {
    const html = generateNewsletterHtml("My Subject", "<p>Body</p>", "John Doe", "john@example.com");
    expect(html).toContain("My Subject");
  });

  it("contains the greeting 'Hi FirstName,'", () => {
    const html = generateNewsletterHtml("Subject", "<p>Body</p>", "Jane Smith", "jane@example.com");
    expect(html).toContain("Hi Jane,");
  });

  it("contains an unsubscribe link", () => {
    const html  = generateNewsletterHtml("Subject", "<p>Body</p>", "Bob", "bob@example.com");
    const token = unsubToken("bob@example.com");
    expect(html).toContain(`token=${token}`);
    expect(html).toContain("Unsubscribe");
  });
});

describe("sendNewsletter()", () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = "re_test_key";
    mockSend.mockClear();
  });

  afterEach(() => {
    delete process.env.RESEND_API_KEY;
  });

  it("returns { sent: 0, failed: 0, errors: [] } without sending when subscriber list is empty", async () => {
    const result = await sendNewsletter("Hello", "<p>Hi</p>", []);
    expect(result).toEqual({ sent: 0, failed: 0, errors: [] });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("calls Resend send once per subscriber and increments sent count", async () => {
    const subscribers = [
      makeSubscriber("alice@example.com", "Alice"),
      makeSubscriber("bob@example.com",   "Bob"),
    ];

    const result = await sendNewsletter("Newsletter", "<p>Content</p>", subscribers);

    expect(result.sent).toBe(2);
    expect(result.failed).toBe(0);
    expect(result.errors).toHaveLength(0);
    expect(mockSend).toHaveBeenCalledTimes(2);
  });
});
