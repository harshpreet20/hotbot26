"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface PortalUser {
  email: string;
  name: string;
  clientRef: string;
}

// ── Icons ──────────────────────────────────────────────────────────────────────
function GridIcon()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/></svg>; }
function TicketIcon()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 12a2 2 0 000-4V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 000 4v2a2 2 0 000 4v2a2 2 0 002 2h12a2 2 0 002-2v-2a2 2 0 000-4v-2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M9 12h6M9 8h6M9 16h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>; }
function InvoiceIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M14 2v6h6M9 13h6M9 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>; }
function TaskIcon()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function ProjectIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>; }
function CalendarIcon(){ return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/></svg>; }
function PenIcon()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function DocIcon()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>; }

// ── Nav groups ─────────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "WORKSPACE",
    items: [
      { label: "Overview", href: "/portal/dashboard", icon: GridIcon, exact: true },
    ],
  },
  {
    label: "CLIENT",
    items: [
      { label: "Projects", href: "/portal/dashboard/projects", icon: ProjectIcon, exact: false },
      { label: "Tasks",    href: "/portal/dashboard/tasks",    icon: TaskIcon,    exact: false },
    ],
  },
  {
    label: "SUPPORT",
    items: [
      { label: "Tickets",  href: "/portal/dashboard/tickets",  icon: TicketIcon,  exact: false },
    ],
  },
  {
    label: "BILLING",
    items: [
      { label: "Invoices", href: "/portal/dashboard/invoices", icon: InvoiceIcon, exact: false },
    ],
  },
  {
    label: "COLLABORATE",
    items: [
      { label: "Meetings",   href: "/portal/dashboard/meetings",   icon: CalendarIcon, exact: false },
      { label: "Whiteboard", href: "/portal/dashboard/whiteboard", icon: PenIcon,      exact: false },
    ],
  },
  {
    label: "LEGAL",
    items: [
      { label: "Documents", href: "/portal/dashboard/documents", icon: DocIcon, exact: false },
    ],
  },
];

