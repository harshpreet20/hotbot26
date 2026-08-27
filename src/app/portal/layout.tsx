import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Portal | HotBot Studios",
  description: "Access your projects, tickets, and invoices.",
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
