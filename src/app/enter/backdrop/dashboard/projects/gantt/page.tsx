"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

interface GanttProject {
  id: string;
  project_number: string;
  name: string;
  client_name: string | null;
  status: "planning" | "active" | "on_hold" | "completed" | "cancelled";
  stage: string;
  priority: string;
  progress: number;
  start_date: string | null;
  target_date: string | null;
}

const STATUS_COLORS: Record<string, { bar: string; light: string; text: string }> = {
  planning:  { bar: "#6366f1", light: "rgba(99,102,241,0.25)",  text: "#a5b4fc" },
  active:    { bar: "#22c55e", light: "rgba(34,197,94,0.25)",   text: "#86efac" },
  on_hold:   { bar: "#f59e0b", light: "rgba(245,158,11,0.25)",  text: "#fde68a" },
  completed: { bar: "#64748b", light: "rgba(100,116,139,0.25)", text: "#94a3b8" },
  cancelled: { bar: "#ef4444", light: "rgba(239,68,68,0.25)",   text: "#fca5a5" },
};

const STATUS_LABELS: Record<string, string> = {
  planning: "Planning", active: "Active", on_hold: "On Hold",
  completed: "Completed", cancelled: "Cancelled",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "#64748b", medium: "#f59e0b", high: "#ef4444", critical: "#dc2626", urgent: "#dc2626",
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function fmtDate(s: string): string {
  const d = new Date(s);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

const FILTER_OPTS = [
  { label: "All",       value: "all" },
  { label: "Active",    value: "active" },
  { label: "Planning",  value: "planning" },
  { label: "On Hold",   value: "on_hold" },
  { label: "Completed", value: "completed" },
];

const ROW_H = 48;
const LEFT_W = 260;  // px — project name column
const CLIENT_W = 130; // px — client column

export default function GanttPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<GanttProject[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all");

  useEffect(() => {
    const secret = getSecret();
    if (!secret) { setTimeout(() => { if (!getSecret()) router.replace("/enter/backdrop"); }, 200); return; }
    fetch("/api/dashboard/projects", { headers: { Authorization: `Bearer ${secret}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setProjects(d.projects ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = useMemo(() =>
    filter === "all" ? projects : projects.filter((p) => p.status === filter),
    [projects, filter]
  );

  // Compute date range
  const { rangeStart, rangeEnd, totalDays, months } = useMemo(() => {
    const today = new Date();
    const dated = filtered.filter((p) => p.start_date || p.target_date);

    let earliest = dated.length > 0
      ? new Date(Math.min(...dated.map((p) => new Date(p.start_date ?? p.target_date!).getTime())))
      : new Date(today.getFullYear(), today.getMonth() - 1, 1);

    let latest = dated.length > 0
      ? new Date(Math.max(...dated.map((p) => new Date(p.target_date ?? p.start_date!).getTime())))
      : new Date(today.getFullYear(), today.getMonth() + 5, 1);

    // Pad to month boundaries
    const start = startOfMonth(earliest);
    let end = endOfMonth(latest);

    // Ensure minimum 6 months
    if (daysBetween(start, end) < 180) {
      end = endOfMonth(addMonths(start, 5));
    }

    const totalDays = daysBetween(start, end) + 1;

    // Build month list
    const months: { label: string; year: number; startDay: number; days: number }[] = [];
    let cur = new Date(start);
    while (cur <= end) {
      const mStart = startOfMonth(cur);
      const mEnd   = endOfMonth(cur);
      const clipStart = mStart < start ? start : mStart;
      const clipEnd   = mEnd   > end   ? end   : mEnd;
      months.push({
        label:    `${MONTHS[cur.getMonth()]} ${cur.getFullYear()}`,
        year:     cur.getFullYear(),
        startDay: daysBetween(start, clipStart),
        days:     daysBetween(clipStart, clipEnd) + 1,
      });
      cur = addMonths(cur, 1);
    }

    return { rangeStart: start, rangeEnd: end, totalDays, months };
  }, [filtered]);

  const today = new Date();
  const todayOffset = Math.max(0, Math.min(1, daysBetween(rangeStart, today) / totalDays));

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <Link
            href="/enter/backdrop/dashboard/projects"
            style={{ fontSize: 13, color: "#64748b", textDecoration: "none" }}
          >
            ← Projects
          </Link>
        </div>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#fff" }}>
          Project Gantt
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
          Visual timeline of all projects by date
        </p>
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {FILTER_OPTS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            style={{
              padding: "5px 14px",
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              border: "1px solid",
              background: filter === opt.value ? "rgba(99,102,241,0.2)" : "transparent",
              borderColor: filter === opt.value ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)",
              color: filter === opt.value ? "#a5b4fc" : "rgba(255,255,255,0.5)",
            }}
          >
            {opt.label}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#475569", alignSelf: "center" }}>
          {filtered.length} project{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div style={{ color: "#64748b", fontSize: 14, textAlign: "center", paddingTop: 80 }}>
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "60px 32px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>No projects found</p>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            {filter !== "all" ? "Try a different filter, or " : ""}
            <Link href="/enter/backdrop/dashboard/projects" style={{ color: "#6366f1" }}>create a project</Link>
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          {/* Chart container */}
          <div style={{ display: "flex" }}>
            {/* Fixed left: Name + Client columns */}
            <div style={{ flexShrink: 0, width: LEFT_W + CLIENT_W, borderRight: "1px solid rgba(255,255,255,0.07)" }}>
              {/* Header row */}
              <div
                style={{
                  display: "flex",
                  height: 40,
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <div style={{ width: LEFT_W, padding: "0 16px", display: "flex", alignItems: "center", fontSize: 11, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Project
                </div>
                <div style={{ width: CLIENT_W, padding: "0 12px", display: "flex", alignItems: "center", fontSize: 11, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Client
                </div>
              </div>
              {/* Project rows */}
              {filtered.map((project, idx) => {
                const sc = STATUS_COLORS[project.status] ?? STATUS_COLORS.planning;
                const pc = PRIORITY_COLORS[project.priority] ?? PRIORITY_COLORS.medium;
                return (
                  <div
                    key={project.id}
                    style={{
                      display: "flex",
                      height: ROW_H,
                      background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    {/* Name */}
                    <div style={{ width: LEFT_W, padding: "0 16px", display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: pc, flexShrink: 0 }} />
                      <Link
                        href={`/enter/backdrop/dashboard/projects/${project.id}`}
                        style={{
                          fontSize: 13,
                          color: "#e2e8f0",
                          textDecoration: "none",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                        }}
                      >
                        {project.name}
                      </Link>
                      <span style={{ fontSize: 10, color: sc.text, background: sc.light, padding: "1px 6px", borderRadius: 100, flexShrink: 0, fontWeight: 600 }}>
                        {STATUS_LABELS[project.status] ?? project.status}
                      </span>
                    </div>
                    {/* Client */}
                    <div style={{ width: CLIENT_W, padding: "0 12px", display: "flex", alignItems: "center", overflow: "hidden" }}>
                      <span style={{ fontSize: 12, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {project.client_name ?? "—"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scrollable timeline */}
            <div style={{ flex: 1, overflowX: "auto", minWidth: 0 }}>
              <div style={{ minWidth: 800 }}>
                {/* Month headers */}
                <div
                  style={{
                    display: "flex",
                    height: 40,
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                    background: "rgba(255,255,255,0.03)",
                    position: "relative",
                  }}
                >
                  {months.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        flexBasis: `${(m.days / totalDays) * 100}%`,
                        flexGrow: 0,
                        flexShrink: 0,
                        padding: "0 12px",
                        display: "flex",
                        alignItems: "center",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#94a3b8",
                        borderRight: "1px solid rgba(255,255,255,0.04)",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {m.label}
                    </div>
                  ))}
                </div>

                {/* Gantt rows */}
                {filtered.map((project, idx) => {
                  const sc = STATUS_COLORS[project.status] ?? STATUS_COLORS.planning;
                  const hasStart  = !!project.start_date;
                  const hasTarget = !!project.target_date;

                  let barLeft = 0;
                  let barWidth = 0;
                  let hasDates = false;

                  if (hasStart && hasTarget) {
                    const s = new Date(project.start_date!);
                    const t = new Date(project.target_date!);
                    const days = Math.max(1, daysBetween(s, t));
                    barLeft  = (daysBetween(rangeStart, s) / totalDays) * 100;
                    barWidth = (days / totalDays) * 100;
                    hasDates = true;
                  } else if (hasStart) {
                    barLeft  = (daysBetween(rangeStart, new Date(project.start_date!)) / totalDays) * 100;
                    barWidth = (14 / totalDays) * 100; // show 2-week stub
                    hasDates = true;
                  } else if (hasTarget) {
                    const t = new Date(project.target_date!);
                    barLeft  = Math.max(0, (daysBetween(rangeStart, t) / totalDays - 0.04) * 100);
                    barWidth = (14 / totalDays) * 100;
                    hasDates = true;
                  }

                  // Clamp
                  if (barLeft < 0) { barWidth += barLeft; barLeft = 0; }
                  if (barLeft + barWidth > 100) barWidth = 100 - barLeft;
                  barWidth = Math.max(barWidth, (60 / 800) * 100); // min 60px equiv

                  return (
                    <div
                      key={project.id}
                      style={{
                        position: "relative",
                        height: ROW_H,
                        background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      {/* Month grid lines */}
                      {months.map((m, i) => (
                        <div
                          key={i}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: `${(m.startDay / totalDays) * 100}%`,
                            width: `${(m.days / totalDays) * 100}%`,
                            height: "100%",
                            borderRight: "1px solid rgba(255,255,255,0.03)",
                          }}
                        />
                      ))}

                      {/* Today line */}
                      {todayOffset > 0 && todayOffset < 1 && (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: `${todayOffset * 100}%`,
                            width: 2,
                            height: "100%",
                            background: "rgba(239,68,68,0.6)",
                            zIndex: 5,
                            pointerEvents: "none",
                          }}
                        />
                      )}

                      {/* Bar */}
                      {hasDates ? (
                        <Link
                          href={`/enter/backdrop/dashboard/projects/${project.id}`}
                          title={`${project.name} — ${project.start_date ? fmtDate(project.start_date) : "?"} → ${project.target_date ? fmtDate(project.target_date) : "?"}`}
                          style={{
                            position: "absolute",
                            top: "50%",
                            transform: "translateY(-50%)",
                            left: `${barLeft}%`,
                            width: `${barWidth}%`,
                            height: 28,
                            background: sc.light,
                            border: `1px solid ${sc.bar}40`,
                            borderRadius: 6,
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            textDecoration: "none",
                            zIndex: 4,
                            minWidth: 60,
                          }}
                        >
                          {/* Progress fill */}
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: `${project.progress}%`,
                              height: "100%",
                              background: sc.bar,
                              opacity: 0.45,
                            }}
                          />
                          {/* Label */}
                          <span
                            style={{
                              position: "relative",
                              zIndex: 1,
                              fontSize: 11,
                              fontWeight: 600,
                              color: sc.text,
                              padding: "0 8px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {project.progress}%
                          </span>
                        </Link>
                      ) : (
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            transform: "translateY(-50%)",
                            left: "4px",
                            fontSize: 11,
                            color: "#334155",
                            fontStyle: "italic",
                          }}
                        >
                          No dates
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div
            style={{
              display: "flex",
              gap: 20,
              padding: "12px 16px",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.01)",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {Object.entries(STATUS_COLORS).map(([key, col]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748b" }}>
                <div style={{ width: 12, height: 8, background: col.bar, borderRadius: 2, opacity: 0.8 }} />
                {STATUS_LABELS[key]}
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748b", marginLeft: "auto" }}>
              <div style={{ width: 2, height: 12, background: "rgba(239,68,68,0.7)", borderRadius: 1 }} />
              Today
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
