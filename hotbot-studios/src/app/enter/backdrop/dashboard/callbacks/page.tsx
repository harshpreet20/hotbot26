"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { CallbackRequest } from "@/types/dashboard";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

export default function CallbacksPage() {
  const router = useRouter();
  const [items, setItems]     = useState<CallbackRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<string | null>(null);

  useEffect(() => {
    const secret = getSecret();
    if (!secret) { router.replace("/enter/backdrop"); return; }
    fetch(`/api/dashboard/callbacks?secret=${encodeURIComponent(secret)}`)
      .then((r) => r.status === 401 ? (router.replace("/enter/backdrop"), null) : r.json())
      .then((d) => { if (d) setItems((d as { callbacks: CallbackRequest[] }).callbacks); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  async function markCalled(id: string) {
    const secret = getSecret();
    setMarking(id);
    try {
      await fetch(`/api/dashboard/callbacks?secret=${encodeURIComponent(secret)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setItems((prev) => prev.map((c) => c.id === id ? { ...c, status: "called" } : c));
    } catch { /* ignore */ }
    finally { setMarking(null); }
  }

  const pending = items.filter((c) => c.status === "pending");
  const called  = items.filter((c) => c.status === "called");

  return (
    <DashboardShell>
      <div className="flex flex-col min-h-full">
        <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <h1 className="text-white font-semibold">Callback Requests</h1>
            <p className="text-slate-500 text-xs mt-0.5">{pending.length} pending · {called.length} called</p>
          </div>
        </header>

        <div className="flex-1 p-6 max-w-3xl">
          {loading ? (
            <div className="text-slate-500 text-sm py-20 text-center">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-slate-500 text-sm py-20 text-center">No callback requests yet.</div>
          ) : (
            <>
              {pending.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Pending</h2>
                  <div className="space-y-2">
                    {pending.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center gap-4 p-4 rounded-2xl"
                        style={{ border: "1px solid rgba(59,130,246,0.2)", background: "rgba(59,130,246,0.04)" }}
                      >
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{c.name}</p>
                          <a href={`tel:${c.phone}`} className="text-blue-400 text-xs hover:text-blue-300 transition-colors">{c.phone}</a>
                        </div>
                        <span className="text-slate-600 text-xs">
                          {new Date(c.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                        </span>
                        <button
                          onClick={() => markCalled(c.id)}
                          disabled={marking === c.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                          style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
                        >
                          {marking === c.id ? "…" : "Mark Called"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {called.length > 0 && (
                <div>
                  <h2 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Called</h2>
                  <div className="space-y-2">
                    {called.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center gap-4 p-4 rounded-2xl"
                        style={{ border: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        <div className="flex-1">
                          <p className="text-slate-400 text-sm">{c.name}</p>
                          <span className="text-slate-600 text-xs">{c.phone}</span>
                        </div>
                        <span className="text-slate-700 text-xs">
                          {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] text-green-600" style={{ background: "rgba(34,197,94,0.08)" }}>
                          ✓ called
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
