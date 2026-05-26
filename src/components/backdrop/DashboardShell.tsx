"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Role } from "@/types/dashboard";

interface BadgeCounts { tickets: number; leads: number; callbacks: number; chats: number; }

function supabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
  roles?: Role[]; // undefined = all roles
}

const NAV: NavItem[] = [
  // ── Daily use ──────────────────────────────────────────────────────────────
  {
    href: "/enter/backdrop/dashboard",
    label: "Overview",
    exact: true,
    roles: ["super_admin", "admin", "manager", "sales", "crm_operator", "finance"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: "/enter/backdrop/dashboard/analytics",
    label: "Analytics",
    roles: ["super_admin", "admin"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6"  y1="20" x2="6"  y2="14" />
      </svg>
    ),
  },
  {
    href: "/enter/backdrop/dashboard/ai-analyst",
    label: "AI Analyst",
    roles: ["super_admin", "admin"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
      </svg>
    ),
  },
  {
    href: "/enter/backdrop/dashboard/tasks",
    label: "Tasks",
    roles: ["super_admin", "admin", "manager", "sales", "crm_operator", "agent"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
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
  // ── CRM ────────────────────────────────────────────────────────────────────
  {
    href: "/enter/backdrop/dashboard/leads",
    label: "Leads",
    roles: ["super_admin", "admin", "manager", "sales", "crm_operator", "finance"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7h-9" /><path d="M14 17H5" />
        <circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" />
      </svg>
    ),
  },
  {
    href: "/enter/backdrop/dashboard/clients",
    label: "Clients",
    roles: ["super_admin", "admin", "manager", "sales", "crm_operator"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    href: "/enter/backdrop/dashboard/tickets",
    label: "Tickets",
    roles: ["super_admin", "admin", "manager", "sales", "crm_operator", "agent"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 9a3 3 0 010-6h20a3 3 0 010 6" /><path d="M2 15a3 3 0 000 6h20a3 3 0 000-6" />
        <line x1="6" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="18" y2="12" />
      </svg>
    ),
  },
  {
    href: "/enter/backdrop/dashboard/callbacks",
    label: "Callbacks",
    roles: ["super_admin", "admin", "manager", "sales", "crm_operator", "agent"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.4 10.8 19.79 19.79 0 01.36 2.18 2 2 0 012.34 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.08 6.08l.82-.82a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
  },
  {
    href: "/enter/backdrop/dashboard/invoices",
    label: "Invoices",
    roles: ["super_admin", "admin"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    href: "/enter/backdrop/dashboard/users",
    label: "Team",
    roles: ["super_admin", "admin", "manager"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 00-16 0" />
      </svg>
    ),
  },
  // ── Less frequent ──────────────────────────────────────────────────────────
  {
    href: "/enter/backdrop/dashboard/contacts",
    label: "Contacts",
    roles: ["super_admin", "admin", "manager", "sales", "crm_operator"],
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
    roles: ["super_admin", "admin", "manager", "agent"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
      </svg>
    ),
  },
  {
    href: "/enter/backdrop/dashboard/email-logs",
    label: "Email Logs",
    roles: ["super_admin", "admin"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
        <circle cx="18" cy="18" r="4" fill="currentColor" stroke="none" opacity="0" />
      </svg>
    ),
  },
  {
    href: "/enter/backdrop/dashboard/blog",
    label: "Blog",
    roles: ["super_admin", "admin", "editor", "contributor"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    href: "/enter/backdrop/dashboard/newsletter",
    label: "Newsletter",
    roles: ["super_admin", "admin", "manager", "crm_operator"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
  },
  {
    href: "/enter/backdrop/dashboard/broadcasts",
    label: "Broadcasts",
    roles: ["super_admin", "admin"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.4 10.8 19.79 19.79 0 01.36 2.18 2 2 0 012.34 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.08 6.08l.82-.82a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
  },
  {
    href: "/enter/backdrop/dashboard/knowledge",
    label: "Knowledge",
    roles: ["super_admin", "admin"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
      </svg>
    ),
  },
  {
    href: "/enter/backdrop/dashboard/activity",
    label: "Activity Log",
    roles: ["super_admin", "admin"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    href: "/enter/backdrop/dashboard/logs",
    label: "System Logs",
    roles: ["super_admin", "admin"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
];

const ROLE_BADGE: Record<Role, { label: string; color: string }> = {
  super_admin:  { label: "Super Admin",  color: "#f43f5e" },
  admin:        { label: "Admin",        color: "#818cf8" },
  manager:      { label: "Manager",      color: "#34d399" },
  sales:        { label: "Sales",        color: "#f97316" },
  crm_operator: { label: "CRM Operator", color: "#a78bfa" },
  finance:      { label: "Finance",      color: "#10b981" },
  editor:       { label: "Editor",       color: "#3b82f6" },
  contributor:  { label: "Contributor",  color: "#06b6d4" },
  agent:        { label: "Agent",        color: "#f59e0b" },
};

const BADGE_KEY_MAP: Record<string, keyof BadgeCounts> = {
  "/enter/backdrop/dashboard/tickets":   "tickets",
  "/enter/backdrop/dashboard/leads":     "leads",
  "/enter/backdrop/dashboard/callbacks": "callbacks",
  "/enter/backdrop/dashboard/chats":     "chats",
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [role, setRole]         = useState<Role | null>(null);
  const [username, setUsername] = useState<string>("");
  const [impersonatingAs, setImpersonatingAs] = useState<string | null>(null);
  const [originalUser,    setOriginalUser]    = useState<string>("");
  const [badges, setBadges]     = useState<BadgeCounts>({ tickets: 0, leads: 0, callbacks: 0, chats: 0 });
  const [seenCounts, setSeenCounts] = useState<BadgeCounts>(() => {
    if (typeof window === "undefined") return { tickets: 0, leads: 0, callbacks: 0, chats: 0 };
    try {
      const stored = localStorage.getItem("backdrop_seen_counts");
      return stored ? JSON.parse(stored) as BadgeCounts : { tickets: 0, leads: 0, callbacks: 0, chats: 0 };
    } catch { return { tickets: 0, leads: 0, callbacks: 0, chats: 0 }; }
  });
  const badgeTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = sessionStorage.getItem("backdrop_secret");
    if (stored) {
      setRole((sessionStorage.getItem("backdrop_role") as Role | null) ?? null);
      setUsername(sessionStorage.getItem("backdrop_username") ?? "");
      if (sessionStorage.getItem("backdrop_impersonating") === "1") {
        setImpersonatingAs(sessionStorage.getItem("backdrop_username") ?? "");
        setOriginalUser(sessionStorage.getItem("backdrop_original_username") ?? "");
      }
      return;
    }

    // sessionStorage was cleared (tab close / cold start) - try to restore from the
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
          router.replace("/enter/backdrop");
        }
      })
      .catch(() => router.replace("/enter/backdrop"));
  }, [router]);

  // Realtime badge counts via Supabase websocket (falls back to 10s poll)
  useEffect(() => {
    const secret = typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") : null;
    if (!secret) return;

    function fetchBadges() {
      fetch("/api/dashboard/badge-counts", { headers: { Authorization: `Bearer ${secret}` } })
        .then((r) => r.ok ? r.json() as Promise<BadgeCounts> : Promise.reject())
        .then((d) => setBadges(d))
        .catch(() => {});
    }

    fetchBadges(); // initial load

    const sb = supabaseClient();
    if (sb) {
      const channel = sb
        .channel("badge-counts")
        .on("postgres_changes", { event: "*", schema: "public", table: "leads" },    fetchBadges)
        .on("postgres_changes", { event: "*", schema: "public", table: "tickets" },  fetchBadges)
        .on("postgres_changes", { event: "*", schema: "public", table: "callbacks" },fetchBadges)
        .on("postgres_changes", { event: "*", schema: "public", table: "chats" },    fetchBadges)
        .subscribe();
      return () => { void sb.removeChannel(channel); };
    }

    // Fallback: poll every 10s if Supabase not configured
    badgeTimer.current = setInterval(fetchBadges, 10_000);
    return () => { if (badgeTimer.current) clearInterval(badgeTimer.current); };
  }, []);

  // Mark badge section as seen when navigating to it
  useEffect(() => {
    const key = Object.keys(BADGE_KEY_MAP).find(p => pathname.startsWith(p));
    if (!key) return;
    const field = BADGE_KEY_MAP[key];
    const currentCount = badges[field];
    setSeenCounts(prev => {
      if (prev[field] === currentCount) return prev;
      const next = { ...prev, [field]: currentCount };
      try { localStorage.setItem("backdrop_seen_counts", JSON.stringify(next)); } catch {}
      return next;
    });
  }, [pathname, badges]);

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  function canSee(item: NavItem) {
    if (!item.roles) return true; // no restriction = all roles
    if (!role) return false;      // hide restricted items while role is loading
    return item.roles.includes(role);
  }

  async function signOut() {
    sessionStorage.removeItem("backdrop_secret");
    sessionStorage.removeItem("backdrop_role");
    sessionStorage.removeItem("backdrop_username");
    await fetch("/api/blog/auth", { method: "DELETE" }).catch(() => {});
    router.push("/enter/backdrop");
  }

  async function stopImpersonation() {
    const secret = typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
    try {
      const res  = await fetch("/api/blog/auth/impersonate", { method: "DELETE", headers: { Authorization: `Bearer ${secret}` } });
      const data = await res.json() as { success?: boolean; token?: string; role?: string; username?: string };
      if (res.ok && data.token) {
        sessionStorage.setItem("backdrop_secret",   data.token);
        sessionStorage.setItem("backdrop_role",     data.role ?? "");
        sessionStorage.setItem("backdrop_username", data.username ?? "");
        sessionStorage.removeItem("backdrop_impersonating");
        sessionStorage.removeItem("backdrop_original_username");
        sessionStorage.removeItem("backdrop_original_role");
        window.location.href = "/enter/backdrop/dashboard/users";
      }
    } catch { /* ignore */ }
  }

  const badge = role ? ROLE_BADGE[role] : null;

  const NAV_BADGES: Partial<Record<string, number>> = {
    "/enter/backdrop/dashboard/tickets":   badges.tickets,
    "/enter/backdrop/dashboard/leads":     badges.leads,
    "/enter/backdrop/dashboard/callbacks": badges.callbacks,
    "/enter/backdrop/dashboard/chats":     badges.chats,
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "#0a0e1a" }}>
      {/* Impersonation banner */}
      {impersonatingAs && (
        <div className="shrink-0 flex items-center justify-between px-4 py-2 text-xs font-medium" style={{ background: "rgba(251,191,36,0.12)", borderBottom: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}>
          <span>⚠ Acting as <strong>{impersonatingAs}</strong> — you are viewing the dashboard as this user</span>
          <button
            onClick={stopImpersonation}
            className="px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
            style={{ background: "rgba(251,191,36,0.2)", border: "1px solid rgba(251,191,36,0.4)", color: "#fbbf24" }}
          >
            Stop — return as {originalUser}
          </button>
        </div>
      )}
      <div className="flex flex-1 min-h-0 overflow-hidden">
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
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5" aria-label="Dashboard navigation">
          {NAV.filter(canSee).map((item) => {
            const active      = isActive(item);
            const count       = NAV_BADGES[item.href] ?? 0;
            const badgeKey    = BADGE_KEY_MAP[item.href];
            const seenCount   = badgeKey ? (seenCounts[badgeKey] ?? 0) : 0;
            const unreadCount = Math.max(0, count - seenCount);
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
                <span className="flex-1 min-w-0 truncate">{item.label}</span>
                {unreadCount > 0 && (
                  <span style={{
                    minWidth: 18, height: 18, borderRadius: 9,
                    background: item.href.includes("chats") ? "#ef4444" : "#6366f1",
                    color: "#fff", fontSize: 10, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "0 5px", lineHeight: 1, flexShrink: 0,
                  }}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
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
            onClick={() => window.location.reload()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-300 transition-colors"
            title="Refresh page"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            Refresh
          </button>
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
      <main className="flex-1 min-w-0 overflow-y-auto h-full">
        {children}
      </main>
      </div>
    </div>
  );
}
