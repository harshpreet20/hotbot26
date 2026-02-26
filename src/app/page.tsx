import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/HeroSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { ClientLogos } from "@/components/sections/ClientLogos";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CTASection } from "@/components/sections/CTASection";

export const metadata: Metadata = {
  title: "HotBot Studios | AI Automation & Digital Marketing Agency USA",
  description:
    "HotBot Studios is America's full-service growth agency — AI automation, digital marketing, content production, software development, PR, and UI/UX design for US businesses.",
  keywords: [
    "AI automation agency USA", "digital marketing agency", "chatbot development USA",
    "growth agency US businesses", "AI marketing agency New York",
  ],
  openGraph: {
    title: "HotBot Studios | AI Automation & Digital Marketing Agency USA",
    description: "America's full-service growth agency — AI, marketing, content, software, PR, and design in one team.",
    url: "https://hotbotstudios.com",
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
