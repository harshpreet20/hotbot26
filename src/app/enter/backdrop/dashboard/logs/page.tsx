"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { LogEntry, LogLevel } from "@/lib/logger";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

// ── Constants ─────────────────────────────────────────────────────────────────

const LEVEL_STYLES: Record<LogLevel, { bg: string; text: string; label: string }> = {
  info:  { bg: "rgba(99,102,241,0.12)",  text: "#818cf8", label: "INFO"  },
  warn:  { bg: "rgba(251,191,36,0.12)",  text: "#fbbf24", label: "WARN"  },
  error: { bg: "rgba(239,68,68,0.12)",   text: "#f87171", label: "ERROR" },
};

const EVENT_COLORS: Record<string, string> = {
  "auth.success":     "#34d399",
  "auth.failure":     "#f87171",
  "auth.attempt":     "#818cf8",
  "auth.rate_limit":  "#fbbf24",
  "auth.logout":      "#60a5fa",
  "auth.bootstrap":   "#a78bfa",
  "auth.session_error": "#fb923c",
  "auth.bad_request": "#fbbf24",
};

function eventColor(event: string): string {
  if (EVENT_COLORS[event]) return EVENT_COLORS[event];
  for (const [prefix, color] of Object.entries(EVENT_COLORS)) {
    if (event.startsWith(prefix.split(".")[0])) return color;
  }
  return "#94a3b8";
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000)  return `${Math.floor(ms / 1000)}s ago`;
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
  return new Date(iso).toLocaleDateString();
}

function absoluteTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

// ── Entry row ─────────────────────────────────────────────────────────────────

