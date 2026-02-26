import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { SubServices } from "@/components/sections/SubServices";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";

export const metadata: Metadata = {
  title: "Content Production Studio USA | HotBot Studios",
  keywords: ["content production agency USA", "video production agency", "copywriting services USA", "podcast production agency", "brand content creation"],
  alternates: { canonical: "https://hotbotstudios.com/content-studio" },
  description:
    "Premium content production — video, photography, copywriting, podcasts, and social content — for US brands that want to stand out.",
};

const SUB_SERVICES = [
  { icon: "🎬", title: "Video Production", desc: "Brand films, product videos, social reels, and corporate documentaries that tell your story." },
  { icon: "📸", title: "Photography", desc: "Product photography, brand shoots, lifestyle content, and event coverage." },
  { icon: "✍️", title: "Copywriting", desc: "Website copy, blog articles, ad copy, email sequences, and thought leadership content." },
  { icon: "🎙️", title: "Podcast Production", desc: "End-to-end podcast production — recording, editing, publishing, and promotion." },
  { icon: "📱", title: "Social Content", desc: "Platform-native content for Instagram, TikTok, LinkedIn, and YouTube Shorts." },
  { icon: "🖨️", title: "Print & Design", desc: "Brochures, pitch decks, infographics, and all print collateral designed to impress." },
];

const STATS = [
  { value: 500, suffix: "+", label: "Content Pieces Produced", color: "#8b5cf6" },
  { value: 40, suffix: "+", label: "Brand Partners", color: "#3b82f6" },
  { value: 300, suffix: "%", label: "Avg Engagement Increase", color: "#ec4899" },
  { value: 48, suffix: "hr", label: "Typical Turnaround", color: "#f59e0b" },
];

const PROCESS = [
  { n: 1, title: "Brief & Discovery", desc: "We learn your brand voice, target audience, content goals, and creative direction.", icon: "📋" },
  { n: 2, title: "Strategy & Planning", desc: "Develop a content calendar, creative concepts, and distribution strategy.", icon: "📅" },
  { n: 3, title: "Creation", desc: "Our team of writers, designers, videographers, and photographers produce your content.", icon: "🎨" },
  { n: 4, title: "Review & Deliver", desc: "You review, we revise, then publish and distribute across all your channels.", icon: "✅" },
];

const FAQS = [
  { q: "How quickly can you produce content?", a: "Blog articles take 24-48 hours. Video production typically takes 1-2 weeks from brief to delivery. Social content batches are turned around weekly." },
  { q: "Do you handle content distribution too?", a: "Yes. We can manage posting, scheduling, and community management across all your social platforms as part of a retainer." },
  { q: "Can you match our existing brand voice?", a: "Absolutely. We conduct a brand voice audit at the start and maintain a brand guidelines document that all content creators follow." },
  { q: "What content formats do you specialise in?", a: "Video, photography, written content (blogs, whitepapers, case studies), social media content, email sequences, and podcast production." },
];

const RELATED = [
  { title: "Digital Marketing", href: "/marketing-services", desc: "Distribute your content for maximum reach.", icon: "📣" },
  { title: "UI/UX Design", href: "/ui-ux-design", desc: "Beautiful design to present your content.", icon: "🎨" },
  { title: "Public Relations", href: "/public-relations", desc: "Get your content featured in major media.", icon: "📰" },
];

export default function ContentStudioPage() {
  return (
    <>
      <PageHeader
        label="Content Studio"
        title="Content That Captivates, Converts, and Compounds"
        subtitle="Generic content gets scrolled past. Content that educates, entertains, and speaks directly to your buyer's pain points builds audiences, drives organic traffic, and generates leads at scale. That's what we produce."
      />
      <SubServices services={SUB_SERVICES} title="What We Create" columns={3} />
      <ServiceStats stats={STATS} />
      <ProcessSteps steps={PROCESS} title="Our Creative Process" />
      <FAQSection faqs={FAQS} />
      <RelatedServices services={RELATED} />
      <CTASection title="Let's Create Something Remarkable" subtitle="Tell us your content goals and we'll build a production system that scales with you — without sacrificing quality." formType="get-started" />
    </>
  );
}
