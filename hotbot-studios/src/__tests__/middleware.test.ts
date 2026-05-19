/**
 * Unit tests — src/middleware.ts
 *
 * Tests: cookie guard for /enter/backdrop/dashboard,
 *        redirect behaviour, pass-through for non-dashboard paths
 */
import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

const COOKIE_NAME = "backdrop_auth";

function makeReq(pathname: string, cookieValue?: string) {
  const url = `http://localhost${pathname}`;
  const headers: Record<string, string> = {};
  if (cookieValue) {
    headers["Cookie"] = `${COOKIE_NAME}=${cookieValue}`;
  }
  return new NextRequest(url, { headers });
}

// ── Pass-through for non-dashboard paths ──────────────────────────────────────

describe("middleware — non-dashboard paths", () => {
  const publicPaths = [
    "/",
    "/about",
    "/services",
    "/blog",
    "/enter/backdrop",           // login page itself must NOT be guarded
    "/enter/backdrop/something", // only /dashboard sub-tree is protected
    "/api/blog/auth",
    "/api/n8n/form",
  ];

  for (const path of publicPaths) {
    it(`passes through ${path} without redirect`, () => {
      const res = middleware(makeReq(path));
      // NextResponse.next() has no Location header
      expect(res.headers.get("location")).toBeNull();
      expect(res.status).toBe(200);
    });
  }
});

// ── Dashboard paths without cookie → redirect to login ───────────────────────

describe("middleware — dashboard paths without cookie", () => {
  const dashboardPaths = [
    "/enter/backdrop/dashboard",
    "/enter/backdrop/dashboard/leads",
    "/enter/backdrop/dashboard/contacts",
    "/enter/backdrop/dashboard/chats",
    "/enter/backdrop/dashboard/blog",
    "/enter/backdrop/dashboard/users",
    "/enter/backdrop/dashboard/settings",
  ];

  for (const path of dashboardPaths) {
    it(`redirects ${path} to /enter/backdrop when no cookie`, () => {
      const res = middleware(makeReq(path));
      expect(res.status).toBe(307); // Next.js redirect default
      const location = res.headers.get("location") ?? "";
      expect(location).toContain("/enter/backdrop");
      expect(location).not.toContain("/dashboard");
    });
  }
});

// ── Dashboard paths with valid cookie → pass through ─────────────────────────

describe("middleware — dashboard paths with cookie present", () => {
  it("passes through /enter/backdrop/dashboard when cookie is set", () => {
    const res = middleware(makeReq("/enter/backdrop/dashboard", "some-token-value"));
    expect(res.headers.get("location")).toBeNull();
    expect(res.status).toBe(200);
  });

  it("passes through nested dashboard path when cookie is set", () => {
    const res = middleware(makeReq("/enter/backdrop/dashboard/leads", "tok123"));
    expect(res.headers.get("location")).toBeNull();
    expect(res.status).toBe(200);
  });
});

// ── Redirect target correctness ───────────────────────────────────────────────

describe("middleware — redirect target", () => {
  it("redirect clears search params (no ?return= leakage)", () => {
    const req = new NextRequest(
      "http://localhost/enter/backdrop/dashboard?foo=bar",
    );
    const res = middleware(req);
    const location = res.headers.get("location") ?? "";
    expect(location).not.toContain("foo=bar");
    expect(location).not.toContain("?");
  });

  it("redirect preserves the host", () => {
    const res = middleware(makeReq("/enter/backdrop/dashboard"));
    const location = res.headers.get("location") ?? "";
    expect(location).toContain("localhost");
  });
});
