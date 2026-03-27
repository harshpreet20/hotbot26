"use client";

import { useEffect, useState } from "react";
import { Users, Activity, LogIn } from "lucide-react";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  loginsToday: number;
  recentActivity: Array<{
    id: string;
    action: string;
    created_at: string;
    ip_address: string | null;
    details: Record<string, unknown>;
    username: string | null;
    display_name: string | null;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-slate-400">Loading dashboard...</div>;
  }

  const cards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "blue" },
    { label: "Active Users", value: stats?.activeUsers ?? 0, icon: Users, color: "green" },
    { label: "Logins Today", value: stats?.loginsToday ?? 0, icon: LogIn, color: "purple" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white/5 border border-white/10 rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-${card.color}-500/10`}>
                  <Icon size={18} className={`text-${card.color}-400`} />
                </div>
                <span className="text-sm text-slate-400">{card.label}</span>
              </div>
              <p className="text-3xl font-bold text-white">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} className="text-slate-400" />
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
        </div>

        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
              >
                <div>
                  <span className="text-sm font-medium text-white">
                    {log.display_name || log.username || "System"}
                  </span>
                  <span className="text-sm text-slate-400 ml-2">
                    {log.action.replace(/_/g, " ")}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No recent activity</p>
        )}
      </div>
    </div>
  );
}
