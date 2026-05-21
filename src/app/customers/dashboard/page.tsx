"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface ClientUser {
  email: string;
  name: string;
  role: string;
  client_id: string;
  avatar_url?: string;
}

interface Client {
  name: string;
  client_id: string;
  account_manager?: string;
  subscription_status?: string;
}

interface Project {
  id: string;
  project_number: string;
  name: string;
  status: string;
  stage?: string;
  progress: number;
  target_date?: string;
}

interface Update {
  id: string;
  type: string;
  title: string;
  content: string;
  author_name: string;
  created_at: string;
}

const UPDATE_ICONS: Record<string, string> = {
  deployment:       "🚀",
  milestone:        "✅",
  approval_needed:  "🎨",
  blocker:          "⚠️",
  sprint_summary:   "📋",
  update:           "💬",
};

const STATUS_COLORS: Record<string, string> = {
  active:     "#22c55e",
  completed:  "#6366f1",
  on_hold:    "#f59e0b",
  review:     "#3b82f6",
  planning:   "#8b5cf6",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m    = Math.floor(diff / 60000);
  if (m < 1)   return "just now";
  if (m < 60)  return `${m}m ago`;
  const h    = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d    = Math.floor(h / 24);
  return `${d}d ago`;
}

function Initials({ name }: { name: string }) {
  const parts = name.split(" ");
  const init  = parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return (
    <div
      style={{
        width: 32, height: 32,
        borderRadius: "50%",
        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 700, color: "#fff",
        flexShrink: 0,
      }}
    >
      {init.toUpperCase()}
    </div>
  );
}

