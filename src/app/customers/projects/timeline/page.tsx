"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface PortalProject {
  id: string;
  project_number: string;
  name: string;
  description: string;
  status: string;
  stage: string;
  priority: string;
  progress: number;
  start_date: string | null;
  target_date: string | null;
  account_manager: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  planning:  "#6366f1",
  active:    "#22c55e",
  on_hold:   "#f59e0b",
  completed: "#64748b",
};

const STATUS_DARK: Record<string, string> = {
  planning:  "#4f46e5",
  active:    "#16a34a",
  on_hold:   "#d97706",
  completed: "#475569",
};

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function monthsBetween(start: Date, end: Date): number {
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const ROW_H = 48;
const LEFT_COL = 200;
const MONTH_COL = 100;

export default function ProjectTimelinePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<PortalProject[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/customers/projects")
      .then((r) => {
        if (r.status === 401) { router.replace("/customers"); return null; }
        return r.ok ? r.json() : null;
      })
      .then((data) => {
        if (data) {
          const list: PortalProject[] = Array.isArray(data) ? data : (data.projects ?? []);
          setProjects(list);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0e1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15 }}>Loading timeline…</p>
      </div>
    );
  }

  const active = projects.filter((p) => p.status !== "cancelled");

  if (active.length === 0) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0e1a", padding: "40px 32px" }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: "#e2e8f0" }}>Project Timeline</h1>
        <p style={{ margin: "0 0 40px", fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Visual timeline of your active projects</p>
        <div style={{ padding: "48px 0", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 15 }}>
          No projects found.
        </div>
      </div>
    );
  }

  // ── Date range calculation ──────────────────────────────────────────────────
  const now = new Date();

  const dates = active.flatMap((p) => {
    const arr: Date[] = [];
    if (p.start_date)  arr.push(new Date(p.start_date));
    if (p.target_date) arr.push(new Date(p.target_date));
    return arr;
  });

  const earliest = dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))) : now;
  const latest   = dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : now;

  // Ensure at least 4 months
  let rangeStart = startOfMonth(earliest);
  let rangeEnd   = endOfMonth(latest);
  const months   = monthsBetween(rangeStart, rangeEnd);
  if (months < 4) {
    rangeEnd = endOfMonth(addMonths(rangeStart, 3));
  }

  const totalMonths = monthsBetween(rangeStart, rangeEnd);
  const totalWidth  = totalMonths * MONTH_COL;

  function xPos(date: Date): number {
    const diffMs = date.getTime() - rangeStart.getTime();
    const totalMs = rangeEnd.getTime() - rangeStart.getTime() + 86400000;
    return Math.max(0, Math.min(totalWidth, (diffMs / totalMs) * totalWidth));
  }

  const todayX = xPos(now);

  const monthHeaders: { label: string; x: number }[] = [];
  for (let i = 0; i < totalMonths; i++) {
    const m = addMonths(rangeStart, i);
    monthHeaders.push({
      label: m.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
      x: i * MONTH_COL,
    });
  }

  const stageColors: Record<string, string> = {
    discovery:   "#6366f1",
    proposal:    "#8b5cf6",
    active:      "#22c55e",
    review:      "#f59e0b",
    completed:   "#64748b",
    on_hold:     "#ef4444",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", padding: "40px 32px" }}>
      {/* Header */}
      <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: "#e2e8f0" }}>Project Timeline</h1>
      <p style={{ margin: "0 0 32px", fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
        Visual timeline of your active projects
      </p>

      {/* Gantt chart */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12,
          overflow: "hidden",
          marginBottom: 40,
        }}
      >
        {/* Month header row */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          {/* Left label column header */}
          <div
            style={{
              width: LEFT_COL,
              flexShrink: 0,
              padding: "10px 16px",
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              borderRight: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            Project
          </div>
          {/* Month headers — scrollable */}
          <div
            ref={scrollRef}
            style={{ flex: 1, overflowX: "auto" }}
          >
            <div style={{ position: "relative", width: totalWidth, height: 38 }}>
              {monthHeaders.map((mh) => (
                <div
                  key={mh.label}
                  style={{
                    position: "absolute",
                    left: mh.x,
                    top: 0,
                    width: MONTH_COL,
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: 8,
                    borderRight: "1px solid rgba(255,255,255,0.05)",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.35)",
                    fontWeight: 500,
                  }}
                >
                  {mh.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project rows */}
        {active.map((project, idx) => {
          const color     = STATUS_COLORS[project.status] ?? "#6366f1";
          const darkColor = STATUS_DARK[project.status]   ?? "#4f46e5";

          const startDate  = project.start_date  ? new Date(project.start_date)  : rangeStart;
          const targetDate = project.target_date ? new Date(project.target_date) : rangeEnd;

          const barLeft  = xPos(startDate);
          const barRight = xPos(targetDate);
          const barWidth = Math.max(barRight - barLeft, 8);

          const progressWidth = barWidth * (project.progress / 100);

          return (
            <div
              key={project.id}
              style={{
                display: "flex",
                borderBottom: idx < active.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}
            >
              {/* Left column: project info */}
              <div
                style={{
                  width: LEFT_COL,
                  flexShrink: 0,
                  padding: "0 16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  height: ROW_H,
                  borderRight: "1px solid rgba(255,255,255,0.07)",
                  gap: 2,
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#e2e8f0",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {project.name}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.35)",
                      textTransform: "capitalize",
                    }}
                  >
                    {project.stage}
                  </span>
                  <span style={{ fontSize: 10, color: color, fontWeight: 600 }}>
                    {project.progress}%
                  </span>
                </div>
              </div>

              {/* Timeline area */}
              <div style={{ flex: 1, overflowX: "hidden", position: "relative", height: ROW_H }}>
                <div style={{ position: "relative", width: totalWidth, height: "100%" }}>
                  {/* Month grid lines */}
                  {monthHeaders.map((mh) => (
                    <div
                      key={mh.label}
                      style={{
                        position: "absolute",
                        left: mh.x,
                        top: 0,
                        bottom: 0,
                        width: 1,
                        background: "rgba(255,255,255,0.04)",
                      }}
                    />
                  ))}

                  {/* Today marker */}
                  {todayX >= 0 && todayX <= totalWidth && (
                    <div
                      style={{
                        position: "absolute",
                        left: todayX,
                        top: 0,
                        bottom: 0,
                        width: 1.5,
                        background: "#ef4444",
                        zIndex: 2,
                      }}
                    />
                  )}

                  {/* Project bar */}
                  <div
                    style={{
                      position: "absolute",
                      left: barLeft,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: barWidth,
                      height: 20,
                      borderRadius: 6,
                      background: color,
                      overflow: "hidden",
                      zIndex: 1,
                    }}
                  >
                    {/* Progress overlay */}
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        height: "100%",
                        width: progressWidth,
                        background: darkColor,
                        borderRadius: 6,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Project Cards section */}
      <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: "#e2e8f0" }}>
        Project Cards
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
        }}
      >
        {active.map((project) => {
          const color = STATUS_COLORS[project.status] ?? "#6366f1";
          const stageBg = stageColors[project.stage] ?? "#6366f1";

          return (
            <div
              key={project.id}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12,
                padding: "18px 20px",
              }}
            >
              {/* Name + stage badge */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.4 }}>
                  {project.name}
                </p>
                <span
                  style={{
                    flexShrink: 0,
                    padding: "2px 8px",
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 600,
                    background: `${stageBg}22`,
                    color: stageBg,
                    textTransform: "capitalize",
                    border: `1px solid ${stageBg}44`,
                  }}
                >
                  {project.stage}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Progress</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color }}>
                    {project.progress}%
                  </span>
                </div>
                <div
                  style={{
                    height: 5,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.07)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${project.progress}%`,
                      borderRadius: 3,
                      background: color,
                    }}
                  />
                </div>
              </div>

              {/* Date range */}
              <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 1 }}>Start</p>
                  <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                    {formatDate(project.start_date)}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 1 }}>Target</p>
                  <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                    {formatDate(project.target_date)}
                  </p>
                </div>
              </div>

              {/* Account manager */}
              {project.account_manager && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                    Account Manager:{" "}
                    <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
                      {project.account_manager}
                    </span>
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
