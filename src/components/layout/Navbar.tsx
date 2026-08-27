"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { NAV_LINKS, SERVICES } from "@/lib/constants";
import { Menu, X, ChevronDown } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled]           = useState(false);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [servicesOpen, setServicesOpen]   = useState(false);   // desktop dropdown
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false); // mobile accordion
  const pathname  = usePathname();
  const openForm  = useAppStore((s) => s.openForm);
  const ddRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Close desktop dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isServiceActive = SERVICES.some((s) => pathname === s.href);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(10,14,26,0.95)" : "rgba(10,14,26,0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
        boxShadow: scrolled ? "0 4px 40px rgba(0,0,0,0.3)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-[70px] flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity shrink-0 mr-8">
          <Image
            src="/logos/brand-logo.png"
            alt="HotBot Studios - AI Automation & Digital Marketing Agency"
            width={200} height={52}
            className="h-11 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">

          {/* Home */}
          <Link
            href="/"
            className="text-sm font-medium transition-colors duration-200 whitespace-nowrap"
            style={{ color: pathname === "/" ? "#93c5fd" : "rgba(148,163,184,0.9)" }}
          >
            Home
          </Link>

          {/* Services dropdown */}
          <div ref={ddRef} style={{ position: "relative" }}>
            <button
              onClick={() => setServicesOpen((o) => !o)}
              className="flex items-center gap-1 text-sm font-medium transition-colors duration-200 whitespace-nowrap"
              style={{ color: isServiceActive || servicesOpen ? "#93c5fd" : "rgba(148,163,184,0.9)", background: "none", border: "none", cursor: "pointer" }}
            >
              Services
              <ChevronDown
                size={14}
                style={{ transition: "transform 0.2s", transform: servicesOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>

            {servicesOpen && (
              <div
                style={{
                  position: "absolute", top: "calc(100% + 12px)", left: "50%", transform: "translateX(-50%)",
                  background: "rgba(10,14,26,0.98)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 16, padding: "8px", minWidth: 220,
                  boxShadow: "0 16px 48px rgba(0,0,0,0.5)", zIndex: 100,
                }}
              >
                {SERVICES.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    onClick={() => setServicesOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{
                      color: pathname === s.href ? "#93c5fd" : "rgba(148,163,184,0.9)",
                      background: pathname === s.href ? "rgba(59,130,246,0.1)" : "transparent",
                    }}
                    onMouseEnter={(e) => { if (pathname !== s.href) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                    onMouseLeave={(e) => { if (pathname !== s.href) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Blog */}
          <Link
            href="/blog"
            className="text-sm font-medium transition-colors duration-200 whitespace-nowrap"
            style={{ color: pathname === "/blog" ? "#93c5fd" : "rgba(148,163,184,0.9)" }}
          >
            Blog
          </Link>
        </div>

        {/* CTA + Mobile Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="https://www.hotbotstudios.com/portal/login"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Customer Login
          </Link>
          <button
            onClick={() => openForm("get-started", pathname)}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
          >
            Get Started
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 animate-slide-down" style={{ background: "rgba(10,14,26,0.98)" }}>
          <div className="px-6 py-4 flex flex-col gap-1">

            {/* Home */}
            <Link
              href="/"
              className="px-3 py-3 rounded-xl text-sm font-medium transition-colors"
              style={{ color: pathname === "/" ? "#93c5fd" : "rgba(148,163,184,0.9)", background: pathname === "/" ? "rgba(59,130,246,0.1)" : "transparent" }}
            >
              Home
            </Link>

            {/* Services accordion */}
            <button
              onClick={() => setMobileServicesOpen((o) => !o)}
              className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium w-full text-left transition-colors"
              style={{ color: isServiceActive || mobileServicesOpen ? "#93c5fd" : "rgba(148,163,184,0.9)", background: isServiceActive ? "rgba(59,130,246,0.1)" : "transparent" }}
            >
              Services
              <ChevronDown size={14} style={{ transition: "transform 0.2s", transform: mobileServicesOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
            </button>
            {mobileServicesOpen && (
              <div className="flex flex-col gap-0.5 pl-3 mb-1">
                {SERVICES.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{ color: pathname === s.href ? "#93c5fd" : "rgba(148,163,184,0.7)", background: pathname === s.href ? "rgba(59,130,246,0.1)" : "transparent" }}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Blog */}
            <Link
              href="/blog"
              className="px-3 py-3 rounded-xl text-sm font-medium transition-colors"
              style={{ color: pathname === "/blog" ? "#93c5fd" : "rgba(148,163,184,0.9)", background: pathname === "/blog" ? "rgba(59,130,246,0.1)" : "transparent" }}
            >
              Blog
            </Link>

            <Link
              href="https://www.hotbotstudios.com/portal/login"
              className="mt-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 text-center flex items-center justify-center gap-2"
              style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Customer Login
            </Link>
            <button
              onClick={() => openForm("get-started", pathname)}
              className="mt-2 px-4 py-3 rounded-xl text-sm font-semibold text-white text-center"
              style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
