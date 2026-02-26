"use client";
import { useRef, useState, useEffect } from "react";

interface UseInViewOptions {
  threshold?: number;
  once?: boolean;
}

export function useInView(opts: UseInViewOptions = {}): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (opts.once !== false) {
            observer.unobserve(el);
          }
        }
      },
      { threshold: opts.threshold ?? 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [opts.threshold, opts.once]);

  return [ref, inView];
}
