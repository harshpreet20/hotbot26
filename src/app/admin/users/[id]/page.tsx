"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({ email: "", role: "", display_name: "", is_active: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch(`/api/admin/users/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setForm({
            email: data.user.email || "",
            role: data.user.role,
            display_name: data.user.display_name || "",
            is_active: data.user.is_active,
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/users/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update user");
      }

      setSuccess("User updated successfully");
      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-slate-400">Loading user...</div>;
  if (!user) return <div className="text-red-400">User not found</div>;

  return (
    <div className="max-w-lg">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Users
      </Link>

      <h1 className="text-2xl font-bold text-white mb-1">Edit User</h1>
      <p className="text-sm text-slate-400 mb-6">
        @{user.username} &middot; Created {new Date(user.created_at).toLocaleDateString()}
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-3 rounded-xl">
            {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Display Name</label>
          <input
            type="text"
            value={form.display_name}
            onChange={(e) => setForm({ ...form, display_name: e.target.value })}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors"
          >
            <option value="admin" className="bg-[#0d1117]">Admin</option>
            <option value="super_admin" className="bg-[#0d1117]">Super Admin</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_active"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500/50"
          />
          <label htmlFor="is_active" className="text-sm text-slate-300">Active</label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 rounded-xl text-white font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:hover:translate-y-0"
          style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
