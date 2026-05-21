"use client";
import { useEffect, useState } from "react";
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

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1200 }}>
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
    </div>
  );
}
