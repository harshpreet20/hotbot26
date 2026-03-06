"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subDone, setSubDone] = useState(false);
  const openForm = useAppStore((s) => s.openForm);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    try {
      const res = await fetch("/api/n8n/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      // Silent fail — still show success so UX isn't blocked
    } finally {
      setSubDone(true);
    }
  };

  return (
    <footer
      className="relative z-10 border-t border-white/[0.06] mt-16 sm:mt-20"
      style={{ background: "rgba(10,14,26,0.95)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Brand — full width on mobile */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-flex mb-4">
              <Image
                src="/logos/hotbot-logo.png"
                alt="HotBot Studios — AI Automation & Digital Marketing Agency"
                width={160}
                height={40}
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-5 sm:mb-6">
              Full-service growth infrastructure for US businesses. AI, marketing, content, software, PR — all in one place.
            </p>
            {/* Newsletter */}
            {!subDone ? (
              <form onSubmit={handleNewsletter} className="flex flex-col xs:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-xl text-sm text-white bg-white/[0.05] border border-white/10 focus:border-blue-500/50 outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 whitespace-nowrap"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
                >
                  Subscribe
                </button>
              </form>
            ) : (
              <p className="text-green-400 text-sm font-medium">
                ✓ You&apos;re subscribed!
              </p>
            )}
          </div>

          {/* Services */}
          <div className="col-span-1">
            <h4 className="text-white font-semibold text-xs sm:text-sm mb-3 sm:mb-4 uppercase tracking-wider">Services</h4>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { label: "AI Automation", href: "/ai-automation" },
                { label: "Digital Marketing", href: "/marketing-services" },
                { label: "Content Studio", href: "/content-studio" },
                { label: "Software Dev", href: "/software-development" },
                { label: "Public Relations", href: "/public-relations" },
                { label: "UI/UX Design", href: "/ui-ux-design" },
                { label: "Consulting", href: "/consultancy" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-slate-400 text-xs sm:text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1">
            <h4 className="text-white font-semibold text-xs sm:text-sm mb-3 sm:mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { label: "About Us", href: "/about" },
                { label: "Blog", href: "/blog" },
                { label: "Products", href: "/ai-automation" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-slate-400 text-xs sm:text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={() => openForm("contact-sales")}
                  className="text-slate-400 text-xs sm:text-sm hover:text-white transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h4 className="text-white font-semibold text-xs sm:text-sm mb-3 sm:mb-4 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Refund Policy", href: "/refund" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-slate-400 text-xs sm:text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs sm:text-sm text-center sm:text-left">
            © 2026 HotBot Studios LLP. All rights reserved. Incorporated in New Delhi, India.
          </p>
          <div className="flex items-center gap-4 sm:gap-4">
            {[
              { label: "LinkedIn", href: "https://linkedin.com" },
              { label: "Twitter", href: "https://twitter.com" },
              { label: "Instagram", href: "https://instagram.com" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-white transition-colors text-xs sm:text-sm"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
