"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import type { Project, CRMTask, Meeting, TaskStatus } from "@/types/dashboard";

interface ClientResource {
  id: string; clientId: string; projectId?: string; name: string; fileUrl: string;
  fileName: string; fileSize: number; mimeType: string; category?: string;
  uploadedBy: string; uploadedByType: string; visibility: "both" | "admin_only"; createdAt: string;
}
interface PortalDocument {
  id: string; title: string; type: string; status: string; clientId: string;
  projectId?: string; createdBy: string; createdAt: string; updatedAt: string;
  comments: { id: string; author: string; text: string; createdAt: string }[];
  suggestions: { id: string; author: string; originalText: string; suggestedText: string; status: string; createdAt: string }[];
}

const STATUS_COLORS: Record<string, string> = {
  planning:"#6366f1", active:"#22c55e", on_hold:"#f59e0b", completed:"#10b981", cancelled:"#ef4444",
};
const TASK_STATUS_COLORS: Record<string, string> = {
  open:"#6366f1", in_progress:"#f59e0b", done:"#22c55e", cancelled:"#ef4444",
};
const PRIORITY_COLORS: Record<string, string> = {
  low:"#64748b", medium:"#6366f1", high:"#f59e0b", urgent:"#ef4444",
};

function fmt(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}
function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
}

type Tab = "updates" | "files" | "meetings" | "documents";
type ViewMode = "kanban" | "list" | "gantt";

