"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { DashboardOverview, Lead, Contact, CallbackRequest, Invoice } from "@/types/dashboard";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

interface StatCardProps { label: string; value: string; href: string; color: string; icon: React.ReactNode }

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

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function OverviewPage() {
  const router = useRouter();
  const [data, setData]       = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const secret = getSecret();
    if (!secret) { router.replace("/enter/backdrop"); return; }
    const role = typeof window !== "undefined" ? sessionStorage.getItem("backdrop_role") || "" : "";
    const dataRoles = ["super_admin", "admin", "manager", "sales", "crm_operator", "finance"];
    if (!dataRoles.includes(role)) { setLoading(false); return; }
    fetch('/api/dashboard/overview', { headers: { Authorization: `Bearer ${secret}` } })
      .then((r) => {
        if (r.status === 401) {
          sessionStorage.removeItem("backdrop_secret");
          sessionStorage.removeItem("backdrop_role");
          sessionStorage.removeItem("backdrop_username");
          router.replace("/enter/backdrop");
          return null;
        }
        return r.json();
      })
      .then((d) => { if (d) setData(d as DashboardOverview); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <DashboardShell>
      <div className="p-6 max-w-5xl">
        <div className="mb-7">
          <h1 className="text-white text-xl font-semibold">Overview</h1>
          <p className="text-slate-500 text-sm mt-1">All inbound activity from your website - no N8N required.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <svg className="animate-spin h-6 w-6 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        ) : !data ? (<p className="text-slate-500 text-sm">Welcome to Backdrop. You have limited dashboard access based on your role.</p>) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Blog Posts"    value={String(data.posts)}      href="/enter/backdrop/dashboard/blog"       color="#3b82f6"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
              />
              <StatCard label="Leads"         value={String(data.leads)}      href="/enter/backdrop/dashboard/leads"      color="#22c55e"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>}
              />
              <StatCard label="Open Tasks"    value={String(data.openTasks)}  href="/enter/backdrop/dashboard/tasks"      color="#f59e0b"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>}
              />
              <StatCard
                label="Revenue (Paid)"
                value={`₹${(data.invoiceRevenue ?? 0).toLocaleString("en-IN")}`}
                href="/enter/backdrop/dashboard/invoices"
                color="#818cf8"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>}
              />
              <StatCard label="Contact Msgs"  value={String(data.contacts)}   href="/enter/backdrop/dashboard/contacts"   color="#8b5cf6"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
              />
              <StatCard label="Chat Sessions" value={String(data.chats)}      href="/enter/backdrop/dashboard/chats"      color="#f59e0b"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>}
              />
              <StatCard label="Callbacks"     value={String(data.callbacks)}  href="/enter/backdrop/dashboard/callbacks"  color="#ec4899"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.4 10.8 19.79 19.79 0 01.36 2.18 2 2 0 012.34 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.08 6.08l.82-.82a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>}
              />
              <StatCard label="Newsletter"    value={String(data.newsletter)} href="/enter/backdrop/dashboard/newsletter" color="#06b6d4"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>}
              />
            </div>

            {/* Recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5">
              {/* Recent leads */}
              <RecentCard title="Recent Leads" href="/enter/backdrop/dashboard/leads">
                {data.recentLeads.length === 0
                  ? <Empty text="No leads yet." />
                  : data.recentLeads.map((l: Lead) => (
                    <ActivityRow key={l.id} name={l.name} sub={l.email} time={l.createdAt} color="#22c55e" />
                  ))
                }
              </RecentCard>

              {/* Recent contacts */}
              <RecentCard title="Recent Contacts" href="/enter/backdrop/dashboard/contacts">
                {data.recentContacts.length === 0
                  ? <Empty text="No messages yet." />
                  : data.recentContacts.map((c: Contact) => (
                    <ActivityRow key={c.id} name={c.name} sub={c.subject || c.email} time={c.createdAt} color="#8b5cf6" />
                  ))
                }
              </RecentCard>

              {/* Pending callbacks */}
              <RecentCard title="Pending Callbacks" href="/enter/backdrop/dashboard/callbacks">
                {data.recentCallbacks.filter((c: CallbackRequest) => c.status === "pending").length === 0
                  ? <Empty text="No pending callbacks." />
                  : data.recentCallbacks.filter((c: CallbackRequest) => c.status === "pending").map((c: CallbackRequest) => (
                    <ActivityRow key={c.id} name={c.name} sub={c.phone} time={c.createdAt} color="#ec4899" />
                  ))
                }
              </RecentCard>

              {/* Recent invoices */}
              <RecentCard title="Recent Invoices" href="/enter/backdrop/dashboard/invoices">
                {(data.recentInvoices ?? []).length === 0
                  ? <Empty text="No invoices yet." />
                  : (data.recentInvoices ?? []).map((inv: Invoice) => (
                    <ActivityRow key={inv.id} name={inv.invoiceNumber} sub={inv.clientName} time={inv.createdAt} color="#818cf8" />
                  ))
                }
              </RecentCard>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}

function RecentCard({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-sm font-medium">{title}</h2>
        <Link href={href} className="text-blue-400 text-xs hover:text-blue-300 transition-colors">View all →</Link>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ActivityRow({ name, sub, time, color }: { name: string; sub: string; time: string; color: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
        style={{ background: `linear-gradient(135deg, ${color}cc, ${color}88)` }}>
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-300 text-xs font-medium truncate">{name}</p>
        <p className="text-slate-600 text-[11px] truncate">{sub}</p>
      </div>
      <span className="text-slate-700 text-[10px] shrink-0">{timeAgo(time)}</span>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-slate-600 text-xs">{text}</p>;
}
