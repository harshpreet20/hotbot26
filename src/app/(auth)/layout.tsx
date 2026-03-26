import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Login | HotBot Studios",
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]">
          <div className="w-full max-w-md px-6">{children}</div>
        </div>
      </body>
    </html>
  );
}
