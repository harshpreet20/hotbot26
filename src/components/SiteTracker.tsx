"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// ── Referrer categorisation ───────────────────────────────────────────────────

function categoriseReferrer(ref: string): { category: string; source: string } {
  if (!ref) return { category: "Direct", source: "direct" };
  try {
    const host = new URL(ref).hostname.replace(/^www\./, "");
    const llm = ["chatgpt.com", "chat.openai.com", "perplexity.ai", "claude.ai",
                  "gemini.google.com", "copilot.microsoft.com", "you.com", "phind.com",
                  "bing.com/chat", "bard.google.com"];
    if (llm.some(l => host.includes(l))) return { category: "LLM", source: host };
    const social = ["facebook.com", "instagram.com", "twitter.com", "x.com",
                    "linkedin.com", "pinterest.com", "tiktok.com", "youtube.com",
                    "reddit.com", "threads.net", "whatsapp.com", "t.me"];
    if (social.some(s => host.includes(s))) return { category: "Organic Social", source: host };
    const search = ["google.", "bing.com", "duckduckgo.com", "yahoo.com",
                    "baidu.com", "yandex.", "ecosia.org", "brave.com"];
    if (search.some(s => host.includes(s))) return { category: "Organic Search", source: host };
    return { category: "Referral", source: host };
  } catch {
    return { category: "Unassigned", source: "unknown" };
  }
}

// ── UA helpers ────────────────────────────────────────────────────────────────

function getDevice(ua: string, w: number): string {
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  if (/iPad|Tablet/i.test(ua) || w < 1024) return "tablet";
  return "desktop";
}
function getBrowser(ua: string): string {
  if (/Edg/i.test(ua))     return "Edge";
  if (/Chrome/i.test(ua))  return "Chrome";
  if (/Firefox/i.test(ua)) return "Firefox";
  if (/Safari/i.test(ua))  return "Safari";
  return "Other";
}
function getOS(ua: string): string {
  if (/Windows/i.test(ua))      return "Windows";
  if (/Mac OS/i.test(ua))       return "macOS";
  if (/Android/i.test(ua))      return "Android";
  if (/iPhone|iPad/i.test(ua))  return "iOS";
  if (/Linux/i.test(ua))        return "Linux";
  return "Other";
}

// ── Session helpers ───────────────────────────────────────────────────────────

function getOrCreateSessionId(): string {
  try {
    let sid = sessionStorage.getItem("site_sid");
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem("site_sid", sid);
    }
    return sid;
  } catch {
    return crypto.randomUUID();
  }
}

// ── Scroll helpers ────────────────────────────────────────────────────────────

function getScrollDepthPct(): number {
  const scrolled = window.scrollY + window.innerHeight;
  const total = document.documentElement.scrollHeight;
  return total <= 0 ? 0 : Math.min(100, Math.round((scrolled / total) * 100));
}

// ── Tracking ──────────────────────────────────────────────────────────────────

function post(body: object): void {
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {});
}

function beacon(body: object): void {
  try {
    navigator.sendBeacon(
      "/api/track",
      new Blob([JSON.stringify(body)], { type: "application/json" })
    );
  } catch {
    post(body);
  }
}

