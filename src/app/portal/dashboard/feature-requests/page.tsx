"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FeatureRequestsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/portal/dashboard/tickets?tab=feature"); }, [router]);
  return null;
}
