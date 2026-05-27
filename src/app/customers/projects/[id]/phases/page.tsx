"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Phase {
  id: string;
  name: string;
  phase_type: "discovery"|"design"|"development"|"review"|"testing"|"deployment"|"launch"|"support"|"sprint"|"approval"|"ai_workflow"|"onboarding"|"custom";
  status: "upcoming"|"active"|"completed"|"delayed"|"on_hold"|"cancelled";
  start_date: string | null;
  end_date: string | null;
  progress: number;
  color: string;
  description: string | null;
  deliverables: string[];
  assigned_team: string[];
  sort_order: number;
}

interface Milestone {
  id: string;
  title: string;
  due_date: string | null;
  status: string;
  color: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  start_date: string | null;
  target_date: string | null;
}

const TYPE_COLORS: Record<string, string> = {
  discovery: "#8b5cf6", design: "#a78bfa", development: "#3b82f6",
  review: "#f59e0b", testing: "#10b981", deployment: "#ec4899",
  launch: "#22c55e", support: "#64748b", sprint: "#06b6d4",
  approval: "#ef4444", ai_workflow: "#6366f1", onboarding: "#f97316", custom: "#94a3b8",
};

const TYPE_ICONS: Record<string, string> = {
  discovery: "🔍", design: "🎨", development: "⚙️", review: "👁️",
  testing: "🧪", deployment: "🚀", launch: "🎉", support: "🛟",
  sprint: "⚡", approval: "✅", ai_workflow: "🤖", onboarding: "👋", custom: "📌",
};

const STATUS_BADGE: Record<string, { bg: string; color: string; text: string }> = {
  upcoming:  { bg: "rgba(148,163,184,0.15)", color: "#94a3b8", text: "Upcoming" },
  active:    { bg: "rgba(34,197,94,0.15)",   color: "#22c55e", text: "In Progress" },
  completed: { bg: "rgba(99,102,241,0.15)",  color: "#818cf8", text: "Completed" },
  delayed:   { bg: "rgba(239,68,68,0.15)",   color: "#ef4444", text: "Delayed" },
  on_hold:   { bg: "rgba(245,158,11,0.15)",  color: "#f59e0b", text: "On Hold" },
  cancelled: { bg: "rgba(100,116,139,0.15)", color: "#64748b", text: "Cancelled" },
};

function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function phaseColor(phase: Phase): string {
  return phase.color || TYPE_COLORS[phase.phase_type] || "#6366f1";
}

const TIMELINE_H = 64;
const LABEL_W = 0;

