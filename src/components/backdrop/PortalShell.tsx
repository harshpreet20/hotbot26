"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const NO_SIDEBAR_PATHS = ["/customers", "/customers/setup", "/customers/verify"];

const NAV_ITEMS = [
  { label: "Dashboard",       href: "/customers/dashboard",       icon: "📊" },
  { label: "Projects",        href: "/customers/projects",        icon: "📁" },
  { label: "Invoices",        href: "/customers/invoices",        icon: "💳" },
  { label: "Support",         href: "/customers/tickets",        icon: "🎫" },
  { label: "Communications",  href: "/customers/communications",  icon: "📢" },
  { label: "Files",           href: "/customers/files",           icon: "📂" },
  { label: "Notifications",   href: "/customers/notifications",   icon: "🔔" },
];

export default function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [clientName, setClientName] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  // No sidebar for auth/setup pages
  const hideSidebar = NO_SIDEBAR_PATHS.includes(pathname ?? "");

  useEffect(() => {
    if (hideSidebar) return;
    fetch("/api/customers/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.client?.name) setClientName(d.client.name);
      })
      .catch(() => {});
  }, [hideSidebar]);

  async function signOut() {
    setSigningOut(true);
    await fetch("/api/customers/auth/logout", { method: "POST" });
    router.replace("/customers");
  }

  if (hideSidebar) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff" }}>
        {children}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0f", color: "#fff" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          background: "#0d0d14",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          overflowY: "auto",
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div style={{ padding: "24px 20px 16px" }}>
          <Image
            src="/logos/brand-logo.png"
            alt="HotBot Studios"
            width={100}
            height={32}
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* Client name */}
        {clientName && (
          <div
            style={{
              margin: "0 12px 16px",
              padding: "10px 14px",
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: 10,
            }}
          >
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>
              {clientName}
            </p>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0 8px" }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: 8,
                  marginBottom: 2,
                  color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                  background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 500,
                  transition: "all 0.1s",
                }}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div style={{ padding: "12px 8px 20px" }}>
          <button
            onClick={signOut}
            disabled={signingOut}
            style={{
              width: "100%",
              padding: "9px 12px",
              background: "none",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              color: "rgba(255,255,255,0.4)",
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

      {/* Main content — offset by sidebar width */}
      <main
        style={{
          flex: 1,
          marginLeft: 220,
          overflowY: "auto",
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
}
