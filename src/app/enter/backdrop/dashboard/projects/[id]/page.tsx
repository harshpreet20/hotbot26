"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { Project, CRMTask, Meeting, Whiteboard, ProjectSOP, TaskPriority, TaskStatus } from "@/types/dashboard";

interface ClientResource {
  id: string; clientId: string; projectId?: string; name: string; fileUrl: string;
  fileName: string; fileSize: number; mimeType: string; category?: string;
  uploadedBy: string; uploadedByType: string; visibility: "both" | "admin_only"; createdAt: string;
}
interface PortalDocument {
  id: string; title: string; type: string; status: string; content: string;
  clientId: string; projectId?: string; createdBy: string; createdAt: string; updatedAt: string;
}

function role() { return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_role") || "" : ""; }

const STATUS_COLORS: Record<string, string> = {
  planning: "#6366f1", active: "#22c55e", on_hold: "#f59e0b",
  completed: "#10b981", cancelled: "#ef4444",
};
const TASK_STATUS_COLORS: Record<string, string> = {
  open: "#6366f1", in_progress: "#f59e0b", done: "#22c55e", cancelled: "#ef4444",
};
const PRIORITY_COLORS: Record<string, string> = {
  low: "#64748b", medium: "#6366f1", high: "#f59e0b", urgent: "#ef4444",
};

function fmt(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}
function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

type Tab = "updates" | "files" | "meetings" | "whiteboard" | "documents" | "sop";
type ViewMode = "kanban" | "list" | "gantt";

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [project, setProject]   = useState<Project | null>(null);
  const [tasks,   setTasks]     = useState<CRMTask[]>([]);
  const [files,   setFiles]     = useState<ClientResource[]>([]);
  const [meetings,setMeetings]  = useState<Meeting[]>([]);
  const [boards,  setBoards]    = useState<Whiteboard[]>([]);
  const [docs,    setDocs]      = useState<PortalDocument[]>([]);
  const [sops,    setSops]      = useState<ProjectSOP[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab,     setTab]       = useState<Tab>("updates");
  const [view,    setView]      = useState<ViewMode>("kanban");

  // Tasks
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle]       = useState("");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("medium");
  const [taskDue, setTaskDue]           = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [savingTask, setSavingTask]     = useState(false);

  // Files
  const [fileTab, setFileTab]           = useState<"team" | "shared">("team");
  const [uploading, setUploading]       = useState(false);
  const fileInput                       = useRef<HTMLInputElement>(null);

  // Meetings
  const [showMeetForm, setShowMeetForm] = useState(false);
  const [meetTitle, setMeetTitle]       = useState("");
  const [meetStart, setMeetStart]       = useState("");
  const [meetEnd, setMeetEnd]           = useState("");
  const [meetLink, setMeetLink]         = useState("");
  const [savingMeet, setSavingMeet]     = useState(false);

  // Whiteboard
  const [activeBoard, setActiveBoard]   = useState<Whiteboard | null>(null);
  const [wbElements, setWbElements]     = useState<unknown[]>([]);
  const [wbTool, setWbTool]             = useState<"pen"|"rect"|"eraser">("pen");
  const [wbColor, setWbColor]           = useState("#818cf8");
  const [wbWidth, setWbWidth]           = useState(2);
  const [wbSaving, setWbSaving]         = useState(false);
  const [showBoardForm, setShowBoardForm] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const canvasRef                       = useRef<HTMLCanvasElement>(null);
  const drawingRef                      = useRef(false);
  const startPosRef                     = useRef<[number,number]>([0,0]);
  const currentElRef                    = useRef<unknown>(null);

  // Team & task edit
  const [team, setTeam]                 = useState<{username:string;role:string}[]>([]);
  const [editingTask, setEditingTask]   = useState<CRMTask | null>(null);
  const [editForm, setEditForm]         = useState<Partial<CRMTask>>({});
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [showAssigneeDD, setShowAssigneeDD] = useState(false);
  const assigneeDDRef                   = useRef<HTMLDivElement>(null);
  const [showEditAssigneeDD, setShowEditAssigneeDD] = useState(false);
  const editAssigneeDDRef               = useRef<HTMLDivElement>(null);

  // Documents
  const [showDocForm, setShowDocForm]   = useState(false);
  const [docTitle, setDocTitle]         = useState("");
  const [docType, setDocType]           = useState<"proposal"|"contract">("proposal");
  const [docContent, setDocContent]     = useState("");
  const [briefInput, setBriefInput]     = useState("");
  const [generating, setGenerating]     = useState(false);
  const [savingDoc, setSavingDoc]       = useState(false);

  // SOP
  const [activeSOP, setActiveSOP]       = useState<ProjectSOP | null>(null);
  const [sopBrief, setSopBrief]         = useState("");
  const [sopTitle, setSopTitle]         = useState("");
  const [sopContent, setSopContent]     = useState("");
  const [generatingSOP, setGeneratingSOP] = useState(false);
  const [savingSOP, setSavingSOP]       = useState(false);
  const [sopError, setSopError]         = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, tRes, fRes, mRes, bRes, dRes, sRes, tmRes] = await Promise.all([
        fetch(`/api/dashboard/projects`, { credentials: "same-origin" }),
        fetch(`/api/dashboard/tasks?projectId=${id}`, { credentials: "same-origin" }),
        fetch(`/api/dashboard/files?projectId=${id}`, { credentials: "same-origin" }),
        fetch(`/api/dashboard/meetings?projectId=${id}`, { credentials: "same-origin" }),
        fetch(`/api/dashboard/whiteboards?projectId=${id}`, { credentials: "same-origin" }),
        fetch(`/api/dashboard/documents?projectId=${id}`, { credentials: "same-origin" }),
        fetch(`/api/dashboard/sop?projectId=${id}`, { credentials: "same-origin" }),
        fetch(`/api/dashboard/team`, { credentials: "same-origin" }),
      ]);
      const pData = await pRes.json() as { projects?: Project[] };
      const found = pData.projects?.find(p => p.id === id);
      if (!found) { router.push("/enter/backdrop/dashboard/projects"); return; }
      setProject(found);
      const tData = await tRes.json() as { tasks: CRMTask[] };
      setTasks(tData.tasks ?? []);
      const fData = await fRes.json() as { files: ClientResource[] };
      setFiles(fData.files ?? []);
      const mData = await mRes.json() as { meetings: Meeting[] };
      setMeetings(mData.meetings ?? []);
      const bData = await bRes.json() as { whiteboards: Whiteboard[] };
      setBoards(bData.whiteboards ?? []);
      const dData = await dRes.json() as { documents: PortalDocument[] };
      setDocs(dData.documents ?? []);
      const sData = await sRes.json() as { sops: ProjectSOP[] };
      setSops(sData.sops ?? []);
      const tmData = await tmRes.json() as { members?: {username:string;role:string}[] };
      setTeam(tmData.members ?? []);
    } finally { setLoading(false); }
  }, [id, router]);

  useEffect(() => { void load(); }, [load]);

  // ── Tasks ──────────────────────────────────────────────────────────────────
  async function addTask() {
    if (!taskTitle.trim()) return;
    setSavingTask(true);
    try {
      await fetch("/api/dashboard/tasks", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: taskTitle, priority: taskPriority, dueDate: taskDue || undefined, assignedTo: taskAssignee || undefined, projectId: id }),
      });
      setTaskTitle(""); setTaskDue(""); setTaskAssignee(""); setShowTaskForm(false);
      await load();
    } finally { setSavingTask(false); }
  }

  async function patchTask(taskId: string, patch: Partial<CRMTask>) {
    await fetch("/api/dashboard/tasks", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: taskId, ...patch }),
    });
    await load();
  }

  async function deleteTask(taskId: string) {
    setDeletingTaskId(taskId);
    try {
      await fetch(`/api/dashboard/tasks?id=${taskId}`, { method: "DELETE", headers: { Authorization: `Bearer ${tok()}` } });
      await load();
    } finally { setDeletingTaskId(null); }
  }

  function openEditTask(task: CRMTask) {
    setEditingTask(task);
    setEditForm({ title: task.title, priority: task.priority, status: task.status, assignedTo: task.assignedTo ?? "", dueDate: task.dueDate ?? "" });
  }

  async function saveEditTask() {
    if (!editingTask || !editForm.title?.trim()) return;
    await fetch("/api/dashboard/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok()}` },
      body: JSON.stringify({ id: editingTask.id, ...editForm }),
    });
    setEditingTask(null);
    await load();
  }

  // ── Files ──────────────────────────────────────────────────────────────────
  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !project) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("clientId", project.clientId);
    fd.append("projectId", id);
    await fetch("/api/dashboard/files", { method: "POST", headers: { Authorization: `Bearer ${tok()}` }, body: fd });
    await load();
    setUploading(false);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function toggleVisibility(fileId: string, current: "both" | "admin_only") {
    const newVis = current === "admin_only" ? "both" : "admin_only";
    // PATCH not available on files route, so delete + re-insert isn't ideal.
    // We update via a PATCH request (extending the route to support it):
    await fetch("/api/dashboard/files", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok()}` },
      body: JSON.stringify({ id: fileId, visibility: newVis }),
    });
    await load();
  }

  async function deleteFile(fileId: string) {
    await fetch(`/api/dashboard/files?id=${fileId}`, { method: "DELETE", headers: { Authorization: `Bearer ${tok()}` } });
    await load();
  }

  // ── Meetings ───────────────────────────────────────────────────────────────
  async function addMeeting() {
    if (!meetTitle.trim() || !meetStart || !meetEnd) return;
    setSavingMeet(true);
    try {
      await fetch("/api/dashboard/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok()}` },
        body: JSON.stringify({
          title: meetTitle, startTime: meetStart, endTime: meetEnd,
          meetLink: meetLink || undefined,
          clientId: project?.clientId, clientEmail: project?.clientEmail, clientName: project?.clientName,
          projectId: id,
        }),
      });
      setMeetTitle(""); setMeetStart(""); setMeetEnd(""); setMeetLink(""); setShowMeetForm(false);
      await load();
    } finally { setSavingMeet(false); }
  }

  // ── Whiteboard ─────────────────────────────────────────────────────────────
  type DrawEl = { type: "stroke"; points: [number,number][]; color: string; width: number }
              | { type: "rect"; x: number; y: number; w: number; h: number; color: string; width: number }
              | { type: "text"; x: number; y: number; text: string; color: string };

  function redraw(els: DrawEl[]) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const el of els) {
      ctx.strokeStyle = el.color; ctx.fillStyle = el.color;
      if (el.type === "stroke") {
        ctx.lineWidth = el.width; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath();
        for (let i = 0; i < el.points.length; i++) {
          const [x,y] = el.points[i];
          if (i === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();
      } else if (el.type === "rect") {
        ctx.lineWidth = el.width; ctx.strokeRect(el.x, el.y, el.w, el.h);
      } else if (el.type === "text") {
        ctx.font = "14px Inter, sans-serif"; ctx.fillText(el.text, el.x, el.y);
      }
    }
  }

  useEffect(() => { if (!canvasRef.current) return; redraw(wbElements as DrawEl[]); }, [wbElements, activeBoard]);

  useEffect(() => {
    if (!showAssigneeDD) return;
    function h(e: MouseEvent) { if (assigneeDDRef.current && !assigneeDDRef.current.contains(e.target as Node)) setShowAssigneeDD(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showAssigneeDD]);

  useEffect(() => {
    if (!showEditAssigneeDD) return;
    function h(e: MouseEvent) { if (editAssigneeDDRef.current && !editAssigneeDDRef.current.contains(e.target as Node)) setShowEditAssigneeDD(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showEditAssigneeDD]);

  function getWbPos(e: React.MouseEvent): [number,number] | null {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  }

  function onWbDown(e: React.MouseEvent) {
    if (wbTool === "pen" || wbTool === "eraser" || wbTool === "rect") {
      const pos = getWbPos(e); if (!pos) return;
      drawingRef.current = true; startPosRef.current = pos;
      const [x,y] = pos;
      if (wbTool === "pen" || wbTool === "eraser") {
        currentElRef.current = { type:"stroke", points:[[x,y]], color: wbTool==="eraser"?"#0f1629":wbColor, width: wbTool==="eraser"?24:wbWidth };
      } else {
        currentElRef.current = { type:"rect", x, y, w:0, h:0, color:wbColor, width:wbWidth };
      }
    }
  }

  function onWbMove(e: React.MouseEvent) {
    if (!drawingRef.current || !currentElRef.current) return;
    const pos = getWbPos(e); if (!pos) return;
    const el = currentElRef.current as DrawEl;
    const [x,y] = pos;
    if (el.type === "stroke") el.points.push([x,y]);
    else if (el.type === "rect") { const [sx,sy] = startPosRef.current; el.w = x-sx; el.h = y-sy; }
    redraw([...(wbElements as DrawEl[]), el]);
  }

  function onWbUp() {
    if (!drawingRef.current || !currentElRef.current) return;
    drawingRef.current = false;
    setWbElements(prev => [...(prev as DrawEl[]), currentElRef.current as DrawEl]);
    currentElRef.current = null;
  }

  function openBoard(b: Whiteboard) {
    setActiveBoard(b);
    try { setWbElements(JSON.parse(b.elements || "[]") as DrawEl[]); } catch { setWbElements([]); }
  }

  async function saveBoard() {
    if (!activeBoard) return;
    setWbSaving(true);
    try {
      await fetch("/api/dashboard/whiteboards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok()}` },
        body: JSON.stringify({ id: activeBoard.id, elements: JSON.stringify(wbElements) }),
      });
      await load();
    } finally { setWbSaving(false); }
  }

  async function createBoard() {
    if (!newBoardName.trim()) return;
    await fetch("/api/dashboard/whiteboards", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok()}` },
      body: JSON.stringify({ name: newBoardName, clientId: project?.clientId, projectId: id }),
    });
    setNewBoardName(""); setShowBoardForm(false);
    await load();
  }

  // ── Documents ──────────────────────────────────────────────────────────────
  async function generateProposal() {
    if (!briefInput.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/dashboard/proposals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok()}` },
        body: JSON.stringify({ projectName: project?.name, clientName: project?.clientName, brief: briefInput }),
      });
      const data = await res.json() as { content?: string; error?: string };
      if (data.content) setDocContent(data.content);
    } finally { setGenerating(false); }
  }

  async function saveDoc() {
    if (!docTitle.trim() || !project) return;
    setSavingDoc(true);
    try {
      await fetch("/api/dashboard/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok()}` },
        body: JSON.stringify({ title: docTitle, type: docType, content: docContent, clientId: project.clientId, clientEmail: project.clientEmail, clientName: project.clientName, projectId: id }),
      });
      setDocTitle(""); setDocContent(""); setBriefInput(""); setShowDocForm(false);
      await load();
    } finally { setSavingDoc(false); }
  }

  async function sendDoc(docId: string) {
    await fetch("/api/dashboard/documents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok()}` },
      body: JSON.stringify({ id: docId, status: "sent" }),
    });
    await load();
  }

  // ── SOP ────────────────────────────────────────────────────────────────────
  async function generateSOP() {
    if (!sopBrief.trim() || !project) return;
    setGeneratingSOP(true);
    setSopError("");
    try {
      const res = await fetch("/api/dashboard/sop", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok()}` },
        body: JSON.stringify({ projectId: id, clientId: project.clientId, title: sopTitle || `${project.name} SOP`, brief: sopBrief }),
      });
      const data = await res.json() as { sop?: ProjectSOP; error?: string };
      if (data.sop) {
        setActiveSOP(data.sop); setSopContent(data.sop.content); await load();
      } else {
        setSopError(data.error ?? `Server error (${res.status}). Check that your role allows SOP generation.`);
      }
    } catch {
      setSopError("Network error — could not reach the server.");
    } finally { setGeneratingSOP(false); }
  }

  async function saveSOP() {
    if (!activeSOP) return;
    setSavingSOP(true);
    try {
      await fetch("/api/dashboard/sop", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok()}` },
        body: JSON.stringify({ id: activeSOP.id, content: sopContent, title: activeSOP.title }),
      });
      await load();
    } finally { setSavingSOP(false); }
  }

  // ── Styles ─────────────────────────────────────────────────────────────────
  const CARD: React.CSSProperties = { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"16px 20px" };
  const INPUT: React.CSSProperties = { width:"100%", padding:"8px 12px", borderRadius:12, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#e2e8f0", fontSize:13, outline:"none" };
  const BTN: React.CSSProperties = { padding:"8px 16px", borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", border:"1px solid rgba(99,102,241,0.3)", background:"rgba(99,102,241,0.15)", color:"#818cf8" };

  if (loading) return (
    <DashboardShell>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh", color:"#64748b" }}>Loading project…</div>
    </DashboardShell>
  );

  if (!project) return null;

  const TABS: { key: Tab; label: string }[] = [
    { key:"updates",   label:"Updates" },
    { key:"files",     label:"Files" },
    { key:"meetings",  label:"Meetings" },
    { key:"whiteboard",label:"Whiteboard" },
    { key:"documents", label:"Documents" },
    { key:"sop",       label:"SOP" },
  ];

  // Kanban columns for tasks
  const KANBAN_COLS: TaskStatus[] = ["open","in_progress","done","cancelled"];
  const COL_LABELS: Record<TaskStatus, string> = { open:"Open", in_progress:"In Progress", done:"Done", cancelled:"Cancelled" };

  // Gantt timeline helpers
  const ganttTasks = tasks.filter(t => t.dueDate);
  const ganttDates = ganttTasks.flatMap(t => [new Date(t.createdAt), new Date(t.dueDate!)]);
  const ganttMin = ganttDates.length ? Math.min(...ganttDates.map(d=>d.getTime())) : Date.now();
  const ganttMax = ganttDates.length ? Math.max(...ganttDates.map(d=>d.getTime())) : Date.now() + 86400000*30;
  const ganttSpan = ganttMax - ganttMin || 1;

  const isManager = ["super_admin","admin","manager"].includes(role());

  return (
    <DashboardShell>
      <div style={{ padding:"24px 28px", minHeight:"100vh" }}>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <Link href="/enter/backdrop/dashboard/projects" style={{ color:"#64748b", fontSize:13, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:6, marginBottom:12 }}>
            ← Projects
          </Link>
          <div style={{ display:"flex", alignItems:"flex-start", gap:16, flexWrap:"wrap" }}>
            <div style={{ width:14, height:14, borderRadius:"50%", background:project.color??STATUS_COLORS[project.status], flexShrink:0, marginTop:6 }} />
            <div style={{ flex:1 }}>
              <h1 style={{ fontSize:22, fontWeight:700, color:"#ffffff", margin:0 }}>{project.name}</h1>
              {project.description && <p style={{ color:"#64748b", fontSize:13, marginTop:4 }}>{project.description}</p>}
              <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginTop:8 }}>
                <span style={{ fontSize:11, padding:"3px 10px", borderRadius:20, background:`${STATUS_COLORS[project.status]}22`, color:STATUS_COLORS[project.status], border:`1px solid ${STATUS_COLORS[project.status]}44`, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px" }}>
                  {project.status.replace("_"," ")}
                </span>
                {project.clientName && <span style={{ fontSize:12, color:"#94a3b8" }}>👤 {project.clientName}</span>}
                {project.startDate  && <span style={{ fontSize:12, color:"#64748b" }}>📅 {fmtDate(project.startDate)} → {fmtDate(project.endDate)}</span>}
                {project.budget     && <span style={{ fontSize:12, color:"#64748b" }}>💰 {project.currency??""} {(project.budget/100).toLocaleString()}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, marginBottom:20, borderBottom:"1px solid rgba(255,255,255,0.08)", paddingBottom:0 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding:"10px 16px", fontSize:13, fontWeight:tab===t.key?600:400, color:tab===t.key?"#818cf8":"#64748b", background:"none", border:"none", borderBottom:tab===t.key?"2px solid #6366f1":"2px solid transparent", cursor:"pointer", transition:"all 0.15s", marginBottom:-1 }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── UPDATES TAB ── */}
        {tab === "updates" && (
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16, flexWrap:"wrap" }}>
              <div style={{ display:"flex", gap:4 }}>
                {(["kanban","list","gantt"] as ViewMode[]).map(v => (
                  <button key={v} onClick={() => setView(v)}
                    style={{ ...BTN, background:view===v?"rgba(99,102,241,0.2)":"rgba(255,255,255,0.04)", color:view===v?"#818cf8":"#64748b", border:view===v?"1px solid rgba(99,102,241,0.35)":"1px solid rgba(255,255,255,0.08)", textTransform:"capitalize", padding:"6px 14px" }}>
                    {v}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowTaskForm(true)} style={{ ...BTN, marginLeft:"auto" }}>+ Add Task</button>
            </div>

            {showTaskForm && (
              <div style={{ ...CARD, marginBottom:16, display:"flex", gap:12, flexWrap:"wrap", alignItems:"flex-end" }}>
                <div style={{ flex:1, minWidth:160 }}>
                  <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>Task Title *</label>
                  <input style={INPUT} value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} placeholder="Task title…" />
                </div>
                <div>
                  <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>Priority</label>
                  <select style={{ ...INPUT, width:"auto" }} value={taskPriority} onChange={e=>setTaskPriority(e.target.value as TaskPriority)}>
                    {["low","medium","high","urgent"].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>Due Date</label>
                  <input type="date" style={{ ...INPUT, width:"auto" }} value={taskDue} onChange={e=>setTaskDue(e.target.value)} />
                </div>
                <div style={{ position:"relative" }} ref={assigneeDDRef}>
                  <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>Assignee</label>
                  <input style={{ ...INPUT, width:150 }} value={taskAssignee}
                    onChange={e=>{ setTaskAssignee(e.target.value); setShowAssigneeDD(true); }}
                    onFocus={()=>setShowAssigneeDD(true)}
                    placeholder="Search teammate…" />
                  {showAssigneeDD && team.length > 0 && (
                    <div style={{ position:"absolute", top:"100%", left:0, zIndex:50, background:"#0f1729", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, overflow:"hidden", boxShadow:"0 8px 32px rgba(0,0,0,0.4)", maxHeight:200, overflowY:"auto", marginTop:4, minWidth:180 }}>
                      {team.filter(m=>{ const q=taskAssignee.toLowerCase(); return !q||m.username.toLowerCase().includes(q)||m.role.toLowerCase().includes(q); }).map(m=>(
                        <div key={m.username} onMouseDown={()=>{ setTaskAssignee(m.username); setShowAssigneeDD(false); }}
                          style={{ padding:"9px 14px", cursor:"pointer", fontSize:13, borderBottom:"1px solid rgba(255,255,255,0.04)" }}
                          onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.05)")}
                          onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                          <span style={{ fontWeight:600, color:"#e2e8f0" }}>{m.username}</span>
                          <span style={{ fontSize:11, color:"#64748b", marginLeft:6 }}>{m.role}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => setShowTaskForm(false)} style={{ padding:"8px 14px", borderRadius:12, fontSize:13, cursor:"pointer", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#94a3b8" }}>Cancel</button>
                  <button onClick={() => void addTask()} disabled={savingTask || !taskTitle.trim()} style={{ ...BTN, opacity: savingTask||!taskTitle.trim()?0.5:1 }}>{savingTask?"Saving…":"Add"}</button>
                </div>
              </div>
            )}

            {view === "kanban" && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:16 }}>
                {KANBAN_COLS.map(col => (
                  <div key={col}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:TASK_STATUS_COLORS[col] }} />
                      <span style={{ fontSize:11, fontWeight:600, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.5px" }}>{COL_LABELS[col]}</span>
                      <span style={{ fontSize:11, color:"#475569", marginLeft:"auto" }}>{tasks.filter(t=>t.status===col).length}</span>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {tasks.filter(t=>t.status===col).map(task => (
                        <div key={task.id} style={{ ...CARD, padding:"12px 14px" }}>
                          <p style={{ color:"#e2e8f0", fontSize:13, fontWeight:500, marginBottom:6 }}>{task.title}</p>
                          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                            <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:`${PRIORITY_COLORS[task.priority]}22`, color:PRIORITY_COLORS[task.priority], border:`1px solid ${PRIORITY_COLORS[task.priority]}33` }}>{task.priority}</span>
                            {task.dueDate && <span style={{ fontSize:10, color:"#64748b" }}>{fmtDate(task.dueDate)}</span>}
                            {task.assignedTo && <span style={{ fontSize:10, color:"#64748b" }}>@{task.assignedTo}</span>}
                          </div>
                          <div style={{ display:"flex", gap:4, marginTop:8, flexWrap:"wrap" }}>
                            {KANBAN_COLS.filter(c=>c!==col).map(c => (
                              <button key={c} onClick={() => void patchTask(task.id, { status:c as TaskStatus })}
                                style={{ fontSize:9, padding:"2px 7px", borderRadius:8, cursor:"pointer", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", color:"#64748b" }}>
                                → {COL_LABELS[c]}
                              </button>
                            ))}
                          </div>
                          <div style={{ display:"flex", gap:6, marginTop:8, justifyContent:"flex-end" }}>
                            <button onClick={() => openEditTask(task)} style={{ fontSize:10, padding:"3px 9px", borderRadius:8, cursor:"pointer", background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)", color:"#818cf8" }}>Edit</button>
                            {isManager && <button onClick={() => void deleteTask(task.id)} disabled={deletingTaskId===task.id} style={{ fontSize:10, padding:"3px 9px", borderRadius:8, cursor:"pointer", background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)", color:"#f87171", opacity:deletingTaskId===task.id?0.5:1 }}>{deletingTaskId===task.id?"…":"Delete"}</button>}
                          </div>
                        </div>
                      ))}
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
                      {["Title","Priority","Status","Assignee","Due Date","Actions"].map(h => (
                        <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding:"24px", textAlign:"center", color:"#475569", fontSize:13 }}>No tasks yet</td></tr>
                    ) : tasks.map(task => (
                      <tr key={task.id} style={{ borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding:"10px 14px", fontSize:13, color:"#e2e8f0" }}>{task.title}</td>
                        <td style={{ padding:"10px 14px" }}><span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background:`${PRIORITY_COLORS[task.priority]}22`, color:PRIORITY_COLORS[task.priority] }}>{task.priority}</span></td>
                        <td style={{ padding:"10px 14px" }}><span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background:`${TASK_STATUS_COLORS[task.status]}22`, color:TASK_STATUS_COLORS[task.status] }}>{task.status.replace("_"," ")}</span></td>
                        <td style={{ padding:"10px 14px", fontSize:12, color:"#94a3b8" }}>{task.assignedTo ?? "—"}</td>
                        <td style={{ padding:"10px 14px", fontSize:12, color:"#64748b" }}>{fmtDate(task.dueDate)}</td>
                        <td style={{ padding:"10px 14px" }}>
                          <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                            <select value={task.status} onChange={e=>void patchTask(task.id, { status:e.target.value as TaskStatus })}
                              style={{ fontSize:11, padding:"3px 8px", borderRadius:8, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#94a3b8", cursor:"pointer" }}>
                              {KANBAN_COLS.map(c=><option key={c} value={c}>{COL_LABELS[c]}</option>)}
                            </select>
                            <button onClick={() => openEditTask(task)} style={{ fontSize:10, padding:"3px 9px", borderRadius:8, cursor:"pointer", background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)", color:"#818cf8" }}>Edit</button>
                            {isManager && <button onClick={() => void deleteTask(task.id)} disabled={deletingTaskId===task.id} style={{ fontSize:10, padding:"3px 9px", borderRadius:8, cursor:"pointer", background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)", color:"#f87171", opacity:deletingTaskId===task.id?0.5:1 }}>{deletingTaskId===task.id?"…":"Del"}</button>}
                          </div>
                        </td>
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
                  <div style={{ minWidth:600 }}>
                    {ganttTasks.map(task => {
                      const start = new Date(task.createdAt).getTime();
                      const end   = new Date(task.dueDate!).getTime();
                      const left  = ((start - ganttMin) / ganttSpan) * 100;
                      const width = Math.max(((end - start) / ganttSpan) * 100, 2);
                      return (
                        <div key={task.id} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
                          <div style={{ width:180, flexShrink:0, fontSize:12, color:"#94a3b8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{task.title}</div>
                          <div style={{ flex:1, height:28, background:"rgba(255,255,255,0.04)", borderRadius:8, position:"relative" }}>
                            <div style={{ position:"absolute", left:`${left}%`, width:`${width}%`, top:4, bottom:4, borderRadius:6, background:TASK_STATUS_COLORS[task.status], opacity:0.85, minWidth:4 }} title={`${fmtDate(task.createdAt)} → ${fmtDate(task.dueDate)}`} />
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
            <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
              {(["team","shared"] as const).map(ft => (
                <button key={ft} onClick={() => setFileTab(ft)}
                  style={{ ...BTN, background:fileTab===ft?"rgba(99,102,241,0.2)":"rgba(255,255,255,0.04)", color:fileTab===ft?"#818cf8":"#64748b", border:fileTab===ft?"1px solid rgba(99,102,241,0.35)":"1px solid rgba(255,255,255,0.08)", textTransform:"capitalize", padding:"6px 14px" }}>
                  {ft === "team" ? "Team (All)" : "Shared with Client"}
                </button>
              ))}
              <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
                <input ref={fileInput} type="file" style={{ display:"none" }} onChange={e => void uploadFile(e)} />
                <button onClick={() => fileInput.current?.click()} disabled={uploading} style={{ ...BTN, opacity:uploading?0.6:1 }}>
                  {uploading ? "Uploading…" : "+ Upload File"}
                </button>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:12 }}>
              {files.filter(f => fileTab === "team" || f.visibility === "both").map(f => (
                <div key={f.id} style={{ ...CARD }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>{f.mimeType.startsWith("image/")?"🖼️":f.mimeType==="application/pdf"?"📄":f.mimeType.includes("word")?"📝":"📁"}</div>
                  <p style={{ fontSize:13, fontWeight:500, color:"#e2e8f0", marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.fileName}</p>
                  <p style={{ fontSize:11, color:"#64748b", marginBottom:8 }}>{fmt(f.fileSize)} • {f.uploadedBy}</p>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    <a href={f.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize:11, padding:"4px 10px", borderRadius:8, background:"rgba(255,255,255,0.06)", color:"#94a3b8", textDecoration:"none" }}>Download</a>
                    <button onClick={() => void toggleVisibility(f.id, f.visibility)}
                      style={{ fontSize:11, padding:"4px 10px", borderRadius:8, cursor:"pointer", background:f.visibility==="both"?"rgba(34,197,94,0.1)":"rgba(255,255,255,0.06)", color:f.visibility==="both"?"#22c55e":"#64748b", border:`1px solid ${f.visibility==="both"?"rgba(34,197,94,0.3)":"rgba(255,255,255,0.08)"}` }}>
                      {f.visibility === "both" ? "✓ Shared" : "Share"}
                    </button>
                    <button onClick={() => void deleteFile(f.id)} style={{ fontSize:11, padding:"4px 10px", borderRadius:8, cursor:"pointer", background:"rgba(248,113,113,0.08)", color:"#f87171", border:"1px solid rgba(248,113,113,0.2)" }}>Delete</button>
                  </div>
                </div>
              ))}
              {files.filter(f => fileTab === "team" || f.visibility === "both").length === 0 && (
                <p style={{ color:"#64748b", fontSize:13, gridColumn:"1/-1", textAlign:"center", padding:"32px" }}>No files yet. Upload one to get started.</p>
              )}
            </div>
          </div>
        )}

        {/* ── MEETINGS TAB ── */}
        {tab === "meetings" && (
          <div>
            <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:16 }}>
              <button onClick={() => setShowMeetForm(true)} style={BTN}>+ Schedule Meeting</button>
            </div>
            {showMeetForm && (
              <div style={{ ...CARD, marginBottom:16 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                  <div style={{ gridColumn:"1/-1" }}>
                    <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>Title *</label>
                    <input style={INPUT} value={meetTitle} onChange={e=>setMeetTitle(e.target.value)} placeholder="Meeting title" />
                  </div>
                  <div>
                    <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>Start *</label>
                    <input type="datetime-local" style={INPUT} value={meetStart} onChange={e=>setMeetStart(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>End *</label>
                    <input type="datetime-local" style={INPUT} value={meetEnd} onChange={e=>setMeetEnd(e.target.value)} />
                  </div>
                  <div style={{ gridColumn:"1/-1" }}>
                    <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>Meet Link</label>
                    <input style={INPUT} value={meetLink} onChange={e=>setMeetLink(e.target.value)} placeholder="https://meet.google.com/…" />
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
                  <button onClick={() => setShowMeetForm(false)} style={{ padding:"8px 14px", borderRadius:12, fontSize:13, cursor:"pointer", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#94a3b8" }}>Cancel</button>
                  <button onClick={() => void addMeeting()} disabled={savingMeet||!meetTitle||!meetStart||!meetEnd} style={{ ...BTN, opacity:savingMeet||!meetTitle||!meetStart||!meetEnd?0.5:1 }}>{savingMeet?"Saving…":"Schedule"}</button>
                </div>
              </div>
            )}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {meetings.length === 0 && <p style={{ color:"#64748b", fontSize:13, textAlign:"center", padding:"32px" }}>No meetings scheduled for this project.</p>}
              {meetings.map(m => (
                <div key={m.id} style={{ ...CARD, display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
                  <div style={{ flex:1 }}>
                    <p style={{ color:"#e2e8f0", fontSize:14, fontWeight:600, marginBottom:4 }}>{m.title}</p>
                    <p style={{ color:"#64748b", fontSize:12 }}>{fmtDate(m.startTime)} · {new Date(m.startTime).toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})} – {new Date(m.endTime).toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})}</p>
                    {m.notes && <p style={{ color:"#94a3b8", fontSize:12, marginTop:4 }}>{m.notes}</p>}
                  </div>
                  {m.meetLink && <a href={m.meetLink} target="_blank" rel="noreferrer" style={{ fontSize:12, padding:"6px 14px", borderRadius:10, background:"rgba(99,102,241,0.12)", color:"#818cf8", border:"1px solid rgba(99,102,241,0.25)", textDecoration:"none" }}>Join</a>}
                  <span style={{ fontSize:11, padding:"3px 10px", borderRadius:20, background:"rgba(255,255,255,0.06)", color:"#94a3b8" }}>{m.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── WHITEBOARD TAB ── */}
        {tab === "whiteboard" && (
          <div style={{ display:"flex", gap:16 }}>
            <div style={{ width:220, flexShrink:0, display:"flex", flexDirection:"column", gap:8 }}>
              <button onClick={() => setShowBoardForm(true)} style={{ ...BTN, width:"100%", marginBottom:4 }}>+ New Board</button>
              {showBoardForm && (
                <div style={{ ...CARD, display:"flex", flexDirection:"column", gap:8 }}>
                  <input style={INPUT} value={newBoardName} onChange={e=>setNewBoardName(e.target.value)} placeholder="Board name" />
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={() => setShowBoardForm(false)} style={{ flex:1, padding:"6px", borderRadius:10, fontSize:12, cursor:"pointer", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#94a3b8" }}>Cancel</button>
                    <button onClick={() => void createBoard()} style={{ flex:1, ...BTN, padding:"6px" }}>Create</button>
                  </div>
                </div>
              )}
              {boards.map(b => (
                <div key={b.id} onClick={() => openBoard(b)} style={{ ...CARD, cursor:"pointer", padding:"12px 14px", border:activeBoard?.id===b.id?"1px solid rgba(99,102,241,0.4)":CARD.border, background:activeBoard?.id===b.id?"rgba(99,102,241,0.08)":CARD.background }}>
                  <p style={{ color:"#e2e8f0", fontSize:13, fontWeight:500 }}>{b.name}</p>
                  {b.lastEditedBy && <p style={{ color:"#64748b", fontSize:10, marginTop:2 }}>By {b.lastEditedBy}</p>}
                </div>
              ))}
              {boards.length === 0 && !showBoardForm && <p style={{ color:"#64748b", fontSize:12, textAlign:"center", padding:"16px 0" }}>No boards yet</p>}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              {activeBoard ? (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                    {(["pen","rect","eraser"] as const).map(t => (
                      <button key={t} onClick={() => setWbTool(t)} style={{ ...BTN, background:wbTool===t?"rgba(99,102,241,0.2)":"rgba(255,255,255,0.04)", color:wbTool===t?"#818cf8":"#64748b", padding:"6px 12px", textTransform:"capitalize" }}>{t}</button>
                    ))}
                    <input type="color" value={wbColor} onChange={e=>setWbColor(e.target.value)} style={{ width:32, height:32, borderRadius:8, cursor:"pointer", border:"none", background:"none" }} />
                    <input type="range" min={1} max={12} value={wbWidth} onChange={e=>setWbWidth(+e.target.value)} style={{ width:80 }} />
                    <span style={{ fontSize:11, color:"#64748b" }}>{wbWidth}px</span>
                    <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
                      <button onClick={() => setWbElements([])} style={{ padding:"6px 12px", borderRadius:10, fontSize:12, cursor:"pointer", background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.2)", color:"#f87171" }}>Clear</button>
                      <button onClick={() => void saveBoard()} disabled={wbSaving} style={{ ...BTN, opacity:wbSaving?0.6:1 }}>{wbSaving?"Saving…":"Save"}</button>
                    </div>
                  </div>
                  <canvas ref={canvasRef} width={860} height={500}
                    onMouseDown={onWbDown} onMouseMove={onWbMove} onMouseUp={onWbUp} onMouseLeave={onWbUp}
                    style={{ display:"block", background:"#0f1629", borderRadius:14, cursor:wbTool==="pen"||wbTool==="eraser"?"crosshair":"crosshair", maxWidth:"100%", border:"1px solid rgba(255,255,255,0.08)" }}
                  />
                </div>
              ) : (
                <div style={{ ...CARD, display:"flex", alignItems:"center", justifyContent:"center", minHeight:300, color:"#475569", fontSize:13 }}>
                  Select a board to start drawing
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── DOCUMENTS TAB ── */}
        {tab === "documents" && (
          <div>
            <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:16 }}>
              <button onClick={() => setShowDocForm(true)} style={BTN}>+ New Proposal / Contract</button>
            </div>

            {showDocForm && (
              <div style={{ ...CARD, marginBottom:20 }}>
                <div style={{ display:"grid", gap:12, marginBottom:16 }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:12 }}>
                    <div>
                      <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>Title *</label>
                      <input style={INPUT} value={docTitle} onChange={e=>setDocTitle(e.target.value)} placeholder="e.g. Website Redesign Proposal" />
                    </div>
                    <div>
                      <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>Type</label>
                      <select style={{ ...INPUT, width:"auto" }} value={docType} onChange={e=>setDocType(e.target.value as "proposal"|"contract")}>
                        <option value="proposal">Proposal</option>
                        <option value="contract">Contract</option>
                      </select>
                    </div>
                  </div>
                  {docType === "proposal" && (
                    <div>
                      <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>Project Brief (for AI generation)</label>
                      <textarea rows={3} style={{ ...INPUT, resize:"vertical" }} value={briefInput} onChange={e=>setBriefInput(e.target.value)} placeholder="Describe what the client needs, goals, requirements…" />
                      <button onClick={() => void generateProposal()} disabled={generating||!briefInput.trim()} style={{ marginTop:8, ...BTN, background:"rgba(139,92,246,0.15)", color:"#a78bfa", border:"1px solid rgba(139,92,246,0.3)", opacity:generating||!briefInput.trim()?0.5:1 }}>
                        {generating ? "✨ Generating…" : "✨ Generate with AI"}
                      </button>
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>Content (Markdown)</label>
                    <textarea rows={12} style={{ ...INPUT, resize:"vertical", fontFamily:"monospace", fontSize:12 }} value={docContent} onChange={e=>setDocContent(e.target.value)} placeholder="Write or paste document content here…" />
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
                  <button onClick={() => { setShowDocForm(false); setDocTitle(""); setDocContent(""); setBriefInput(""); }} style={{ padding:"8px 14px", borderRadius:12, fontSize:13, cursor:"pointer", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#94a3b8" }}>Cancel</button>
                  <button onClick={() => void saveDoc()} disabled={savingDoc||!docTitle.trim()} style={{ ...BTN, opacity:savingDoc||!docTitle.trim()?0.5:1 }}>{savingDoc?"Saving…":"Save Draft"}</button>
                </div>
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {docs.length === 0 && !showDocForm && <p style={{ color:"#64748b", fontSize:13, textAlign:"center", padding:"32px" }}>No documents yet.</p>}
              {docs.map(doc => (
                <div key={doc.id} style={{ ...CARD, display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:4 }}>
                      <span style={{ fontSize:14, fontWeight:600, color:"#e2e8f0" }}>{doc.title}</span>
                      <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background:"rgba(255,255,255,0.06)", color:"#94a3b8", textTransform:"capitalize" }}>{doc.type}</span>
                      <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background:doc.status==="draft"?"rgba(255,255,255,0.06)":doc.status==="sent"?"rgba(99,102,241,0.15)":doc.status==="signed"?"rgba(34,197,94,0.15)":"rgba(248,113,113,0.15)", color:doc.status==="draft"?"#64748b":doc.status==="sent"?"#818cf8":doc.status==="signed"?"#22c55e":"#f87171", textTransform:"capitalize" }}>{doc.status}</span>
                    </div>
                    <p style={{ fontSize:11, color:"#64748b" }}>By {doc.createdBy} · {fmtDate(doc.createdAt)}</p>
                  </div>
                  {doc.status === "draft" && isManager && (
                    <button onClick={() => void sendDoc(doc.id)} style={{ fontSize:12, padding:"6px 14px", borderRadius:10, cursor:"pointer", background:"rgba(99,102,241,0.12)", color:"#818cf8", border:"1px solid rgba(99,102,241,0.25)" }}>Send to Client</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SOP TAB ── */}
        {tab === "sop" && (
          <div>
            {sops.length > 0 && !activeSOP && (
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
                {sops.map(s => (
                  <div key={s.id} style={{ ...CARD, display:"flex", alignItems:"center", gap:16, cursor:"pointer" }} onClick={() => { setActiveSOP(s); setSopContent(s.content); }}>
                    <div style={{ flex:1 }}>
                      <p style={{ color:"#e2e8f0", fontSize:14, fontWeight:600 }}>{s.title}</p>
                      <p style={{ color:"#64748b", fontSize:11, marginTop:2 }}>By {s.createdBy} · {fmtDate(s.createdAt)}</p>
                    </div>
                    <span style={{ fontSize:12, color:"#818cf8" }}>Edit →</span>
                  </div>
                ))}
              </div>
            )}

            {activeSOP ? (
              <div>
                <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:16 }}>
                  <button onClick={() => setActiveSOP(null)} style={{ padding:"6px 12px", borderRadius:10, fontSize:12, cursor:"pointer", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#94a3b8" }}>← Back</button>
                  <h2 style={{ color:"#e2e8f0", fontSize:16, fontWeight:600, flex:1 }}>{activeSOP.title}</h2>
                  <button onClick={() => void saveSOP()} disabled={savingSOP} style={{ ...BTN, opacity:savingSOP?0.6:1 }}>{savingSOP?"Saving…":"Save"}</button>
                </div>
                <textarea rows={30} style={{ ...INPUT, resize:"vertical", fontFamily:"monospace", fontSize:12 }} value={sopContent} onChange={e=>setSopContent(e.target.value)} />
              </div>
            ) : (
              <div style={{ ...CARD }}>
                <h3 style={{ color:"#e2e8f0", fontSize:15, fontWeight:600, marginBottom:16 }}>Generate New SOP</h3>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <div>
                    <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>SOP Title</label>
                    <input style={INPUT} value={sopTitle} onChange={e=>setSopTitle(e.target.value)} placeholder={`${project.name} SOP`} />
                  </div>
                  <div>
                    <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>Project Brief *</label>
                    <textarea rows={6} style={{ ...INPUT, resize:"vertical" }} value={sopBrief} onChange={e=>setSopBrief(e.target.value)} placeholder="Describe the project scope, goals, stakeholders, technical requirements, deliverables, timeline…" />
                  </div>
                  <button onClick={() => void generateSOP()} disabled={generatingSOP||!sopBrief.trim()} style={{ ...BTN, alignSelf:"flex-start", background:"rgba(139,92,246,0.15)", color:"#a78bfa", border:"1px solid rgba(139,92,246,0.3)", opacity:generatingSOP||!sopBrief.trim()?0.5:1 }}>
                    {generatingSOP ? "✨ Generating SOP…" : "✨ Generate SOP with AI"}
                  </button>
                  {sopError && (
                    <div style={{ padding:"10px 14px", borderRadius:12, background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.25)", color:"#f87171", fontSize:12 }}>
                      {sopError}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TASK EDIT MODAL ── */}
        {editingTask && (
          <div style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:16, background:"rgba(0,0,0,0.75)" }} onClick={e=>{ if (e.target===e.currentTarget) setEditingTask(null); }}>
            <div style={{ width:"100%", maxWidth:480, borderRadius:20, padding:24, background:"#0f1629", border:"1px solid rgba(255,255,255,0.12)", display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <h2 style={{ color:"#e2e8f0", fontSize:16, fontWeight:600 }}>Edit Task</h2>
                <button onClick={()=>setEditingTask(null)} style={{ color:"#64748b", fontSize:18, background:"none", border:"none", cursor:"pointer", lineHeight:1 }}>✕</button>
              </div>
              <div>
                <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>Title *</label>
                <input style={INPUT} value={editForm.title ?? ""} onChange={e=>setEditForm(f=>({...f,title:e.target.value}))} autoFocus />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>Priority</label>
                  <select style={INPUT} value={editForm.priority ?? "medium"} onChange={e=>setEditForm(f=>({...f,priority:e.target.value as TaskPriority}))}>
                    {(["low","medium","high","urgent"] as TaskPriority[]).map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>Status</label>
                  <select style={INPUT} value={editForm.status ?? "open"} onChange={e=>setEditForm(f=>({...f,status:e.target.value as TaskStatus}))}>
                    {(["open","in_progress","done","cancelled"] as TaskStatus[]).map(c=><option key={c} value={c}>{{"open":"Open","in_progress":"In Progress","done":"Done","cancelled":"Cancelled"}[c]}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div style={{ position:"relative" }} ref={editAssigneeDDRef}>
                  <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>Assignee</label>
                  <input style={INPUT} value={editForm.assignedTo ?? ""}
                    onChange={e=>{ setEditForm(f=>({...f,assignedTo:e.target.value})); setShowEditAssigneeDD(true); }}
                    onFocus={()=>setShowEditAssigneeDD(true)}
                    placeholder="Search teammate…" />
                  {showEditAssigneeDD && team.length > 0 && (
                    <div style={{ position:"absolute", top:"100%", left:0, right:0, zIndex:200, background:"#0f1729", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, overflow:"hidden", boxShadow:"0 8px 32px rgba(0,0,0,0.4)", maxHeight:200, overflowY:"auto", marginTop:4 }}>
                      {team.filter(m=>{ const q=(editForm.assignedTo??"").toLowerCase(); return !q||m.username.toLowerCase().includes(q)||m.role.toLowerCase().includes(q); }).map(m=>(
                        <div key={m.username} onMouseDown={()=>{ setEditForm(f=>({...f,assignedTo:m.username})); setShowEditAssigneeDD(false); }}
                          style={{ padding:"9px 14px", cursor:"pointer", fontSize:13, borderBottom:"1px solid rgba(255,255,255,0.04)" }}
                          onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.05)")}
                          onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                          <span style={{ fontWeight:600, color:"#e2e8f0" }}>{m.username}</span>
                          <span style={{ fontSize:11, color:"#64748b", marginLeft:6 }}>{m.role}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>Due Date</label>
                  <input type="date" style={INPUT} value={editForm.dueDate ?? ""} onChange={e=>setEditForm(f=>({...f,dueDate:e.target.value||undefined}))} />
                </div>
              </div>
              <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
                <button onClick={()=>setEditingTask(null)} style={{ padding:"8px 16px", borderRadius:12, fontSize:13, cursor:"pointer", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#94a3b8" }}>Cancel</button>
                <button onClick={()=>void saveEditTask()} disabled={!editForm.title?.trim()} style={{ ...BTN, opacity:!editForm.title?.trim()?0.5:1 }}>Save Changes</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardShell>
  );
}