const NAV_ITEMS = [
  { label: "Dashboard",      href: "/customers/dashboard",      icon: "⊞" },
  { label: "Projects",       href: "/customers/projects",        icon: "◈" },
  { label: "Invoices",       href: "/customers/invoices",        icon: "◎" },
  { label: "Support",        href: "/customers/tickets",         icon: "◉" },
  { label: "Notifications",  href: "/customers/notifications",   icon: "◻" },
];

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser]         = useState<ClientUser | null>(null);
  const [client, setClient]     = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<Update[]>([]);
  const [tickets, setTickets]   = useState<{ status: string }[]>([]);
  const [notifCount, setNotifCount] = useState(0);
  const [loading, setLoading]   = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/customers/me").then((r) => r.ok ? r.json() : null),
      fetch("/api/customers/projects").then((r) => r.ok ? r.json() : null),
      fetch("/api/customers/tickets").then((r) => r.ok ? r.json() : null),
      fetch("/api/customers/notifications").then((r) => r.ok ? r.json() : null),
    ]).then(([meData, projData, ticketData, notifData]) => {
      if (!meData) { router.replace("/customers"); return; }
      setUser(meData.user);
      setClient(meData.client);
      const projs: Project[] = projData?.projects ?? [];
      setProjects(projs);

      // Gather recent updates from first project (simplified)
      setTickets(ticketData?.tickets ?? []);
      const notifications = notifData?.notifications ?? [];
      setNotifCount(notifications.filter((n: { read_at: string | null }) => !n.read_at).length);
      setLoading(false);
    }).catch(() => {
      router.replace("/customers");
    });
  }, [router]);

  // Fetch recent updates across projects
  useEffect(() => {
    if (projects.length === 0) return;
    // Fetch from first active project for feed
    const activeProject = projects.find((p) => p.status === "active") ?? projects[0];
    fetch(`/api/customers/projects/${activeProject.id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.updates) setRecentUpdates(d.updates.slice(0, 5));
      })
      .catch(() => {});
  }, [projects]);

  async function signOut() {
    setSigningOut(true);
    await fetch("/api/customers/auth/logout", { method: "POST" });
    router.replace("/customers");
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const activeProjects = projects.filter((p) => p.status === "active").length;
  const openTickets    = tickets.filter((t: { status: string }) => t.status === "open").length;

  const sidebarStyle: React.CSSProperties = {
    width: 240,
    flexShrink: 0,
    background: "rgba(255,255,255,0.02)",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    position: "sticky",
    top: 0,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0f" }}>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 16px" }}>
          <Image src="/logos/brand-logo.png" alt="HotBot Studios" width={120} height={30} style={{ objectFit: "contain" }} />
        </div>

        {/* Client badge */}
        {client && (
          <div style={{ margin: "0 12px 20px", padding: "12px 14px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12 }}>
            <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{client.name}</p>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", background: "rgba(99,102,241,0.15)", padding: "2px 8px", borderRadius: 100 }}>
              {client.client_id}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0 8px" }}>
          {NAV_ITEMS.map((item) => {
            const isActive = typeof window !== "undefined" && window.location.pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: 9,
                  marginBottom: 2,
                  color: isActive ? "#fff" : "#94a3b8",
                  background: isActive ? "rgba(99,102,241,0.15)" : "transparent",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 500,
                  transition: "all 0.1s",
                }}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                {item.label}
                {item.label === "Notifications" && notifCount > 0 && (
                  <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, background: "#ef4444", color: "#fff", padding: "1px 6px", borderRadius: 100 }}>
                    {notifCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Account manager card */}
        {client?.account_manager && (
          <div style={{ margin: "0 12px 12px", padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>Your Manager</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>{client.account_manager}</p>
          </div>
        )}

        {/* Sign out */}
        <div style={{ padding: "0 8px 20px" }}>
          <button
            onClick={signOut}
            disabled={signingOut}
            style={{
              width: "100%",
              padding: "9px 12px",
              background: "none",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 9,
              color: "#64748b",
              fontSize: 13,
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.1s",
            }}
          >
            {signingOut ? "Signing out…" : "← Sign Out"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "32px 40px", overflow: "auto" }}>
        {loading ? (
          <div style={{ color: "#64748b", fontSize: 14, textAlign: "center", paddingTop: 80 }}>Loading…</div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
              <div>
                <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: "#fff" }}>
                  {greeting()}, {user?.name?.split(" ")[0] ?? "there"} 👋
                </h1>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                  Here&apos;s what&apos;s happening with your projects.
                </p>
              </div>
              <Link
                href="/customers/notifications"
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#94a3b8",
                  textDecoration: "none",
                  fontSize: 18,
                }}
              >
                🔔
                {notifCount > 0 && (
                  <span style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    width: 18,
                    height: 18,
                    background: "#ef4444",
                    borderRadius: "50%",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
              <SummaryCard label="Active Projects" value={String(activeProjects)} color="#22c55e" icon="◈" />
              <SummaryCard label="Open Tickets"    value={String(openTickets)}    color="#f59e0b" icon="◉" />
              <SummaryCard label="Total Projects"  value={String(projects.length)} color="#6366f1" icon="⊞" />
              <SummaryCard label="Portal Access"   value="Active"                 color="#22c55e" icon="✓" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
              {/* Recent updates feed */}
              <div>
                <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: "#e2e8f0" }}>Recent Updates</h2>
                {recentUpdates.length === 0 && projects.length === 0 ? (
                  <div style={{ padding: "32px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, color: "#64748b", fontSize: 13, textAlign: "center" }}>
                    No projects yet. Your account manager will set things up shortly.
                  </div>
                ) : recentUpdates.length === 0 ? (
                  <div style={{ padding: "32px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, color: "#64748b", fontSize: 13, textAlign: "center" }}>
                    No updates yet. Check back soon.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {recentUpdates.map((upd) => (
                      <div
                        key={upd.id}
                        style={{
                          padding: "16px 20px",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          borderRadius: 14,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                          <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>
                            {UPDATE_ICONS[upd.type] ?? "💬"}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{upd.title}</p>
                            <p style={{ margin: "0 0 8px", fontSize: 13, color: "#94a3b8", lineHeight: 1.6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                              {upd.content}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <Initials name={upd.author_name || "Team"} />
                              <span style={{ fontSize: 12, color: "#64748b" }}>{upd.author_name}</span>
                              <span style={{ fontSize: 12, color: "#475569" }}>·</span>
                              <span style={{ fontSize: 12, color: "#475569" }}>{timeAgo(upd.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right panel */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Projects list */}
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>Your Projects</h3>
                    <Link href="/customers/projects" style={{ fontSize: 12, color: "#6366f1", textDecoration: "none" }}>View all →</Link>
                  </div>
                  {projects.slice(0, 4).map((p) => (
                    <Link
                      key={p.id}
                      href={`/customers/projects/${p.id}`}
                      style={{ display: "block", textDecoration: "none", marginBottom: 12 }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>{p.name}</span>
                          <span style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: STATUS_COLORS[p.status] ?? "#6366f1",
                            background: `${STATUS_COLORS[p.status] ?? "#6366f1"}18`,
                            padding: "2px 7px",
                            borderRadius: 100,
                            textTransform: "capitalize",
                          }}>
                            {p.status}
                          </span>
                        </div>
                        <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${p.progress ?? 0}%`, background: "#6366f1", borderRadius: 10, transition: "width 0.3s" }} />
                        </div>
                        <span style={{ fontSize: 11, color: "#64748b" }}>{p.progress ?? 0}% complete</span>
                      </div>
                    </Link>
                  ))}
                  {projects.length === 0 && (
                    <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>No projects yet.</p>
                  )}
                </div>

                {/* Quick actions */}
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "20px" }}>
                  <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>Quick Actions</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Link href="/customers/tickets" style={{
                      display: "block", padding: "10px 14px",
                      background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
                      borderRadius: 10, color: "#a5b4fc", fontSize: 13, fontWeight: 500,
                      textDecoration: "none",
                    }}>
                      + New Support Ticket
                    </Link>
                    <Link href="/customers/invoices" style={{
                      display: "block", padding: "10px 14px",
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 10, color: "#94a3b8", fontSize: 13, fontWeight: 500,
                      textDecoration: "none",
                    }}>
                      View Invoices
                    </Link>
                    {client?.account_manager && (
                      <a href={`mailto:${client.account_manager}`} style={{
                        display: "block", padding: "10px 14px",
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: 10, color: "#94a3b8", fontSize: 13, fontWeight: 500,
                        textDecoration: "none",
                      }}>
                        Contact Manager
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function SummaryCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 16, color: "#475569" }}>{icon}</span>
      </div>
      <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color }}>{value}</p>
    </div>
  );
}
