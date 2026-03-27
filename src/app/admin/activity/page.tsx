"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Filter } from "lucide-react";

interface ActivityLog {
  id: string;
  action: string;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
  username: string | null;
  display_name: string | null;
}

export default function ActivityPage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const limit = 25;

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  async function fetchLogs() {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (actionFilter) params.set("action", actionFilter);

    try {
      const res = await fetch(`/api/admin/activity?${params}`);
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(total / limit);

  const actionTypes = [
    "login",
    "password_changed",
    "password_reset_requested",
    "password_reset_completed",
    "user_created",
    "user_updated",
    "user_deactivated",
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Activity Logs</h1>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <Filter size={16} className="text-slate-400" />
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
        >
          <option value="" className="bg-[#0d1117]">All actions</option>
          {actionTypes.map((a) => (
            <option key={a} value={a} className="bg-[#0d1117]">
              {a.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-500">{total} total entries</span>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-slate-400 font-medium">User</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Action</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Details</th>
                  <th className="text-left p-4 text-slate-400 font-medium">IP</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4 text-white">
                      {log.display_name || log.username || "System"}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400">
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-xs max-w-[200px] truncate">
                      {Object.keys(log.details).length > 0
                        ? JSON.stringify(log.details)
                        : "—"}
                    </td>
                    <td className="p-4 text-slate-500 text-xs">{log.ip_address || "—"}</td>
                    <td className="p-4 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No activity logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl text-sm text-slate-400 bg-white/5 border border-white/10 hover:text-white disabled:opacity-30 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-slate-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl text-sm text-slate-400 bg-white/5 border border-white/10 hover:text-white disabled:opacity-30 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
