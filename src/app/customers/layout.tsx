import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Portal — HotBot Studios",
  description: "Manage your projects, invoices, and support with HotBot Studios.",
};

export default function CustomersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff" }}>
      {children}
    </div>
  );
}
