"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { User, Role } from "@/types/dashboard";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}
function getRole() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_role") || "" : "";
}

const ROLE_COLORS: Record<Role, string> = {
  admin:   "#818cf8",
  manager: "#34d399",
  agent:   "#f59e0b",
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers]       = useState<User[]>([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // New user form state
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole]         = useState<Role>("agent");
  const [creating, setCreating]       = useState(false);
  const [formError, setFormError]     = useState("");

  useEffect(() => {
    const secret = getSecret();
    const role   = getRole();
    if (!secret) { router.replace("/enter/backdrop"); return; }
    if (role && role !== "admin") { router.replace("/enter/backdrop/dashboard"); return; }
    loadUsers(secret);
  }, [router]);

  async function loadUsers(secret: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/users`, {
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (res.status === 401 || res.status === 403) { router.replace("/enter/backdrop"); return; }
      const data = await res.json() as { users: User[] };
      setUsers(data.users);
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
      setNewUsername(""); setNewPassword(""); setNewRole("agent");
      setShowForm(false);
    } catch { setFormError("Network error."); }
    finally { setCreating(false); }
  }

  const inputCls = "w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none";
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" };

  return (
    <DashboardShell>
      <div className="flex flex-col min-h-full">
        <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <h1 className="text-white font-semibold">User Management</h1>
            <p className="text-slate-500 text-xs mt-0.5">{users.length} account{users.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={() => { setShowForm((v) => !v); setFormError(""); }}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}
          >
            {showForm ? "Cancel" : "+ New User"}
          </button>
        </header>

        <div className="flex-1 p-6 max-w-3xl space-y-5">
          {/* Create user form */}
          {showForm && (
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
                <div className="flex gap-2">
                  {(["admin", "manager", "agent"] as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewRole(r)}
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
                  className="flex items-center gap-4 p-4 rounded-2xl"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: `linear-gradient(135deg, ${ROLE_COLORS[u.role as Role]}cc, ${ROLE_COLORS[u.role as Role]}66)` }}
                  >
                    {u.username.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{u.username}</p>
                    <p className="text-slate-600 text-xs">
                      Added {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>

                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                    style={{ background: `${ROLE_COLORS[u.role as Role]}18`, color: ROLE_COLORS[u.role as Role] }}
                  >
                    {u.role}
                  </span>

                  <button
                    onClick={() => deleteUser(u.id)}
                    disabled={deleting === u.id}
                    className="px-3 py-1.5 rounded-lg text-xs text-red-500 hover:text-red-400 transition-colors disabled:opacity-40"
                    style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}
                  >
                    {deleting === u.id ? "…" : "Delete"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
