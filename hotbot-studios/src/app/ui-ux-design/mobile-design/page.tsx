import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { SubServices } from "@/components/sections/SubServices";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";
import { GlassCard } from "@/components/shared/GlassCard";
import { Reveal } from "@/components/shared/Reveal";

export const metadata: Metadata = {
  title: "Mobile App Design (iOS & Android) USA | HotBot Studios",
  description:
    "Native iOS and Android mobile app design for US businesses. Human Interface Guidelines, Material Design 3, gesture navigation, and responsive layouts that feel intuitive on every screen. HotBot Studios.",
  keywords: [
    "mobile app design USA",
    "iOS app design agency USA",
    "Android app design USA",
    "mobile UX design USA",
    "React Native design",
    "Material Design 3 agency",
    "Human Interface Guidelines design",
    "mobile app UI agency USA",
    "app design company USA",
    "mobile-first design USA",
  ],
  openGraph: {
    title: "Mobile App Design (iOS & Android) USA | HotBot Studios",
    description: "Native iOS HIG and Android Material Design 3 app design. Gesture navigation, responsive layouts, and mobile-first experiences for US businesses.",
    url: "https://hotbotstudios.com/ui-ux-design/mobile-design",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: "Mobile App Design iOS & Android USA | HotBot Studios", description: "Native iOS and Android app design following HIG and Material Design 3." },
  alternates: { canonical: "https://hotbotstudios.com/ui-ux-design/mobile-design" },
};

const serviceSchema = {
  "@context": "https://schema.org", "@type": "Service",
  name: "Mobile App Design (iOS & Android)",
  description: "Native iOS and Android mobile app design following Human Interface Guidelines and Material Design 3, gesture navigation, responsive layouts, and mobile-first experiences for US businesses.",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  areaServed: { "@type": "Country", name: "United States" },
  serviceType: "Mobile App Design",
  url: "https://hotbotstudios.com/ui-ux-design/mobile-design",
};

const breadcrumbSchema = {
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "UI/UX Design", item: "https://hotbotstudios.com/ui-ux-design" },
    { "@type": "ListItem", position: 3, name: "Mobile App Design", item: "https://hotbotstudios.com/ui-ux-design/mobile-design" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Do you design for both iOS and Android or just one platform?", acceptedAnswer: { "@type": "Answer", text: "We design for both iOS and Android. Each platform has its own design language: iOS follows Apple's Human Interface Guidelines (HIG) with SF Symbols, swipe-back gestures, and bottom sheet patterns; Android follows Material Design 3 with dynamic color, navigation rails, and FAB patterns. We deliver platform-specific design variants that feel native on each OS, not a generic cross-platform compromise." } },
    { "@type": "Question", name: "What is the difference between iOS HIG and Android Material Design 3?", acceptedAnswer: { "@type": "Answer", text: "iOS Human Interface Guidelines (HIG) prioritise clarity, deference, and depth, SF Symbols, large titles, swipe-based navigation, bottom sheets, and the iOS tab bar. Android Material Design 3 (M3) prioritises adaptive layouts, dynamic color theming, navigation rails for large screens, and FABs. Users on each platform expect their native patterns, ignoring these conventions creates friction and reduces ratings." } },
    { "@type": "Question", name: "Should we design a native app or a React Native cross-platform app?", acceptedAnswer: { "@type": "Answer", text: "From a design perspective, React Native and native apps can look and feel nearly identical when designed and developed carefully. The design process is the same, we design iOS and Android variants separately using platform conventions, and developers implement these in their chosen framework. The technology choice (Swift/Kotlin vs React Native) is a development decision that doesn't constrain our design quality." } },
    { "@type": "Question", name: "Do you design for tablets and iPads as well as phones?", acceptedAnswer: { "@type": "Answer", text: "Yes, for B2B and enterprise apps, tablet/iPad layouts are increasingly important. iPad requires different layout patterns (split views, sidebar navigation, multi-column layouts) that don't simply scale up from phone designs. We design tablet variants as a separate deliverable, ensuring the larger screen real estate is used intelligently rather than wasted." } },
    { "@type": "Question", name: "How do you handle gesture navigation in mobile design?", acceptedAnswer: { "@type": "Answer", text: "Gesture navigation is central to mobile UX design. On iOS, we design for swipe-back, swipe-to-dismiss, pull-to-refresh, and long-press menus. On Android, we design for the gesture navigation bar, edge swipes, and Material Design's shared element transitions. All gestures are documented in our prototype with Figma's smart animate and overlay interactions so developers can implement them precisely." } },
    { "@type": "Question", name: "What screen sizes do you design for?", acceptedAnswer: { "@type": "Answer", text: "We design for the primary screen sizes covering 90%+ of US device usage: iPhone 16 Pro (393×852pt), iPhone SE (375×667pt), and iPhone 16 Pro Max (430×932pt) for iOS; and 360×800dp and 412×915dp for Android. We also deliver iPad designs for enterprise apps. All designs use Auto Layout in Figma to ensure flexible scaling across intermediate sizes." } },
  ],
};

