"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { Client } from "@/types/dashboard";

function getToken() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

interface FileResource {
  id: string;
  clientId: string;
  projectId?: string;
  name: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  category?: string;
  uploadedBy: string;
  uploadedByType: "admin" | "client";
  createdAt: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MimeIcon({ mime }: { mime: string }) {
  const isImg   = mime.startsWith("image/");
  const isPdf   = mime === "application/pdf";
  const isVideo = mime.startsWith("video/");
  const color   = isImg ? "#34d399" : isPdf ? "#f87171" : isVideo ? "#a78bfa" : "#60a5fa";
  const label   = isImg ? "IMG" : isPdf ? "PDF" : isVideo ? "VID" : "FILE";
  return (
    <div style={{ width:38, height:38, borderRadius:10, background:`${color}18`, border:`1px solid ${color}33`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <span style={{ fontSize:9, fontWeight:700, color, letterSpacing:"0.05em" }}>{label}</span>
    </div>
  );
}

export default function AdminFilesPage() {
  const [files, setFiles]       = useState<FileResource[]>([]);
  const [clients, setClients]   = useState<Client[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filterClient, setFilterClient] = useState("");
  const [uploading, setUploading]       = useState(false);
  const [uploadError, setUploadError]   = useState("");
  const [uploadClientId, setUploadClientId] = useState("");
  const [uploadCategory, setUploadCategory] = useState("general");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (cId?: string) => {
    setLoading(true);
    const qs = cId ? `?clientId=${encodeURIComponent(cId)}` : "";
    const res = await fetch(`/api/dashboard/files${qs}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.ok) {
      const d = await res.json() as { files: FileResource[] };
      setFiles(d.files ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch("/api/dashboard/clients", { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.ok ? r.json() as Promise<{ clients: Client[] }> : Promise.reject())
      .then(d => setClients(d.clients ?? []))
      .catch(() => {});
    void load();
  }, [load]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!uploadClientId) { setUploadError("Select a client first."); return; }
    setUploading(true);
    setUploadError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("clientId", uploadClientId);
    formData.append("category", uploadCategory);
    try {
      const res = await fetch("/api/dashboard/files", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setUploadError(d.error || "Upload failed.");
      } else {
        await load(filterClient || undefined);
      }
    } catch { setUploadError("Upload failed."); }
    finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this file?")) return;
    await fetch(`/api/dashboard/files?id=${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` },
    });
    await load(filterClient || undefined);
  }

  const CARD: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
  };

  return (
    <DashboardShell>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Shared Drive</h1>
            <p className="text-sm text-slate-500">Files and assets shared with clients</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={uploadClientId}
              onChange={e => setUploadClientId(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none"
              style={{ background:"#0f1729", minWidth:160 }}
            >
              <option value="">Select client…</option>
              {clients.map(c => <option key={c.id} value={c.clientId}>{c.name} ({c.clientId})</option>)}
            </select>
            <select
              value={uploadCategory}
              onChange={e => setUploadCategory(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none"
              style={{ background:"#0f1729" }}
            >
              {["general","logo","document","contract","design","video","other"].map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>
              ))}
            </select>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
            <button
              onClick={() => { if (!uploadClientId) { setUploadError("Select a client first."); return; } fileInputRef.current?.click(); }}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
              style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}
            >
              {uploading ? "Uploading…" : "+ Upload File"}
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400" style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)" }}>
            {uploadError}
          </div>
        )}

        {/* Client filter tabs */}
        <div className="flex gap-2 flex-wrap mb-5">
          <button
            onClick={() => { setFilterClient(""); void load(); }}
            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{ background:!filterClient?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.04)", color:!filterClient?"#a5b4fc":"#64748b", border:!filterClient?"1px solid rgba(99,102,241,0.3)":"1px solid rgba(255,255,255,0.07)" }}
          >
            All Clients
          </button>
          {clients.map(c => (
            <button key={c.id}
              onClick={() => { setFilterClient(c.clientId); void load(c.clientId); }}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{ background:filterClient===c.clientId?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.04)", color:filterClient===c.clientId?"#a5b4fc":"#64748b", border:filterClient===c.clientId?"1px solid rgba(99,102,241,0.3)":"1px solid rgba(255,255,255,0.07)" }}
            >
              {c.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-slate-500 text-sm">Loading…</div>
        ) : files.length === 0 ? (
          <div style={{ ...CARD, textAlign:"center", padding:"48px 24px" }}>
            <div className="text-4xl mb-3">📁</div>
            <p className="text-slate-400 font-medium">No files yet</p>
            <p className="text-slate-600 text-sm mt-1">Upload files above to share with clients</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {files.map(f => (
              <div key={f.id} style={CARD} className="p-4 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <MimeIcon mime={f.mimeType} />
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate" title={f.fileName}>{f.fileName}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{formatBytes(f.fileSize)}</p>
                  </div>
                </div>
                {f.category && (
                  <span className="text-[10px] font-semibold capitalize text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full self-start">
                    {f.category}
                  </span>
                )}
                <div className="text-xs text-slate-600">
                  <div>{f.uploadedBy} ({f.uploadedByType})</div>
                  <div>{new Date(f.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-2 pt-1 border-t border-white/5">
                  <a href={f.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="flex-1 text-center text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors py-1">
                    Download ↗
                  </a>
                  <button onClick={() => handleDelete(f.id)}
                    className="flex-1 text-center text-xs font-medium text-slate-600 hover:text-red-400 transition-colors py-1">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
