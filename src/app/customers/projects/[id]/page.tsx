"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { portalClient } from "@/lib/supabase-portal";

interface Project {
  id: string;
  project_number: string;
  name: string;
  description?: string;
  status: string;
  stage?: string;
  priority?: string;
  progress: number;
  start_date?: string;
  target_date?: string;
  account_manager?: string;
  assigned_to?: string[];
}

interface Update {
  id: string;
  type: string;
  title: string;
  content: string;
  author_name: string;
  author_email: string;
  author_type: string;
  attachments?: { name: string; url: string }[];
  pinned: boolean;
  visibility?: string;
  created_at: string;
}

interface Comment {
  id: string;
  update_id: string;
  content: string;
  author_name: string;
  author_type: string;
  created_at: string;
}

interface Reaction {
  id: string;
  update_id: string;
  author_email: string;
  emoji: string;
}

const UPDATE_ICONS: Record<string, string> = {
  deployment:       "🚀",
  milestone:        "✅",
  approval_needed:  "🎨",
  blocker:          "⚠️",
  sprint_summary:   "📋",
  update:           "💬",
};

const STATUS_COLORS: Record<string, string> = {
  active:    "#22c55e",
  completed: "#6366f1",
  on_hold:   "#f59e0b",
  review:    "#3b82f6",
  planning:  "#8b5cf6",
};

const REACTION_EMOJIS = ["👍", "✅", "🔥", "👀"];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m    = Math.floor(diff / 60000);
  if (m < 1)   return "just now";
  if (m < 60)  return `${m}m ago`;
  const h    = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d    = Math.floor(h / 24);
  return `${d}d ago`;
}

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Initials({ name, size = 32 }: { name: string; size?: number }) {
  const parts = name.split(" ");
  const init  = parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return (
    <div style={{
      width: size, height: size,
      borderRadius: "50%",
      background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, color: "#fff",
      flexShrink: 0,
    }}>
      {init.toUpperCase()}
    </div>
  );
}

function renderContent(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
}

