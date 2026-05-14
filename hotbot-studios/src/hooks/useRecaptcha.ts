// src/hooks/useRecaptcha.ts
// reCAPTCHA v3 — invisible, score-based spam protection.
// Site key is public (NEXT_PUBLIC_). Secret key lives server-side only.
"use client";
import { useEffect, useCallback } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

export function useRecaptcha() {
  useEffect(() => {
    if (!SITE_KEY || typeof window === "undefined") return;
    if (document.querySelector(`script[src*="recaptcha"]`)) return;
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const getToken = useCallback(async (action: string): Promise<string | null> => {
    if (!SITE_KEY || typeof window === "undefined" || !window.grecaptcha) {
      return null; // No key configured — skip silently
    }
    return new Promise((resolve) => {
      window.grecaptcha!.ready(async () => {
        try {
          const token = await window.grecaptcha!.execute(SITE_KEY, { action });
          resolve(token);
        } catch {
          resolve(null);
        }
      });
    });
  }, []);

  return { getToken };
}
