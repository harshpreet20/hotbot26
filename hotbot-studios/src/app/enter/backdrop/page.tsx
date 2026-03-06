"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BackdropLoginPage() {
  const router = useRouter();

  useEffect(() => {
    sessionStorage.setItem("backdrop_secret", "hotbot-blog-secret-2026");
    router.replace("/enter/backdrop/dashboard");
  }, [router]);

  return null;
}
