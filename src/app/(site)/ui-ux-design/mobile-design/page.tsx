import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

export const metadata: Metadata = {
  title: "Mobile App Design Agency USA - iOS & Android UI/UX Design | HotBot Studios",
  description:
    "HotBot Studios designs iOS and Android mobile apps for US product teams - Human Interface Guidelines, Material Design 3, responsive layouts, and developer-ready Figma specs. Free mobile design consultation.",
  keywords: [
    "mobile app design agency USA",
    "iOS app design USA",
    "Android app design USA",
    "mobile UI design USA",
    "Material Design 3 USA",
    "Human Interface Guidelines design",
    "mobile UX design USA",
    "app design consultant USA",
  ],
  alternates: { canonical: "https://hotbotstudios.com/ui-ux-design/mobile-design" },
  openGraph: {
    title: "Mobile App Design Agency USA - iOS & Android UI/UX Design | HotBot Studios",
    description: "iOS and Android mobile app design following Human Interface Guidelines and Material Design 3 - responsive layouts and Figma specs for US product teams.",
    url: "https://hotbotstudios.com/ui-ux-design/mobile-design",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Mobile App Design (iOS & Android)",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Mobile App UI/UX Design",
  areaServed: { "@type": "Country", name: "United States" },
  description: "iOS and Android mobile app design for US product teams - Human Interface Guidelines, Material Design 3, responsive layouts, and developer-ready Figma specifications.",
  url: "https://hotbotstudios.com/ui-ux-design/mobile-design",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "UI/UX Design", item: "https://hotbotstudios.com/ui-ux-design" },
    { "@type": "ListItem", position: 3, name: "Mobile App Design (iOS & Android)", item: "https://hotbotstudios.com/ui-ux-design/mobile-design" },
  ],
};

const CONTENT = [
  {
    heading: "Mobile Design Is Not Web Design Made Smaller - It Is an Entirely Different Discipline",
    body: "Designing for mobile requires a fundamentally different approach to information architecture, interaction patterns, and visual hierarchy than designing for web. The interaction model is touch (not cursor-based), which means hit targets need to be a minimum of 44 by 44 points to be reliably tappable, swipe gestures replace right-click menus, and bottom navigation is preferable to top navigation because of how users hold their phones. The viewport is small and variable (from 375pt on an iPhone SE to 430pt on an iPhone 16 Pro Max), which requires careful prioritisation of what information appears on each screen rather than simply reflowing a web layout into a narrower column. The performance expectation is immediate - mobile users expect sub-100ms response to touch interactions. And the context of use is different - mobile users are often moving, distracted, and using the app in short sessions, which requires a different information density and task completion flow than a desktop product where users sit and focus. HotBot Studios designs mobile apps from a mobile-first perspective, not as a translation of an existing web product.",
    color: "#06b6d4",
  },
  {
    heading: "iOS Design: Human Interface Guidelines and the Platform Conventions Users Expect",
    body: "Apple's Human Interface Guidelines (HIG) are the most comprehensive and strictly enforced platform design specification in consumer technology - and for good reason. iOS users have been trained by years of using well-designed Apple and third-party apps to expect specific interaction patterns: the navigation bar at the top, the tab bar at the bottom, swipe-back gesture for navigation, share sheet for sharing, contextual menus for secondary actions. Apps that deviate from these conventions without strong justification feel broken to iOS users - not innovative. HotBot Studios designs iOS apps that follow HIG conventions as a default, applying custom brand expression in visual design (colour, typography, illustration, animation) rather than in interaction patterns. We design for all current iPhone and iPad form factors, including the Dynamic Island, the Face ID notch, and the various safe area insets that must be respected on different devices. We also design for iOS-specific features - widgets, Spotlight integration, App Clips, and Share Sheet extensions - where relevant to your product.",
    color: "#8b5cf6",
  },
  {
    heading: "Android Design: Material Design 3 and the Flexibility of the Android Ecosystem",
    body: "Android's Material Design 3 (Material You) is the current design system specification for Android apps - a dynamic, adaptive design language that responds to the user's system colour theme, creating a personalised experience that iOS currently does not support at the same depth. Material Design 3 introduces design tokens that map to the user's chosen wallpaper colour palette, navigation components (navigation bar, navigation drawer, navigation rail) that adapt to device form factor, and a component library that includes every UI element needed for a complete Android app. HotBot Studios designs Android apps using Material Design 3 components and principles as the foundation, with brand-specific customisation applied through the Material Theme Builder and custom design tokens. We design for the full range of Android form factors - phones, tablets, and foldables - which requires careful attention to responsive layout specifications and the breakpoints at which the navigation pattern and content layout shift.",
    color: "#22c55e",
  },
  {
    heading: "Cross-Platform Design: One Design System, Two Platforms",
    body: "Most mobile products need to ship on both iOS and Android - which raises the question of how much platform-specific customisation to apply versus how much to standardise across both platforms. HotBot Studios designs cross-platform mobile apps using a shared design system with platform-specific variants: shared design tokens (colours, typography, spacing) applied universally, with platform-specific components for navigation (iOS tab bar vs Android navigation bar), interaction patterns (iOS swipe gestures vs Android back button), and typography (SF Pro for iOS, Roboto for Android). This approach gives your app a consistent brand experience across platforms while respecting the platform conventions that each platform's user base expects. Every design is delivered in Figma with separate iOS and Android component pages, shared styles across both, and developer handoff annotations that specify which platform-native components to use and where custom components are required. Request a consultation below and we will review your product and recommend the right design approach for your target platforms.",
    color: "#ec4899",
  },
];

export default function MobileDesignPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <Breadcrumb items={[{ label: "UI/UX Design", href: "/ui-ux-design" }, { label: "Mobile Design" }]} />

      <PageHeader
        label="Mobile App Design (iOS & Android)"
        title="Native Mobile Design That Feels Right on Every Platform"
        subtitle="iOS and Android app design following Human Interface Guidelines and Material Design 3 - responsive layouts, platform-specific components, and Figma specs for developer handoff."
      />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-10 space-y-6">
        {CONTENT.map((block, i) => (
          <Reveal key={i} delay={i * 0.07}>
            <GlassCard className="p-6 md:p-8">
              <div className="w-1 h-10 rounded-full mb-4" style={{ background: `linear-gradient(180deg, ${block.color}, ${block.color}44)` }} />
              <h2 className="text-xl font-bold text-white mb-3">{block.heading}</h2>
              <p className="text-slate-300 leading-relaxed text-[15px]">{block.body}</p>
            </GlassCard>
          </Reveal>
        ))}
      </section>

      <section className="relative z-10 px-6 max-w-2xl mx-auto pb-24">
        <Reveal>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free Mobile Design Consultation</h2>
            <p className="text-slate-400">Tell us about your app, your target platforms, and your users. We will recommend the right design approach and scope within 24 hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="uiux-mobile-design"
            accentColor="#06b6d4"
            title="Start Your Mobile App Design Project"
            subtitle="No obligation. Share your app concept and target platforms and we will scope the design engagement."
          />
        </Reveal>
      </section>
    </>
  );
}
