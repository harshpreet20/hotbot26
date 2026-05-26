"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import type { Role, TicketPriority, TicketStatus } from "@/types/dashboard";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface MemberStats {
  leadsAssigned: number;
  leadsWon: number;
  tasksAssigned: number;
  tasksDone: number;
  ticketsAssigned: number;
  ticketsResolved: number;
  internalIssuesRaisedAgainst: number;
  internalIssuesOpen: number;
  blogPosts: number;
  crmUpdates: number;
}

interface ActivityItem {
  type: string;
  content: string;
  createdAt: string;
}

interface InternalTicket {
  id: string;
  ticketNumber: string;
  title: string;
  priority: TicketPriority;
  status: TicketStatus;
  raisedBy?: string;
  createdAt: string;
}

interface TeamProfile {
  member: { username: string; role: Role };
  stats: MemberStats;
  recentActivity: ActivityItem[];
  internalIssues: InternalTicket[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ROLE_BADGE: Record<Role, { label: string; color: string }> = {
  super_admin:  { label: "Super Admin",  color: "#f43f5e" },
  admin:        { label: "Admin",        color: "#818cf8" },
  manager:      { label: "Manager",      color: "#34d399" },
  sales:        { label: "Sales",        color: "#f97316" },
  crm_operator: { label: "CRM Operator", color: "#a78bfa" },
  finance:      { label: "Finance",      color: "#10b981" },
  editor:       { label: "Editor",       color: "#3b82f6" },
  contributor:  { label: "Contributor",  color: "#06b6d4" },
  agent:        { label: "Agent",        color: "#f59e0b" },
};

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  low:      "#64748b",
  medium:   "#3b82f6",
  high:     "#f59e0b",
  critical: "#ef4444",
};

const STATUS_META: Record<TicketStatus, { label: string; color: string }> = {
  draft:       { label: "Draft",       color: "#64748b" },
  open:        { label: "Open",        color: "#3b82f6" },
  in_progress: { label: "In Progress", color: "#f59e0b" },
  waiting:     { label: "Waiting",     color: "#8b5cf6" },
  resolved:    { label: "Resolved",    color: "#22c55e" },
  closed:      { label: "Closed",      color: "#475569" },
};

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  note:           "Note",
  call:           "Call",
  email:          "Email",
  meeting:        "Meeting",
  status_change:  "Status Change",
  assignment:     "Assignment",
  task_linked:    "Task Linked",
  invoice_linked: "Invoice Linked",
};

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <p className="text-slate-500 text-xs mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color: accent ?? "#e2e8f0" }}>{value}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TeamMemberPage() {
  const router  = useRouter();
  const params  = useParams();
  const username = typeof params?.username === "string" ? params.username : "";

  const [profile, setProfile] = useState<TeamProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    const secret = getSecret();
    if (!secret) { router.replace("/enter/backdrop"); return; }

    fetch(`/api/dashboard/team/${encodeURIComponent(username)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    })
      .then((r) => {
        if (r.status === 401) { ["backdrop_secret","backdrop_role","backdrop_username"].forEach((k)=>sessionStorage.removeItem(k)); router.replace("/enter/backdrop"); return null; }
        if (r.status === 404) { setError("Team member not found."); return null; }
        return r.json();
      })
      .then((d) => { if (d) setProfile(d as TeamProfile); })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, [username, router]);

  const badge = profile ? (ROLE_BADGE[profile.member.role] ?? { label: profile.member.role, color: "#64748b" }) : null;

  return (
    <>
      <div className="flex flex-col min-h-full">
        {/* Header */}
        <header
          className="flex items-center gap-4 px-6 py-4 border-b shrink-0"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <Link
            href="/enter/backdrop/dashboard/team"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Team
          </Link>
        </header>

        {/* Body */}
        <div className="flex-1 px-6 py-6 space-y-8">
          {loading && (
            <p className="text-slate-500 text-sm">Loading…</p>
          )}

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          {!loading && !error && profile && (
            <>
              {/* Member identity */}
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
                  style={{ background: `${badge!.color}22`, color: badge!.color }}
                >
                  {profile.member.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-white text-lg font-semibold">{profile.member.username}</h1>
                  <span
                    className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: `${badge!.color}20`, color: badge!.color }}
                  >
                    {badge!.label}
                  </span>
                </div>
              </div>

              {/* Stats grid */}
              <section>
                <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Performance Stats</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <StatCard label="Leads Assigned"  value={profile.stats.leadsAssigned} />
                  <StatCard label="Leads Won"        value={profile.stats.leadsWon}       accent="#22c55e" />
                  <StatCard label="Tasks Assigned"   value={profile.stats.tasksAssigned} />
                  <StatCard label="Tasks Done"       value={profile.stats.tasksDone}      accent="#22c55e" />
                  <StatCard label="Tickets Assigned" value={profile.stats.ticketsAssigned} />
                  <StatCard
                    label="Internal Issues"
                    value={profile.stats.internalIssuesRaisedAgainst}
                    accent={profile.stats.internalIssuesRaisedAgainst > 0 ? "#f59e0b" : undefined}
                  />
                </div>
              </section>

              {/* Internal issues table */}
              {profile.internalIssues.length > 0 && (
                <section>
                  <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                    Internal Issues Raised Against {profile.member.username}
                    {profile.stats.internalIssuesOpen > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px]" style={{ background: "#f59e0b22", color: "#f59e0b" }}>
                        {profile.stats.internalIssuesOpen} open
                      </span>
                    )}
                  </h2>
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                          <th className="text-left px-4 py-2.5 text-slate-500 text-xs font-semibold">Ticket</th>
                          <th className="text-left px-4 py-2.5 text-slate-500 text-xs font-semibold">Title</th>
                          <th className="text-left px-4 py-2.5 text-slate-500 text-xs font-semibold">Priority</th>
                          <th className="text-left px-4 py-2.5 text-slate-500 text-xs font-semibold">Status</th>
                          <th className="text-left px-4 py-2.5 text-slate-500 text-xs font-semibold">Raised By</th>
                          <th className="text-left px-4 py-2.5 text-slate-500 text-xs font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profile.internalIssues.map((t, i) => {
                          const pColor = PRIORITY_COLORS[t.priority] ?? "#64748b";
                          const sMeta  = STATUS_META[t.status]       ?? { label: t.status, color: "#64748b" };
                          return (
                            <tr
                              key={t.id}
                              style={{
                                borderBottom: i < profile.internalIssues.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                              }}
                            >
                              <td className="px-4 py-3 text-slate-400 font-mono text-xs">{t.ticketNumber}</td>
                              <td className="px-4 py-3 text-slate-200 max-w-xs truncate">{t.title}</td>
                              <td className="px-4 py-3">
                                <span
                                  className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                  style={{ background: `${pColor}20`, color: pColor }}
                                >
                                  {t.priority}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                  style={{ background: `${sMeta.color}20`, color: sMeta.color }}
                                >
                                  {sMeta.label}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-400 text-xs">{t.raisedBy ?? "—"}</td>
                              <td className="px-4 py-3 text-slate-500 text-xs">
                                {new Date(t.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Recent activity timeline */}
              {profile.recentActivity.length > 0 && (
                <section>
                  <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Recent CRM Activity</h2>
                  <div className="space-y-2">
                    {profile.recentActivity.map((a, i) => (
                      <div
                        key={i}
                        className="flex gap-3 rounded-xl px-4 py-3"
                        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        {/* Type dot */}
                        <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: "#818cf8" }}
                          />
                          {i < profile.recentActivity.length - 1 && (
                            <span className="w-px flex-1 min-h-[8px]" style={{ background: "rgba(129,140,248,0.15)" }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "#818cf820", color: "#818cf8" }}>
                              {ACTIVITY_TYPE_LABELS[a.type] ?? a.type}
                            </span>
                            <span className="text-slate-600 text-[10px]">
                              {new Date(a.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                              {" "}
                              {new Date(a.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm leading-snug line-clamp-2">{a.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {profile.recentActivity.length === 0 && profile.internalIssues.length === 0 && (
                <p className="text-slate-600 text-sm">No activity recorded yet for this team member.</p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
