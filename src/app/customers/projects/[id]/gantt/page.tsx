"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface GanttItem {
  id: string;
  title: string;
  item_type: "phase" | "milestone" | "task" | "subtask" | "deliverable";
  status: "pending" | "in_progress" | "completed" | "delayed" | "cancelled" | "blocked";
  priority: "low" | "medium" | "high" | "critical";
  start_date: string | null;
  end_date: string | null;
  progress: number;
  assigned_dept: string | null;
  parent_id: string | null;
  phase_id: string | null;
  sort_order: number;
  blocker_reason?: string;
}

interface Dependency { id: string; source_id: string; target_id: string; dependency_type: string; }
interface Milestone { id: string; title: string; due_date: string | null; status: string; color: string; }

type Zoom = "week" | "month" | "quarter";
const DAY_PX: Record<Zoom, number> = { week: 7, month: 3, quarter: 1.5 };
const LEFT_W = 260;
const PHASE_ROW_H = 52;
const ROW_H = 44;
const SUB_ROW_H = 38;
const HEADER_H = 48;

const STATUS_COLOR: Record<string, string> = {
  pending: "#6366f1", in_progress: "#3b82f6", completed: "#22c55e",
  delayed: "#ef4444", blocked: "#f59e0b", cancelled: "#475569",
};
const PRIORITY_DOT: Record<string, string> = {
  low: "#22c55e", medium: "#f59e0b", high: "#ef4444", critical: "#dc2626",
};
const TYPE_ICON: Record<string, string> = {
  phase: "▶", task: "◻", subtask: "·", milestone: "◆", deliverable: "⬡",
};

function rowHeight(type: string) {
  if (type === "phase") return PHASE_ROW_H;
  if (type === "subtask") return SUB_ROW_H;
  return ROW_H;
}

function parseDate(s: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function addDays(d: Date, n: number) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}

