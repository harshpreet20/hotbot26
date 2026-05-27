"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface StatCardProps { label: string; value: string; href: string; color: string; icon: React.ReactNode; }

function StatCard({ label, value, href, color, icon }: StatCardProps) {
  return (
    <Link href={href}
      className="block rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:bg-white/[0.03]"
      style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18`, color }}>
          {icon}
        </div>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round">
          <path d="M7 17L17 7M17 7H7M17 7v10" />
        </svg>
      </div>
      <p className="text-3xl font-bold text-white tabular-nums">{value}</p>
      <p className="text-slate-500 text-sm mt-1">{label}</p>
    </Link>
  );
}

interface Stats { openTickets: number; totalTasks: number; pendingTasks: number; }

export default function CustomerOverviewPage() {
  const router = useRouter();
  const [clientName, setClientName] = useState("");
  const [stats, setStats] = useState<Stats>({ openTickets: 0, totalTasks: 0, pendingTasks: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [meRes, ticketsRes, tasksRes] = await Promise.all([
          fetch("/api/customers/me"),
          fetch("/api/customers/tickets"),
          fetch("/api/customers/tasks"),
        ]);

        if (!meRes.ok) { router.replace("/customers"); return; }

        const meData = await meRes.json() as { user?: { name?: string } };
        setClientName(meData.user?.name?.split(" ")[0] ?? "");

        const ticketsData = ticketsRes.ok ? await ticketsRes.json() as { tickets?: Array<{ status: string }> } : { tickets: [] };
        const tasksData   = tasksRes.ok  ? await tasksRes.json()   as { tasks?:   Array<{ status: string }> } : { tasks: [] };

        const tickets = ticketsData.tickets ?? [];
        const tasks   = tasksData.tasks     ?? [];

        setStats({
          openTickets:  tickets.filter((t) => t.status === "open" || t.status === "in_progress").length,
          totalTasks:   tasks.length,
          pendingTasks: tasks.filter((r) => r.status === "pending" || r.status === "in_progress").length,
        });
      } finally {
        setLoading(false);
      }
    }
    void fetchData();
  }, [router]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-6">
      <div className="mb-7">
        <h1 className="text-white text-xl font-semibold">{greeting}{clientName ? `, ${clientName}` : ""}</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome to your HotBot Studios client portal.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <svg className="animate-spin h-6 w-6 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard label="Open Tickets" value={String(stats.openTickets)} href="/customers/tickets" color="#6366f1"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 9a3 3 0 010-6h20a3 3 0 010 6"/><path d="M2 15a3 3 0 000 6h20a3 3 0 000-6"/></svg>}
            />
            <StatCard label="Total Tasks" value={String(stats.totalTasks)} href="/customers/tasks" color="#22c55e"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
            />
            <StatCard label="Pending Tasks" value={String(stats.pendingTasks)} href="/customers/tasks" color="#f59e0b"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QuickLink href="/customers/tasks" title="Submit a Task Request"
              desc="Start a new website, app, content, or automation project with us." color="#6366f1" />
            <QuickLink href="/customers/tickets" title="Open a Support Ticket"
              desc="Report an issue, request changes, or get help from our team." color="#818cf8" />
            <QuickLink href="/customers/projects" title="View Your Projects"
              desc="Track progress, updates, and milestones on your active projects." color="#22c55e" />
            <QuickLink href="/customers/invoices" title="View Invoices"
              desc="Check your invoices, payment history, and outstanding balances." color="#f59e0b" />
          </div>
        </>
      )}
    </div>
  );
}

function QuickLink({ href, title, desc, color }: { href: string; title: string; desc: string; color: string }) {
  return (
    <Link href={href}
      className="block rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:bg-white/[0.03]"
      style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color }}>{title}</p>
          <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
        </div>
        <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round">
          <path d="M7 17L17 7M17 7H7M17 7v10" />
        </svg>
      </div>
    </Link>
  );
}
