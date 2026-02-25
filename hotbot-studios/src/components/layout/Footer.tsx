"use client";
import Link from "next/link";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subDone, setSubDone] = useState(false);
  const openForm = useAppStore((s) => s.openForm);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await fetch("/api/n8n/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubDone(true);
    } catch {
      setSubDone(true);
    }
  };

  return (
    <footer
      className="relative z-10 border-t border-white/[0.06] mt-20"
      style={{ background: "rgba(10,14,26,0.95)" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white"
                style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
              >
                H
              </div>
              <span className="font-black text-lg text-white">HotBot Studios</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-6">
              Full-service growth infrastructure for UK businesses. AI, marketing, content, software, PR — all in one place.
            </p>
            {/* Newsletter */}
            {!subDone ? (
              <form onSubmit={handleNewsletter} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white bg-white/[0.05] border border-white/10 focus:border-blue-500/50 outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
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
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Services</h4>
            <ul className="space-y-3">
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
                  <Link href={item.href} className="text-slate-400 text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              {[
                { label: "About Us", href: "/about" },
                { label: "Blog", href: "/blog" },
                { label: "Products", href: "/ai-automation" },
                { label: "Dashboard", href: "/dashboard" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-slate-400 text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={() => openForm("contact-sales")}
                  className="text-slate-400 text-sm hover:text-white transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-slate-400 text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} HotBot Studios Ltd. All rights reserved. Registered in England & Wales.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-white transition-colors text-sm"
            >
              LinkedIn
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-white transition-colors text-sm"
            >
              Twitter
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-white transition-colors text-sm"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
