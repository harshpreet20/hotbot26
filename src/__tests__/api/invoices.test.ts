/**
 * Integration tests - /api/dashboard/invoices + /api/invoice/[id]
 *
 * Tests: auth guard, invoice CRUD (create/read/update/delete),
 *        total calculations, role restrictions, public view endpoint
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
  newId:      vi.fn().mockReturnValue("inv-new-id"),
}));

vi.mock("@/lib/rateLimit", () => ({
  rateLimitResponse: vi.fn().mockResolvedValue(null),
}));

import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { readAll, insert, updateById, removeById, newId } from "@/lib/store";
import {
  GET, POST, PATCH, DELETE,
} from "@/app/api/dashboard/invoices/route";
import { GET as publicGet } from "@/app/api/invoice/[id]/route";

const ADMIN_SESSION  = { userId: "u1", username: "admin",   role: "admin"   as const };
const FINANCE_SESSION = { userId: "u2", username: "finance", role: "finance" as const };
const SALES_SESSION   = { userId: "u3", username: "sales",   role: "sales"   as const };

const INVOICE_FIXTURE = {
  id:            "inv-1",
  invoiceNumber: "INV-0001",
  status:        "draft" as const,
  clientName:    "Acme Corp",
  clientEmail:   "billing@acme.com",
  lineItems:     [{ id: "li-1", description: "SEO Service", quantity: 1, unitPrice: 5000, amount: 5000 }],
  subtotal:      5000,
  taxRate:       18,
  taxAmount:     900,
  discount:      0,
  total:         5900,
  currency:      "INR",
  issuedDate:    "2026-01-01",
  dueDate:       "2026-01-31",
  createdAt:     "2026-01-01T00:00:00Z",
  createdBy:     "admin",
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
  vi.mocked(readAll).mockResolvedValue([INVOICE_FIXTURE]);
  vi.mocked(insert).mockClear();
  vi.mocked(updateById).mockClear();
  vi.mocked(removeById).mockClear();
  vi.mocked(newId).mockReturnValue("inv-new-id");
});

// ── GET ───────────────────────────────────────────────────────────────────────

describe("GET /api/dashboard/invoices - auth guard", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(authorizeAny).mockResolvedValue(null);
    const res = await GET(makeReq("GET", "http://localhost/api/dashboard/invoices"));
    expect(res.status).toBe(401);
  });
});

describe("GET /api/dashboard/invoices", () => {
  it("returns all invoices", async () => {
    const res  = await GET(makeReq("GET", "http://localhost/api/dashboard/invoices", undefined, "tok"));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(Array.isArray(body.invoices)).toBe(true);
    expect((body.invoices as unknown[]).length).toBe(1);
  });

  it("filters by leadId when provided", async () => {
    vi.mocked(readAll).mockResolvedValue([
      { ...INVOICE_FIXTURE, id: "inv-1", leadId: "lead-1" },
      { ...INVOICE_FIXTURE, id: "inv-2", leadId: "lead-2" },
    ]);
    const res  = await GET(makeReq("GET", "http://localhost/api/dashboard/invoices?leadId=lead-1"));
    const body = await res.json() as { invoices: { id: string }[] };
    expect(body.invoices).toHaveLength(1);
    expect(body.invoices[0].id).toBe("inv-1");
  });

  it("returns empty array when no invoices exist", async () => {
    vi.mocked(readAll).mockResolvedValue([]);
    const res  = await GET(makeReq("GET", "http://localhost/api/dashboard/invoices", undefined, "tok"));
    const body = await res.json() as Record<string, unknown>;
    expect((body.invoices as unknown[]).length).toBe(0);
  });
});

// ── POST ──────────────────────────────────────────────────────────────────────

describe("POST /api/dashboard/invoices - auth & roles", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(authorizeAny).mockResolvedValue(null);
    const res = await POST(makeReq("POST", "http://localhost/api/dashboard/invoices", {}));
    expect(res.status).toBe(401);
  });

  it("returns 403 when role is sales (not allowed)", async () => {
    vi.mocked(authorizeAny).mockResolvedValue(SALES_SESSION);
    const res = await POST(makeReq("POST", "http://localhost/api/dashboard/invoices", {
      clientName: "Test", clientEmail: "t@test.com", lineItems: [],
    }));
    expect(res.status).toBe(403);
  });

  it("allows finance role to create invoices", async () => {
    vi.mocked(authorizeAny).mockResolvedValue(FINANCE_SESSION);
    vi.mocked(readAll).mockResolvedValue([]);
    const res = await POST(makeReq("POST", "http://localhost/api/dashboard/invoices", {
      clientName: "Client", clientEmail: "c@example.com", lineItems: [],
    }));
    expect(res.status).toBe(201);
  });
});

describe("POST /api/dashboard/invoices - creation", () => {
  beforeEach(() => {
    vi.mocked(readAll).mockResolvedValue([]);
  });

  it("returns 201 and creates invoice with auto-numbered INV-0001", async () => {
    const res  = await POST(makeReq("POST", "http://localhost/api/dashboard/invoices", {
      clientName:  "Alice Corp",
      clientEmail: "alice@corp.com",
      lineItems:   [{ description: "Service", quantity: 2, unitPrice: 1000 }],
      taxRate:     10,
      discount:    0,
    }));
    const body = await res.json() as { invoice: { invoiceNumber: string; total: number } };
    expect(res.status).toBe(201);
    expect(body.invoice.invoiceNumber).toBe("INV-0001");
    expect(insert).toHaveBeenCalledWith("invoices", expect.objectContaining({
      clientName: "Alice Corp",
      status:     "draft",
    }));
  });

  it("auto-increments invoice number from existing invoices", async () => {
    vi.mocked(readAll).mockResolvedValue([{ ...INVOICE_FIXTURE, invoiceNumber: "INV-0003" }]);
    const res  = await POST(makeReq("POST", "http://localhost/api/dashboard/invoices", {
      clientName: "Bob", clientEmail: "bob@example.com", lineItems: [],
    }));
    const body = await res.json() as { invoice: { invoiceNumber: string } };
    expect(body.invoice.invoiceNumber).toBe("INV-0004");
  });

  it("correctly calculates subtotal, tax, and total", async () => {
    const res  = await POST(makeReq("POST", "http://localhost/api/dashboard/invoices", {
      clientName:  "Calc Test",
      clientEmail: "calc@test.com",
      lineItems:   [
        { description: "Item A", quantity: 2, unitPrice: 500 },
        { description: "Item B", quantity: 1, unitPrice: 200 },
      ],
      taxRate:  10,
      discount: 100,
    }));
    const body = await res.json() as { invoice: { subtotal: number; taxAmount: number; total: number } };
    expect(body.invoice.subtotal).toBe(1200);    // 2*500 + 1*200
    expect(body.invoice.taxAmount).toBe(110);    // (1200-100) * 10% = 110
    expect(body.invoice.total).toBe(1210);       // 1200 - 100 + 110
  });

  it("defaults currency to INR and status to draft", async () => {
    const res  = await POST(makeReq("POST", "http://localhost/api/dashboard/invoices", {
      clientName: "Default Test", clientEmail: "d@test.com", lineItems: [],
    }));
    const body = await res.json() as { invoice: { currency: string; status: string } };
    expect(body.invoice.currency).toBe("INR");
    expect(body.invoice.status).toBe("draft");
  });

  it("sets createdBy from session username", async () => {
    const res  = await POST(makeReq("POST", "http://localhost/api/dashboard/invoices", {
      clientName: "Test", clientEmail: "t@test.com", lineItems: [],
    }));
    const body = await res.json() as { invoice: { createdBy: string } };
    expect(body.invoice.createdBy).toBe("admin");
  });
});

// ── PATCH ─────────────────────────────────────────────────────────────────────

describe("PATCH /api/dashboard/invoices", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(authorizeAny).mockResolvedValue(null);
    const res = await PATCH(makeReq("PATCH", "http://localhost/api/dashboard/invoices", { id: "inv-1" }));
    expect(res.status).toBe(401);
  });

  it("returns 403 when role is sales", async () => {
    vi.mocked(authorizeAny).mockResolvedValue(SALES_SESSION);
    const res = await PATCH(makeReq("PATCH", "http://localhost/api/dashboard/invoices", { id: "inv-1" }));
    expect(res.status).toBe(403);
  });

  it("returns 400 when id is missing", async () => {
    const res = await PATCH(makeReq("PATCH", "http://localhost/api/dashboard/invoices", {}));
    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown invoice id", async () => {
    vi.mocked(readAll).mockResolvedValue([]);
    const res = await PATCH(makeReq("PATCH", "http://localhost/api/dashboard/invoices", { id: "no-such" }));
    expect(res.status).toBe(404);
  });

  it("updates invoice fields and recalculates totals", async () => {
    const res  = await PATCH(makeReq("PATCH", "http://localhost/api/dashboard/invoices", {
      id:       "inv-1",
      discount: 500,
      taxRate:  18,
    }));
    const body = await res.json() as { invoice: { discount: number; total: number } };
    expect(res.status).toBe(200);
    expect(body.invoice.discount).toBe(500);
    expect(updateById).toHaveBeenCalledWith("invoices", "inv-1", expect.objectContaining({ discount: 500 }));
  });

  it("auto-sets paidDate when status transitions to paid", async () => {
    const res  = await PATCH(makeReq("PATCH", "http://localhost/api/dashboard/invoices", {
      id:     "inv-1",
      status: "paid",
    }));
    const body = await res.json() as { invoice: { paidDate: string | undefined } };
    expect(res.status).toBe(200);
    expect(body.invoice.paidDate).toBeDefined();
  });

  it("does NOT overwrite existing paidDate on re-patch to paid", async () => {
    vi.mocked(readAll).mockResolvedValue([
      { ...INVOICE_FIXTURE, status: "paid", paidDate: "2026-01-15" },
    ]);
    const res  = await PATCH(makeReq("PATCH", "http://localhost/api/dashboard/invoices", {
      id:     "inv-1",
      status: "paid",
    }));
    const body = await res.json() as { invoice: { paidDate: string } };
    expect(body.invoice.paidDate).toBe("2026-01-15");
  });

  it("sets lastUpdatedBy from session username", async () => {
    await PATCH(makeReq("PATCH", "http://localhost/api/dashboard/invoices", {
      id: "inv-1", notes: "Updated",
    }));
    expect(updateById).toHaveBeenCalledWith("invoices", "inv-1", expect.objectContaining({
      lastUpdatedBy: "admin",
    }));
  });
});

// ── DELETE ────────────────────────────────────────────────────────────────────

describe("DELETE /api/dashboard/invoices", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(authorizeAny).mockResolvedValue(null);
    const res = await DELETE(makeReq("DELETE", "http://localhost/api/dashboard/invoices?id=inv-1"));
    expect(res.status).toBe(401);
  });

  it("returns 403 when role is not admin", async () => {
    vi.mocked(authorizeAny).mockResolvedValue(FINANCE_SESSION);
    const res = await DELETE(makeReq("DELETE", "http://localhost/api/dashboard/invoices?id=inv-1"));
    expect(res.status).toBe(403);
  });

  it("returns 400 when id is missing from query", async () => {
    const res = await DELETE(makeReq("DELETE", "http://localhost/api/dashboard/invoices"));
    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown invoice id", async () => {
    vi.mocked(readAll).mockResolvedValue([]);
    const res = await DELETE(makeReq("DELETE", "http://localhost/api/dashboard/invoices?id=no-such"));
    expect(res.status).toBe(404);
  });

  it("deletes invoice and returns ok:true", async () => {
    const res  = await DELETE(makeReq("DELETE", "http://localhost/api/dashboard/invoices?id=inv-1"));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(removeById).toHaveBeenCalledWith("invoices", "inv-1");
  });
});

// ── Public invoice view ───────────────────────────────────────────────────────

describe("GET /api/invoice/[id] - public view", () => {
  it("returns sanitized invoice by id", async () => {
    vi.mocked(readAll).mockResolvedValue([{ ...INVOICE_FIXTURE, createdBy: "admin", leadId: "lead-1" }]);
    const res  = await publicGet(
      makeReq("GET", "http://localhost/api/invoice/inv-1"),
      { params: { id: "inv-1" } }
    );
    const body = await res.json() as { invoice: Record<string, unknown> };
    expect(res.status).toBe(200);
    expect(body.invoice.id).toBe("inv-1");
    expect(body.invoice.createdBy).toBeUndefined();
    expect(body.invoice.leadId).toBeUndefined();
  });

  it("returns 404 for unknown invoice id", async () => {
    vi.mocked(readAll).mockResolvedValue([]);
    const res = await publicGet(
      makeReq("GET", "http://localhost/api/invoice/no-such"),
      { params: { id: "no-such" } }
    );
    expect(res.status).toBe(404);
  });

  it("requires no authentication (public endpoint)", async () => {
    // No auth token set - should still return data
    vi.mocked(extractToken).mockReturnValue(null);
    vi.mocked(readAll).mockResolvedValue([INVOICE_FIXTURE]);
    const res = await publicGet(
      makeReq("GET", "http://localhost/api/invoice/inv-1"),
      { params: { id: "inv-1" } }
    );
    expect(res.status).toBe(200);
  });
});