const SUB_SERVICES = [
  { icon: "🍎", title: "iOS App Design (Human Interface Guidelines)", desc: "Native iOS design following Apple HIG, SF Symbols, swipe gestures, bottom sheets, tab bars, and large title navigation that App Store reviewers and iPhone users expect.", href: "/ui-ux-design/mobile-design" },
  { icon: "🤖", title: "Android App Design (Material Design 3)", desc: "Material You design with dynamic color, navigation rails, FABs, and M3 component patterns, Android-native experiences that feel right on every Google device.", href: "/ui-ux-design/mobile-design" },
  { icon: "🔄", title: "Cross-Platform Design System", desc: "Unified design system covering both iOS and Android variants, shared visual identity with platform-specific component and navigation adaptations for React Native teams.", href: "/ui-ux-design/mobile-design" },
  { icon: "📱", title: "Onboarding & Onboarding Flows", desc: "First-run onboarding sequences that convert installs into active users, permission prompts, feature spotlights, personalization steps, and value demonstration optimized for mobile.", href: "/ui-ux-design/mobile-design" },
  { icon: "🔔", title: "Push Notification & Widget Design", desc: "Rich push notification templates, iOS lock screen widgets, and Android notification channel designs that re-engage users without triggering notification opt-out.", href: "/ui-ux-design/mobile-design" },
  { icon: "🖥️", title: "Tablet & iPad Design", desc: "Split-view, sidebar, and multi-column layouts that use tablet screen real estate intelligently, designed to pass App Store review and meet enterprise iPad use cases.", href: "/ui-ux-design/mobile-design" },
];

const STATS = [
  { value: 60, suffix: "%", label: "of US Web Traffic Is Mobile", color: "#3b82f6" },
  { value: 88, suffix: "%", label: "Users Abandon App After Poor Experience", color: "#3b82f6" },
  { value: 4.5, suffix: "★", label: "Avg Rating Lift After UX Redesign", color: "#3b82f6" },
  { value: 2, suffix: "×", label: "Retention Lift with Proper Onboarding Flow", color: "#3b82f6" },
];

const PROCESS = [
  { n: 1, title: "Platform & Audience Analysis", desc: "Determine primary platform (iOS / Android / both), target user demographics, primary use context (commute, desk, home), and interaction patterns before making any design decisions.", icon: "📊" },
  { n: 2, title: "Navigation Architecture", desc: "Design the core navigation model, tab bar, sidebar, stack navigation, bottom sheet flows, ensuring users can always orient themselves and return to key screens intuitively.", icon: "🧭" },
  { n: 3, title: "Screen Design (Platform-Native)", desc: "Design all screens using platform-correct patterns: HIG-compliant for iOS, Material Design 3 for Android. Each interaction state, empty state, and error state documented.", icon: "📱" },
  { n: 4, title: "Prototype, Test & Handoff", desc: "Interactive Figma prototypes with gesture animations, Maze usability testing with real mobile users, and developer handoff with platform-specific annotation and asset export.", icon: "📤" },
];

const FAQS = [
  { q: "Do you design for both iOS and Android or just one platform?", a: "We design for both. iOS follows Apple's Human Interface Guidelines (HIG); Android follows Material Design 3 (M3). We deliver platform-specific design variants that feel native on each OS, not a generic cross-platform compromise that feels slightly off on both." },
  { q: "What is the difference between iOS HIG and Android Material Design 3?", a: "iOS HIG prioritises SF Symbols, swipe-based navigation, bottom sheets, and the iOS tab bar. Android M3 prioritises dynamic color theming, navigation rails for large screens, and FABs. Users on each platform expect their native patterns, ignoring these conventions creates friction and reduces App Store ratings." },
  { q: "Should we design a native app or a React Native cross-platform app?", a: "From a design perspective, React Native and native apps can look and feel nearly identical when designed carefully. We design iOS and Android variants separately using platform conventions regardless of the technology choice, the design process is identical." },
  { q: "Do you design for tablets and iPads as well as phones?", a: "Yes, for B2B and enterprise apps, tablet/iPad layouts are increasingly important. iPad requires split views, sidebar navigation, and multi-column layouts that don't scale up from phone designs. We design tablet variants as a separate deliverable." },
  { q: "How do you handle gesture navigation in mobile design?", a: "Gesture navigation is central to mobile UX. On iOS, we design for swipe-back, swipe-to-dismiss, pull-to-refresh, and long-press menus. On Android, we design for edge swipes and shared element transitions. All gestures are documented in our Figma prototype with smart animate interactions." },
  { q: "What screen sizes do you design for?", a: "We cover 90%+ of US device usage: iPhone 16 Pro (393×852pt), iPhone SE (375×667pt), and iPhone 16 Pro Max (430×932pt) for iOS; 360×800dp and 412×915dp for Android. All designs use Auto Layout in Figma for flexible scaling across intermediate sizes." },
];

