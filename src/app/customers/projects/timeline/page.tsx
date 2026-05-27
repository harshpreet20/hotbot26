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

const STATUS_BADGES: Record<string, { bg: string; color: string; label: string }> = {
  planning:  { bg: "rgba(99,102,241,0.15)",  color: "#818cf8", label: "Planning"  },
  active:    { bg: "rgba(34,197,94,0.15)",   color: "#22c55e", label: "Active"    },
  on_hold:   { bg: "rgba(245,158,11,0.15)",  color: "#f59e0b", label: "On Hold"   },
  completed: { bg: "rgba(100,116,139,0.15)", color: "#94a3b8", label: "Completed" },
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "#ef4444", high: "#f97316", medium: "#f59e0b", low: "#22c55e",
};

function startOfMonth(d: Date): Date { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d: Date): Date   { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
function addMonths(d: Date, n: number): Date { return new Date(d.getFullYear(), d.getMonth() + n, 1); }
function monthsBetween(s: Date, e: Date): number {
  return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1;
}
function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const MONTH_COL = 80;

function ProgressRing({ pct, color }: { pct: number; color: string }) {
  const r = 18, c = 2 * Math.PI * r;
  const fill = ((100 - pct) / 100) * c;
  return (
    <svg width={44} height={44} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={22} cy={22} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3.5} />
      <circle cx={22} cy={22} r={r} fill="none" stroke={color} strokeWidth={3.5}
        strokeDasharray={c} strokeDashoffset={fill} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }} />
    </svg>
  );
}