export default function ProjectDetailPage() {
  const router    = useRouter();
  const { id }    = useParams() as { id: string };
  const [project,   setProject]   = useState<Project | null>(null);
  const [updates,   setUpdates]   = useState<Update[]>([]);
  const [comments,  setComments]  = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs]       = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);

  useEffect(() => {
    // Get current user email
    fetch("/api/customers/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.user?.email) setUserEmail(d.user.email); });
  }, []);

  useEffect(() => {
    fetch(`/api/customers/projects/${id}`)
      .then((r) => {
        if (r.status === 401) { router.replace("/customers"); return null; }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        if (d.error) { router.replace("/customers/projects"); return; }
        setProject(d.project);
        setUpdates(d.updates ?? []);
        setComments(d.comments ?? []);
        setReactions(d.reactions ?? []);
        setLoading(false);
      })
      .catch(() => router.replace("/customers"));
  }, [id, router]);

  // Realtime subscription
  useEffect(() => {
    if (!id) return;
    const channel = portalClient
      .channel(`project-updates-${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "project_updates", filter: `project_id=eq.${id}` },
        (payload) => {
          const newUpd = payload.new as Update;
          if (newUpd.visibility === "client") {
            setUpdates((prev) => [newUpd, ...prev]);
          }
        },
      )
      .subscribe();
    return () => { portalClient.removeChannel(channel); };
  }, [id]);

  async function handleReact(updateId: string, emoji: string) {
    const res  = await fetch(`/api/customers/projects/${id}/react`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ update_id: updateId, emoji }),
    });
    const data = await res.json() as { reactions?: Reaction[] };
    if (data.reactions) {
      setReactions((prev) => [
        ...prev.filter((r) => r.update_id !== updateId),
        ...data.reactions!,
      ]);
    }
  }

  async function handleComment(updateId: string) {
    const content = commentInputs[updateId]?.trim();
    if (!content) return;
    setSubmittingComment(updateId);
    const res  = await fetch(`/api/customers/projects/${id}/comment`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ update_id: updateId, content }),
    });
    const data = await res.json() as { comment?: Comment };
    if (data.comment) {
      setComments((prev) => [...prev, data.comment!]);
      setCommentInputs((prev) => ({ ...prev, [updateId]: "" }));
    }
    setSubmittingComment(null);
  }

  function toggleComments(updateId: string) {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(updateId)) next.delete(updateId);
      else next.add(updateId);
      return next;
    });
  }

  if (loading) {
    return (
      <div style={{ padding: "32px 40px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ color: "#64748b", fontSize: 14 }}>Loading project…</div>
      </div>
    );
  }

  if (!project) return null;

  const milestones = updates.filter((u) => u.type === "milestone");

  return (
    <div style={{ padding: "32px 40px", overflow: "auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <Link href="/customers/projects" style={{ fontSize: 12, color: "#64748b", textDecoration: "none", marginBottom: 12, display: "inline-block" }}>
            ← Back to Projects
          </Link>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", fontFamily: "monospace" }}>{project.project_number}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: STATUS_COLORS[project.status] ?? "#6366f1",
                  background: `${STATUS_COLORS[project.status] ?? "#6366f1"}18`,
                  padding: "2px 8px", borderRadius: 100, textTransform: "capitalize",
                }}>
                  {project.status.replace("_", " ")}
                </span>
                {project.stage && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 100 }}>
                    {project.stage}
                  </span>
                )}
              </div>
              <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 700, color: "#fff" }}>{project.name}</h1>
              {project.description && (
                <p style={{ margin: 0, fontSize: 14, color: "#64748b", maxWidth: 600 }}>{project.description}</p>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 20, maxWidth: 500 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>Overall Progress</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{project.progress ?? 0}%</span>
            </div>
            <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${project.progress ?? 0}%`, background: "linear-gradient(90deg,#6366f1,#8b5cf6)", borderRadius: 10, transition: "width 0.5s" }} />
            </div>
          </div>
        </div>

        {/* 2-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, alignItems: "start" }}>
          {/* Feed */}
          <div>
            <h2 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 600, color: "#e2e8f0" }}>
              Project Updates
              {updates.length > 0 && <span style={{ fontSize: 12, color: "#64748b", marginLeft: 8, fontWeight: 400 }}>{updates.length} update{updates.length !== 1 ? "s" : ""}</span>}
            </h2>

            {updates.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, color: "#64748b", fontSize: 14 }}>
                No updates yet. Your team will post here as work progresses.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {updates.map((upd) => {
                  const updateReactions  = reactions.filter((r) => r.update_id === upd.id);
                  const updateComments   = comments.filter((c) => c.update_id === upd.id);
                  const isExpanded       = expandedComments.has(upd.id);

                  // Group reactions by emoji
                  const reactionGroups: Record<string, { count: number; hasMe: boolean }> = {};
                  for (const r of updateReactions) {
                    if (!reactionGroups[r.emoji]) reactionGroups[r.emoji] = { count: 0, hasMe: false };
                    reactionGroups[r.emoji].count++;
                    if (r.author_email === userEmail) reactionGroups[r.emoji].hasMe = true;
                  }

                  return (
                    <div
                      key={upd.id}
                      style={{
                        background: upd.pinned ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${upd.pinned ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.07)"}`,
                        borderRadius: 16,
                        padding: "20px",
                        transition: "border-color 0.15s",
                      }}
                    >
                      {upd.pinned && (
                        <div style={{ fontSize: 11, color: "#6366f1", fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
                          📌 Pinned update
                        </div>
                      )}

                      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                        <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>
                          {UPDATE_ICONS[upd.type] ?? "💬"}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 600, color: "#fff" }}>{upd.title}</p>
                          <div
                            style={{ margin: "0 0 14px", fontSize: 14, color: "#94a3b8", lineHeight: 1.7 }}
                            dangerouslySetInnerHTML={{ __html: renderContent(upd.content) }}
                          />

                          {/* Attachments */}
                          {upd.attachments && upd.attachments.length > 0 && (
                            <div style={{ marginBottom: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
                              {upd.attachments.map((att, i) => (
                                <a
                                  key={i}
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: "inline-flex", alignItems: "center", gap: 4,
                                    padding: "4px 10px",
                                    background: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: 8, fontSize: 12, color: "#a5b4fc",
                                    textDecoration: "none",
                                  }}
                                >
                                  📎 {att.name}
                                </a>
                              ))}
                            </div>
                          )}

                          {/* Author + time */}
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                            <Initials name={upd.author_name || "Team"} size={24} />
                            <span style={{ fontSize: 12, color: "#64748b" }}>{upd.author_name}</span>
                            <span style={{ fontSize: 12, color: "#475569" }}>·</span>
                            <span style={{ fontSize: 12, color: "#475569" }}>{timeAgo(upd.created_at)}</span>
                          </div>

                          {/* Reaction bar */}
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            {REACTION_EMOJIS.map((emoji) => {
                              const group = reactionGroups[emoji];
                              return (
                                <button
                                  key={emoji}
                                  onClick={() => handleReact(upd.id, emoji)}
                                  style={{
                                    display: "inline-flex", alignItems: "center", gap: 4,
                                    padding: "3px 8px",
                                    background: group?.hasMe ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)",
                                    border: `1px solid ${group?.hasMe ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.1)"}`,
                                    borderRadius: 8, fontSize: 13,
                                    cursor: "pointer", color: "#fff",
                                    transition: "all 0.1s",
                                  }}
                                >
                                  {emoji}
                                  {group && <span style={{ fontSize: 11, color: "#94a3b8" }}>{group.count}</span>}
                                </button>
                              );
                            })}

                            <button
                              onClick={() => toggleComments(upd.id)}
                              style={{
                                marginLeft: 4,
                                padding: "3px 8px",
                                background: "none",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: 8, fontSize: 12,
                                cursor: "pointer", color: "#64748b",
                              }}
                            >
                              💬 {updateComments.length > 0 ? updateComments.length : ""} {isExpanded ? "Hide" : "Comment"}
                            </button>
                          </div>

                          {/* Comments section */}
                          {isExpanded && (
                            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                              {updateComments.map((c) => (
                                <div key={c.id} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                                  <Initials name={c.author_name || "You"} size={26} />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                                      <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{c.author_name}</span>
                                      <span style={{ fontSize: 11, color: "#475569" }}>{timeAgo(c.created_at)}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{c.content}</p>
                                  </div>
                                </div>
                              ))}

                              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                                <input
                                  type="text"
                                  value={commentInputs[upd.id] ?? ""}
                                  onChange={(e) => setCommentInputs((prev) => ({ ...prev, [upd.id]: e.target.value }))}
                                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleComment(upd.id); } }}
                                  placeholder="Add a comment…"
                                  style={{
                                    flex: 1,
                                    padding: "8px 12px",
                                    background: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: 8, color: "#fff", fontSize: 13, outline: "none",
                                  }}
                                />
                                <button
                                  onClick={() => handleComment(upd.id)}
                                  disabled={!commentInputs[upd.id]?.trim() || submittingComment === upd.id}
                                  style={{
                                    padding: "8px 14px",
                                    background: "#6366f1",
                                    border: "none", borderRadius: 8,
                                    color: "#fff", fontSize: 13, fontWeight: 600,
                                    cursor: "pointer", opacity: (!commentInputs[upd.id]?.trim() || submittingComment === upd.id) ? 0.5 : 1,
                                  }}
                                >
                                  {submittingComment === upd.id ? "…" : "Send"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 24 }}>
            {/* Progress card */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "20px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>Project Details</h3>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <CircleProgress value={project.progress ?? 0} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  ["Start Date",  formatDate(project.start_date)],
                  ["Target Date", formatDate(project.target_date)],
                  ["Stage",       project.stage ?? "—"],
                  ["Manager",     project.account_manager ?? "—"],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#64748b" }}>{label}</span>
                    <span style={{ color: "#e2e8f0", fontWeight: 500 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones */}
            {milestones.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "20px" }}>
                <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>Milestones</h3>
                {milestones.map((m) => (
                  <div key={m.id} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 16 }}>✅</span>
                    <div>
                      <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>{m.title}</p>
                      <span style={{ fontSize: 11, color: "#64748b" }}>{timeAgo(m.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
    </div>
  );
}

function CircleProgress({ value }: { value: number }) {
  const r   = 44;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - value / 100);
  return (
    <div style={{ position: "relative", width: 120, height: 120 }}>
      <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke="#6366f1" strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={dash}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{value}%</span>
        <span style={{ fontSize: 11, color: "#64748b" }}>complete</span>
      </div>
    </div>
  );
}