function formatMonthLabel(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export default function GanttPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [items, setItems] = useState<GanttItem[]>([]);
  const [deps, setDeps] = useState<Dependency[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState<Zoom>("month");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const syncingRef = useRef(false);

  // Sync vertical scroll between panels
  const syncScroll = useCallback((src: "left" | "right") => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    const top = src === "left" ? leftRef.current?.scrollTop : rightRef.current?.scrollTop;
    if (top !== undefined) {
      if (src === "left" && rightRef.current) rightRef.current.scrollTop = top;
      if (src === "right" && leftRef.current) leftRef.current.scrollTop = top;
    }
    requestAnimationFrame(() => { syncingRef.current = false; });
  }, []);

  useEffect(() => {
    fetch(`/api/customers/projects/${id}/gantt`)
      .then((r) => { if (r.status === 401) { router.replace("/customers"); return null; } return r.json(); })
      .then((d) => {
        if (!d) return;
        setProjectName(d.project_name ?? "Project");
        setItems(d.items ?? []);
        setDeps(d.dependencies ?? []);
        setMilestones(d.milestones ?? []);
        setLoading(false);
      })
      .catch(() => router.replace("/customers"));
  }, [id, router]);

  // Build flat sorted display list
  const displayItems = (() => {
    const phases = items.filter((i) => i.item_type === "phase").sort((a, b) => a.sort_order - b.sort_order);
    const ungrouped = items.filter((i) => i.item_type !== "phase" && !i.phase_id && !i.parent_id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const result: GanttItem[] = [];
    for (const ph of phases) {
      result.push(ph);
      if (!collapsed.has(ph.id)) {
        const children = items
          .filter((i) => i.phase_id === ph.id && i.item_type !== "phase")
          .sort((a, b) => a.sort_order - b.sort_order);
        for (const ch of children) {
          result.push(ch);
          if (ch.item_type !== "subtask") {
            items
              .filter((i) => i.parent_id === ch.id)
              .sort((a, b) => a.sort_order - b.sort_order)
              .forEach((sub) => result.push(sub));
          }
        }
      }
    }
    result.push(...ungrouped);
    return result;
  })();

  // Timeline range
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const allDates = items.flatMap((i) => [parseDate(i.start_date), parseDate(i.end_date)].filter(Boolean) as Date[]);
  milestones.forEach((m) => { const d = parseDate(m.due_date); if (d) allDates.push(d); });

  const rangeStart = allDates.length ? new Date(Math.min(...allDates.map((d) => d.getTime()))) : addDays(today, -14);
  const rangeEnd = allDates.length ? new Date(Math.max(...allDates.map((d) => d.getTime()))) : addDays(today, 60);
  // Pad
  rangeStart.setDate(rangeStart.getDate() - 14);
  rangeEnd.setDate(rangeEnd.getDate() + 14);
  const totalDays = daysBetween(rangeStart, rangeEnd);
  const dpx = DAY_PX[zoom];
  const totalW = Math.max(totalDays * dpx, 600);

  const todayX = daysBetween(rangeStart, today) * dpx;

  // Scroll today into view on mount / zoom change
  useEffect(() => {
    if (rightRef.current) {
      const target = Math.max(0, todayX - rightRef.current.clientWidth * 0.25);
      rightRef.current.scrollLeft = target;
    }
  }, [todayX, loading, zoom]);

  // Build month header segments
  const monthSegs: { label: string; x: number; w: number }[] = [];
  let cur = new Date(rangeStart); cur.setDate(1);
  while (cur <= rangeEnd) {
    const segStart = cur < rangeStart ? rangeStart : new Date(cur);
    const nextMonth = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    const segEnd = nextMonth > rangeEnd ? rangeEnd : nextMonth;
    const x = daysBetween(rangeStart, segStart) * dpx;
    const w = daysBetween(segStart, segEnd) * dpx;
    monthSegs.push({ label: formatMonthLabel(segStart), x, w });
    cur = nextMonth;
  }

  function xForDate(d: Date) { return daysBetween(rangeStart, d) * dpx; }

  function toggleCollapse(id: string) {
    setCollapsed((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  if (loading) return <LoadingSkeleton projectId={id} />;

  const totalH = displayItems.reduce((acc, i) => acc + rowHeight(i.item_type), 0);

  // Dependency SVG arrows
  const itemYMap: Record<string, number> = {};
  let yAcc = 0;
  for (const item of displayItems) {
    itemYMap[item.id] = yAcc + rowHeight(item.item_type) / 2;
    yAcc += rowHeight(item.item_type);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0a0a0f", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 16, flexShrink: 0, flexWrap: "wrap" }}>
        <Link href={`/customers/projects/${id}`} style={{ fontSize: 12, color: "#64748b", textDecoration: "none", whiteSpace: "nowrap" }}>
          ← Back
        </Link>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff", flex: 1 }}>
          {projectName} <span style={{ color: "#64748b", fontWeight: 400 }}>— Gantt</span>
        </h1>

        {/* Zoom */}
        <div style={{ display: "flex", gap: 3, background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 3 }}>
          {(["week", "month", "quarter"] as Zoom[]).map((z) => (
            <button key={z} onClick={() => setZoom(z)} style={{
              padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, border: "none",
              background: zoom === z ? "rgba(99,102,241,0.3)" : "transparent",
              color: zoom === z ? "#a5b4fc" : "#64748b", cursor: "pointer",
            }}>
              {z.charAt(0).toUpperCase() + z.slice(1)}
            </button>
          ))}
        </div>

        <Link href={`/customers/projects/${id}/phases`} style={{ fontSize: 12, color: "#64748b", textDecoration: "none", padding: "5px 12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}>
          Phases →
        </Link>

        {/* Legend */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {Object.entries(STATUS_COLOR).map(([s, c]) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
              <span style={{ fontSize: 11, color: "#64748b", textTransform: "capitalize" }}>{s.replace("_", " ")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left panel */}
        <div
          ref={leftRef}
          onScroll={() => syncScroll("left")}
          style={{ width: LEFT_W, flexShrink: 0, overflowY: "auto", overflowX: "hidden", borderRight: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* Left header spacer */}
          <div style={{ height: HEADER_H, background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", paddingLeft: 16, flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Task</span>
          </div>
          {displayItems.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b", fontSize: 13 }}>
              No schedule items yet.<br />Your team will populate this soon.
            </div>
          ) : (
            displayItems.map((item) => <LeftRow key={item.id} item={item} collapsed={collapsed} onToggle={toggleCollapse} />)
          )}
        </div>

        {/* Right panel */}
        <div
          ref={rightRef}
          onScroll={() => syncScroll("right")}
          style={{ flex: 1, overflow: "auto", position: "relative" }}
        >
          {/* Sticky month header */}
          <div style={{ position: "sticky", top: 0, zIndex: 10, height: HEADER_H, width: totalW, background: "rgba(10,10,15,0.95)", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "stretch" }}>
            {monthSegs.map((seg, i) => (
              <div key={i} style={{
                position: "absolute", left: seg.x, width: seg.w,
                height: "100%", display: "flex", alignItems: "center", paddingLeft: 8,
                borderRight: "1px solid rgba(255,255,255,0.05)",
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", whiteSpace: "nowrap" }}>{seg.label}</span>
              </div>
            ))}
            {/* Today label in header */}
            <div style={{ position: "absolute", left: todayX, top: 0, bottom: 0, display: "flex", alignItems: "center", paddingLeft: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", whiteSpace: "nowrap", background: "#0a0a0f", paddingRight: 3 }}>
                {today.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          </div>

          {/* Grid + bars */}
          <div style={{ position: "relative", width: totalW, minHeight: totalH }}>
            {/* Background grid lines (month boundaries) */}
            {monthSegs.map((seg, i) => (
              <div key={i} style={{ position: "absolute", left: seg.x, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.04)" }} />
            ))}

            {/* Today line */}
            <div style={{ position: "absolute", left: todayX, top: 0, bottom: 0, width: 2, background: "rgba(239,68,68,0.7)", zIndex: 5 }} />

            {/* Dependency SVG */}
            {deps.length > 0 && (
              <svg style={{ position: "absolute", top: 0, left: 0, width: totalW, height: totalH, pointerEvents: "none", zIndex: 4 }}>
                {deps.map((dep) => {
                  const src = items.find((i) => i.id === dep.source_id);
                  const tgt = items.find((i) => i.id === dep.target_id);
                  if (!src || !tgt) return null;
                  const srcEnd = parseDate(src.end_date);
                  const tgtStart = parseDate(tgt.start_date);
                  if (!srcEnd || !tgtStart) return null;
                  const x1 = xForDate(srcEnd) + dpx;
                  const y1 = itemYMap[dep.source_id] ?? 0;
                  const x2 = xForDate(tgtStart);
                  const y2 = itemYMap[dep.target_id] ?? 0;
                  const mx = (x1 + x2) / 2;
                  return (
                    <path key={dep.id} d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
                      stroke="rgba(99,102,241,0.4)" strokeWidth={1.5} fill="none" markerEnd="url(#arr)" />
                  );
                })}
                <defs>
                  <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="rgba(99,102,241,0.5)" />
                  </marker>
                </defs>
              </svg>
            )}

            {/* Rows */}
            {displayItems.map((item) => (
              <TimelineRow key={item.id} item={item} rangeStart={rangeStart} dpx={dpx} totalW={totalW} />
            ))}

            {/* Standalone milestone markers from milestones array */}
            {milestones.map((m) => {
              const d = parseDate(m.due_date);
              if (!d) return null;
              const x = xForDate(d);
              return (
                <div key={m.id} title={m.title} style={{
                  position: "absolute", left: x - 8, top: 8, zIndex: 6,
                  width: 16, height: 16, background: m.color || "#f59e0b",
                  transform: "rotate(45deg)", borderRadius: 2,
                }} />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Left panel row ──────────────────────────────────────────────────────────
function LeftRow({ item, collapsed, onToggle }: { item: GanttItem; collapsed: Set<string>; onToggle: (id: string) => void }) {
  const isPhase = item.item_type === "phase";
  const isSub = item.item_type === "subtask";
  const h = rowHeight(item.item_type);
  const indent = isSub ? 32 : isPhase ? 0 : item.parent_id ? 28 : 0;
  const isCollapsed = collapsed.has(item.id);

  return (
    <div
      style={{
        height: h, display: "flex", alignItems: "center",
        paddingLeft: 12 + indent,
        paddingRight: 12,
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        background: isPhase ? "rgba(99,102,241,0.06)" : "transparent",
        cursor: isPhase ? "pointer" : "default",
        gap: 6,
      }}
      onClick={() => isPhase && onToggle(item.id)}
    >
      {isPhase && (
        <span style={{ fontSize: 9, color: "#6366f1", width: 10, flexShrink: 0, transition: "transform 0.15s", transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)", display: "inline-block" }}>▼</span>
      )}
      <span style={{ fontSize: item.item_type === "milestone" ? 10 : isSub ? 9 : 11, color: STATUS_COLOR[item.status] ?? "#64748b", flexShrink: 0 }}>
        {TYPE_ICON[item.item_type] ?? "◻"}
      </span>
      <span style={{
        fontSize: isPhase ? 12 : isSub ? 11 : 12,
        fontWeight: isPhase ? 700 : 500,
        color: isPhase ? "#e2e8f0" : "#c8d3e0",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
      }}>
        {item.title}
      </span>
      {item.priority && item.priority !== "low" && (
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: PRIORITY_DOT[item.priority] ?? "#64748b", flexShrink: 0 }} />
      )}
      {item.assigned_dept && (
        <span style={{ fontSize: 9, color: "#64748b", background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: 4, whiteSpace: "nowrap", flexShrink: 0 }}>
          {item.assigned_dept}
        </span>
      )}
    </div>
  );
}

// ── Timeline bar row ─────────────────────────────────────────────────────────
function TimelineRow({ item, rangeStart, dpx, totalW }: { item: GanttItem; rangeStart: Date; dpx: number; totalW: number }) {
  const h = rowHeight(item.item_type);
  const isPhase = item.item_type === "phase";
  const isMilestone = item.item_type === "milestone";
  const isDashed = item.item_type === "deliverable";

  const start = parseDate(item.start_date);
  const end = parseDate(item.end_date);

  const color = STATUS_COLOR[item.status] ?? "#6366f1";
  const barH = isPhase ? 28 : h - 20;
  const barTop = (h - barH) / 2;

  let barX = 0, barW = 0;
  if (start && end) {
    barX = daysBetween(rangeStart, start) * dpx;
    barW = Math.max(daysBetween(start, end) * dpx + dpx, 8);
  } else if (start) {
    barX = daysBetween(rangeStart, start) * dpx;
    barW = dpx * 1;
  }

  return (
    <div style={{
      height: h, position: "relative", borderBottom: "1px solid rgba(255,255,255,0.04)",
      background: isPhase ? "rgba(99,102,241,0.03)" : "transparent",
      width: totalW,
    }}>
      {isMilestone ? (
        start && (
          <div title={item.title} style={{
            position: "absolute",
            left: daysBetween(rangeStart, start) * dpx - 8,
            top: (h - 16) / 2,
            width: 16, height: 16,
            background: color, transform: "rotate(45deg)", borderRadius: 2, zIndex: 2,
          }} />
        )
      ) : barW > 0 ? (
        <div style={{
          position: "absolute", left: barX, top: barTop, height: barH, width: barW,
          background: `${color}30`,
          border: isDashed ? `1.5px dashed ${color}80` : `1px solid ${color}60`,
          borderRadius: isPhase ? 4 : 6,
          overflow: "hidden",
        }}>
          {/* Progress fill */}
          {item.progress > 0 && (
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              width: `${item.progress}%`,
              background: `${color}70`,
              borderRadius: "inherit",
            }} />
          )}
          {/* Label */}
          {barW > 40 && (
            <div style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center",
              paddingLeft: 6, zIndex: 1, overflow: "hidden",
            }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                {item.progress > 0 ? `${item.progress}%` : ""}
              </span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function LoadingSkeleton({ projectId }: { projectId: string }) {
  const pulse = {
    background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)",
    backgroundSize: "200% 100%",
    animation: "pulse 1.4s ease-in-out infinite",
  } as React.CSSProperties;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0a0a0f", color: "#fff" }}>
      <style>{`@keyframes pulse { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <div style={{ padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 16 }}>
        <Link href={`/customers/projects/${projectId}`} style={{ fontSize: 12, color: "#64748b", textDecoration: "none" }}>← Back</Link>
        <div style={{ height: 16, width: 200, borderRadius: 4, ...pulse }} />
      </div>
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ width: LEFT_W, borderRight: "1px solid rgba(255,255,255,0.07)", paddingTop: HEADER_H }}>
          {[PHASE_ROW_H, ROW_H, ROW_H, SUB_ROW_H, ROW_H, PHASE_ROW_H, ROW_H, ROW_H].map((h, i) => (
            <div key={i} style={{ height: h, display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ height: 10, width: `${55 + (i % 3) * 15}%`, borderRadius: 4, ...pulse }} />
            </div>
          ))}
        </div>
        <div style={{ flex: 1, paddingTop: HEADER_H }}>
          {[PHASE_ROW_H, ROW_H, ROW_H, SUB_ROW_H, ROW_H, PHASE_ROW_H, ROW_H, ROW_H].map((h, i) => (
            <div key={i} style={{ height: h, display: "flex", alignItems: "center", padding: "0 24px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ height: h - 20, width: `${20 + (i * 13) % 40}%`, marginLeft: `${(i * 7) % 30}%`, borderRadius: 6, ...pulse }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
