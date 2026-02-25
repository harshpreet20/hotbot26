import type { Metadata } from "next";
import { LeadsDashboard } from "@/components/dashboard/LeadsDashboard";

export const metadata: Metadata = {
  title: "Leads Dashboard | HotBot Studios",
  description: "Internal leads management dashboard.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <LeadsDashboard />;
}