export default function PortalDashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser]       = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/portal/auth")
      .then(r => { if (!r.ok) throw new Error(); return r.json() as Promise<{ user?: PortalUser }>; })
      .then(d => setUser(d.user ?? null))
      .catch(() => router.push("/portal/login"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSignOut() {
    await fetch("/api/portal/auth", { method: "DELETE" }).catch(() => {});
    router.push("/portal/login");
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      const res = await fetch("/api/portal/auth?action=delete-account", { method: "DELETE" });
      if (res.ok) router.push("/portal/login?deleted=1");
    } finally { setDeleting(false); }
  }

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", background:"#0a0f1e", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ animation:"spin 1s linear infinite" }}>
          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.1)" strokeWidth="3"/>
          <path d="M12 2a10 10 0 0110 10" stroke="#6366f1" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#0a0f1e" }}>
      {/* Sidebar */}
      <aside style={{ width:228, flexShrink:0, background:"rgba(255,255,255,0.025)", borderRight:"1px solid rgba(255,255,255,0.07)", display:"flex", flexDirection:"column", position:"sticky", top:0, height:"100vh", overflowY:"auto" }}>
        {/* Brand */}
        <div style={{ padding:"24px 20px 20px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ fontSize:15, fontWeight:700, color:"#ffffff", letterSpacing:"-0.2px", marginBottom:8 }}>
            HotBot Studios
          </div>
          <span style={{ display:"inline-block", fontSize:11, fontWeight:500, color:"#8b5cf6", background:"rgba(139,92,246,0.12)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:20, padding:"3px 10px", letterSpacing:"0.4px", textTransform:"uppercase" }}>
            Client Portal
          </span>
        </div>

        {/* Nav groups */}
        <nav style={{ flex:1, padding:"8px 10px 12px" }}>
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <p style={{ padding:"12px 14px 4px", fontSize:9, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#334155" }}>
                {group.label}
              </p>
              {group.items.map(item => {
                const active = isActive(item.href, item.exact);
                const Icon = item.icon;
                return (
                  <a key={item.href} href={item.href}
                    style={{
                      display:"flex", alignItems:"center", gap:10, padding:"9px 14px", borderRadius:14,
                      fontSize:14, fontWeight:active?600:400,
                      color:active?"#e2e8f0":"#64748b",
                      background:active?"rgba(99,102,241,0.12)":"transparent",
                      border:active?"1px solid rgba(99,102,241,0.2)":"1px solid transparent",
                      textDecoration:"none", marginBottom:2, transition:"all 0.15s",
                    }}
                    onMouseEnter={e=>{ if(!active){e.currentTarget.style.color="#cbd5e1";e.currentTarget.style.background="rgba(255,255,255,0.04)";} }}
                    onMouseLeave={e=>{ if(!active){e.currentTarget.style.color="#64748b";e.currentTarget.style.background="transparent";} }}
                  >
                    <span style={{ color:active?"#6366f1":"#475569" }}><Icon /></span>
                    {item.label}
                  </a>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User + actions */}
        <div style={{ padding:"16px 16px 20px", borderTop:"1px solid rgba(255,255,255,0.07)" }}>
          {user && (
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:13, fontWeight:500, color:"#e2e8f0", marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {user.name || user.email}
              </div>
              <div style={{ fontSize:11, color:"#475569", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {user.email}
              </div>
            </div>
          )}
          <button onClick={handleSignOut}
            style={{ width:"100%", padding:"9px 12px", background:"transparent", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, color:"#64748b", fontSize:13, fontWeight:500, cursor:"pointer", display:"flex", alignItems:"center", gap:8, transition:"all 0.15s", marginBottom:8 }}
            onMouseEnter={e=>{e.currentTarget.style.color="#e2e8f0";e.currentTarget.style.borderColor="rgba(255,255,255,0.15)";}}
            onMouseLeave={e=>{e.currentTarget.style.color="#64748b";e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Sign Out
          </button>
          <button onClick={() => setShowDeleteConfirm(true)}
            style={{ width:"100%", padding:"7px 12px", background:"transparent", border:"1px solid rgba(248,113,113,0.15)", borderRadius:14, color:"rgba(248,113,113,0.5)", fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:8, transition:"all 0.15s" }}
            onMouseEnter={e=>{e.currentTarget.style.color="#f87171";e.currentTarget.style.borderColor="rgba(248,113,113,0.35)";}}
            onMouseLeave={e=>{e.currentTarget.style.color="rgba(248,113,113,0.5)";e.currentTarget.style.borderColor="rgba(248,113,113,0.15)";}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 6V4h6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Delete Account
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex:1, overflow:"auto", minWidth:0 }}>
        {children}
      </main>

      {/* Delete account confirm */}
      {showDeleteConfirm && (
        <div style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:16, background:"rgba(0,0,0,0.75)" }}>
          <div style={{ width:"100%", maxWidth:400, background:"#0f1629", border:"1px solid rgba(248,113,113,0.2)", borderRadius:20, padding:24 }}>
            <h2 style={{ color:"#f87171", fontSize:16, fontWeight:700, marginBottom:8 }}>Delete Account?</h2>
            <p style={{ color:"#94a3b8", fontSize:13, lineHeight:1.6, marginBottom:20 }}>
              Your account will be deactivated immediately and permanently deleted after 30 days. All your data (tickets, invoices, projects) will be retained during this period.
            </p>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button onClick={() => setShowDeleteConfirm(false)}
                style={{ padding:"8px 16px", borderRadius:14, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#94a3b8", fontSize:13, cursor:"pointer" }}>
                Cancel
              </button>
              <button onClick={() => void handleDeleteAccount()} disabled={deleting}
                style={{ padding:"8px 16px", borderRadius:14, background:"rgba(248,113,113,0.15)", border:"1px solid rgba(248,113,113,0.3)", color:"#f87171", fontSize:13, fontWeight:600, cursor:"pointer", opacity:deleting?0.6:1 }}>
                {deleting ? "Deleting…" : "Yes, Delete My Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
