"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface PortalFile {
  id: string;
  project_id: string;
  project_name: string;
  name: string;
  url: string;
  mime_type: string;
  size: number;
  created_at: string;
  visibility: string;
}

type ResourceCategory = "general" | "contract" | "design" | "report" | "deliverable" | "invoice" | "other";

interface ClientResource {
  id: string;
  name: string;
  description: string | null;
  file_url: string;
  file_name: string;
  file_size: number | null;
  mime_type: string;
  category: ResourceCategory;
  uploaded_by: string;
  uploaded_by_type: "team" | "client";
  created_at: string;
}

const CATEGORY_COLORS: Record<ResourceCategory, { color: string; bg: string }> = {
  general:     { color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  contract:    { color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
  design:      { color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  report:      { color: "#34d399", bg: "rgba(52,211,153,0.12)"  },
  deliverable: { color: "#38bdf8", bg: "rgba(56,189,248,0.12)"  },
  invoice:     { color: "#fb923c", bg: "rgba(251,146,60,0.12)"  },
  other:       { color: "#64748b", bg: "rgba(100,116,139,0.12)" },
};

function fileIcon(mime: string) {
  if (mime?.includes("pdf")) return "📄";
  if (mime?.includes("image")) return "🖼️";
  if (mime?.includes("zip") || mime?.includes("archive")) return "📦";
  if (mime?.includes("video")) return "🎥";
  if (mime?.includes("word") || mime?.includes("document")) return "📝";
  return "📎";
}

function fmtSize(bytes: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  return `${mo}mo ago`;
}

export default function FilesPage() {
  const router = useRouter();
  const [files, setFiles] = useState<PortalFile[]>([]);
  const [loading, setLoading] = useState(true);

  // Resources state
  const [resources, setResources] = useState<ClientResource[]>([]);
  const [resLoading, setResLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resName, setResName] = useState("");
  const [resDesc, setResDesc] = useState("");
  const [resCategory, setResCategory] = useState<ResourceCategory>("general");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch portal project files
  useEffect(() => {
    fetch("/api/customers/files")
      .then((r) => {
        if (r.status === 401) { router.replace("/customers"); return null; }
        return r.ok ? r.json() : null;
      })
      .then((d) => {
        if (d) setFiles(d.files ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  // Fetch client resources
  const loadResources = () => {
    setResLoading(true);
    fetch("/api/customers/resources")
      .then((r) => r.ok ? r.json() : { resources: [] })
      .then((d) => setResources(d.resources ?? []))
      .catch(console.error)
      .finally(() => setResLoading(false));
  };

  useEffect(() => { loadResources(); }, []);

  async function handleResourceUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile || !resName.trim()) return;
    setUploading(true); setUploadError(""); setUploadSuccess("");
    try {
      // Step 1: get a signed upload URL from the server (uses service role key)
      const urlRes = await fetch(
        `/api/customers/resources/upload-url?filename=${encodeURIComponent(selectedFile.name)}&content_type=${encodeURIComponent(selectedFile.type || "application/octet-stream")}`
      );
      if (!urlRes.ok) {
        const d = await urlRes.json() as { error?: string };
        setUploadError(d.error ?? "Could not get upload URL");
        return;
      }
      const { signed_url, token, path, public_url } = await urlRes.json() as {
        signed_url: string; token: string; path: string; public_url: string;
      };

      // Step 2: upload directly to Supabase Storage using the signed URL
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
      const uploadEndpoint = `${supabaseUrl}/storage/v1/object/upload/sign/client-resources/${path}?token=${encodeURIComponent(token)}`;
      const uploadRes = await fetch(uploadEndpoint, {
        method: "PUT",
        headers: { "Content-Type": selectedFile.type || "application/octet-stream" },
        body: selectedFile,
      });
      if (!uploadRes.ok) {
        const txt = await uploadRes.text().catch(() => uploadRes.statusText);
        setUploadError(`Storage upload failed: ${txt}`);
        return;
      }

      // Step 3: save the resource record to the database
      const saveRes = await fetch("/api/customers/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:        resName.trim(),
          description: resDesc.trim() || undefined,
          file_url:    public_url,
          file_name:   selectedFile.name,
          file_size:   selectedFile.size,
          mime_type:   selectedFile.type || "application/octet-stream",
          category:    resCategory,
        }),
      });

      if (!saveRes.ok) {
        const d = await saveRes.json() as { error?: string };
        setUploadError(d.error ?? "Failed to save resource");
        return;
      }

      setUploadSuccess("Resource uploaded successfully!");
      setSelectedFile(null); setResName(""); setResDesc(""); setResCategory("general");
      setShowUpload(false);
      loadResources();
      setTimeout(() => setUploadSuccess(""), 3000);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ padding: "32px 40px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 700, color: "#fff" }}>
          Files &amp; Resources
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
          Files and documents shared with you from your projects.
        </p>
      </div>

      {loading ? (
        <div style={{ color: "#64748b", fontSize: 14, textAlign: "center", paddingTop: 80 }}>
          Loading…
        </div>
      ) : files.length === 0 ? (
        <div
          style={{
            padding: "64px 32px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
          <p style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "#e2e8f0" }}>
            No files have been shared yet
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            Your team will share files and resources here as your projects progress.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {files.map((file) => (
            <div
              key={file.id}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14,
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {/* Icon + Name */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ fontSize: 32, flexShrink: 0 }}>{fileIcon(file.mime_type)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: "0 0 6px",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#e2e8f0",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {file.name}
                  </p>
                  {/* Project badge */}
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#6366f1",
                      background: "rgba(99,102,241,0.15)",
                      padding: "2px 8px",
                      borderRadius: 100,
                    }}
                  >
                    {file.project_name}
                  </span>
                </div>
              </div>

              {/* Meta */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 12,
                  color: "#64748b",
                }}
              >
                <span>{fmtSize(file.size)}</span>
                <span style={{ color: "#334155" }}>·</span>
                <span>{timeAgo(file.created_at)}</span>
              </div>

              {/* Download button */}
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  background: "rgba(99,102,241,0.15)",
                  border: "1px solid rgba(99,102,241,0.3)",
                  borderRadius: 8,
                  color: "#a5b4fc",
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: "none",
                  textAlign: "center",
                  transition: "all 0.1s",
                }}
              >
                ↓ Download
              </a>
            </div>
          ))}
        </div>
      )}

      {/* ── Resources Section ── */}
      <div style={{ marginTop: 48 }}>
        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#fff" }}>
              Resource Library
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
              Documents and files uploaded specifically for your account.
            </p>
          </div>
          <button
            onClick={() => { setShowUpload((v) => !v); setUploadError(""); setUploadSuccess(""); }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              color: "#fff", background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none", cursor: "pointer",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Upload
          </button>
        </div>

        {uploadSuccess && (
          <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 10, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399", fontSize: 13 }}>
            {uploadSuccess}
          </div>
        )}

        {/* Upload form */}
        {showUpload && (
          <form
            onSubmit={handleResourceUpload}
            style={{
              marginBottom: 24, padding: 20, borderRadius: 14,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
          >
            <p style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>Upload a Resource</p>
            {uploadError && (
              <p style={{ margin: "0 0 12px", padding: "8px 12px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", fontSize: 12 }}>
                {uploadError}
              </p>
            )}

            {/* Drag-drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault(); setDragOver(false);
                const f = e.dataTransfer.files[0];
                if (f) { setSelectedFile(f); if (!resName) setResName(f.name.replace(/\.[^.]+$/, "")); }
              }}
              style={{
                padding: "28px 20px", borderRadius: 10, textAlign: "center", cursor: "pointer",
                border: `2px dashed ${dragOver ? "#6366f1" : "rgba(255,255,255,0.12)"}`,
                background: dragOver ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.02)",
                marginBottom: 16, transition: "all 0.15s",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setSelectedFile(f); if (!resName) setResName(f.name.replace(/\.[^.]+$/, "")); }
                }}
              />
              {selectedFile ? (
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: "#a5b4fc" }}>{selectedFile.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>
                    {fmtSize(selectedFile.size)}
                    {" · "}
                    <span style={{ color: "#6366f1", cursor: "pointer" }}>Change file</span>
                  </p>
                </div>
              ) : (
                <div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" style={{ margin: "0 auto 8px" }}>
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p style={{ margin: "0 0 4px", fontSize: 13, color: "#94a3b8" }}>Drop file here or <span style={{ color: "#6366f1" }}>browse</span></p>
                  <p style={{ margin: 0, fontSize: 11, color: "#475569" }}>Any file type</p>
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#64748b", marginBottom: 6 }}>Display Name *</label>
                <input
                  required
                  value={resName}
                  onChange={(e) => setResName(e.target.value)}
                  placeholder="e.g. Brand Guidelines"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 9, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#64748b", marginBottom: 6 }}>Category</label>
                <select
                  value={resCategory}
                  onChange={(e) => setResCategory(e.target.value as ResourceCategory)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 9, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", fontSize: 13, outline: "none" }}
                >
                  <option value="general">General</option>
                  <option value="contract">Contract</option>
                  <option value="design">Design</option>
                  <option value="report">Report</option>
                  <option value="deliverable">Deliverable</option>
                  <option value="invoice">Invoice</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, color: "#64748b", marginBottom: 6 }}>Description (optional)</label>
              <input
                value={resDesc}
                onChange={(e) => setResDesc(e.target.value)}
                placeholder="Brief description…"
                style={{ width: "100%", padding: "9px 12px", borderRadius: 9, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 13, fontWeight: 600,
                  color: "#fff", background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  border: "none", cursor: uploading || !selectedFile ? "not-allowed" : "pointer",
                  opacity: uploading || !selectedFile ? 0.6 : 1,
                }}
              >
                {uploading ? "Uploading…" : "Upload Resource"}
              </button>
              <button
                type="button"
                onClick={() => { setShowUpload(false); setSelectedFile(null); setResName(""); setResDesc(""); setUploadError(""); }}
                style={{
                  padding: "9px 16px", borderRadius: 10, fontSize: 13, color: "#64748b",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Resource list */}
        {resLoading ? (
          <div style={{ color: "#64748b", fontSize: 14, textAlign: "center", padding: "40px 0" }}>Loading…</div>
        ) : resources.length === 0 ? (
          <div style={{
            padding: "48px 32px", borderRadius: 16, textAlign: "center",
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
            <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>No resources yet</p>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
              Upload a file above or wait for your team to share resources with you.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {resources.map((r) => {
              const cat = CATEGORY_COLORS[r.category] ?? CATEGORY_COLORS.other;
              return (
                <div
                  key={r.id}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 14,
                    padding: "18px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  {/* Icon + Name */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <span style={{ fontSize: 28, flexShrink: 0 }}>{fileIcon(r.mime_type)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.name}
                      </p>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100, color: cat.color, background: cat.bg }}>
                          {r.category}
                        </span>
                        {r.uploaded_by_type === "team" && (
                          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100, color: "#a5b4fc", background: "rgba(165,180,252,0.12)" }}>
                            From team
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {r.description && (
                    <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{r.description}</p>
                  )}

                  {/* Meta */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#475569" }}>
                    <span>{r.file_size ? fmtSize(r.file_size) : "—"}</span>
                    <span>·</span>
                    <span>{timeAgo(r.created_at)}</span>
                  </div>

                  {/* Download */}
                  <a
                    href={r.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      padding: "8px 16px",
                      background: "rgba(99,102,241,0.15)",
                      border: "1px solid rgba(99,102,241,0.3)",
                      borderRadius: 8,
                      color: "#a5b4fc",
                      fontSize: 13,
                      fontWeight: 500,
                      textDecoration: "none",
                      textAlign: "center",
                    }}
                  >
                    ↓ Download
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
