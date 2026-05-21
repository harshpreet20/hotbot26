"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { portalClient } from "@/lib/supabase-portal";

type CommType = "announcement" | "meeting_note" | "shared_note" | "update";

interface CommItem {
  id: string;
  client_id: string;
  title: string;
  content: string;
  type: CommType;
  author_name?: string;
  author_type?: string;
  pinned?: boolean;
  attachments?: { name: string; url: string }[];
  created_at: string;
}

const TYPE_LABELS: Record<CommType, string> = {
  announcement: "Announcement",
  meeting_note:  "Meeting Note",
  shared_note:   "Shared Note",
  update:        "Update",
};

const TYPE_COLORS: Record<CommType, { bg: string; color: string }> = {
  announcement: { bg: "rgba(59,130,246,0.15)", color: "#60a5fa" },
  meeting_note:  { bg: "rgba(139,92,246,0.15)", color: "#a78bfa" },
  shared_note:   { bg: "rgba(34,197,94,0.15)",  color: "#4ade80" },
  update:        { bg: "rgba(245,158,11,0.15)",  color: "#fbbf24" },
};

const FILTER_OPTIONS: { label: string; value: CommType | "all" }[] = [
  { label: "All",            value: "all" },
  { label: "Announcements",  value: "announcement" },
  { label: "Meeting Notes",  value: "meeting_note" },
  { label: "Shared Notes",   value: "shared_note" },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function CommCard({ item }: { item: CommItem }) {
  const [expanded, setExpanded] = useState(false);
  const colors = TYPE_COLORS[item.type] ?? TYPE_COLORS.update;
  const contentLong = item.content.length > 240;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        padding: "20px 24px",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            {/* Type badge */}
            <span
              style={{
                display: "inline-block",
                fontSize: 11,
                fontWeight: 700,
                color: colors.color,
                background: colors.bg,
                padding: "2px 10px",
                borderRadius: 100,
              }}
            >
              {TYPE_LABELS[item.type] ?? item.type}
            </span>
            {item.pinned && <span style={{ fontSize: 14 }}>📌</span>}
          </div>
          <p style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>
            {item.title}
          </p>
        </div>
      </div>

      {/* Content */}
      <p
        style={{
          margin: "0 0 12px",
          fontSize: 13,
          color: "#94a3b8",
          lineHeight: 1.7,
          overflow: expanded ? undefined : "hidden",
          display: expanded ? undefined : "-webkit-box",
          WebkitLineClamp: expanded ? undefined : 3,
          WebkitBoxOrient: expanded ? undefined : "vertical",
          whiteSpace: "pre-wrap",
        }}
      >
        {item.content}
      </p>

      {contentLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: "none",
            border: "none",
            color: "#6366f1",
            fontSize: 13,
            cursor: "pointer",
            padding: 0,
            marginBottom: 12,
          }}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      {/* Attachments */}
      {item.attachments && item.attachments.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {item.attachments.map((att, i) => (
            <a
              key={i}
              href={att.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                fontSize: 12,
                color: "#a5b4fc",
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.2)",
                padding: "3px 10px",
                borderRadius: 6,
                textDecoration: "none",
              }}
            >
              📎 {att.name}
            </a>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#475569" }}>
        {item.author_name && (
          <>
            <span style={{ color: "#64748b" }}>{item.author_name}</span>
            <span>·</span>
          </>
        )}
        <span>{timeAgo(item.created_at)}</span>
      </div>
    </div>
  );
}

export default function CommunicationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<CommItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CommType | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const clientIdRef = useRef<string | null>(null);

  useEffect(() => {
    fetch("/api/customers/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) { router.replace("/customers"); return; }
        clientIdRef.current = d.client?.id ?? null;
      })
      .catch(() => {});
  }, [router]);

  useEffect(() => {
    fetch("/api/customers/communications")
      .then((r) => {
        if (r.status === 401) { router.replace("/customers"); return null; }
        return r.ok ? r.json() : null;
      })
      .then((d) => {
        if (d) {
          // Sort: pinned first, then by date
          const sorted = [...(d.items ?? [])].sort((a: CommItem, b: CommItem) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
          setItems(sorted);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  // Realtime subscription
  useEffect(() => {
    const channel = portalClient
      .channel("client_announcements_portal")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "client_announcements" },
        (payload) => {
          const newItem = payload.new as CommItem;
          setItems((prev) => {
            const updated = [newItem, ...prev].sort((a, b) => {
              if (a.pinned && !b.pinned) return -1;
              if (!a.pinned && b.pinned) return 1;
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            return updated;
          });
        }
      )
      .subscribe();
    return () => { portalClient.removeChannel(channel); };
  }, []);

  async function submitNote() {
    if (!form.title.trim() || !form.content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/customers/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, content: form.content, type: "shared_note" }),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ title: "", content: "" });
      }
    } finally {
      setSubmitting(false);
    }
  }

  const filtered =
    filter === "all" ? items : items.filter((i) => i.type === filter);

  return (
    <div style={{ padding: "32px 40px", maxWidth: 900, position: "relative", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 700, color: "#fff" }}>
          Communications
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
          Updates, meeting notes, and shared communications from your team.
        </p>
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            style={{
              padding: "6px 16px",
              borderRadius: 100,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              border: "1px solid",
              transition: "all 0.1s",
              background: filter === opt.value ? "rgba(99,102,241,0.2)" : "transparent",
              borderColor: filter === opt.value ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)",
              color: filter === opt.value ? "#a5b4fc" : "rgba(255,255,255,0.5)",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ color: "#64748b", fontSize: 14, textAlign: "center", paddingTop: 80 }}>
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            padding: "64px 32px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>📢</div>
          <p style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "#e2e8f0" }}>
            No communications yet
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            Your team will post updates here. Check back soon.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map((item) => (
            <CommCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Fixed Add Note button */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          padding: "12px 20px",
          background: "#6366f1",
          border: "none",
          borderRadius: 12,
          color: "#fff",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
          transition: "all 0.1s",
          zIndex: 100,
        }}
      >
        + Add Note
      </button>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: "20px",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div
            style={{
              background: "#13131f",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: "28px",
              width: "100%",
              maxWidth: 520,
            }}
          >
            <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700, color: "#fff" }}>
              Add Shared Note
            </h2>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Title
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Note title…"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Content
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Write your note here…"
                rows={5}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 14,
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: "9px 18px",
                  background: "none",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "#94a3b8",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitNote}
                disabled={submitting || !form.title.trim() || !form.content.trim()}
                style={{
                  padding: "9px 18px",
                  background: "#6366f1",
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "Posting…" : "Post Note"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
