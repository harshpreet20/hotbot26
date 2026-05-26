"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Role } from "@/types/dashboard";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

interface TeamMember {
  username: string;
  role: Role;
}

const ROLE_BADGE: Record<Role, { label: string; color: string }> = {
  super_admin:  { label: "Super Admin",  color: "#f43f5e" },
  admin:        { label: "Admin",        color: "#818cf8" },
  manager:      { label: "Manager",      color: "#34d399" },
  sales:        { label: "Sales",        color: "#f97316" },
  crm_operator: { label: "CRM Operator", color: "#a78bfa" },
  finance:      { label: "Finance",      color: "#10b981" },
  editor:       { label: "Editor",       color: "#3b82f6" },
  contributor:  { label: "Contributor",  color: "#06b6d4" },
  agent:        { label: "Agent",        color: "#f59e0b" },
};

export default function TeamPage() {
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    const secret = getSecret();
    if (!secret) { router.replace("/enter/backdrop"); return; }
    fetch("/api/dashboard/team", {
      headers: { Authorization: `Bearer ${secret}` },
    })
      .then((r) => {
        if (r.status === 401) {
          ["backdrop_secret","backdrop_role","backdrop_username"].forEach((k)=>sessionStorage.removeItem(k));
          router.replace("/enter/backdrop");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setMembers((d as { members: TeamMember[] }).members);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = members.filter((m) =>
    !search || m.username.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col min-h-full">
        {/* Header */}
        <header
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div>
            <h1 className="text-white font-semibold">Team</h1>
            <p className="text-slate-500 text-xs mt-0.5">{members.length} member{members.length !== 1 ? "s" : ""}</p>
          </div>
        </header>

        {/* Search */}
        <div className="px-6 py-4 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <input
            type="text"
            placeholder="Search by username or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm px-3 py-2 rounded-lg text-sm text-slate-200 placeholder-slate-600 outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-6">
          {loading ? (
            <p className="text-slate-500 text-sm">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-slate-500 text-sm">No team members found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((m) => {
                const badge = ROLE_BADGE[m.role] ?? { label: m.role, color: "#64748b" };
                return (
                  <Link
                    key={m.username}
                    href={`/enter/backdrop/dashboard/team/${m.username}`}
                    className="group block rounded-xl p-4 transition-all duration-150 hover:ring-1"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      // @ts-expect-error CSS custom property
                      "--tw-ring-color": "rgba(129,140,248,0.3)",
                    }}
                  >
                    {/* Avatar placeholder */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-3"
                      style={{ background: `${badge.color}22`, color: badge.color }}
                    >
                      {m.username.charAt(0).toUpperCase()}
                    </div>

                    <p className="text-white font-medium text-sm truncate">{m.username}</p>

                    <span
                      className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ background: `${badge.color}20`, color: badge.color }}
                    >
                      {badge.label}
                    </span>

                    <p
                      className="mt-3 text-xs flex items-center gap-1 group-hover:opacity-100 opacity-60 transition-opacity"
                      style={{ color: "#818cf8" }}
                    >
                      View profile
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                      </svg>
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