function LogRow({ entry, expanded, onToggle }: {
  entry: LogEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  const ls  = LEVEL_STYLES[entry.level];
  const col = eventColor(entry.event);

  return (
    <div
      className="border-b border-white/[0.04] last:border-0 cursor-pointer hover:bg-white/[0.015] transition-colors"
      onClick={onToggle}
    >
      {/* Main row */}
      <div className="flex items-start gap-3 px-4 py-3 font-mono text-xs">
        {/* Level badge */}
        <span
          className="shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest"
          style={{ background: ls.bg, color: ls.text }}
        >
          {ls.label}
        </span>

        {/* Event */}
        <span className="shrink-0 font-semibold" style={{ color: col, minWidth: "160px" }}>
          {entry.event}
        </span>

        {/* Message */}
        <span className="flex-1 text-slate-300 truncate">{entry.message}</span>

        {/* Meta */}
        <span className="shrink-0 text-slate-600 text-right" style={{ minWidth: "90px" }}>
          {relativeTime(entry.createdAt)}
        </span>
        <span className="shrink-0 text-slate-600 text-[10px]">{entry.ip || "—"}</span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div
          className="mx-4 mb-3 rounded-lg p-3 text-xs font-mono"
          style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-3 text-slate-400">
            <div><span className="text-slate-600">id       </span> {entry.id}</div>
            <div><span className="text-slate-600">time     </span> {absoluteTime(entry.createdAt)}</div>
            {entry.userId   && <div><span className="text-slate-600">user_id  </span> {entry.userId}</div>}
            {entry.username && <div><span className="text-slate-600">username </span> {entry.username}</div>}
            {entry.ip       && <div><span className="text-slate-600">ip       </span> {entry.ip}</div>}
          </div>

          {Object.keys(entry.details).length > 0 && (
            <>
              <div className="text-slate-600 mb-1">details</div>
              <pre className="text-slate-300 whitespace-pre-wrap break-all leading-relaxed">
                {JSON.stringify(entry.details, null, 2)}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LogsPage() {
  const router = useRouter();
  const [logs, setLogs]             = useState<LogEntry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [filter, setFilter]         = useState<LogLevel | "all">("all");
  const [eventFilter, setEventFilter] = useState("auth");
  const [expanded, setExpanded]     = useState<Set<string>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLogs = useCallback(async (silent = false) => {
    const secret = getSecret();
    if (!secret) { router.replace("/enter/backdrop"); return; }

    if (!silent) setLoading(true);
    setError("");

    const params = new URLSearchParams({ limit: "300" });
    if (filter !== "all") params.set("level", filter);
    if (eventFilter)      params.set("event", eventFilter);

    try {
      const res  = await fetch(`/api/blog/logs?${params}`, {
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (res.status === 403) { router.replace("/enter/backdrop"); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { logs: LogEntry[] };
      setLogs(data.logs);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, [filter, eventFilter, router]);

  // Initial load
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Auto-refresh every 5s
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoRefresh) {
      intervalRef.current = setInterval(() => fetchLogs(true), 5_000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, fetchLogs]);

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Counts
  const counts = logs.reduce(
    (acc, l) => { acc[l.level] = (acc[l.level] ?? 0) + 1; return acc; },
    {} as Record<string, number>,
  );

  const EVENT_TABS = ["auth", "session", "all"];

  return (
    <>
      <div className="p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">System Logs</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Live auth + system event log ·{" "}
              {lastRefresh ? `updated ${relativeTime(lastRefresh.toISOString())}` : "loading…"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto-refresh toggle */}
            <button
              onClick={() => setAutoRefresh((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: autoRefresh ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.05)",
                color:      autoRefresh ? "#818cf8" : "#64748b",
                border:     `1px solid ${autoRefresh ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: autoRefresh ? "#818cf8" : "#475569", animation: autoRefresh ? "ping 1.5s infinite" : "none" }}
              />
              {autoRefresh ? "Live" : "Paused"}
            </button>

            {/* Manual refresh */}
            <button
              onClick={() => fetchLogs()}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors disabled:opacity-40"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3">
          {(["error", "warn", "info"] as LogLevel[]).map((lvl) => {
            const ls = LEVEL_STYLES[lvl];
            return (
              <button
                key={lvl}
                onClick={() => setFilter(filter === lvl ? "all" : lvl)}
                className="rounded-xl p-4 text-left transition-all"
                style={{
                  background: filter === lvl ? ls.bg : "rgba(255,255,255,0.02)",
                  border: `1px solid ${filter === lvl ? ls.text + "40" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                <p className="text-2xl font-bold tabular-nums" style={{ color: ls.text }}>
                  {counts[lvl] ?? 0}
                </p>
                <p className="text-slate-500 text-xs mt-0.5 uppercase tracking-wider">{lvl}</p>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-slate-600 text-xs">Event prefix:</span>
          {EVENT_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setEventFilter(tab === "all" ? "" : tab)}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: (eventFilter === tab || (tab === "all" && !eventFilter))
                  ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
                color: (eventFilter === tab || (tab === "all" && !eventFilter))
                  ? "#818cf8" : "#64748b",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {tab}
            </button>
          ))}

          <input
            type="text"
            placeholder="custom prefix (e.g. auth.failure)"
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-1 rounded-lg text-xs text-slate-300 placeholder:text-slate-600"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", outline: "none" }}
          />

          {(filter !== "all" || eventFilter) && (
            <button
              onClick={() => { setFilter("all"); setEventFilter("auth"); }}
              className="px-3 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-300 transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              Reset
            </button>
          )}

          <span className="ml-auto text-slate-600 text-xs">{logs.length} entries</span>
        </div>

        {/* Log table */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Column headers */}
          <div
            className="flex items-center gap-3 px-4 py-2 text-[10px] uppercase tracking-widest text-slate-600 font-medium border-b border-white/[0.04]"
          >
            <span style={{ width: "46px" }}>Level</span>
            <span style={{ minWidth: "160px" }}>Event</span>
            <span className="flex-1">Message</span>
            <span style={{ minWidth: "90px" }}>Time</span>
            <span>IP</span>
          </div>

          {loading && logs.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-slate-600 text-sm">
              Loading logs…
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16 text-red-400 text-sm">
              {error}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <p className="text-slate-600 text-sm">No logs yet.</p>
              <p className="text-slate-700 text-xs">Logs appear here as soon as a login is attempted.</p>
            </div>
          ) : (
            logs.map((entry) => (
              <LogRow
                key={entry.id}
                entry={entry}
                expanded={expanded.has(entry.id)}
                onToggle={() => toggleExpanded(entry.id)}
              />
            ))
          )}
        </div>

        {/* SQL hint */}
        <div
          className="rounded-xl p-4 text-xs font-mono text-slate-600"
          style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.04)" }}
        >
          <p className="text-slate-500 mb-2 font-sans font-medium">Supabase table (run once if not created):</p>
          <pre className="whitespace-pre-wrap leading-relaxed">{`CREATE TABLE system_logs (
  id          TEXT PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  level       TEXT NOT NULL,
  event       TEXT NOT NULL,
  message     TEXT NOT NULL,
  details     JSONB,
  ip          TEXT,
  user_id     TEXT,
  username    TEXT
);
CREATE INDEX ON system_logs (created_at DESC);
CREATE INDEX ON system_logs (level);
CREATE INDEX ON system_logs (event);`}</pre>
        </div>

      </div>
    </>
  );
}