// Extend window type for trackEvent
declare global {
  interface Window {
    trackEvent: (name: string, props?: Record<string, unknown>) => void;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SiteTracker() {
  const pathname = usePathname();

  const sessionIdRef    = useRef<string>("");
  const pageCountRef    = useRef<number>(0);
  const sessionStartRef = useRef<number>(0);
  const pageStartRef    = useRef<number>(0);
  const prevPageRef     = useRef<string>("");

  // Scroll depth – per page
  const maxScrollRef        = useRef<number>(0);
  const scrollMilestonesRef = useRef<Set<number>>(new Set());
  const scrollRafRef        = useRef<number | null>(null);

  // Tab visibility – cumulative session totals
  const tabSwitchesRef  = useRef<number>(0);
  const tabHiddenMsRef  = useRef<number>(0);
  const tabHiddenAtRef  = useRef<number | null>(null);

  // ── Mount: init session + global listeners ─────────────────────────────────
  useEffect(() => {
    const ua  = navigator.userAgent;
    const w   = window.innerWidth;
    const sid = getOrCreateSessionId();

    sessionIdRef.current    = sid;
    sessionStartRef.current = Date.now();

    const params = new URLSearchParams(window.location.search);
    const utmSource   = params.get("utm_source")   ?? undefined;
    const utmMedium   = params.get("utm_medium")   ?? undefined;
    const utmCampaign = params.get("utm_campaign") ?? undefined;

    const { category: trafficCategory, source: trafficSource } = categoriseReferrer(document.referrer);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    post({
      type:            "session",
      sessionId:       sid,
      firstPage:       pathname,
      referrer:        document.referrer || undefined,
      utmSource,
      utmMedium,
      utmCampaign,
      device:          getDevice(ua, w),
      browser:         getBrowser(ua),
      os:              getOS(ua),
      trafficCategory,
      trafficSource,
      timezone,
    });

    window.trackEvent = (name: string, props?: Record<string, unknown>) => {
      post({
        type:       "event",
        sessionId:  sessionIdRef.current,
        eventName:  name,
        page:       window.location.pathname,
        properties: props,
      });
    };

    // ── Scroll depth listener ──────────────────────────────────────────────
    const handleScroll = () => {
      if (scrollRafRef.current !== null) return;
      scrollRafRef.current = requestAnimationFrame(() => {
        scrollRafRef.current = null;
        const pct = getScrollDepthPct();
        if (pct > maxScrollRef.current) maxScrollRef.current = pct;

        // Fire milestone events once per page
        for (const milestone of [25, 50, 75, 90, 100]) {
          if (pct >= milestone && !scrollMilestonesRef.current.has(milestone)) {
            scrollMilestonesRef.current.add(milestone);
            post({
              type:       "event",
              sessionId:  sessionIdRef.current,
              eventName:  "scroll_depth",
              page:       window.location.pathname,
              properties: { depth: milestone },
            });
          }
        }
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // ── Tab visibility listener ────────────────────────────────────────────
    const handleVisibility = () => {
      if (document.hidden) {
        tabHiddenAtRef.current = Date.now();
        tabSwitchesRef.current += 1;
      } else if (tabHiddenAtRef.current !== null) {
        tabHiddenMsRef.current += Date.now() - tabHiddenAtRef.current;
        tabHiddenAtRef.current = null;
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // ── beforeunload ───────────────────────────────────────────────────────
    const handleUnload = () => {
      // Flush any ongoing hidden period
      if (tabHiddenAtRef.current !== null) {
        tabHiddenMsRef.current += Date.now() - tabHiddenAtRef.current;
      }

      const durationMs = Date.now() - sessionStartRef.current;

      if (prevPageRef.current) {
        beacon({
          type:          "pageview",
          sessionId:     sessionIdRef.current,
          page:          prevPageRef.current,
          durationMs:    Date.now() - pageStartRef.current,
          maxScrollDepth: maxScrollRef.current,
        });
      }

      beacon({
        type:         "session_update",
        sessionId:    sessionIdRef.current,
        pageCount:    pageCountRef.current,
        durationMs,
        isBounce:     pageCountRef.current <= 1,
        tabSwitches:  tabSwitchesRef.current,
        tabHiddenMs:  tabHiddenMsRef.current,
      });
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleUnload);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Route changes: track pageview + reset scroll ───────────────────────────
  useEffect(() => {
    const sid = sessionIdRef.current;
    if (!sid) return;

    const now    = Date.now();
    const tz     = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const hourUtc = new Date().getUTCHours();

    if (prevPageRef.current) {
      const durationMs = now - pageStartRef.current;
      post({
        type:           "pageview",
        sessionId:      sid,
        page:           prevPageRef.current,
        durationMs,
        timezone:       tz,
        hourUtc,
        maxScrollDepth: maxScrollRef.current,
      });
    } else {
      post({
        type:      "pageview",
        sessionId: sid,
        page:      pathname,
        referrer:  document.referrer || undefined,
        timezone:  tz,
        hourUtc,
      });
    }

    // Reset scroll tracking for the new page
    maxScrollRef.current = 0;
    scrollMilestonesRef.current = new Set();

    prevPageRef.current  = pathname;
    pageStartRef.current = now;
    pageCountRef.current += 1;
  }, [pathname]);

  return null;
}
