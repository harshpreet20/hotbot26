"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { Contact } from "@/types/dashboard";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const secret = getSecret();
    if (!secret) { router.replace("/enter/backdrop"); return; }
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

  return (
    <DashboardShell>
      <div className="flex flex-col min-h-full">
        <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <h1 className="text-white font-semibold">Contact Messages</h1>
            <p className="text-slate-500 text-xs mt-0.5">{contacts.length} total</p>
          </div>
        </header>

        <div className="flex-1 p-6 max-w-4xl">
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
                      <p className="text-slate-300 text-sm leading-relaxed mt-3 whitespace-pre-wrap">{c.message || "—"}</p>
                      <div className="flex items-center gap-3 mt-4">
                        <a
                          href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject || "Your message")}`}
                          className="px-3 py-1.5 rounded-lg text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}
                        >
                          Reply via email ↗
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
