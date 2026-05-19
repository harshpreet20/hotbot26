// reCAPTCHA v3 — invisible, score-based spam protection.
// Script is injected on first user interaction to keep it off the critical path.
"use client";
import { useCallback, useRef } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

function injectScript(): Promise<void> {
  if (!SITE_KEY || typeof window === "undefined") return Promise.resolve();
  if (document.querySelector(`script[src*="recaptcha"]`)) return Promise.resolve();
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => resolve(); // fail open
    document.head.appendChild(script);
  });
}

export function useRecaptcha() {
  const loaded = useRef(false);

  // Call this on first form focus/interaction to warm up reCAPTCHA early
  const prime = useCallback(() => {
    if (loaded.current) return;
    loaded.current = true;
    void injectScript();
  }, []);

  const getToken = useCallback(async (action: string): Promise<string | null> => {
    if (!SITE_KEY || typeof window === "undefined") return null;
    await injectScript();
    return new Promise((resolve) => {
      const attempt = () => {
        if (!window.grecaptcha) { setTimeout(attempt, 100); return; }
        window.grecaptcha.ready(async () => {
          try {
            const token = await window.grecaptcha!.execute(SITE_KEY, { action });
            resolve(token);
          } catch {
            resolve(null);
          }
        });
      };
      attempt();
    });
  }, []);

  return { getToken, prime };
}
