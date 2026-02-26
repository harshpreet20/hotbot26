import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/HeroSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { ClientLogos } from "@/components/sections/ClientLogos";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CTASection } from "@/components/sections/CTASection";

export const metadata: Metadata = {
  title: "AI Automation & Digital Marketing Agency for US Businesses | HotBot Studios",
  description:
    "HotBot Studios is America's #1 full-stack growth agency. We build custom AI agents, run ROI-driven marketing campaigns, produce premium content, and ship enterprise software — all under one roof. Serving 42+ US businesses. Book a free strategy call.",
  keywords: [
    "AI automation agency USA",
    "digital marketing agency USA",
    "AI chatbot development company",
    "growth agency for US businesses",
    "AI marketing agency",
    "full service digital agency USA",
    "marketing automation agency",
    "custom AI agents USA",
    "SEO agency US",
    "software development agency USA",
    "content marketing agency",
    "PR agency USA",
    "UI UX design agency",
    "n8n automation agency",
    "voice AI business USA",
  ],
  openGraph: {
    title: "AI Automation & Digital Marketing Agency for US Businesses | HotBot Studios",
    description: "America's full-stack growth agency — custom AI agents, performance marketing, content production, software development, PR, and UI/UX design for US businesses. 42+ clients. Book a free strategy call.",
    url: "https://hotbotstudios.com",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "HotBot Studios — AI Automation & Digital Marketing Agency USA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Automation & Digital Marketing Agency | HotBot Studios",
    description: "Custom AI agents, performance marketing, software development & PR for US businesses. One team, your entire growth stack.",
    images: ["/og-image.svg"],
  },
  alternates: { canonical: "https://hotbotstudios.com" },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <ClientLogos />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
