"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },
  { label: "All Posts", href: "/dashboard/posts", icon: "📋" },
  { label: "New Post", href: "/dashboard/new-post", icon: "✏️" },
  { label: "Settings", href: "/dashboard/settings", icon: "⚙️" },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState("Admin");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("hb_admin_token");
    if (!token) {
      router.replace("/");
      return;
    }
    const user = localStorage.getItem("hb_admin_user");
    if (user) setUsername(user);
  }, [router]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  function handleLogout() {
    localStorage.removeItem("hb_admin_token");
    localStorage.removeItem("hb_admin_user");
    router.push("/");
  }

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-blue-400 font-black text-lg">⚡</span>
          <div>
            <p className="text-white font-bold text-sm leading-none">HotBot</p>
            <p className="text-slate-500 text-xs">Admin Panel</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1 text-slate-500 hover:text-white transition-colors"
          aria-label="Close sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold flex-shrink-0">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-300 text-xs font-semibold truncate">{username}</p>
            <p className="text-slate-600 text-[10px]">Administrator</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-500 hover:text-red-400 transition-colors text-xs"
            title="Sign out"
          >
            ⏏
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 border-r border-white/[0.06] flex-col">
        {sidebar}
      </aside>

      {/* Mobile sidebar — overlay drawer */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <aside
            className="fixed left-0 top-0 bottom-0 z-50 w-64 border-r border-white/[0.08] bg-[#0a0a0f] flex flex-col lg:hidden"
            style={{ animation: "slideInLeft 0.22s ease-out" }}
          >
            {sidebar}
          </aside>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-auto min-w-0">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-4 sm:px-6 border-b border-white/[0.06] flex-shrink-0 gap-4">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.07] transition-colors"
              aria-label="Open menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
            <span className="text-slate-400 text-sm font-medium">
              {NAV.find((n) => n.href === pathname)?.label || ""}
            </span>
          </div>
          <a
            href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://hotbotstudios.com"}/blog`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-blue-400 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            View Blog ↗
          </a>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 sm:p-6">
          {children}
        </div>
      </main>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
