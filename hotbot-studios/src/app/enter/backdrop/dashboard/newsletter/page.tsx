"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { NewsletterSubscriber } from "@/types/dashboard";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

export default function NewsletterPage() {
  const router = useRouter();
  const [subs, setSubs]       = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    const secret = getSecret();
    if (!secret) { router.replace("/enter/backdrop"); return; }
    fetch('/api/dashboard/newsletter', { headers: { Authorization: `Bearer ${secret}` } })
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
      .then((d) => { if (d) setSubs((d as { subscribers: NewsletterSubscriber[] }).subscribers); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = subs.filter((s) =>
    !search || [s.email, s.name].some((v) => v.toLowerCase().includes(search.toLowerCase()))
  );

  function copyEmails() {
    navigator.clipboard.writeText(subs.map((s) => s.email).join(", ")).catch(console.error);
  }

  return (
    <DashboardShell>
      <div className="flex flex-col min-h-full">
        <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <h1 className="text-white font-semibold">Newsletter Subscribers</h1>
            <p className="text-slate-500 text-xs mt-0.5">{subs.length} subscribers</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none w-40"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            {subs.length > 0 && (
              <button
                onClick={copyEmails}
                className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors whitespace-nowrap"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                Copy all emails
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 p-6">
          {loading ? (
            <div className="text-slate-500 text-sm py-20 text-center">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-slate-500 text-sm py-20 text-center">
              {search ? "No matching subscribers." : "No subscribers yet. Newsletter sign-ups will appear here."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                    {["Email", "Name", "Source", "Subscribed"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-xs text-slate-500 font-medium uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                      <td className="py-3 px-3">
                        <a href={`mailto:${s.email}`} className="text-blue-400 hover:text-blue-300 transition-colors text-sm">{s.email}</a>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-sm">{s.name || "—"}</td>
                      <td className="py-3 px-3 text-slate-600 text-xs">{s.source}</td>
                      <td className="py-3 px-3 text-slate-600 text-xs whitespace-nowrap">
                        {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
