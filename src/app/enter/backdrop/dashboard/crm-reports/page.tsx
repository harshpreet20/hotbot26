"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

type ClientStatus = "active" | "old" | "reactivation_needed";

interface ClientSummary {
  id: string;
  client_id: string;
  name: string;
  email: string;
  company: string;
  status: ClientStatus;
  onboarding_stage?: string;
  account_manager?: string;
  created_at: string;
}

const STATUS_META: Record<ClientStatus, { label: string; color: string; bg: string }> = {
  active:              { label: "Active",              color: "#34d399", bg: "rgba(52,211,153,0.12)"  },
  old:                 { label: "Old",                 color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  reactivation_needed: { label: "Reactivation Needed", color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
};

function StatusBadge({ status }: { status: ClientStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 500,
        color: m.color,
        background: m.bg,
      }}
    >
      {m.label}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        animation: "pulse 1.8s ease-in-out infinite",
      }}
    >
      <div style={{ height: 14, borderRadius: 8, background: "rgba(255,255,255,0.06)", width: "55%" }} />
      <div style={{ height: 11, borderRadius: 8, background: "rgba(255,255,255,0.04)", width: "40%" }} />
      <div style={{ height: 22, borderRadius: 999, background: "rgba(99,102,241,0.12)", width: "35%" }} />
      <div style={{ height: 11, borderRadius: 8, background: "rgba(255,255,255,0.04)", width: "60%" }} />
      <div style={{ height: 32, borderRadius: 10, background: "rgba(255,255,255,0.04)", marginTop: 4 }} />
    </div>
  );
}

export default function CRMReportsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<ClientStatus | "all">("all");

  const load = useCallback(() => {
    const secret = getSecret();
    if (!secret) {
      setTimeout(() => { if (!getSecret()) router.replace("/enter/backdrop"); }, 200);
      return;
    }
    setLoading(true);
    fetch("/api/dashboard/clients", { headers: { Authorization: `Bearer ${secret}` } })
      .then((r) => {
        if (r.status === 401) {
          ["backdrop_secret", "backdrop_role", "backdrop_username"].forEach((k) => sessionStorage.removeItem(k));
          router.replace("/enter/backdrop");
          return null;
        }
        return r.json();
      })
      .then((d: { clients?: Array<{
        id: string;
        clientId?: string;
        client_id?: string;
        name: string;
        email: string;
        company: string;
        status: ClientStatus;
        onboardingStage?: string;
        onboarding_stage?: string;
        accountManager?: string;
        account_manager?: string;
        createdAt?: string;
        created_at?: string;
      }> } | null) => {
        if (!d?.clients) return;
        const mapped: ClientSummary[] = d.clients.map((c) => ({
          id:               c.id,
          client_id:        c.clientId ?? c.client_id ?? c.id,
          name:             c.name,
          email:            c.email,
          company:          c.company,
          status:           c.status,
          onboarding_stage: c.onboardingStage ?? c.onboarding_stage,
          account_manager:  c.accountManager ?? c.account_manager,
          created_at:       c.createdAt ?? c.created_at ?? "",
        }));
        setClients(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const filtered = clients.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return [c.name, c.email, c.company, c.client_id].some((v) => v?.toLowerCase().includes(q));
  });

  const counts = {
    active:              clients.filter((c) => c.status === "active").length,
    old:                 clients.filter((c) => c.status === "old").length,
    reactivation_needed: clients.filter((c) => c.status === "reactivation_needed").length,
  };

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
        {/* Header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h1 style={{ color: "#fff", fontWeight: 600, fontSize: 18, margin: 0 }}>CRM Reports</h1>
            <p style={{ color: "#64748b", fontSize: 12, marginTop: 4, marginBottom: 0 }}>
              Relationship insights and performance metrics for every client
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {(["active", "old", "reactivation_needed"] as const).map((s) => (
              <div
                key={s}
                style={{
                  padding: "6px 14px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  textAlign: "center",
                }}
              >
                <div style={{ color: STATUS_META[s].color, fontSize: 18, fontWeight: 700 }}>{counts[s]}</div>
                <div style={{ color: "#475569", fontSize: 10, marginTop: 1 }}>{STATUS_META[s].label}</div>
              </div>
            ))}
          </div>
        </header>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "16px 24px 0",
            flexWrap: "wrap",
          }}
        >
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or company…"
            style={{
              flex: 1,
              minWidth: 200,
              padding: "9px 14px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e2e8f0",
              fontSize: 13,
              outline: "none",
            }}
          />
          {(["all", "active", "old", "reactivation_needed"] as const).map((s) => {
            const active = filter === s;
            const meta = s !== "all" ? STATUS_META[s] : null;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  color: active ? (meta ? meta.color : "#818cf8") : "#64748b",
                  background: active
                    ? meta ? meta.bg : "rgba(99,102,241,0.15)"
                    : "rgba(255,255,255,0.04)",
                  border: active
                    ? `1px solid ${meta ? meta.color + "44" : "rgba(99,102,241,0.4)"}`
                    : "1px solid rgba(255,255,255,0.07)",
                  transition: "all 0.15s",
                }}
              >
                {s === "all" ? `All (${clients.length})` : `${STATUS_META[s].label} (${counts[s]})`}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div style={{ flex: 1, padding: "20px 24px" }}>
          {loading ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 16,
              }}
            >
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 0",
                color: "#475569",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
              <p style={{ fontSize: 14, margin: 0 }}>
                {search || filter !== "all"
                  ? "No clients match your search or filter."
                  : "No clients found."}
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 16,
              }}
            >
              {filtered.map((c) => (
                <div
                  key={c.id}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 16,
                    padding: 20,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    transition: "border-color 0.15s",
                  }}
                >
                  {/* Name + company */}
                  <div>
                    <h3 style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 15, margin: 0 }}>{c.name}</h3>
                    {c.company && (
                      <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 3, marginBottom: 0 }}>{c.company}</p>
                    )}
                  </div>

                  {/* Badges row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#818cf8",
                        background: "rgba(99,102,241,0.15)",
                        border: "1px solid rgba(99,102,241,0.3)",
                        padding: "2px 10px",
                        borderRadius: 999,
                      }}
                    >
                      {c.client_id}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>

                  {/* Email */}
                  {c.email && (
                    <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>{c.email}</p>
                  )}

                  {/* Account manager */}
                  {c.account_manager && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: "#475569", fontSize: 11 }}>Account Manager:</span>
                      <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 500 }}>{c.account_manager}</span>
                    </div>
                  )}

                  {/* Onboarding stage */}
                  {c.onboarding_stage && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: "#475569", fontSize: 11 }}>Stage:</span>
                      <span style={{ color: "#818cf8", fontSize: 11 }}>{c.onboarding_stage}</span>
                    </div>
                  )}

                  {/* Footer */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 4,
                      paddingTop: 10,
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span style={{ color: "#475569", fontSize: 11 }}>
                      {c.created_at
                        ? new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : ""}
                    </span>
                    <Link
                      href={`/enter/backdrop/dashboard/crm-reports/${c.id}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "6px 14px",
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#818cf8",
                        background: "rgba(99,102,241,0.12)",
                        border: "1px solid rgba(99,102,241,0.25)",
                        textDecoration: "none",
                        transition: "background 0.15s",
                      }}
                    >
                      View Report →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
