"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// ── Referrer categorisation ───────────────────────────────────────────────────

function categoriseReferrer(ref: string): { category: string; source: string } {
  if (!ref) return { category: "Direct", source: "direct" };
  try {
    const host = new URL(ref).hostname.replace(/^www\./, "");
    // LLM sources
    const llm = ["chatgpt.com", "chat.openai.com", "perplexity.ai", "claude.ai",
                  "gemini.google.com", "copilot.microsoft.com", "you.com", "phind.com",
                  "bing.com/chat", "bard.google.com"];
    if (llm.some(l => host.includes(l))) return { category: "LLM", source: host };
    // Organic social
    const social = ["facebook.com", "instagram.com", "twitter.com", "x.com",
                    "linkedin.com", "pinterest.com", "tiktok.com", "youtube.com",
                    "reddit.com", "threads.net", "whatsapp.com", "t.me"];
    if (social.some(s => host.includes(s))) return { category: "Organic Social", source: host };
    // Organic search
    const search = ["google.", "bing.com", "duckduckgo.com", "yahoo.com",
                    "baidu.com", "yandex.", "ecosia.org", "brave.com"];
    if (search.some(s => host.includes(s))) return { category: "Organic Search", source: host };
    // Everything else with a referrer = Referral
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

  const sessionIdRef  = useRef<string>("");
  const pageCountRef  = useRef<number>(0);
  const sessionStartRef = useRef<number>(0);
  const pageStartRef  = useRef<number>(0);
  const prevPageRef   = useRef<string>("");

  // ── Mount: init session ────────────────────────────────────────────────────
  useEffect(() => {
    const ua  = navigator.userAgent;
    const w   = window.innerWidth;
    const sid = getOrCreateSessionId();

    sessionIdRef.current   = sid;
    sessionStartRef.current = Date.now();

    // Parse UTM params
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

    // Expose global trackEvent
    window.trackEvent = (name: string, props?: Record<string, unknown>) => {
      post({
        type:       "event",
        sessionId:  sessionIdRef.current,
        eventName:  name,
        page:       window.location.pathname,
        properties: props,
      });
    };

    // beforeunload: send final session_update via beacon
    const handleUnload = () => {
      const durationMs = Date.now() - sessionStartRef.current;
      // also flush the current page duration
      if (prevPageRef.current) {
        beacon({
          type:      "pageview",
          sessionId: sessionIdRef.current,
          page:      prevPageRef.current,
          durationMs: Date.now() - pageStartRef.current,
        });
      }
      beacon({
        type:      "session_update",
        sessionId: sessionIdRef.current,
        pageCount: pageCountRef.current,
        durationMs,
        isBounce:  pageCountRef.current <= 1,
      });
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Route changes: track pageview ─────────────────────────────────────────
  useEffect(() => {
    const sid = sessionIdRef.current;
    if (!sid) return;

    const now = Date.now();

    // Send duration of the previous page
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const hourUtc = new Date().getUTCHours();
    if (prevPageRef.current) {
      const durationMs = now - pageStartRef.current;
      post({
        type:      "pageview",
        sessionId: sid,
        page:      prevPageRef.current,
        durationMs,
        timezone:  tz,
        hourUtc,
      });
    } else {
      // First page view — send without duration
      post({
        type:      "pageview",
        sessionId: sid,
        page:      pathname,
        referrer:  document.referrer || undefined,
        timezone:  tz,
        hourUtc,
      });
    }

    prevPageRef.current  = pathname;
    pageStartRef.current = now;
    pageCountRef.current += 1;
  }, [pathname]);

  return null;
}
