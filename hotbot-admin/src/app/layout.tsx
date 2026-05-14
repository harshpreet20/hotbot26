import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HotBot Admin — Blog Management",
  description: "HotBot Studios internal blog management panel",
  robots: "noindex, nofollow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#0a0a0f] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
