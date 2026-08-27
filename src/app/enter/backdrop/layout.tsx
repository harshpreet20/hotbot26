import type { Metadata } from "next";
import AuthProvider from "@/components/backdrop/AuthProvider";

export const metadata: Metadata = {
  title: "Backdrop - HotBot Studios Blog Admin",
  description: "Internal blog management for HotBot Studios.",
  robots: { index: false, follow: false },
};

// Backdrop runs as a standalone section - no main-site nav, footer, or chat widget.
export default function BackdropLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col" style={{ background: "#0a0e1a", color: "#f1f5f9" }}>
        {children}
      </div>
    </AuthProvider>
  );
}
