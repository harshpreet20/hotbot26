"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { AuditLog, Role } from "@/types/dashboard";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}
function getRole() {
  return typeof window !== "undefined" ? (sessionStorage.getItem("backdrop_role") as Role) || "" : "";
}

const ACTION_COLORS: Record<string, string> = {
  "user.create":             "#34d399",
  "user.delete":             "#f87171",
  "role.change":             "#fb923c",
  "user.permissions_updated": "#a78bfa",
  "impersonate.start":       "#f59e0b",
  "impersonate.end":         "#60a5fa",
  "login":                   "#6ee7b7",
  "blog.publish":            "#38bdf8",
  "blog.delete":             "#f87171",
};

function actionColor(action: string): string {
  for (const [key, color] of Object.entries(ACTION_COLORS)) {
    if (action.startsWith(key)) return color;
  }
  return "#94a3b8";
}

function actionLabel(action: string): string {
  return action.replace(/\./g, " · ").replace(/_/g, " ");
}

export default function ActivityPage() {
  const router = useRouter();
  const [logs, setLogs]         = useState<AuditLog[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [total, setTotal]       = useState(0);

  useEffect(() => {
    const secret = getSecret();
    const role   = getRole();
    if (!secret) { router.replace("/enter/backdrop"); return; }
    if (role !== "admin" && role !== "super_admin") {
      router.replace("/enter/backdrop/dashboard");
      return;
    }
    loadLogs(secret);
  }, [router]);

  async function loadLogs(secret: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/blog/audit-logs?limit=500", {
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (!res.ok) return;
      const data = await res.json() as { logs: AuditLog[]; total: number };
      setLogs(data.logs);
      setTotal(data.total);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  const filtered = logs.filter((l) => {
    const matchText = !filter || [l.actorUsername, l.action, l.resourceType, l.resourceId ?? ""].some(
      (s) => s.toLowerCase().includes(filter.toLowerCase())
    );
    const matchRole = !roleFilter || l.actorRole === roleFilter;
    return matchText && matchRole;
  });

  const roles = [...new Set(logs.map((l) => l.actorRole))].sort();

  return (
    <DashboardShell>
      <div className="flex flex-col min-h-full">
        <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <h1 className="text-white font-semibold">Activity Log</h1>
            <p className="text-slate-500 text-xs mt-0.5">{total} total events</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-300 outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <option value="">All roles</option>
              {roles.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by user, action…"
              className="px-3 py-1.5 rounded-xl text-xs text-white placeholder:text-slate-600 outline-none w-48"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <button
              onClick={() => loadLogs(getSecret())}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              Refresh
            </button>
          </div>
        </header>

        <div className="flex-1 p-6">
          {loading ? (
            <div className="text-slate-500 text-sm py-20 text-center">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-slate-500 text-sm py-20 text-center">No activity found.</div>
          ) : (
            <div className="space-y-1.5">
              {filtered.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl px-4 py-3 flex items-start gap-4"
                  style={{ border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}
                >
                  {/* Action badge */}
                  <span
                    className="shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
                    style={{ background: `${actionColor(log.action)}18`, color: actionColor(log.action) }}
                  >
                    {actionLabel(log.action)}
                  </span>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white text-xs font-medium">{log.actorUsername}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] capitalize"
                        style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}>
                        {log.actorRole}
                      </span>
                      {log.isImpersonating && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] text-amber-400"
                          style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.2)" }}>
                          impersonating
                        </span>
                      )}
                      {log.resourceId && (
                        <span className="text-slate-600 text-[10px] truncate">
                          → {log.resourceType}/{log.resourceId}
                        </span>
                      )}
                    </div>
                    {Object.keys(log.details).length > 0 && (
                      <p className="text-slate-600 text-[10px] mt-0.5 truncate">
                        {JSON.stringify(log.details)}
                      </p>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="shrink-0 text-right">
                    <p className="text-slate-600 text-[10px]">
                      {new Date(log.createdAt).toLocaleString("en-US", {
                        month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                    <p className="text-slate-700 text-[10px]">{log.ip}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
