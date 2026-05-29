"use client";
import { useEffect, useState } from "react";
import type { Project, ProjectStatus } from "@/types/dashboard";

const STATUS_META: Record<ProjectStatus, { label: string; color: string; bg: string; border: string }> = {
  planning:  { label: "Planning",  color: "#94a3b8", bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.25)" },
  active:    { label: "Active",    color: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.25)"  },
  on_hold:   { label: "On Hold",   color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.25)"  },
  completed: { label: "Completed", color: "#6366f1", bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.25)"  },
  cancelled: { label: "Cancelled", color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.25)" },
};

const KANBAN_COLS: ProjectStatus[] = ["planning","active","on_hold","completed","cancelled"];

function StatusBadge({ status }: { status: ProjectStatus }) {
  const m = STATUS_META[status];
  return (
    <span style={{ display:"inline-block", padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600, color:m.color, background:m.bg, border:`1px solid ${m.border}` }}>
      {m.label}
    </span>
  );
}

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
}

type ViewMode = "list" | "kanban" | "gantt";

export default function PortalProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);
  const [view, setView]         = useState<ViewMode>("list");

  useEffect(() => {
    fetch("/api/portal/projects")
      .then(r => r.json() as Promise<{ projects?: Project[] }>)
      .then(d => setProjects(d.projects ?? []))
      .finally(() => setLoading(false));
  }, []);

  // Gantt helpers
  const withDates = projects.filter(p => p.startDate && p.endDate);
  const ganttProjects = withDates.length > 0 ? withDates : projects.filter(p => p.startDate);
  const ganttStart = ganttProjects.length > 0
    ? new Date(Math.min(...ganttProjects.map(p => new Date(p.startDate!).getTime())))
    : new Date();
  const ganttEnd = withDates.length > 0
    ? new Date(Math.max(...withDates.map(p => new Date(p.endDate!).getTime())))
    : new Date(Date.now() + 90*24*60*60*1000);
  const totalDays = Math.max((ganttEnd.getTime()-ganttStart.getTime())/(1000*60*60*24), 30);

  function barStyle(p: Project) {
    if (!p.startDate) return null;
    const left     = (new Date(p.startDate).getTime()-ganttStart.getTime())/(1000*60*60*24);
    const duration = p.endDate ? (new Date(p.endDate).getTime()-new Date(p.startDate).getTime())/(1000*60*60*24) : 14;
    return { left:`${(left/totalDays)*100}%`, width:`${Math.max((duration/totalDays)*100,2)}%` };
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 text-sm mt-0.5">{projects.length} project{projects.length!==1?"s":""} assigned to your account</p>
        </div>
        {/* View toggle */}
        <div className="flex rounded-xl overflow-hidden border" style={{ borderColor:"rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.03)" }}>
          {(["list","kanban","gantt"] as ViewMode[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className="px-3 py-1.5 text-xs font-medium capitalize transition-all"
              style={{ background:view===v?"rgba(99,102,241,0.2)":"transparent", color:view===v?"#a5b4fc":"#64748b" }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">Loading…</div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-600 mb-4">
            <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
          </svg>
          <p className="text-slate-400 font-medium">No projects assigned yet</p>
          <p className="text-slate-600 text-sm mt-1">Your account manager will add projects here</p>
        </div>
      ) : view === "list" ? (
        /* ─── List View ─────────────────────────────────────────────── */
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor:"rgba(255,255,255,0.07)" }}>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b" style={{ background:"rgba(255,255,255,0.025)", borderColor:"rgba(255,255,255,0.07)" }}>
                {["Project","Status","Start","End"].map((h,i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i<projects.length-1?"1px solid rgba(255,255,255,0.04)":"none" }} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background:p.color??"#6366f1" }} />
                      <span className="text-white font-medium">{p.name}</span>
                    </div>
                    {p.description && <p className="text-xs text-slate-500 mt-0.5 ml-5">{p.description}</p>}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(p.startDate)}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(p.endDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : view === "kanban" ? (
        /* ─── Kanban View ────────────────────────────────────────────── */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLS.map(col => {
            const colP = projects.filter(p => p.status===col);
            const m = STATUS_META[col];
            return (
              <div key={col} className="flex-shrink-0 w-60">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full" style={{ background:m.color }} />
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{m.label}</span>
                  <span className="ml-auto text-xs text-slate-600">{colP.length}</span>
                </div>
                <div className="flex flex-col gap-3">
                  {colP.map(p => (
                    <div key={p.id} className="rounded-2xl p-4" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
                      <div className="flex items-start gap-2 mb-2">
                        <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ background:p.color??"#6366f1" }} />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white leading-snug">{p.name}</div>
                        </div>
                      </div>
                      {p.description && <p className="text-xs text-slate-500 mb-2 line-clamp-2">{p.description}</p>}
                      {(p.startDate||p.endDate) && (
                        <div className="text-xs text-slate-600 mt-1">{formatDate(p.startDate)} → {formatDate(p.endDate)}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ─── Gantt View ─────────────────────────────────────────────── */
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor:"rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.02)" }}>
          {ganttProjects.length===0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No project dates available for Gantt view.</div>
          ) : (
            <>
              <div className="flex border-b" style={{ background:"rgba(255,255,255,0.025)", borderColor:"rgba(255,255,255,0.07)" }}>
                <div className="w-44 flex-shrink-0 px-4 py-2 text-xs font-semibold text-slate-500 border-r" style={{ borderColor:"rgba(255,255,255,0.07)" }}>Project</div>
                <div className="flex-1 relative h-8">
                  {Array.from({length:Math.ceil(totalDays/30)}).map((_,i) => {
                    const d = new Date(ganttStart.getTime()+i*30*24*60*60*1000);
                    return <div key={i} className="absolute top-0 h-full flex items-center text-xs text-slate-600 pl-1" style={{ left:`${(i*30/totalDays)*100}%` }}>{d.toLocaleDateString("en-US",{month:"short"})}</div>;
                  })}
                </div>
              </div>
              {ganttProjects.map(p => {
                const bar = barStyle(p);
                return (
                  <div key={p.id} className="flex items-center border-b hover:bg-white/[0.01]" style={{ minHeight:44, borderColor:"rgba(255,255,255,0.04)" }}>
                    <div className="w-44 flex-shrink-0 px-4 py-2 border-r" style={{ borderColor:"rgba(255,255,255,0.07)" }}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background:p.color??"#6366f1" }} />
                        <span className="text-xs font-medium text-white truncate">{p.name}</span>
                      </div>
                    </div>
                    <div className="flex-1 relative h-8">
                      {bar && (
                        <div className="absolute top-1 h-6 rounded-full flex items-center px-2 text-xs text-white font-medium truncate"
                          style={{ left:bar.left, width:bar.width, background:p.color??"#6366f1", opacity:0.85 }}>
                          {p.name}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
