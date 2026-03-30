/**
 * Unit tests — src/lib/store.ts
 * File-based JSON storage layer (mocking fs to avoid disk I/O)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";

vi.mock("fs");

// Re-import after mocking so module picks up mocked fs
async function getStore() {
  vi.resetModules();
  return import("@/lib/store");
}

const MOCK_DIR  = expect.stringContaining("data");
const MOCK_FILE = expect.stringContaining(".json");

describe("store — readAll()", () => {
  beforeEach(() => vi.resetModules());

  it("returns parsed array from valid JSON file", async () => {
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify([{ id: "1", name: "Alice" }]));
    const { readAll } = await getStore();
    expect(await readAll("leads")).toEqual([{ id: "1", name: "Alice" }]);
  });

  it("returns [] when file does not exist (ENOENT)", async () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => { throw Object.assign(new Error("ENOENT"), { code: "ENOENT" }); });
    const { readAll } = await getStore();
    expect(await readAll("leads")).toEqual([]);
  });

  it("returns [] when file contains invalid JSON", async () => {
    vi.mocked(fs.readFileSync).mockReturnValue("not-valid-json{{");
    const { readAll } = await getStore();
    expect(await readAll("sessions")).toEqual([]);
  });

  it("returns [] when JSON is an object, not an array", async () => {
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ key: "value" }));
    const { readAll } = await getStore();
    expect(await readAll("sessions")).toEqual([]);
  });

  it("returns [] when JSON is null", async () => {
    vi.mocked(fs.readFileSync).mockReturnValue("null");
    const { readAll } = await getStore();
    expect(await readAll("sessions")).toEqual([]);
  });

  it("returns [] when file is empty", async () => {
    vi.mocked(fs.readFileSync).mockReturnValue("");
    const { readAll } = await getStore();
    expect(await readAll("any")).toEqual([]);
  });
});

describe("store — writeAll()", () => {
  beforeEach(() => vi.resetModules());

  it("creates directory and writes JSON to file", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
    vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
    const { writeAll } = await getStore();
    writeAll("leads", [{ id: "1" }]);
    expect(fs.mkdirSync).toHaveBeenCalledWith(MOCK_DIR, { recursive: true });
    expect(fs.writeFileSync).toHaveBeenCalledWith(MOCK_FILE, expect.stringContaining('"id": "1"'), "utf-8");
  });

  it("skips mkdir if directory already exists", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
    const { writeAll } = await getStore();
    writeAll("leads", []);
    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });

  it("writes pretty-printed JSON", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    let written = "";
    vi.mocked(fs.writeFileSync).mockImplementation((_p, data) => { written = String(data); });
    const { writeAll } = await getStore();
    writeAll("test", [{ a: 1 }]);
    expect(written).toContain("\n");
    expect(JSON.parse(written)).toEqual([{ a: 1 }]);
  });
});

describe("store — prepend()", () => {
  beforeEach(() => vi.resetModules());

  it("prepends new item to existing array", async () => {
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify([{ id: "old" }]));
    vi.mocked(fs.existsSync).mockReturnValue(true);
    let written = "";
    vi.mocked(fs.writeFileSync).mockImplementation((_p, data) => { written = String(data); });
    const { prepend } = await getStore();
    prepend("leads", { id: "new" });
    const result = JSON.parse(written);
    expect(result[0]).toEqual({ id: "new" });
    expect(result[1]).toEqual({ id: "old" });
  });

  it("creates array with single item when store is empty", async () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => { throw new Error("ENOENT"); });
    vi.mocked(fs.existsSync).mockReturnValue(true);
    let written = "";
    vi.mocked(fs.writeFileSync).mockImplementation((_p, data) => { written = String(data); });
    const { prepend } = await getStore();
    prepend("leads", { id: "first" });
    expect(JSON.parse(written)).toEqual([{ id: "first" }]);
  });
});

describe("store — newId()", () => {
  beforeEach(() => vi.resetModules());

  it("generates unique IDs on each call", async () => {
    const { newId } = await getStore();
    const ids = new Set(Array.from({ length: 100 }, () => newId()));
    expect(ids.size).toBe(100);
  });

  it("ID starts with a timestamp", async () => {
    const before = Date.now();
    const { newId } = await getStore();
    const id = newId();
    const after = Date.now();
    const ts = parseInt(id.split("-")[0], 10);
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  it("ID contains a hex suffix", async () => {
    const { newId } = await getStore();
    const id = newId();
    const suffix = id.split("-")[1];
    expect(suffix).toMatch(/^[0-9a-f]+$/);
  });
});
