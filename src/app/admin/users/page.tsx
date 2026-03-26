"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserPlus, Edit, UserX, UserCheck } from "lucide-react";

interface User {
  id: string;
  username: string;
  email: string | null;
  role: string;
  display_name: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleUserStatus(user: User) {
    const action = user.is_active ? "deactivate" : "reactivate";
    if (!confirm(`Are you sure you want to ${action} "${user.username}"?`)) return;

    if (user.is_active) {
      await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    } else {
      await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: true }),
      });
    }
    fetchUsers();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <Link
          href="/admin/users/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20"
          style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
        >
          <UserPlus size={16} />
          Add User
        </Link>
      </div>

      {loading ? (
        <div className="text-slate-400">Loading users...</div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-slate-400 font-medium">Username</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Email</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Role</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Last Login</th>
                  <th className="text-right p-4 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">{user.username}</p>
                        {user.display_name && (
                          <p className="text-xs text-slate-500">{user.display_name}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">{user.email || "—"}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          user.role === "super_admin"
                            ? "bg-purple-500/10 text-purple-400"
                            : "bg-blue-500/10 text-blue-400"
                        }`}
                      >
                        {user.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          user.is_active
                            ? "bg-green-500/10 text-green-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-xs">
                      {user.last_login_at
                        ? new Date(user.last_login_at).toLocaleString()
                        : "Never"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => toggleUserStatus(user)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.is_active
                              ? "text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                              : "text-slate-400 hover:text-green-400 hover:bg-green-500/10"
                          }`}
                          title={user.is_active ? "Deactivate" : "Reactivate"}
                        >
                          {user.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <div className="p-8 text-center text-slate-500">No users found</div>
          )}
        </div>
      )}
    </div>
  );
}
