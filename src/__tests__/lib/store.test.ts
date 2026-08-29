/**
 * Unit tests - src/lib/store.ts
 *
 * store.ts is now backed by Prisma rather than JSON files, so these exercise the
 * delegate mapping and the value normalisation that keeps API response shapes
 * stable. The Prisma client is mocked; no database is touched.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";

const lead = {
  findMany:   vi.fn(),
  create:     vi.fn(),
  updateMany: vi.fn(),
  deleteMany: vi.fn(),
};
const invoice = { findMany: vi.fn(), create: vi.fn(), updateMany: vi.fn(), deleteMany: vi.fn() };
const userPermission = { findMany: vi.fn(), create: vi.fn(), updateMany: vi.fn(), deleteMany: vi.fn() };

vi.mock("@/lib/prisma", () => ({
  prisma: {
    get lead() { return lead; },
    get invoice() { return invoice; },
    get userPermission() { return userPermission; },
  },
}));

import { readAll, readWhere, insert, updateById, removeById, newId } from "@/lib/store";

beforeEach(() => {
  vi.clearAllMocks();
  lead.findMany.mockResolvedValue([]);
  invoice.findMany.mockResolvedValue([]);
  userPermission.findMany.mockResolvedValue([]);
});

describe("store - table mapping", () => {
  it("routes a table name to its Prisma delegate", async () => {
    lead.findMany.mockResolvedValue([{ id: "1", name: "Alice" }]);
    expect(await readAll("leads")).toEqual([{ id: "1", name: "Alice" }]);
    expect(lead.findMany).toHaveBeenCalledOnce();
  });

  it("throws on an unknown table rather than silently returning nothing", async () => {
    await expect(readAll("not_a_table")).rejects.toThrow(/Unknown table "not_a_table"/);
  });

  it("orders newest first", async () => {
    await readAll("leads");
    expect(lead.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: "desc" } });
  });
});

describe("store - readWhere()", () => {
  it("converts a snake_case column to its Prisma field name", async () => {
    await readWhere("user_permissions", "user_id", "u-1");
    expect(userPermission.findMany).toHaveBeenCalledWith({
      where:   { userId: "u-1" },
      orderBy: { createdAt: "desc" },
    });
  });

  it("leaves a single-word column untouched", async () => {
    await readWhere("leads", "id", "abc");
    expect(lead.findMany).toHaveBeenCalledWith({
      where:   { id: "abc" },
      orderBy: { createdAt: "desc" },
    });
  });
});

describe("store - value normalisation", () => {
  // Prisma returns Decimal for numeric and BigInt for bigint. JSON.stringify
  // renders Decimal as a quoted string and throws outright on BigInt, so both
  // are converted back to plain numbers on the way out.
  it("converts Decimal columns to numbers", async () => {
    invoice.findMany.mockResolvedValue([
      { id: "i-1", total: new Prisma.Decimal("1234.56"), status: "paid" },
    ]);
    const [row] = await readAll<{ total: number }>("invoices");
    expect(row.total).toBe(1234.56);
    expect(typeof row.total).toBe("number");
  });

  it("converts BigInt columns to numbers so JSON.stringify does not throw", async () => {
    invoice.findMany.mockResolvedValue([{ id: "i-2", fileSize: BigInt(4096) }]);
    const rows = await readAll("invoices");
    expect(() => JSON.stringify(rows)).not.toThrow();
    expect((rows[0] as { fileSize: number }).fileSize).toBe(4096);
  });

  it("leaves other values alone", async () => {
    const createdAt = new Date("2026-01-01T00:00:00Z");
    invoice.findMany.mockResolvedValue([{ id: "i-3", notes: null, tags: ["a"], createdAt }]);
    expect(await readAll("invoices")).toEqual([
      { id: "i-3", notes: null, tags: ["a"], createdAt },
    ]);
  });
});

describe("store - writes", () => {
  it("insert passes the item through as create data", async () => {
    await insert("leads", { id: "l-1", name: "Bob", email: "b@example.com" });
    expect(lead.create).toHaveBeenCalledWith({
      data: { id: "l-1", name: "Bob", email: "b@example.com" },
    });
  });

  it("updateById uses updateMany so a missing row is a no-op", async () => {
    await updateById("leads", "l-1", { status: "won" });
    expect(lead.updateMany).toHaveBeenCalledWith({
      where: { id: "l-1" },
      data:  { status: "won" },
    });
  });

  it("removeById deletes by id", async () => {
    await removeById("leads", "l-1");
    expect(lead.deleteMany).toHaveBeenCalledWith({ where: { id: "l-1" } });
  });
});

describe("store - newId()", () => {
  it("generates unique IDs on each call", () => {
    const ids = new Set(Array.from({ length: 100 }, () => newId()));
    expect(ids.size).toBe(100);
  });

  it("ID starts with a timestamp", () => {
    const before = Date.now();
    const id = newId();
    const after = Date.now();
    const ts = parseInt(id.split("-")[0], 10);
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  it("ID contains a hex suffix", () => {
    const suffix = newId().split("-")[1];
    expect(suffix).toMatch(/^[0-9a-f]+$/);
  });
});
