"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Contact } from "@/types/dashboard";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [refresh,  setRefresh]  = useState(0);

  // Convert to Lead state
  const [converting, setConverting] = useState<Record<string, boolean>>({});
  const [converted,  setConverted]  = useState<Record<string, string>>({});

  // Delete state
  const [deleting,       setDeleting]       = useState<Record<string, boolean>>({});
  const [deleteConfirm,  setDeleteConfirm]  = useState<string | null>(null);

  const fetchContacts = useCallback(() => {
    const secret = getSecret();
    if (!secret) { setTimeout(() => { if (!getSecret()) router.replace("/enter/backdrop"); }, 200); return; }
    setLoading(true);
    fetch('/api/dashboard/contacts', { headers: { Authorization: `Bearer ${secret}` } })
      .then((r) => {
        if (r.status === 401) {
          sessionStorage.removeItem("backdrop_secret");
          sessionStorage.removeItem("backdrop_role");
          sessionStorage.removeItem("backdrop_username");
          router.replace("/enter/backdrop");
          return null;
        }
        return r.json();
      })
      .then((d) => { if (d) setContacts((d as { contacts: Contact[] }).contacts); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts, refresh]);

  async function convertToLead(contactId: string) {
    const secret = getSecret();
    setConverting((prev) => ({ ...prev, [contactId]: true }));
    try {
      const res = await fetch("/api/dashboard/contacts/convert", {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
        body: JSON.stringify({ contactId }),
      });
      const data = await res.json() as { lead?: { id: string; name: string }; error?: string };
      if (res.ok && data.lead) {
        setConverted((prev) => ({ ...prev, [contactId]: data.lead!.id }));
        // Clear success badge after 3 seconds
        setTimeout(() => {
          setConverted((prev) => {
            const next = { ...prev };
            delete next[contactId];
            return next;
          });
        }, 3000);
      }
    } catch {
      // silently fail — button will re-enable
    } finally {
      setConverting((prev) => ({ ...prev, [contactId]: false }));
    }
  }

  async function deleteContact(contactId: string) {
    const secret = getSecret();
    setDeleting((prev) => ({ ...prev, [contactId]: true }));
    try {
      const res = await fetch(`/api/dashboard/contacts?id=${encodeURIComponent(contactId)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (res.ok) {
        setContacts((prev) => prev.filter((c) => c.id !== contactId));
        setDeleteConfirm(null);
        if (expanded === contactId) setExpanded(null);
      }
    } catch {
      // silently fail
    } finally {
      setDeleting((prev) => ({ ...prev, [contactId]: false }));
    }
  }

  return (
    <>
      <div className="flex flex-col min-h-full">
        <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <h1 className="text-white font-semibold">Contact Messages</h1>
            <p className="text-slate-500 text-xs mt-0.5">{contacts.length} total</p>
          </div>
          <button
            onClick={() => setRefresh((n) => n + 1)}
            title="Refresh"
            className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
          </button>
        </header>

        <div className="flex-1 p-6">
          {loading ? (
            <div className="text-slate-500 text-sm py-20 text-center">Loading…</div>
          ) : contacts.length === 0 ? (
            <div className="text-slate-500 text-sm py-20 text-center">No contact messages yet.</div>
          ) : (
            <div className="space-y-3">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl overflow-hidden"
                  style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <button
                    onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold text-white"
                      style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium">{c.name}</span>
                        {c.subject && <span className="text-slate-500 text-xs">· {c.subject}</span>}
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5">{c.email}{c.phone ? ` · ${c.phone}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-slate-600 text-xs">
                        {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <svg
                        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"
                        style={{ transform: expanded === c.id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </button>

                  {expanded === c.id && (
                    <div className="px-4 pb-4 pt-0 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      <p className="text-slate-300 text-sm leading-relaxed mt-3 whitespace-pre-wrap">{c.message || "-"}</p>
                      <div className="flex items-center gap-3 mt-4 flex-wrap">
                        <a
                          href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject || "Your message")}`}
                          className="px-3 py-1.5 rounded-lg text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}
                        >
                          Reply via email ↗
                        </a>

                        {converted[c.id] ? (
                          <span
                            className="px-3 py-1.5 rounded-lg text-xs font-medium"
                            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80" }}
                          >
                            Converted! Lead ID: {converted[c.id]}
                          </span>
                        ) : (
                          <button
                            onClick={() => convertToLead(c.id)}
                            disabled={converting[c.id]}
                            className="px-3 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-50"
                            style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.3)", color: "#60a5fa" }}
                          >
                            {converting[c.id] ? "Converting…" : "Convert to Lead"}
                          </button>
                        )}

                        {/* Delete flow */}
                        {deleteConfirm === c.id ? (
                          <>
                            <button
                              onClick={() => deleteContact(c.id)}
                              disabled={deleting[c.id]}
                              className="px-3 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-50"
                              style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171" }}
                            >
                              {deleting[c.id] ? "Deleting…" : "Confirm delete"}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-3 py-1.5 rounded-lg text-xs transition-colors"
                              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(c.id)}
                            className="px-3 py-1.5 rounded-lg text-xs transition-colors"
                            style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
