"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { NewsletterSubscriber } from "@/types/dashboard";

function getToken() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}
function getRole() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_role") || "" : "";
}

// ── Plain-text → HTML (newlines → <p> tags) ─────────────────────────────────
function textToHtml(text: string): string {
  return text
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function NewsletterPage() {
  const router = useRouter();

  // ── Data ───────────────────────────────────────────────────────────────────
  const [subs, setSubs]       = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Tabs ───────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<"compose" | "subscribers">("subscribers");

  // ── Search ─────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");

  // ── Compose state ──────────────────────────────────────────────────────────
  const [subject, setSubject]       = useState("");
  const [bodyText, setBodyText]     = useState("");
  const [preview, setPreview]       = useState(false);
  const [sending, setSending]       = useState(false);
  const [sendResult, setSendResult] = useState<{
    success?: boolean; sent?: number; failed?: number; total?: number; error?: string;
  } | null>(null);

  const isAdmin = ["admin", "super_admin", "manager"].includes(getRole());

  const loadSubs = useCallback(() => {
    const token = getToken();
    if (!token) { router.replace("/enter/backdrop"); return; }
    setLoading(true);
    fetch("/api/dashboard/newsletter", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (r.status === 401) {
          ["backdrop_secret", "backdrop_role", "backdrop_username"].forEach((k) => sessionStorage.removeItem(k));
          router.replace("/enter/backdrop");
          return null;
        }
        return r.json();
      })
      .then((d) => { if (d) setSubs((d as { subscribers: NewsletterSubscriber[] }).subscribers); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => { loadSubs(); }, [loadSubs]);

  const filtered = subs.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [s.email, s.name, s.whatsapp ?? ""].some((v) => v.toLowerCase().includes(q));
  });

  const whatsappCount = subs.filter((s) => s.whatsappOptIn).length;

  function copyEmails() {
    navigator.clipboard.writeText(subs.map((s) => s.email).join(", ")).catch(console.error);
  }

  async function handleSend() {
    if (!subject.trim() || !bodyText.trim()) return;
    if (!confirm(`Send "${subject}" to ${subs.length} subscriber${subs.length !== 1 ? "s" : ""}?`)) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/blog/newsletter/send", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify({ subject, bodyHtml: textToHtml(bodyText) }),
      });
      const data = await res.json() as typeof sendResult;
      setSendResult(data);
    } catch {
      setSendResult({ error: "Network error. Please try again." });
    } finally {
      setSending(false);
    }
  }

  return (
    <DashboardShell>
      <div className="flex flex-col min-h-full">
        {/* ── Header ── */}
        <header className="flex items-center justify-between px-6 py-4 border-b flex-wrap gap-3" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <h1 className="text-white font-semibold">Newsletter</h1>
            <p className="text-slate-500 text-xs mt-0.5">{subs.length} subscriber{subs.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(["subscribers", ...(isAdmin ? ["compose"] : [])] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t as "compose" | "subscribers")}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors capitalize ${tab === t ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                style={tab !== t ? { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" } : {}}
              >
                {t === "compose" ? "Compose & Send" : "Subscribers"}
              </button>
            ))}
          </div>
        </header>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 pt-5">
          <Stat label="Total Subscribers" value={subs.length} />
          <Stat label="WhatsApp Opt-ins" value={whatsappCount} sub={subs.length ? `${Math.round((whatsappCount / subs.length) * 100)}% of subscribers` : undefined} />
          <Stat label="Email Only" value={subs.length - whatsappCount} />
          <Stat label="Potential Leads" value={subs.length} sub="All added to CRM" />
        </div>

        <div className="flex-1 p-6">
          {/* ── Subscribers tab ── */}
          {tab === "subscribers" && (
            <>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search subscribers…"
                  className="px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none flex-1 min-w-40"
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

              {loading ? (
                <div className="text-slate-500 text-sm py-20 text-center">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="text-slate-500 text-sm py-20 text-center">
                  {search ? "No matching subscribers." : "No subscribers yet."}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                        {["Name", "Email", "WhatsApp", "Source", "Subscribed"].map((h) => (
                          <th key={h} className="text-left py-3 px-4 text-xs text-slate-500 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((s) => (
                        <tr key={s.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td className="py-3 px-4 text-slate-300 text-sm font-medium">{s.name || <span className="text-slate-600">—</span>}</td>
                          <td className="py-3 px-4">
                            <a href={`mailto:${s.email}`} className="text-blue-400 hover:text-blue-300 transition-colors text-sm">{s.email}</a>
                          </td>
                          <td className="py-3 px-4">
                            {s.whatsappOptIn && s.whatsapp ? (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-emerald-400" style={{ background: "rgba(52,211,153,0.12)" }}>
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                  {s.whatsapp}
                                </span>
                              </div>
                            ) : s.whatsappOptIn ? (
                              <span className="text-xs text-emerald-600">Opted in</span>
                            ) : (
                              <span className="text-slate-700 text-xs">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-600 text-xs">{s.source}</td>
                          <td className="py-3 px-4 text-slate-600 text-xs whitespace-nowrap">
                            {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ── Compose tab ── */}
          {tab === "compose" && isAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: editor */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs text-slate-500 font-medium mb-2 uppercase tracking-wider">Subject Line</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. 🚀 Your May AI Automation Digest"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder:text-slate-600 outline-none text-sm"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-slate-500 font-medium uppercase tracking-wider">Email Body</label>
                    <button
                      onClick={() => setPreview((p) => !p)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      {preview ? "← Edit" : "Preview →"}
                    </button>
                  </div>
                  {!preview ? (
                    <textarea
                      value={bodyText}
                      onChange={(e) => setBodyText(e.target.value)}
                      placeholder={"Write your newsletter content here.\n\nUse blank lines to separate paragraphs.\n\nExample:\nThis month we're launching new AI automation packages...\n\nOur clients have seen 3x lead conversion using our bots."}
                      rows={16}
                      className="w-full px-4 py-3 rounded-xl text-white placeholder:text-slate-600 outline-none text-sm font-mono resize-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  ) : (
                    <div
                      className="rounded-xl px-4 py-3 text-sm text-slate-300 leading-relaxed overflow-auto min-h-[280px]"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                      dangerouslySetInnerHTML={{ __html: bodyText ? textToHtml(bodyText) : "<span style='color:#475569'>Nothing to preview yet.</span>" }}
                    />
                  )}
                </div>
                <div className="text-xs text-slate-600">
                  Tip: Leave blank lines between paragraphs. They become &lt;p&gt; tags in the HTML email.
                </div>
              </div>

              {/* Right: send panel */}
              <div className="flex flex-col gap-4">
                <div className="rounded-xl p-5" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                  <h3 className="text-white font-semibold text-sm mb-1">Ready to send?</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-4">
                    This will send a branded HTML email to all <strong className="text-white">{subs.length}</strong> subscriber{subs.length !== 1 ? "s" : ""} via{" "}
                    <code className="text-indigo-300 text-xs">info@hotbotstudios.com</code>.
                    Each email includes a personalised greeting and an unsubscribe link.
                  </p>
                  <ul className="text-xs text-slate-500 space-y-1 mb-5">
                    <li className={subject.trim() ? "text-emerald-400" : "text-slate-600"}>
                      {subject.trim() ? "✓" : "○"} Subject: {subject.trim() || "not set"}
                    </li>
                    <li className={bodyText.trim() ? "text-emerald-400" : "text-slate-600"}>
                      {bodyText.trim() ? "✓" : "○"} Body: {bodyText.trim() ? `${bodyText.trim().length} characters` : "empty"}
                    </li>
                    <li className={subs.length > 0 ? "text-emerald-400" : "text-slate-600"}>
                      {subs.length > 0 ? "✓" : "○"} Recipients: {subs.length}
                    </li>
                  </ul>
                  <button
                    onClick={handleSend}
                    disabled={sending || !subject.trim() || !bodyText.trim() || subs.length === 0}
                    className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff" }}
                  >
                    {sending ? "Sending…" : `Send to ${subs.length} subscriber${subs.length !== 1 ? "s" : ""}`}
                  </button>
                </div>

                {/* Send result */}
                {sendResult && (
                  <div
                    className="rounded-xl p-4 text-sm"
                    style={{
                      background: sendResult.success ? "rgba(52,211,153,0.08)" : "rgba(239,68,68,0.08)",
                      border: `1px solid ${sendResult.success ? "rgba(52,211,153,0.2)" : "rgba(239,68,68,0.2)"}`,
                    }}
                  >
                    {sendResult.success ? (
                      <>
                        <p className="text-emerald-400 font-semibold mb-1">Newsletter sent!</p>
                        <p className="text-slate-400 text-xs">
                          {sendResult.sent} delivered · {sendResult.failed} failed · {sendResult.total} total
                        </p>
                      </>
                    ) : (
                      <p className="text-red-400">{sendResult.error}</p>
                    )}
                  </div>
                )}

                {/* WhatsApp opt-in stats */}
                {whatsappCount > 0 && (
                  <div className="rounded-xl p-4" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}>
                    <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-2">WhatsApp Leads</p>
                    <p className="text-white font-bold text-xl">{whatsappCount}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      subscribers opted in to WhatsApp — check CRM to follow up.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