const CARD: React.CSSProperties = { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"16px 20px" };
const INPUT: React.CSSProperties = { width:"100%", padding:"8px 12px", borderRadius:12, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#e2e8f0", fontSize:13, outline:"none" };
const BTN: React.CSSProperties = { padding:"8px 16px", borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", border:"1px solid rgba(99,102,241,0.3)", background:"rgba(99,102,241,0.15)", color:"#818cf8" };

export default function PortalProjectDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [project,  setProject]  = useState<Project | null>(null);
  const [tasks,    setTasks]    = useState<CRMTask[]>([]);
  const [files,    setFiles]    = useState<ClientResource[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [docs,     setDocs]     = useState<PortalDocument[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState<Tab>("updates");
  const [view,     setView]     = useState<ViewMode>("kanban");

  // File upload
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Comment
  const [commentDocId, setCommentDocId] = useState<string|null>(null);
  const [commentText, setCommentText]   = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, tRes, fRes, mRes, dRes] = await Promise.all([
        fetch(`/api/portal/projects/${id}`),
        fetch(`/api/dashboard/tasks?projectId=${id}`).catch(() => null),
        fetch(`/api/portal/files?projectId=${id}`).catch(() => ({ json: async () => ({ files: [] }) } as unknown as Response)),
        fetch(`/api/portal/meetings?projectId=${id}`).catch(() => null),
        fetch(`/api/portal/documents`).catch(() => null),
      ]);

      if (!pRes.ok) { router.push("/portal/dashboard/projects"); return; }
      const pData = await pRes.json() as { project: Project };
      setProject(pData.project);

      if (tRes?.ok) { const d = await tRes.json() as { tasks: CRMTask[] }; setTasks(d.tasks ?? []); }
      if (fRes) { const d = await fRes.json() as { files: ClientResource[] }; setFiles((d.files ?? []).filter((f: ClientResource) => f.projectId === id)); }
      if (mRes?.ok) { const d = await mRes.json() as { meetings: Meeting[] }; setMeetings((d.meetings ?? []).filter((m: Meeting) => (m as { projectId?: string }).projectId === id)); }
      if (dRes?.ok) { const d = await dRes.json() as { documents: PortalDocument[] }; setDocs((d.documents ?? []).filter((doc: PortalDocument) => doc.projectId === id && doc.status !== "draft")); }
    } finally { setLoading(false); }
  }, [id, router]);

  useEffect(() => { void load(); }, [load]);

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !project) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file); fd.append("projectId", id);
    await fetch("/api/portal/files", { method:"POST", body: fd });
    await load(); setUploading(false);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function deleteFile(fileId: string) {
    await fetch(`/api/portal/files?id=${fileId}`, { method:"DELETE" });
    await load();
  }

  async function postComment(docId: string) {
    if (!commentText.trim()) return;
    setPostingComment(true);
    await fetch("/api/portal/documents", {
      method: "PATCH",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ id: docId, action:"add-comment", text: commentText }),
    });
    setCommentText(""); setCommentDocId(null);
    await load(); setPostingComment(false);
  }

  const KANBAN_COLS: TaskStatus[] = ["open","in_progress","done","cancelled"];
  const COL_LABELS: Record<TaskStatus, string> = { open:"Open", in_progress:"In Progress", done:"Done", cancelled:"Cancelled" };

  const ganttTasks = tasks.filter(t => t.dueDate);
  const ganttDates = ganttTasks.flatMap(t => [new Date(t.createdAt), new Date(t.dueDate!)]);
  const ganttMin = ganttDates.length ? Math.min(...ganttDates.map(d=>d.getTime())) : Date.now();
  const ganttMax = ganttDates.length ? Math.max(...ganttDates.map(d=>d.getTime())) : Date.now() + 86400000*30;
  const ganttSpan = ganttMax - ganttMin || 1;

  const TABS: { key: Tab; label: string }[] = [
    { key:"updates",   label:"Updates" },
    { key:"files",     label:"Files" },
    { key:"meetings",  label:"Meetings" },
    { key:"documents", label:"Documents" },
  ];

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#0a0f1e", display:"flex", alignItems:"center", justifyContent:"center", color:"#64748b" }}>Loading…</div>
  );
  if (!project) return null;

  return (
    <div style={{ padding:"24px 28px", minHeight:"100vh", background:"#0a0f1e" }}>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <Link href="/portal/dashboard/projects" style={{ color:"#64748b", fontSize:13, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:6, marginBottom:12 }}>
          ← Projects
        </Link>
        <div style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
          <div style={{ width:14, height:14, borderRadius:"50%", background:project.color??STATUS_COLORS[project.status], flexShrink:0, marginTop:6 }} />
          <div style={{ flex:1 }}>
            <h1 style={{ fontSize:22, fontWeight:700, color:"#ffffff", margin:0 }}>{project.name}</h1>
            {project.description && <p style={{ color:"#64748b", fontSize:13, marginTop:4 }}>{project.description}</p>}
            <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginTop:8 }}>
              <span style={{ fontSize:11, padding:"3px 10px", borderRadius:20, background:`${STATUS_COLORS[project.status]}22`, color:STATUS_COLORS[project.status], border:`1px solid ${STATUS_COLORS[project.status]}44`, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px" }}>
                {project.status.replace("_"," ")}
              </span>
              {project.startDate && <span style={{ fontSize:12, color:"#64748b" }}>📅 {fmtDate(project.startDate)} → {fmtDate(project.endDate)}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, marginBottom:20, borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding:"10px 16px", fontSize:13, fontWeight:tab===t.key?600:400, color:tab===t.key?"#818cf8":"#64748b", background:"none", border:"none", borderBottom:tab===t.key?"2px solid #6366f1":"2px solid transparent", cursor:"pointer", marginBottom:-1 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── UPDATES TAB ── */}
      {tab === "updates" && (
        <div>
          <div style={{ display:"flex", gap:4, marginBottom:16 }}>
            {(["kanban","list","gantt"] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ ...BTN, background:view===v?"rgba(99,102,241,0.2)":"rgba(255,255,255,0.04)", color:view===v?"#818cf8":"#64748b", border:view===v?"1px solid rgba(99,102,241,0.35)":"1px solid rgba(255,255,255,0.08)", textTransform:"capitalize", padding:"6px 14px" }}>
                {v}
              </button>
            ))}
          </div>

          {view === "kanban" && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12 }}>
              {KANBAN_COLS.map(col => (
                <div key={col}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:TASK_STATUS_COLORS[col] }} />
                    <span style={{ fontSize:11, fontWeight:600, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.5px" }}>{COL_LABELS[col]}</span>
                    <span style={{ fontSize:11, color:"#475569", marginLeft:"auto" }}>{tasks.filter(t=>t.status===col).length}</span>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {tasks.filter(t=>t.status===col).map(task => (
                      <div key={task.id} style={{ ...CARD, padding:"12px 14px" }}>
                        <p style={{ color:"#e2e8f0", fontSize:13, fontWeight:500, marginBottom:6 }}>{task.title}</p>
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                          <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:`${PRIORITY_COLORS[task.priority]}22`, color:PRIORITY_COLORS[task.priority] }}>{task.priority}</span>
                          {task.dueDate && <span style={{ fontSize:10, color:"#64748b" }}>{fmtDate(task.dueDate)}</span>}
                        </div>
                      </div>
                    ))}
                    {tasks.filter(t=>t.status===col).length === 0 && (
                      <div style={{ ...CARD, padding:"16px", textAlign:"center" }}><p style={{ color:"#334155", fontSize:12 }}>Empty</p></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === "list" && (
            <div style={{ ...CARD, padding:0, overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"rgba(255,255,255,0.03)" }}>
                    {["Task","Priority","Status","Due Date"].map(h => (
                      <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding:"24px", textAlign:"center", color:"#475569", fontSize:13 }}>No tasks yet</td></tr>
                  ) : tasks.map(task => (
                    <tr key={task.id} style={{ borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding:"10px 14px", fontSize:13, color:"#e2e8f0" }}>{task.title}</td>
                      <td style={{ padding:"10px 14px" }}><span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background:`${PRIORITY_COLORS[task.priority]}22`, color:PRIORITY_COLORS[task.priority] }}>{task.priority}</span></td>
                      <td style={{ padding:"10px 14px" }}><span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background:`${TASK_STATUS_COLORS[task.status]}22`, color:TASK_STATUS_COLORS[task.status] }}>{task.status.replace("_"," ")}</span></td>
                      <td style={{ padding:"10px 14px", fontSize:12, color:"#64748b" }}>{fmtDate(task.dueDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === "gantt" && (
            <div style={{ ...CARD, overflowX:"auto" }}>
              {ganttTasks.length === 0 ? (
                <p style={{ color:"#64748b", fontSize:13, textAlign:"center", padding:"24px" }}>No tasks with due dates to display on Gantt</p>
              ) : (
                <div style={{ minWidth:500 }}>
                  {ganttTasks.map(task => {
                    const start = new Date(task.createdAt).getTime();
                    const end   = new Date(task.dueDate!).getTime();
                    const left  = ((start - ganttMin) / ganttSpan) * 100;
                    const width = Math.max(((end - start) / ganttSpan) * 100, 2);
                    return (
                      <div key={task.id} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
                        <div style={{ width:160, flexShrink:0, fontSize:12, color:"#94a3b8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{task.title}</div>
                        <div style={{ flex:1, height:24, background:"rgba(255,255,255,0.04)", borderRadius:8, position:"relative" }}>
                          <div style={{ position:"absolute", left:`${left}%`, width:`${width}%`, top:3, bottom:3, borderRadius:5, background:TASK_STATUS_COLORS[task.status], opacity:0.85, minWidth:4 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── FILES TAB ── */}
      {tab === "files" && (
        <div>
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:16, gap:8 }}>
            <input ref={fileInput} type="file" style={{ display:"none" }} onChange={e => void uploadFile(e)} />
            <button onClick={() => fileInput.current?.click()} disabled={uploading} style={{ ...BTN, opacity:uploading?0.6:1 }}>
              {uploading ? "Uploading…" : "+ Upload File"}
            </button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:12 }}>
            {files.map(f => (
              <div key={f.id} style={{ ...CARD }}>
                <div style={{ fontSize:28, marginBottom:8 }}>{f.mimeType.startsWith("image/")?"🖼️":f.mimeType==="application/pdf"?"📄":f.mimeType.includes("word")?"📝":"📁"}</div>
                <p style={{ fontSize:13, fontWeight:500, color:"#e2e8f0", marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.fileName}</p>
                <p style={{ fontSize:11, color:"#64748b", marginBottom:8 }}>{fmt(f.fileSize)} · {f.uploadedBy}</p>
                <div style={{ display:"flex", gap:6 }}>
                  <a href={f.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize:11, padding:"4px 10px", borderRadius:8, background:"rgba(255,255,255,0.06)", color:"#94a3b8", textDecoration:"none" }}>Download</a>
                  {f.uploadedByType === "client" && (
                    <button onClick={() => void deleteFile(f.id)} style={{ fontSize:11, padding:"4px 10px", borderRadius:8, cursor:"pointer", background:"rgba(248,113,113,0.08)", color:"#f87171", border:"1px solid rgba(248,113,113,0.2)" }}>Delete</button>
                  )}
                </div>
              </div>
            ))}
            {files.length === 0 && <p style={{ color:"#64748b", fontSize:13, gridColumn:"1/-1", textAlign:"center", padding:"32px" }}>No shared files yet.</p>}
          </div>
        </div>
      )}

      {/* ── MEETINGS TAB ── */}
      {tab === "meetings" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {meetings.length === 0 && <p style={{ color:"#64748b", fontSize:13, textAlign:"center", padding:"32px" }}>No meetings scheduled for this project.</p>}
          {meetings.map(m => (
            <div key={m.id} style={{ ...CARD, display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
              <div style={{ flex:1 }}>
                <p style={{ color:"#e2e8f0", fontSize:14, fontWeight:600, marginBottom:4 }}>{m.title}</p>
                <p style={{ color:"#64748b", fontSize:12 }}>{fmtDate(m.startTime)} · {new Date(m.startTime).toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})} – {new Date(m.endTime).toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})}</p>
              </div>
              {m.meetLink && <a href={m.meetLink} target="_blank" rel="noreferrer" style={{ fontSize:12, padding:"6px 14px", borderRadius:10, background:"rgba(99,102,241,0.12)", color:"#818cf8", border:"1px solid rgba(99,102,241,0.25)", textDecoration:"none" }}>Join</a>}
              <span style={{ fontSize:11, padding:"3px 10px", borderRadius:20, background:"rgba(255,255,255,0.06)", color:"#94a3b8" }}>{m.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── DOCUMENTS TAB ── */}
      {tab === "documents" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {docs.length === 0 && <p style={{ color:"#64748b", fontSize:13, textAlign:"center", padding:"32px" }}>No documents shared yet.</p>}
          {docs.map(doc => (
            <div key={doc.id} style={{ ...CARD }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <span style={{ fontSize:14, fontWeight:600, color:"#e2e8f0" }}>{doc.title}</span>
                <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background:"rgba(255,255,255,0.06)", color:"#94a3b8", textTransform:"capitalize" }}>{doc.type}</span>
                <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background:doc.status==="signed"?"rgba(34,197,94,0.15)":"rgba(99,102,241,0.15)", color:doc.status==="signed"?"#22c55e":"#818cf8", textTransform:"capitalize" }}>{doc.status}</span>
              </div>
              {/* Comments */}
              {doc.comments.length > 0 && (
                <div style={{ marginBottom:10 }}>
                  <p style={{ fontSize:11, fontWeight:600, color:"#64748b", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>Comments</p>
                  {doc.comments.map(c => (
                    <div key={c.id} style={{ background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"8px 12px", marginBottom:6 }}>
                      <p style={{ fontSize:12, color:"#94a3b8", fontWeight:500, marginBottom:2 }}>{c.author} <span style={{ color:"#475569", fontWeight:400 }}>· {fmtDate(c.createdAt)}</span></p>
                      <p style={{ fontSize:13, color:"#e2e8f0" }}>{c.text}</p>
                    </div>
                  ))}
                </div>
              )}
              {commentDocId === doc.id ? (
                <div style={{ display:"flex", gap:8 }}>
                  <input style={{ ...INPUT, flex:1 }} value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add a comment…" autoFocus />
                  <button onClick={() => void postComment(doc.id)} disabled={postingComment||!commentText.trim()} style={{ ...BTN, opacity:postingComment||!commentText.trim()?0.5:1 }}>{postingComment?"Posting…":"Post"}</button>
                  <button onClick={() => { setCommentDocId(null); setCommentText(""); }} style={{ padding:"8px 12px", borderRadius:12, fontSize:13, cursor:"pointer", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#94a3b8" }}>✕</button>
                </div>
              ) : (
                <button onClick={() => setCommentDocId(doc.id)} style={{ fontSize:12, padding:"5px 12px", borderRadius:10, cursor:"pointer", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"#64748b" }}>+ Comment</button>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
