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
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState("Admin");

  useEffect(() => {
    const token = localStorage.getItem("hb_admin_token");
    if (!token) {
      router.replace("/");
      return;
    }
    const user = localStorage.getItem("hb_admin_user");
    if (user) setUsername(user);
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("hb_admin_token");
    localStorage.removeItem("hb_admin_user");
    router.push("/");
  }

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 border-r border-white/[0.06] flex flex-col">
        {/* Brand */}
        <div className="p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="text-blue-400 font-black text-lg">⚡</span>
            <div>
              <p className="text-white font-bold text-sm leading-none">HotBot</p>
              <p className="text-slate-500 text-xs">Admin Panel</p>
            </div>
          </div>
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
            <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold">
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
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-auto">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-white/[0.06] flex-shrink-0">
          <div className="text-slate-400 text-sm">
            {NAV.find((n) => n.href === pathname)?.label || ""}
          </div>
          <a
            href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://hotbotstudios.com"}/blog`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-blue-400 transition-colors flex items-center gap-1.5"
          >
            View Blog ↗
          </a>
        </header>

        {/* Page content */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
