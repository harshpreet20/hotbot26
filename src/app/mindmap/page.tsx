import type { Metadata } from "next";
import BrainMap from "./BrainMap";

export const metadata: Metadata = {
  title: "Platform Architecture · HotBot Studios",
  description:
    "Interactive 3D map of the HotBot Studios platform — AI products, CRM, email tracking, MCP integrations, and more. Built with Claude Code + MCP Servers.",
  robots: { index: false, follow: false },
};

export default function MindmapPage() {
  return <BrainMap />;
}