export default function ProjectTimelinePage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [projects, setProjects] = useState<PortalProject[]>([]);
  const [loading, setLoading]   = useState(true);

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
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15 }}>Loading timeline…</p>
      </div>
    );
  }

  const active = projects.filter((p) => p.status !== "cancelled");

  if (active.length === 0) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", padding: "40px 32px" }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: "#e2e8f0" }}>Project Timeline</h1>
        <p style={{ margin: "0 0 40px", fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Visual overview of your active projects</p>
        <div style={{ padding: "64px 0", textAlign: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
          <p style={{ margin: 0, fontSize: 15, color: "rgba(255,255,255,0.3)" }}>No projects found.</p>
        </div>
      </div>
    );
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  const activeCount    = active.filter(p => p.status === "active").length;
  const completedCount = active.filter(p => p.status === "completed").length;
  const onHoldCount    = active.filter(p => p.status === "on_hold").length;
  const onTrackCount   = active.filter(p => p.status === "active" && p.progress >= 50).length;

  // ── Date range ─────────────────────────────────────────────────────────────
  const now    = new Date();
  const dates  = active.flatMap((p) => {
    const arr: Date[] = [];
    if (p.start_date)  arr.push(new Date(p.start_date));
    if (p.target_date) arr.push(new Date(p.target_date));
    return arr;
  });

  const earliest   = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : now;
  const latest     = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : now;
  let rangeStart   = startOfMonth(earliest);
  let rangeEnd     = endOfMonth(latest);
  if (monthsBetween(rangeStart, rangeEnd) < 4) rangeEnd = endOfMonth(addMonths(rangeStart, 3));

  const totalMonths = monthsBetween(rangeStart, rangeEnd);
  const totalWidth  = totalMonths * MONTH_COL;

  function xPos(date: Date): number {
    const diffMs   = date.getTime() - rangeStart.getTime();
    const totalMs  = rangeEnd.getTime() - rangeStart.getTime() + 86400000;
    return Math.max(0, Math.min(totalWidth, (diffMs / totalMs) * totalWidth));
  }

  const todayX = xPos(now);

  // Month headers grouped by year
  type MonthHeader = { label: string; x: number; year: number };
  const monthHeaders: MonthHeader[] = [];
  for (let i = 0; i < totalMonths; i++) {
    const m = addMonths(rangeStart, i);
    monthHeaders.push({
      label: m.toLocaleDateString("en-GB", { month: "short" }),
      year:  m.getFullYear(),
      x:     i * MONTH_COL,
    });
  }

  // Unique years for header
  const years: { year: number; x: number; width: number }[] = [];
  for (const mh of monthHeaders) {
    const last = years[years.length - 1];
    if (last && last.year === mh.year) {
      last.width += MONTH_COL;
    } else {
      years.push({ year: mh.year, x: mh.x, width: MONTH_COL });
    }
  }

  const nowMonth = now.getMonth();
  const nowYear  = now.getFullYear();

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", padding: "36px 28px", fontFamily: "inherit" }}>

      {/* Header + view toggle */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
            Project Timeline
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            {active.length} project{active.length !== 1 ? "s" : ""} · {activeCount} active
          </p>
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", gap: 4, padding: "4px", background: "rgba(255,255,255,0.04)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)" }}>
          {[
            { label: "Timeline", href: "/customers/projects/timeline", active: true },
            { label: "Grid",     href: "/customers/projects",          active: false },
          ].map((v) => (
            <button
              key={v.label}
              onClick={() => router.push(v.href)}
              style={{
                padding: "5px 14px", borderRadius: 7, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 500,
                background: v.active ? "rgba(99,102,241,0.2)" : "transparent",
                color: v.active ? "#818cf8" : "rgba(255,255,255,0.45)",
                transition: "all 0.15s",
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Active Projects", value: activeCount,    color: "#22c55e" },
          { label: "On Track",        value: onTrackCount,   color: "#6366f1" },
          { label: "On Hold",         value: onHoldCount,    color: "#f59e0b" },
          { label: "Completed",       value: completedCount, color: "#64748b" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12, padding: "16px 20px",
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Project cards with embedded timeline */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {active.map((project) => {
          const color      = STATUS_COLORS[project.status] ?? "#6366f1";
          const badge      = STATUS_BADGES[project.status] ?? STATUS_BADGES.planning;
          const prioColor  = PRIORITY_COLORS[project.priority] ?? "#94a3b8";
          const startDate  = project.start_date  ? new Date(project.start_date)  : rangeStart;
          const targetDate = project.target_date ? new Date(project.target_date) : rangeEnd;
          const barLeft    = xPos(startDate);
          const barRight   = xPos(targetDate);
          const barWidth   = Math.max(barRight - barLeft, 8);
          const progressW  = barWidth * (project.progress / 100);

          return (
            <div
              key={project.id}
              onClick={() => router.push(`/customers/projects/${project.id}`)}
              style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, overflow: "hidden", cursor: "pointer",
                transition: "background 0.15s, border-color 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
            >
              {/* Card body: left info + right timeline */}
              <div style={{ display: "flex", alignItems: "stretch" }}>
                {/* Left: project info */}
                <div style={{ width: 240, flexShrink: 0, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10, borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                  {/* Name + priority dot */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: prioColor, flexShrink: 0, marginTop: 5 }} />
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.4 }}>
                      {project.name}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span style={{ alignSelf: "flex-start", padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: badge.bg, color: badge.color }}>
                    {badge.label}
                  </span>

                  {/* Progress ring + pct */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ position: "relative" }}>
                      <ProgressRing pct={project.progress} color={color} />
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color, transform: "rotate(90deg)" }}>{project.progress}%</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 2 }}>Progress</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color }}>{project.progress}%</div>
                    </div>
                  </div>
                </div>

                {/* Right: timeline bar */}
                <div style={{ flex: 1, overflow: "hidden", padding: "0", position: "relative" }}>
                  {/* Year header strip */}
                  <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.05)", height: 22, background: "rgba(0,0,0,0.2)", position: "relative" }}>
                    <div style={{ position: "relative", width: totalWidth }}>
                      {years.map((y) => (
                        <div key={y.year} style={{ position: "absolute", left: y.x, width: y.width, height: "100%", display: "flex", alignItems: "center", paddingLeft: 8, borderRight: "1px solid rgba(255,255,255,0.04)" }}>
                          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontWeight: 600, letterSpacing: "0.06em" }}>{y.year}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Month sub-header */}
                  <div ref={scrollRef} style={{ overflow: "hidden" }}>
                    <div style={{ position: "relative", width: totalWidth, height: 20, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      {monthHeaders.map((mh) => {
                        const isCurrent = mh.year === nowYear && mh.label === new Date(nowYear, nowMonth, 1).toLocaleDateString("en-GB", { month: "short" });
                        return (
                          <div
                            key={`${mh.year}-${mh.label}`}
                            style={{
                              position: "absolute", left: mh.x, width: MONTH_COL, height: "100%",
                              display: "flex", alignItems: "center", paddingLeft: 6,
                              borderRight: "1px solid rgba(255,255,255,0.04)",
                              background: isCurrent ? "rgba(99,102,241,0.08)" : "transparent",
                            }}
                          >
                            <span style={{ fontSize: 9, color: isCurrent ? "#818cf8" : "rgba(255,255,255,0.25)", fontWeight: isCurrent ? 700 : 400 }}>
                              {mh.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bar area */}
                  <div style={{ position: "relative", height: 68, overflow: "hidden" }}>
                    <div style={{ position: "relative", width: totalWidth, height: "100%" }}>
                      {/* Grid lines */}
                      {monthHeaders.map((mh) => (
                        <div key={`grid-${mh.year}-${mh.label}`} style={{ position: "absolute", left: mh.x, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.04)" }} />
                      ))}

                      {/* Today marker */}
                      {todayX >= 0 && todayX <= totalWidth && (
                        <div style={{ position: "absolute", left: todayX, top: 0, bottom: 0, width: 1.5, background: "#ef4444", opacity: 0.7, zIndex: 2 }} />
                      )}

                      {/* Project bar */}
                      <div
                        style={{
                          position: "absolute", left: barLeft, top: "50%", transform: "translateY(-50%)",
                          width: barWidth, height: 24, borderRadius: 8,
                          background: `${color}25`, border: `1px solid ${color}50`,
                          overflow: "hidden", zIndex: 1,
                        }}
                      >
                        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: progressW, background: `${color}70`, borderRadius: 8 }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card footer */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {project.account_manager && (
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                      AM: <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>{project.account_manager}</span>
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                  Target: <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{formatDate(project.target_date)}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
