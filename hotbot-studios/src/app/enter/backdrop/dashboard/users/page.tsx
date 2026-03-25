"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { User, Role, PendingUser } from "@/types/dashboard";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}
function getRole() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_role") || "" : "";
}

const ROLE_COLORS: Record<Role, string> = {
  admin:        "#818cf8",
  manager:      "#34d399",
  sales:        "#f97316",
  crm_operator: "#a78bfa",
  editor:       "#3b82f6",
  contributor:  "#06b6d4",
  agent:        "#f59e0b",
};

const ROLE_DESCRIPTIONS: Record<Role, { title: string; perms: string[] }> = {
  admin: {
    title: "Full Access",
    perms: ["Manage all users", "Publish & edit blog posts", "View all CRM data", "Access settings & reports"],
  },
  manager: {
    title: "CRM & Reports",
    perms: ["View leads, contacts, callbacks", "View newsletter subscribers", "View dashboard overview", "Read-only user list"],
  },
  sales: {
    title: "Sales & CRM",
    perms: ["Create & manage leads", "View full CRM pipeline", "View contacts & callbacks", "Access invoices (read)"],
  },
  crm_operator: {
    title: "CRM Operator",
    perms: ["View & update leads", "View contacts, callbacks, newsletter", "No lead creation or user management", "No blog access"],
  },
  editor: {
    title: "Blog Management",
    perms: ["Create & edit blog posts", "Publish & unpublish posts", "Delete posts", "Upload & manage images"],
  },
  contributor: {
    title: "Content Drafts",
    perms: ["Create & edit blog drafts", "Submit drafts for review", "Cannot publish posts", "Upload images"],
  },
  agent: {
    title: "Support View",
    perms: ["View chat logs", "View callback requests", "No CRM data access", "No blog access"],
  },
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers]               = useState<User[]>([]);
  const [loading, setLoading]           = useState(true);
  const [readonly, setReadonly]         = useState(false);
  const [deleting, setDeleting]         = useState<string | null>(null);
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [showForm, setShowForm]         = useState(false);
  const [showRoles, setShowRoles]       = useState(false);

  // New user form state
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole]         = useState<Role>("contributor");
  const [creating, setCreating]       = useState(false);
  const [formError, setFormError]     = useState("");

  // Pending registrations
  const [pending, setPending]               = useState<PendingUser[]>([]);
  const [approvingId, setApprovingId]       = useState<string | null>(null);
  const [approvePassword, setApprovePassword] = useState("");
  const [approveError, setApproveError]     = useState("");
  const [processingId, setProcessingId]     = useState<string | null>(null);

  useEffect(() => {
    const secret = getSecret();
    const role   = getRole();
    if (!secret) { router.replace("/enter/backdrop"); return; }
    if (role && role !== "admin" && role !== "manager") {
      router.replace("/enter/backdrop/dashboard");
      return;
    }
    loadUsers(secret);
    if (role === "admin") loadPending(secret);
  }, [router]);

  async function loadPending(secret: string) {
    try {
      const res = await fetch("/api/blog/users/pending", { headers: { Authorization: `Bearer ${secret}` } });
      if (res.ok) {
        const data = await res.json() as { pending: PendingUser[] };
        setPending(data.pending);
      }
    } catch { /* ignore */ }
  }

  async function handleApprove(id: string) {
    setApproveError("");
    const secret = getSecret();
    if (!approvePassword || approvePassword.length < 8) {
      setApproveError("Password must be at least 8 characters.");
      return;
    }
    setProcessingId(id);
    try {
      const res = await fetch("/api/blog/users/pending", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
        body: JSON.stringify({ id, action: "approve", password: approvePassword }),
      });
      const data = await res.json() as { success?: boolean; user?: User; error?: string };
      if (!res.ok) { setApproveError(data.error || "Failed."); return; }
      setPending((prev) => prev.filter((p) => p.id !== id));
      if (data.user) setUsers((prev) => [...prev, data.user!]);
      setApprovingId(null);
      setApprovePassword("");
    } catch { setApproveError("Network error."); }
    finally { setProcessingId(null); }
  }

  async function handleReject(id: string) {
    const secret = getSecret();
    setProcessingId(id);
    try {
      await fetch("/api/blog/users/pending", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
        body: JSON.stringify({ id, action: "reject" }),
      });
      setPending((prev) => prev.filter((p) => p.id !== id));
    } catch { /* ignore */ }
    finally { setProcessingId(null); }
  }

  async function loadUsers(secret: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/users`, {
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (res.status === 401 || res.status === 403) {
        sessionStorage.removeItem("backdrop_secret");
        sessionStorage.removeItem("backdrop_role");
        sessionStorage.removeItem("backdrop_username");
        router.replace("/enter/backdrop");
        return;
      }
      const data = await res.json() as { users: User[]; readonly?: boolean };
      setUsers(data.users);
      setReadonly(data.readonly ?? false);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  async function deleteUser(id: string) {
    const secret = getSecret();
    setDeleting(id);
    try {
      await fetch(`/api/blog/users?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${secret}` },
      });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch { /* ignore */ }
    finally { setDeleting(null); }
  }

  async function changeRole(id: string, role: Role) {
    const secret = getSecret();
    setChangingRole(id);
    try {
      const res = await fetch("/api/blog/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
        body: JSON.stringify({ id, role }),
      });
      const data = await res.json() as { user?: User; error?: string };
      if (res.ok && data.user) {
        setUsers((prev) => prev.map((u) => (u.id === id ? data.user! : u)));
      }
    } catch { /* ignore */ }
    finally { setChangingRole(null); }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    const secret = getSecret();
    setCreating(true);
    try {
      const res = await fetch("/api/blog/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
        body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole }),
      });
      const data = await res.json() as { user?: User; error?: string };
      if (!res.ok) { setFormError(data.error || "Failed to create user."); return; }
      if (data.user) setUsers((prev) => [...prev, data.user!]);
      setNewUsername(""); setNewPassword(""); setNewRole("contributor");
      setShowForm(false);
    } catch { setFormError("Network error."); }
    finally { setCreating(false); }
  }

  // Role breakdown counts for report
  const roleCounts = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  const inputCls = "w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none";
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" };

  return (
    <DashboardShell>
      <div className="flex flex-col min-h-full">
        <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <h1 className="text-white font-semibold">
              User Management
              {readonly && <span className="ml-2 text-xs text-slate-500 font-normal">(read-only)</span>}
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">{users.length} account{users.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRoles((v) => !v)}
              className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {showRoles ? "Hide Role Guide" : "Role Guide"}
            </button>
            {!readonly && (
              <button
                onClick={() => { setShowForm((v) => !v); setFormError(""); }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}
              >
                {showForm ? "Cancel" : "+ New User"}
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 p-6 max-w-4xl space-y-5">

          {/* Role guide */}
          {showRoles && (
            <div className="rounded-2xl p-4 space-y-3" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
              <h2 className="text-white text-sm font-semibold mb-3">Role Capabilities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(Object.keys(ROLE_DESCRIPTIONS) as Role[]).map((r) => {
                  const d = ROLE_DESCRIPTIONS[r];
                  return (
                    <div key={r} className="rounded-xl p-3 space-y-2" style={{ border: `1px solid ${ROLE_COLORS[r]}25`, background: `${ROLE_COLORS[r]}08` }}>
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-bold capitalize"
                          style={{ background: `${ROLE_COLORS[r]}18`, color: ROLE_COLORS[r] }}
                        >
                          {r}
                        </span>
                        <span className="text-slate-400 text-xs">{d.title}</span>
                      </div>
                      <ul className="space-y-1">
                        {d.perms.map((p) => (
                          <li key={p} className="flex items-start gap-1.5 text-xs text-slate-500">
                            <span className="mt-0.5 text-[10px] shrink-0" style={{ color: ROLE_COLORS[r] }}>●</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                      {roleCounts[r] !== undefined && (
                        <p className="text-[10px] text-slate-600 pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                          {roleCounts[r]} user{roleCounts[r] !== 1 ? "s" : ""} assigned
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Team overview report */}
          {users.length > 0 && (
            <div className="rounded-2xl p-4" style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.015)" }}>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Team Overview</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(ROLE_COLORS) as Role[]).filter((r) => roleCounts[r]).map((r) => (
                  <div
                    key={r}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                    style={{ background: `${ROLE_COLORS[r]}12`, border: `1px solid ${ROLE_COLORS[r]}30`, color: ROLE_COLORS[r] }}
                  >
                    <span className="font-bold">{roleCounts[r]}</span>
                    <span className="capitalize opacity-80">{r}</span>
                  </div>
                ))}
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#64748b" }}
                >
                  <span className="font-bold">{users.length}</span>
                  <span>total</span>
                </div>
              </div>
            </div>
          )}

          {/* Pending registration requests (admin only) */}
          {!readonly && pending.length > 0 && (
            <div className="rounded-2xl p-4 space-y-3" style={{ border: "1px solid rgba(251,191,36,0.25)", background: "rgba(251,191,36,0.04)" }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <p className="text-amber-300 text-sm font-semibold">Pending Access Requests</p>
                <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-300" style={{ background: "rgba(251,191,36,0.15)" }}>{pending.length}</span>
              </div>
              {pending.map((p) => (
                <div key={p.id} className="rounded-xl p-3 space-y-2" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-white text-sm font-medium">{p.username}</p>
                      <p className="text-slate-500 text-xs">{p.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize"
                          style={{ background: `${ROLE_COLORS[p.requestedRole]}18`, color: ROLE_COLORS[p.requestedRole] }}>
                          {p.requestedRole}
                        </span>
                        <span className="text-slate-600 text-[10px]">
                          {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => { setApprovingId(approvingId === p.id ? null : p.id); setApproveError(""); setApprovePassword(""); }}
                        disabled={processingId === p.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-40"
                        style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80" }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(p.id)}
                        disabled={processingId === p.id}
                        className="px-3 py-1.5 rounded-lg text-xs text-red-500 hover:text-red-400 transition-colors disabled:opacity-40"
                        style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}
                      >
                        {processingId === p.id ? "…" : "Reject"}
                      </button>
                    </div>
                  </div>

                  {approvingId === p.id && (
                    <div className="pt-2 space-y-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      <p className="text-xs text-slate-400">Set a temporary password for <strong className="text-white">{p.username}</strong>:</p>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          placeholder="min 8 characters"
                          value={approvePassword}
                          onChange={(e) => setApprovePassword(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg text-sm text-white outline-none"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                        />
                        <button
                          onClick={() => handleApprove(p.id)}
                          disabled={processingId === p.id}
                          className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-50"
                          style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}
                        >
                          {processingId === p.id ? "…" : "Confirm"}
                        </button>
                      </div>
                      {approveError && <p className="text-red-400 text-xs">{approveError}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Create user form */}
          {!readonly && showForm && (
            <form
              onSubmit={createUser}
              className="rounded-2xl p-5 space-y-4"
              style={{ border: "1px solid rgba(99,102,241,0.25)", background: "rgba(99,102,241,0.04)" }}
            >
              <h2 className="text-white text-sm font-semibold">Create New User</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Username</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="username"
                    required
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="min 8 chars"
                    required
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Role</label>
                <div className="flex flex-wrap gap-2">
                  {(["admin", "manager", "sales", "crm_operator", "editor", "contributor", "agent"] as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewRole(r)}
                      title={ROLE_DESCRIPTIONS[r].title}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                      style={{
                        border: `1px solid ${newRole === r ? ROLE_COLORS[r] : "rgba(255,255,255,0.1)"}`,
                        background: newRole === r ? `${ROLE_COLORS[r]}18` : "transparent",
                        color: newRole === r ? ROLE_COLORS[r] : "#64748b",
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                {newRole && (
                  <p className="text-xs text-slate-600 mt-1.5 pl-1">{ROLE_DESCRIPTIONS[newRole].title} — {ROLE_DESCRIPTIONS[newRole].perms[0]}</p>
                )}
              </div>
              {formError && (
                <p className="text-red-400 text-xs px-1">{formError}</p>
              )}
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-60 transition-opacity"
                style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
              >
                {creating ? "Creating…" : "Create User"}
              </button>
            </form>
          )}

          {/* User list */}
          {loading ? (
            <div className="text-slate-500 text-sm py-20 text-center">Loading…</div>
          ) : users.length === 0 ? (
            <div className="text-slate-500 text-sm py-20 text-center">No users yet.</div>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="rounded-2xl p-4"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: `linear-gradient(135deg, ${ROLE_COLORS[u.role as Role]}cc, ${ROLE_COLORS[u.role as Role]}66)` }}
                      aria-label={`${u.username} avatar`}
                    >
                      {u.username.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{u.username}</p>
                      <p className="text-slate-600 text-xs">
                        Added {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>

                    {/* Role selector (admin) or badge (manager) */}
                    {!readonly ? (
                      <div className="flex items-center gap-1 flex-wrap justify-end">
                        {(["admin", "manager", "sales", "crm_operator", "editor", "contributor", "agent"] as Role[]).map((r) => (
                          <button
                            key={r}
                            onClick={() => u.role !== r && changeRole(u.id, r)}
                            disabled={changingRole === u.id || u.role === r}
                            title={ROLE_DESCRIPTIONS[r].title}
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize transition-all"
                            style={{
                              background: u.role === r ? `${ROLE_COLORS[r]}25` : "transparent",
                              color: u.role === r ? ROLE_COLORS[r] : "#334155",
                              border: `1px solid ${u.role === r ? ROLE_COLORS[r] : "rgba(255,255,255,0.05)"}`,
                              cursor: u.role === r ? "default" : "pointer",
                            }}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                        style={{ background: `${ROLE_COLORS[u.role as Role]}18`, color: ROLE_COLORS[u.role as Role] }}
                      >
                        {u.role}
                      </span>
                    )}

                    {!readonly && (
                      <button
                        onClick={() => deleteUser(u.id)}
                        disabled={deleting === u.id}
                        className="px-3 py-1.5 rounded-lg text-xs text-red-500 hover:text-red-400 transition-colors disabled:opacity-40 shrink-0"
                        style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}
                      >
                        {deleting === u.id ? "…" : "Delete"}
                      </button>
                    )}
                  </div>

                  {/* Role capability hint */}
                  <div className="mt-2 pl-[52px]">
                    <p className="text-xs text-slate-600">
                      <span style={{ color: ROLE_COLORS[u.role as Role] }} className="font-medium">{ROLE_DESCRIPTIONS[u.role as Role]?.title}</span>
                      {" — "}
                      {ROLE_DESCRIPTIONS[u.role as Role]?.perms.slice(0, 2).join(" · ")}
                    </p>
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