export default function PhasesPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [project, setProject]     = useState<Project | null>(null);
  const [phases, setPhases]       = useState<Phase[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/customers/projects/${id}/phases`)
      .then((r) => {
        if (r.status === 401) { router.replace("/customers"); return null; }
        return r.ok ? r.json() : null;
      })
      .then((data) => {
        if (data) {
          setProject(data.project ?? null);
          setPhases((data.phases ?? []).sort((a: Phase, b: Phase) => a.sort_order - b.sort_order));
          setMilestones(data.milestones ?? []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15 }}>Loading timeline…</p>
      </div>
    );
  }

  const projectName = project?.name ?? "Project";

  // ── Timeline date range ──────────────────────────────────────────────────────
  const now = new Date();
  const allDates: Date[] = [];
  for (const p of phases) {
    if (p.start_date) allDates.push(new Date(p.start_date));
    if (p.end_date)   allDates.push(new Date(p.end_date));
  }
  for (const m of milestones) {
    if (m.due_date) allDates.push(new Date(m.due_date));
  }

  let rangeStart = allDates.length ? new Date(Math.min(...allDates.map(d => d.getTime()))) : now;
  let rangeEnd   = allDates.length ? new Date(Math.max(...allDates.map(d => d.getTime()))) : now;

  // Pad 2 weeks on each side
  rangeStart = new Date(rangeStart.getTime() - 14 * 86400000);
  rangeEnd   = new Date(rangeEnd.getTime()   + 14 * 86400000);

  const totalMs = rangeEnd.getTime() - rangeStart.getTime();

  function xPct(date: Date): number {
    return Math.max(0, Math.min(100, ((date.getTime() - rangeStart.getTime()) / totalMs) * 100));
  }

  // Month markers
  const monthMarkers: { label: string; pct: number; year: number }[] = [];
  {
    let cur = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
    while (cur < rangeEnd) {
      monthMarkers.push({
        label: cur.toLocaleDateString("en-GB", { month: "short" }),
        year: cur.getFullYear(),
        pct: xPct(cur),
      });
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }
  }

  const todayPct = xPct(now);
  const hasPhases = phases.length > 0;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", padding: "32px 24px", fontFamily: "inherit" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Back link */}
        <button
          onClick={() => router.push(`/customers/projects/${id}`)}
          style={{ background: "none", border: "none", color: "#6366f1", fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}
        >
          ← Back to {projectName}
        </button>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28, padding: "4px", background: "rgba(255,255,255,0.04)", borderRadius: 10, width: "fit-content", border: "1px solid rgba(255,255,255,0.07)" }}>
          {[
            { label: "Updates",    href: `/customers/projects/${id}` },
            { label: "Gantt Chart", href: `/customers/projects/${id}/gantt` },
            { label: "Timeline",   href: `/customers/projects/${id}/phases` },
          ].map((tab) => {
            const active = tab.href === `/customers/projects/${id}/phases`;
            return (
              <button
                key={tab.label}
                onClick={() => router.push(tab.href)}
                style={{
                  padding: "6px 16px", borderRadius: 7, border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: 500,
                  background: active ? "rgba(99,102,241,0.2)" : "transparent",
                  color: active ? "#818cf8" : "rgba(255,255,255,0.45)",
                  transition: "all 0.15s",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Page title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
            Project Timeline
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
            {phases.length} phase{phases.length !== 1 ? "s" : ""} · Waterfall view
          </p>
        </div>

        {!hasPhases ? (
          /* ── Empty state ── */
          <div style={{ textAlign: "center", padding: "80px 32px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🗓️</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600, color: "#e2e8f0" }}>No phases yet</h2>
            <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.35)", maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
              Your project timeline will appear here once the team sets up the project phases and milestones.
            </p>
          </div>
        ) : (
          <>
            {/* ── SECTION A: Horizontal Gantt strip ── */}
            <div style={{ marginBottom: 36, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
              {/* Month header */}
              <div style={{ position: "relative", height: 32, borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                {monthMarkers.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: `${m.pct}%`,
                      top: 0, height: "100%",
                      display: "flex", alignItems: "center",
                      paddingLeft: 8,
                    }}
                  >
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 500, whiteSpace: "nowrap" }}>
                      {m.label} {i === 0 || m.label === "Jan" ? m.year : ""}
                    </span>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.05)" }} />
                  </div>
                ))}
              </div>

              {/* Phase rows */}
              <div style={{ padding: "12px 0 16px" }}>
                {phases.map((phase) => {
                  const color  = phaseColor(phase);
                  const isActive = phase.status === "active";
                  const start  = phase.start_date ? new Date(phase.start_date) : null;
                  const end    = phase.end_date   ? new Date(phase.end_date)   : null;
                  const left   = start ? xPct(start) : null;
                  const right  = end   ? xPct(end)   : null;
                  const width  = (left !== null && right !== null) ? Math.max(right - left, 1) : null;

                  return (
                    <div key={phase.id} style={{ position: "relative", height: TIMELINE_H, marginBottom: 4 }}>
                      {/* Month grid lines */}
                      {monthMarkers.map((m, i) => (
                        <div key={i} style={{ position: "absolute", left: `${m.pct}%`, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.04)" }} />
                      ))}

                      {/* Today line */}
                      {todayPct >= 0 && todayPct <= 100 && (
                        <div style={{ position: "absolute", left: `${todayPct}%`, top: 0, bottom: 0, width: 1.5, background: "rgba(239,68,68,0.7)", zIndex: 3 }} />
                      )}

                      {/* Phase label on left */}
                      <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", zIndex: 4, display: "flex", alignItems: "center", gap: 6, pointerEvents: "none" }}>
                        <span style={{ fontSize: 12 }}>{TYPE_ICONS[phase.phase_type] ?? "📌"}</span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 500, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {phase.name}
                        </span>
                      </div>

                      {/* Bar */}
                      {left !== null && width !== null && (
                        <div
                          style={{
                            position: "absolute",
                            left: `${left}%`,
                            width: `${width}%`,
                            top: "50%",
                            transform: "translateY(-50%)",
                            height: 28,
                            borderRadius: 6,
                            background: `${color}30`,
                            border: `1px solid ${color}60`,
                            overflow: "hidden",
                            zIndex: 2,
                            boxShadow: isActive ? `0 0 0 1px ${color}80, 0 0 10px ${color}30` : "none",
                            animation: isActive ? "pulseGlow 2s infinite" : "none",
                          }}
                        >
                          {/* Progress fill */}
                          <div
                            style={{
                              position: "absolute", left: 0, top: 0, bottom: 0,
                              width: `${phase.progress}%`,
                              background: `${color}60`,
                              borderRadius: 6,
                            }}
                          />
                          <span style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 9, color: color, fontWeight: 700 }}>
                            {phase.progress}%
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Milestone markers */}
                {milestones.map((ms) => {
                  if (!ms.due_date) return null;
                  const pct = xPct(new Date(ms.due_date));
                  return (
                    <div key={ms.id} style={{ position: "absolute", left: `${pct}%`, top: 0, bottom: 0, zIndex: 5, pointerEvents: "none" }}>
                      <div style={{ position: "absolute", top: 0, bottom: 0, width: 1, borderLeft: "1.5px dashed rgba(255,255,255,0.2)" }} />
                      <div style={{ position: "absolute", top: 4, left: 4, fontSize: 9, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {ms.title}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Today label at bottom */}
              {todayPct >= 0 && todayPct <= 100 && (
                <div style={{ position: "relative", height: 20, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ position: "absolute", left: `${todayPct}%`, bottom: 2, transform: "translateX(-50%)", fontSize: 9, color: "#ef4444", fontWeight: 600 }}>
                    TODAY
                  </div>
                </div>
              )}
            </div>

            {/* ── SECTION B: Phase Cards ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {phases.map((phase, idx) => {
                const color    = phaseColor(phase);
                const badge    = STATUS_BADGE[phase.status] ?? STATUS_BADGE.upcoming;
                const isActive = phase.status === "active";
                const num      = String(idx + 1).padStart(2, "0");

                return (
                  <div
                    key={phase.id}
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderLeft: `3px solid ${color}`,
                      borderRadius: 12,
                      padding: "20px 24px",
                      transition: "background 0.15s",
                      boxShadow: isActive ? `0 0 0 1px ${color}40, 0 4px 24px ${color}20` : "none",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                    onMouseLeave={e => (e.currentTarget.style.background = isActive ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.02)")}
                  >
                    {/* Card header */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
                      {/* Phase number badge */}
                      <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 8, background: `${color}20`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color }}>{num}</span>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 14 }}>{TYPE_ICONS[phase.phase_type] ?? "📌"}</span>
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                            {phase.phase_type.replace("_", " ")}
                          </span>
                          <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: badge.bg, color: badge.color }}>
                            {badge.text}
                          </span>
                        </div>
                        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.01em" }}>
                          {phase.name}
                        </h3>
                      </div>

                      {/* Date range */}
                      <div style={{ flexShrink: 0, textAlign: "right" }}>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 2 }}>
                          {fmt(phase.start_date)} — {fmt(phase.end_date)}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ marginBottom: phase.description || phase.deliverables.length > 0 || phase.assigned_team.length > 0 ? 14 : 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Progress</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color }}>{phase.progress}%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 4, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${phase.progress}%`, borderRadius: 4, background: color, transition: "width 0.5s ease" }} />
                      </div>
                    </div>

                    {/* Description */}
                    {phase.description && (
                      <p style={{ margin: "0 0 14px", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
                        {phase.description}
                      </p>
                    )}

                    {/* Deliverables */}
                    {phase.deliverables.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <p style={{ margin: "0 0 8px", fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Deliverables</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                          {phase.deliverables.map((d, i) => {
                            const done = phase.status === "completed";
                            return (
                              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                                <span style={{ fontSize: 12, color: done ? "#22c55e" : "rgba(255,255,255,0.25)", flexShrink: 0, marginTop: 1 }}>
                                  {done ? "✓" : "○"}
                                </span>
                                <span style={{ fontSize: 13, color: done ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.7)", textDecoration: done ? "line-through" : "none" }}>
                                  {d}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Assigned team */}
                    {phase.assigned_team.length > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Team:</span>
                        {phase.assigned_team.map((member, i) => (
                          <span
                            key={i}
                            style={{
                              padding: "3px 10px", borderRadius: 20,
                              background: "rgba(255,255,255,0.07)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 500,
                            }}
                          >
                            {member}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
