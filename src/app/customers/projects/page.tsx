"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Project {
  id: string;
  project_number: string;
  name: string;
  description?: string;
  status: string;
  stage?: string;
  priority?: string;
  progress: number;
  start_date?: string;
  target_date?: string;
  account_manager?: string;
}

const STATUS_COLORS: Record<string, string> = {
  active:    "#22c55e",
  completed: "#6366f1",
  on_hold:   "#f59e0b",
  review:    "#3b82f6",
  planning:  "#8b5cf6",
};

const PRIORITY_COLORS: Record<string, string> = {
  high:   "#ef4444",
  medium: "#f59e0b",
  low:    "#22c55e",
};

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch("/api/customers/projects")
      .then((r) => {
        if (r.status === 401) { router.replace("/customers"); return null; }
        return r.json();
      })
      .then((d) => {
        if (d) setProjects(d.projects ?? []);
        setLoading(false);
      })
      .catch(() => router.replace("/customers"));
  }, [router]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0f" }}>
      <PortalSidebar active="/customers/projects" />
      <main style={{ flex: 1, padding: "32px 40px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#fff" }}>Projects</h1>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>{projects.length} project{projects.length !== 1 ? "s" : ""} in your account</p>
        </div>

        {loading ? (
          <div style={{ color: "#64748b", fontSize: 14, textAlign: "center", paddingTop: 60 }}>Loading…</div>
        ) : projects.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, color: "#64748b" }}>
            No projects yet. Your account manager will set things up shortly.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/customers/projects/${p.id}`}
                style={{
                  display: "block",
                  padding: "22px 24px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16,
                  textDecoration: "none",
                  transition: "border-color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(99,102,241,0.3)";
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(99,102,241,0.05)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.03)";
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", fontFamily: "monospace" }}>{p.project_number}</span>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: STATUS_COLORS[p.status] ?? "#6366f1",
                        background: `${STATUS_COLORS[p.status] ?? "#6366f1"}18`,
                        padding: "2px 8px",
                        borderRadius: 100,
                        textTransform: "capitalize",
                      }}>
                        {p.status.replace("_", " ")}
                      </span>
                      {p.priority && (
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: PRIORITY_COLORS[p.priority] ?? "#6366f1",
                          background: `${PRIORITY_COLORS[p.priority] ?? "#6366f1"}18`,
                          padding: "2px 8px",
                          borderRadius: 100,
                          textTransform: "capitalize",
                        }}>
                          {p.priority}
                        </span>
                      )}
                    </div>
                    <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 600, color: "#fff" }}>{p.name}</h3>
                    {p.description && (
                      <p style={{ margin: 0, fontSize: 13, color: "#64748b", maxWidth: 500, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
                        {p.description}
                      </p>
                    )}
                  </div>
                  <span style={{ fontSize: 20, color: "#6366f1" }}>→</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <div style={{ flex: 1, maxWidth: 300 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: "#64748b" }}>Progress</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{p.progress ?? 0}%</span>
                    </div>
                    <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${p.progress ?? 0}%`, background: "linear-gradient(90deg,#6366f1,#8b5cf6)", borderRadius: 10 }} />
                    </div>
                  </div>
                  {p.target_date && (
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      <span style={{ color: "#475569" }}>Due: </span>
                      {formatDate(p.target_date)}
                    </div>
                  )}
                  {p.stage && (
                    <div style={{ fontSize: 12, color: "#64748b", textTransform: "capitalize" }}>
                      Stage: <span style={{ color: "#94a3b8" }}>{p.stage}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function PortalSidebar({ active }: { active: string }) {
  const NAV = [
    { label: "Dashboard",     href: "/customers/dashboard",    icon: "⊞" },
    { label: "Projects",      href: "/customers/projects",     icon: "◈" },
    { label: "Invoices",      href: "/customers/invoices",     icon: "◎" },
    { label: "Support",       href: "/customers/tickets",      icon: "◉" },
    { label: "Notifications", href: "/customers/notifications", icon: "◻" },
  ];
  return (
    <aside style={{ width: 220, flexShrink: 0, background: "rgba(255,255,255,0.02)", borderRight: "1px solid rgba(255,255,255,0.06)", padding: "24px 8px", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ padding: "0 12px 20px" }}>
        <Link href="/customers/dashboard">
          <img src="/logos/brand-logo.png" alt="HotBot Studios" style={{ width: 110, height: "auto", objectFit: "contain" }} />
        </Link>
      </div>
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px", borderRadius: 9, marginBottom: 2,
            color: active === item.href ? "#fff" : "#94a3b8",
            background: active === item.href ? "rgba(99,102,241,0.15)" : "transparent",
            textDecoration: "none", fontSize: 13, fontWeight: 500,
          }}
        >
          <span style={{ fontSize: 15 }}>{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </aside>
  );
}
