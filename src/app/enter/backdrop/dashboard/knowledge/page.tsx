"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { KnowledgeEntry } from "@/types/dashboard";

function getToken() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}
function getRole() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_role") || "" : "";
}

const ALLOWED_ROLES = ["super_admin", "admin", "manager", "editor"];

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function CategoryBadge({ category }: { category?: string }) {
  if (!category) return <span className="text-slate-700">—</span>;
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ color: "#818cf8", background: "rgba(99,102,241,0.12)" }}
    >
      {category}
    </span>
  );
}

interface FormState {
  title: string;
  content: string;
  category: string;
  active: boolean;
  priority: number;
}

const EMPTY_FORM: FormState = { title: "", content: "", category: "", active: true, priority: 10 };

export default function KnowledgePage() {
  const router = useRouter();
  const [entries, setEntries]     = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<KnowledgeEntry | null>(null);
  const [form, setForm]           = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [accessDenied, setAccessDenied] = useState(false);

  const role = getRole();
  const isAdmin = ["super_admin", "admin"].includes(role);

  const load = useCallback(() => {
    const token = getToken();
    if (!token) { router.replace("/enter/backdrop"); return; }
    setLoading(true);
    fetch("/api/dashboard/knowledge", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (r.status === 401) {
          ["backdrop_secret", "backdrop_role", "backdrop_username"].forEach((k) => sessionStorage.removeItem(k));
          router.replace("/enter/backdrop");
          return null;
        }
        return r.json();
      })
      .then((d) => { if (d) setEntries((d as { entries: KnowledgeEntry[] }).entries); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (!ALLOWED_ROLES.includes(getRole())) {
      setAccessDenied(true);
      setLoading(false);
      return;
    }
    load();
  }, [load]);

  const filtered = entries.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [e.title, e.category ?? "", e.content].some((v) => v.toLowerCase().includes(q));
  });

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowModal(true);
  }

  function openEdit(entry: KnowledgeEntry) {
    setEditing(entry);
    setForm({
      title:    entry.title,
      content:  entry.content,
      category: entry.category ?? "",
      active:   entry.active,
      priority: entry.priority,
    });
    setError("");
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true); setError("");
    try {
      const method = editing ? "PATCH" : "POST";
      const payload = editing
        ? { id: editing.id, ...form, category: form.category.trim() || undefined }
        : { ...form, category: form.category.trim() || undefined };

      const res = await fetch("/api/dashboard/knowledge", {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? "Failed to save entry"); return; }
      setShowModal(false);
      load();
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  }

  async function handleToggleActive(entry: KnowledgeEntry) {
    await fetch("/api/dashboard/knowledge", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ id: entry.id, active: !entry.active }),
    });
    setEntries((prev) => prev.map((e) => e.id === entry.id ? { ...e, active: !e.active } : e));
  }

  async function handleDelete(entry: KnowledgeEntry) {
    if (!confirm(`Delete "${entry.title}"? This cannot be undone.`)) return;
    await fetch(`/api/dashboard/knowledge?id=${entry.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    setEntries((prev) => prev.filter((e) => e.id !== entry.id));
  }

  const activeCount = entries.filter((e) => e.active).length;

  if (accessDenied) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-full py-32">
          <div className="text-center">
            <p className="text-red-400 text-sm font-medium">Access denied</p>
            <p className="text-slate-600 text-xs mt-1">Your role does not have permission to view this page.</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="flex flex-col min-h-full">
        {/* Header */}
        <header
          className="flex items-center justify-between px-6 py-4 border-b flex-wrap gap-3"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div>
            <h1 className="text-white font-semibold">Knowledge Base</h1>
            <p className="text-slate-500 text-xs mt-0.5">{entries.length} entr{entries.length !== 1 ? "ies" : "y"} total</p>
          </div>
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-2"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Entry
          </button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 px-6 pt-5">
          <Stat label="Total Entries" value={entries.length} />
          <Stat label="Active Entries" value={activeCount} />
        </div>

        <div className="flex-1 p-6">
          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.7)" }}>
              <form
                onSubmit={handleSubmit}
                className="w-full max-w-2xl rounded-2xl p-6 space-y-4"
                style={{ background: "#0f1626", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-semibold">{editing ? "Edit Entry" : "Add Knowledge Entry"}</h2>
                  <button type="button" onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">✕</button>
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <F label="Title *">
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Entry title…"
                    className="fi"
                  />
                </F>
                <F label="Content *">
                  <textarea
                    required
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    rows={8}
                    placeholder="Knowledge base content…"
                    className="fi resize-y"
                    style={{ minHeight: "160px" }}
                  />
                </F>
                <div className="grid grid-cols-2 gap-3">
                  <F label="Category (optional)">
                    <input
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="e.g. FAQs, Pricing…"
                      className="fi"
                    />
                  </F>
                  <F label="Priority">
                    <input
                      type="number"
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                      min={0}
                      max={100}
                      className="fi"
                    />
                  </F>
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="w-4 h-4 rounded accent-indigo-500"
                  />
                  <span className="text-sm text-slate-300">Active</span>
                </label>
                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                  >
                    {saving ? "Saving…" : editing ? "Save Changes" : "Create Entry"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white transition-colors"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search */}
          <div className="mb-4">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search entries…"
              className="px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none w-full max-w-sm"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
          </div>

          {loading ? (
            <div className="text-slate-500 text-sm py-20 text-center">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-slate-500 text-sm">
                {search ? "No matching entries." : "No knowledge entries yet. Add your first entry."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                    {["Title", "Category", "Priority", "Active", "Created", "Actions"].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-xs text-slate-500 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((entry) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-white/[0.02] transition-colors"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      {/* Title */}
                      <td className="py-3 px-4">
                        <p className="text-slate-200 font-medium leading-snug">{entry.title}</p>
                        <p className="text-slate-600 text-xs mt-0.5 truncate max-w-xs">{entry.content.slice(0, 80)}{entry.content.length > 80 ? "…" : ""}</p>
                      </td>
                      {/* Category */}
                      <td className="py-3 px-4">
                        <CategoryBadge category={entry.category} />
                      </td>
                      {/* Priority */}
                      <td className="py-3 px-4 text-slate-400 text-xs font-mono">{entry.priority}</td>
                      {/* Active toggle */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(entry)}
                          className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
                          style={{ background: entry.active ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.1)" }}
                          title={entry.active ? "Click to deactivate" : "Click to activate"}
                        >
                          <span
                            className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
                            style={{ transform: `translateX(${entry.active ? "18px" : "2px"})` }}
                          />
                        </button>
                      </td>
                      {/* Created */}
                      <td className="py-3 px-4 text-slate-600 text-xs whitespace-nowrap">
                        {new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(entry)}
                            className="text-xs text-slate-500 hover:text-indigo-400 transition-colors"
                          >
                            Edit
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(entry)}
                              className="text-xs text-slate-600 hover:text-red-400 transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .fi {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e2e8f0;
          font-size: 13px;
          outline: none;
        }
        .fi:focus { border-color: rgba(99,102,241,0.5); }
        option { background: #0f1626; color: #e2e8f0; }
      `}</style>
    </DashboardShell>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