const RELATED = [
  { title: "Visual UI Design & Design Systems", href: "/ui-ux-design/visual-ui-design", desc: "The design system foundation mobile apps are built on.", icon: "🎨" },
  { title: "Interactive Prototyping", href: "/ui-ux-design/prototyping", desc: "Clickable mobile prototypes with gesture animations.", icon: "⚡" },
  { title: "Mobile App Development", href: "/software-development/mobile-app-development", desc: "We build what we design, React Native and native mobile.", icon: "💻" },
];

const platformComparison = [
  { feature: "Navigation Model", ios: "Tab Bar / Stack Push", android: "Navigation Rail / Drawer" },
  { feature: "Icon System", ios: "SF Symbols", android: "Material Symbols" },
  { feature: "Primary Action", ios: "Bottom Sheet / Action Sheet", android: "FAB (Floating Action Button)" },
  { feature: "Gesture Back", ios: "Swipe Right Edge", android: "System Back Gesture / Button" },
  { feature: "Color System", ios: "Semantic Color Tokens", android: "Material You Dynamic Color" },
  { feature: "Typography", ios: "SF Pro Text / Display", android: "Roboto / Google Fonts" },
];

export default function MobileDesignPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        label="Mobile App Design (iOS & Android)"
        title="Native Mobile Experiences Users Actually Love Using"
        subtitle="A mobile app that ignores platform conventions feels wrong, users feel it even if they can't explain why, and they rate it accordingly. HotBot Studios designs iOS and Android apps that follow Human Interface Guidelines and Material Design 3, feeling native, intuitive, and worth 5 stars."
      />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div className="rounded-xl p-6" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#3b82f6" }}>Definition, Mobile App Design</p>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Mobile app design</strong> is the creation of digital interfaces specifically optimised for touchscreen devices, following platform-specific design languages (Apple&apos;s Human Interface Guidelines for iOS, Google&apos;s Material Design 3 for Android) that govern navigation patterns, gesture interactions, typography, and component behaviour. Great mobile design reduces cognitive load, follows learned user expectations, and makes every interaction feel effortless on a small screen.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-xl font-bold text-white mb-6 text-center">iOS vs Android Design, Key Differences</h2>
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="grid grid-cols-3 gap-0">
              <div className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider" style={{ background: "rgba(255,255,255,0.02)" }}>Feature</div>
              <div className="p-3 text-xs font-bold text-center" style={{ color: "#3b82f6", background: "rgba(59,130,246,0.06)" }}>iOS (HIG)</div>
              <div className="p-3 text-xs font-bold text-center" style={{ color: "#22c55e", background: "rgba(34,197,94,0.06)" }}>Android (M3)</div>
              {platformComparison.map((row, i) => (
                <>
                  <div key={`f${i}`} className="p-3 text-xs text-slate-400 border-t border-white/5">{row.feature}</div>
                  <div key={`i${i}`} className="p-3 text-xs text-white text-center border-t border-white/5" style={{ background: "rgba(59,130,246,0.03)" }}>{row.ios}</div>
                  <div key={`a${i}`} className="p-3 text-xs text-white text-center border-t border-white/5" style={{ background: "rgba(34,197,94,0.03)" }}>{row.android}</div>
                </>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="Mobile App Design Services" columns={3} />
      <ServiceStats stats={STATS} title="Why Mobile-Native Design Matters" />
      <ProcessSteps steps={PROCESS} title="Our Mobile Design Process" />
      <FAQSection faqs={FAQS} />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div className="rounded-xl p-6" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-xl font-bold text-white mb-4">Key Takeaways</h2>
            <ul className="space-y-2">
              {[
                "60% of US web traffic is mobile, mobile-first design is not optional in 2026",
                "88% of users abandon an app after a poor UX experience and rarely return",
                "iOS HIG and Android Material Design 3 are different design languages requiring separate design variants",
                "We design gesture navigation, push notification templates, onboarding flows, and widget designs",
                "Tablet/iPad layouts designed as a separate deliverable for enterprise and B2B apps",
                "Figma prototypes with gesture animations enable realistic mobile usability testing in Maze",
              ].map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-slate-300">
                  <span style={{ color: "#22c55e" }} className="mt-0.5 shrink-0">✓</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <RelatedServices services={RELATED} />
      <CTASection
        title="Design a Mobile App Users Rate 5 Stars"
        subtitle="Tell us your app concept and target platform, we'll design native iOS and Android experiences that feel intuitive, perform beautifully, and pass App Store review."
        formType="get-started"
      />
    </>
  );
}
