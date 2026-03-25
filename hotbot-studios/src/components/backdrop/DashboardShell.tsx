"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Role } from "@/types/dashboard";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
  roles?: Role[]; // undefined = all roles
}

const NAV: NavItem[] = [
  {
    href: "/enter/backdrop/dashboard",
    label: "Overview",
    exact: true,
    roles: ["admin", "manager", "sales", "crm_operator"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: "/enter/backdrop/dashboard/blog",
    label: "Blog",
    roles: ["admin", "editor", "contributor"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    href: "/enter/backdrop/dashboard/users",
    label: "Users",
    roles: ["admin", "manager", "sales", "crm_operator"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  // ── CRM ────────────────────────────────────────────────────────────────────
  {
    href: "/enter/backdrop/dashboard/leads",
    label: "Leads",
    roles: ["admin", "manager", "sales", "crm_operator"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7h-9" /><path d="M14 17H5" />
        <circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" />
      </svg>
    ),
  },
  {
    href: "/enter/backdrop/dashboard/tasks",
    label: "Tasks",
    roles: ["admin", "manager", "sales", "crm_operator", "agent"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    href: "/enter/backdrop/dashboard/invoices",
    label: "Invoices",
    roles: ["admin", "manager", "sales"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    href: "/enter/backdrop/dashboard/contacts",
    label: "Contacts",
    roles: ["admin", "manager", "sales", "crm_operator"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    href: "/enter/backdrop/dashboard/chats",
    label: "Chat Logs",
    roles: ["admin", "manager", "agent"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
      </svg>
    ),
  },
  {
    href: "/enter/backdrop/dashboard/callbacks",
    label: "Callbacks",
    roles: ["admin", "manager", "sales", "crm_operator", "agent"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.4 10.8 19.79 19.79 0 01.36 2.18 2 2 0 012.34 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.08 6.08l.82-.82a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
  },
  {
    href: "/enter/backdrop/dashboard/newsletter",
    label: "Newsletter",
    roles: ["admin", "manager", "crm_operator"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
  },
  // ── Team ───────────────────────────────────────────────────────────────────
  {
    href: "/enter/backdrop/dashboard/tickets",
    label: "Tickets",
    roles: ["admin", "manager", "sales", "crm_operator", "agent"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 9a3 3 0 010-6h20a3 3 0 010 6" /><path d="M2 15a3 3 0 000 6h20a3 3 0 000-6" />
        <line x1="6" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="18" y2="12" />
      </svg>
    ),
  },
  {
    href: "/enter/backdrop/dashboard/team-chat",
    label: "Team Chat",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-1" />
        <path d="M15 2H3a2 2 0 00-2 2v8a2 2 0 002 2h2v4l4-4h4a2 2 0 002-2V4a2 2 0 00-2-2z" />
      </svg>
    ),
  },
];

const ROLE_BADGE: Record<Role, { label: string; color: string }> = {
  admin:        { label: "Admin",        color: "#818cf8" },
  manager:      { label: "Manager",      color: "#34d399" },
  sales:        { label: "Sales",        color: "#f97316" },
  crm_operator: { label: "CRM Operator", color: "#a78bfa" },
  editor:       { label: "Editor",       color: "#3b82f6" },
  contributor:  { label: "Contributor",  color: "#06b6d4" },
  agent:        { label: "Agent",        color: "#f59e0b" },
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [role, setRole]         = useState<Role | null>(null);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = sessionStorage.getItem("backdrop_secret");
    if (stored) {
      setRole((sessionStorage.getItem("backdrop_role") as Role | null) ?? null);
      setUsername(sessionStorage.getItem("backdrop_username") ?? "");
      return;
    }

    // sessionStorage was cleared (tab close / cold start) — try to restore from the
    // HttpOnly cookie by calling the auth check endpoint.
    fetch("/api/blog/auth")
      .then((r) => r.json() as Promise<{
        authenticated?: boolean;
        token?: string;
        role?: string;
        username?: string;
      }>)
      .then((data) => {
        if (data.authenticated && data.token) {
          sessionStorage.setItem("backdrop_secret",  data.token);
          if (data.role)     sessionStorage.setItem("backdrop_role",     data.role);
          if (data.username) sessionStorage.setItem("backdrop_username", data.username);
          setRole((data.role as Role | undefined) ?? null);
          setUsername(data.username ?? "");
        } else {
          // Cookie invalid or expired — middleware should have caught this, but guard anyway
          router.replace("/enter/backdrop");
        }
      })
      .catch(() => router.replace("/enter/backdrop"));
  }, [router]);

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  function canSee(item: NavItem) {
    if (!item.roles) return true; // no restriction = all roles
    if (!role) return true;       // role not loaded yet — show all (auth gate handles actual access)
    return item.roles.includes(role);
  }

  async function signOut() {
    sessionStorage.removeItem("backdrop_secret");
    sessionStorage.removeItem("backdrop_role");
    sessionStorage.removeItem("backdrop_username");
    await fetch("/api/blog/auth", { method: "DELETE" }).catch(() => {});
    router.push("/enter/backdrop");
  }

  const badge = role ? ROLE_BADGE[role] : null;

  return (
    <div className="flex min-h-screen" style={{ background: "#0a0e1a" }}>
      {/* Sidebar */}
      <aside
        className="w-56 shrink-0 flex flex-col border-r"
        style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.015)" }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-4 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <Image
            src="/logos/hotbot-logo.svg"
            alt="HotBot Studios logo"
            width={28}
            height={28}
            className="shrink-0 object-contain"
          />
          <div>
            <p className="text-white text-sm font-semibold leading-none">Backdrop</p>
            <p className="text-slate-600 text-[10px] mt-0.5">HotBot Studios</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5" aria-label="Dashboard navigation">
          {NAV.filter(canSee).map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150"
                style={{
                  color: active ? "#e2e8f0" : "#64748b",
                  background: active ? "rgba(99,102,241,0.12)" : "transparent",
                  fontWeight: active ? 500 : 400,
                }}
              >
                <span style={{ color: active ? "#818cf8" : "#475569" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info + Sign out */}
        <div className="p-3 border-t space-y-2" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          {username && (
            <div className="px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-slate-400 text-xs font-medium truncate">{username}</p>
              {badge && (
                <span className="text-[10px] font-semibold mt-0.5 inline-block" style={{ color: badge.color }}>
                  {badge.label}
                </span>
              )}
            </div>
          )}
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
