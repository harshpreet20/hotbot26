import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/HeroSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { ClientLogos } from "@/components/sections/ClientLogos";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CTASection } from "@/components/sections/CTASection";

export const metadata: Metadata = {
  title: "HotBot Studios | AI Automation & Digital Marketing Agency USA",
  description:
    "Full-service digital marketing, AI automation, content production, software development, public relations, and UI/UX design for US businesses.",
  openGraph: {
    title: "HotBot Studios | America's Growth Infrastructure",
    description: "AI, marketing, content, software, PR — all in one place.",
    url: "https://hotbotstudios.com",
  },
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
