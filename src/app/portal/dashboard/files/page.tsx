"use client";
import { useEffect, useState, useRef } from "react";

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
    <div style={{ width:40, height:40, borderRadius:12, background:`${color}18`, border:`1px solid ${color}33`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <span style={{ fontSize:9, fontWeight:700, color, letterSpacing:"0.05em" }}>{label}</span>
    </div>
  );
}

const CARD: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
};

export default function PortalFilesPage() {
  const [files, setFiles]           = useState<FileResource[]>([]);
  const [loading, setLoading]       = useState(true);
  const [uploading, setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/portal/files");
      if (res.ok) {
        const d = await res.json() as { files: FileResource[] };
        setFiles(d.files ?? []);
      }
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/portal/files", { method: "POST", body: formData });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setUploadError(d.error || "Upload failed.");
      } else {
        await load();
      }
    } catch { setUploadError("Upload failed."); }
    finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this file?")) return;
    await fetch(`/api/portal/files?id=${id}`, { method: "DELETE" });
    await load();
  }

  const categories = ["all", ...Array.from(new Set(files.map(f => f.category ?? "general")))];
  const filtered   = categoryFilter === "all" ? files : files.filter(f => (f.category ?? "general") === categoryFilter);

  return (
    <div style={{ padding:"32px 36px 48px" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16, marginBottom:28 }}>
        <div>
          <h1 style={{ margin:"0 0 4px", fontSize:22, fontWeight:700, color:"#f1f5f9", letterSpacing:"-0.2px" }}>
            Shared Drive
          </h1>
          <p style={{ margin:0, fontSize:13, color:"#64748b" }}>
            Files and assets shared with you — and your uploads
          </p>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <input ref={fileInputRef} type="file" style={{ display:"none" }} onChange={handleUpload} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              padding:"9px 18px", borderRadius:16, fontSize:13, fontWeight:600, cursor:"pointer",
              color:"#ffffff", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", border:"none",
              display:"flex", alignItems:"center", gap:6, opacity:uploading?0.6:1,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {uploading ? "Uploading…" : "Upload File"}
          </button>
        </div>
      </div>

      {uploadError && (
        <div style={{ marginBottom:16, padding:"10px 16px", borderRadius:14, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", color:"#fca5a5", fontSize:13 }}>
          {uploadError}
        </div>
      )}

      {/* Category filter tabs */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24 }}>
        {categories.map(cat => {
          const active = categoryFilter === cat;
          return (
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              style={{
                padding:"6px 14px", borderRadius:14, fontSize:13, fontWeight:active?600:400, cursor:"pointer",
                color:active?"#e2e8f0":"#64748b", background:active?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.04)",
                border:active?"1px solid rgba(99,102,241,0.3)":"1px solid rgba(255,255,255,0.07)",
                textTransform:"capitalize",
              }}>
              {cat}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, color:"#475569", fontSize:14 }}>
          Loading files…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ ...CARD, textAlign:"center", padding:"48px 24px" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📂</div>
          <p style={{ color:"#94a3b8", fontWeight:500, margin:0 }}>No files yet</p>
          <p style={{ color:"#475569", fontSize:13, marginTop:4 }}>
            Files shared by your account manager will appear here. You can also upload your own assets.
          </p>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16 }}>
          {filtered.map(f => (
            <div key={f.id} style={CARD}>
              <div style={{ padding:"16px 16px 12px" }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:12 }}>
                  <MimeIcon mime={f.mimeType} />
                  <div style={{ minWidth:0, flex:1 }}>
                    <p style={{ margin:0, color:"#e2e8f0", fontSize:13, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={f.fileName}>
                      {f.fileName}
                    </p>
                    <p style={{ margin:"2px 0 0", color:"#475569", fontSize:11 }}>{formatBytes(f.fileSize)}</p>
                  </div>
                </div>
                {f.category && (
                  <span style={{ display:"inline-block", fontSize:10, fontWeight:600, textTransform:"capitalize", color:"#818cf8", background:"rgba(99,102,241,0.1)", padding:"2px 8px", borderRadius:12, marginBottom:8 }}>
                    {f.category}
                  </span>
                )}
                <div style={{ fontSize:11, color:"#475569" }}>
                  <div>{f.uploadedByType === "admin" ? "Shared by team" : `Uploaded by you`}</div>
                  <div>{new Date(f.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div style={{ display:"flex", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                <a href={f.fileUrl} target="_blank" rel="noopener noreferrer"
                  style={{ flex:1, textAlign:"center", padding:"10px 0", fontSize:12, fontWeight:500, color:"#6366f1", textDecoration:"none" }}>
                  Download ↗
                </a>
                {f.uploadedByType === "client" && (
                  <button onClick={() => handleDelete(f.id)}
                    style={{ flex:1, textAlign:"center", padding:"10px 0", fontSize:12, fontWeight:500, color:"#64748b", background:"none", border:"none", borderLeft:"1px solid rgba(255,255,255,0.05)", cursor:"pointer" }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color="#f87171";}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color="#64748b";}}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
