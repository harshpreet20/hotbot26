import type { Metadata } from "next";
import PortalShell from "@/components/backdrop/PortalShell";

export const metadata: Metadata = {
  title: "Client Portal — HotBot Studios",
  description: "Manage your projects, invoices, and support with HotBot Studios.",
};

export default function CustomersLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell>{children}</PortalShell>;
}
