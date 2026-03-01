import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { SubServices } from "@/components/sections/SubServices";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";

export const metadata: Metadata = {
  title: "Mobile App Development Agency USA — iOS & Android with React Native | HotBot Studios",
  description:
    "HotBot Studios builds cross-platform iOS and Android mobile apps using React Native and Flutter for US businesses. Native performance, single codebase, App Store & Google Play deployment. 4-week MVP. Free technical scoping.",
  keywords: [
    "mobile app development agency USA",
    "iOS app development agency USA",
    "Android app development USA",
    "React Native development agency USA",
    "Flutter app development USA",
    "cross-platform mobile app USA",
    "mobile app MVP development USA",
    "custom mobile app development",
    "enterprise mobile app USA",
    "startup mobile app development USA",
    "App Store deployment agency",
    "Google Play app development",
    "mobile app design and development",
    "B2B mobile app development USA",
  ],
  openGraph: {
    title: "Mobile App Development Agency USA — iOS & Android React Native | HotBot Studios",
    description: "Cross-platform iOS & Android apps built with React Native for US businesses. Native performance, single codebase. App Store & Google Play. 4-week MVP.",
    url: "https://hotbotstudios.com/software-development/mobile-app-development",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Mobile App Development Agency USA — HotBot Studios" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mobile App Development Agency USA | HotBot Studios",
    description: "iOS & Android apps with React Native. Native performance, single codebase, App Store & Google Play ready.",
  },
  alternates: { canonical: "https://hotbotstudios.com/software-development/mobile-app-development" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Mobile App Development for US Businesses",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "iOS & Android Mobile App Development",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Cross-platform iOS and Android mobile app development using React Native and Flutter for US businesses. Native performance, single codebase, App Store and Google Play deployment, AI integration, and offline capabilities.",
  url: "https://hotbotstudios.com/software-development/mobile-app-development",
  offers: { "@type": "Offer", priceCurrency: "USD", availability: "https://schema.org/InStock" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Software Development", item: "https://hotbotstudios.com/software-development" },
    { "@type": "ListItem", position: 3, name: "Mobile App Development", item: "https://hotbotstudios.com/software-development/mobile-app-development" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What is the difference between React Native and Flutter?", acceptedAnswer: { "@type": "Answer", text: "React Native uses JavaScript/TypeScript and renders native iOS and Android components — ideal for teams with existing web/React expertise and projects that share code with a web app. Flutter uses Dart and renders its own widget engine — offering pixel-perfect consistency across platforms. HotBot Studios recommends React Native for most business apps due to its larger ecosystem and shared codebase opportunities with Next.js web apps." } },
    { "@type": "Question", name: "How long does it take to build and launch a mobile app?", acceptedAnswer: { "@type": "Answer", text: "A mobile app MVP (core user flows, authentication, basic push notifications) takes 6–10 weeks from brief to App Store and Google Play submission. Full-featured apps with complex data sync, payment integration, and offline capabilities take 4–6 months. App Store review typically adds 1–3 days." } },
    { "@type": "Question", name: "Do you handle App Store and Google Play submission?", acceptedAnswer: { "@type": "Answer", text: "Yes — we manage the full submission process for both App Store (Apple) and Google Play, including provisioning profiles, certificates, store listings, screenshots, privacy policy compliance, and the review process. We handle rejections and respond to reviewer feedback on your behalf." } },
  ],
};

const SUB_SERVICES = [
  { icon: "⚡", title: "React Native Apps (iOS & Android)", desc: "Cross-platform mobile apps built with React Native — native performance, smooth animations, and access to device APIs (camera, GPS, biometrics) with a single TypeScript codebase for both iOS and Android.", href: "/software-development/mobile-app-development" },
  { icon: "🦋", title: "Flutter Apps", desc: "Pixel-perfect cross-platform apps with Flutter's custom rendering engine. Ideal for apps where UI consistency across platforms is paramount, or where performance-critical animations and custom UI components are required.", href: "/software-development/mobile-app-development" },
  { icon: "🤖", title: "AI-Powered Mobile Apps", desc: "Mobile apps with on-device AI (Core ML, TensorFlow Lite) or cloud AI (GPT-4o, Claude 3) integrations — real-time image recognition, voice interfaces, intelligent search, and personalised recommendations.", href: "/software-development/mobile-app-development" },
  { icon: "🔔", title: "Consumer Apps with Engagement Systems", desc: "B2C mobile apps with push notifications, in-app messaging, deep linking, A/B testing, and user retention mechanisms — built on Firebase, Segment, and Amplitude for data-driven growth.", href: "/software-development/mobile-app-development" },
  { icon: "🏢", title: "Enterprise Mobile Apps", desc: "Internal mobile apps for field teams, logistics, inspections, and remote workers — with offline-first architecture, MDM (Mobile Device Management) compatibility, and enterprise SSO (SAML, OAuth).", href: "/software-development/mobile-app-development" },
  { icon: "💳", title: "Fintech & Commerce Mobile Apps", desc: "Mobile apps with Stripe payment integration, Apple Pay, Google Pay, subscription billing, and financial-grade security — including biometric authentication, certificate pinning, and OWASP mobile security compliance.", href: "/software-development/mobile-app-development" },
];

const STATS = [
  { value: 50, suffix: "+", label: "Mobile Apps Shipped", color: "#3b82f6" },
  { value: 40, suffix: "%", label: "Cost Saving vs Native iOS + Android", color: "#22c55e" },
  { value: 6, suffix: "wk", label: "Avg MVP to App Store", color: "#8b5cf6" },
  { value: 2, suffix: "stores", label: "iOS & Android — One Codebase", color: "#f59e0b" },
];

const PROCESS = [
  { n: 1, title: "Mobile Discovery & Architecture", desc: "Platform selection (React Native vs Flutter), offline strategy, push notification infrastructure, API contract design, and App Store compliance planning. Technical Design Document delivered before any code is written.", icon: "📋" },
  { n: 2, title: "Mobile UI/UX Design", desc: "Platform-native Figma designs (iOS Human Interface Guidelines + Android Material Design 3), interactive prototype, user testing, and accessibility compliance (WCAG 2.1 AA) before development begins.", icon: "🎨" },
  { n: 3, title: "Agile Mobile Development", desc: "2-week sprint cycles with working builds delivered to TestFlight (iOS) and Google Play Internal Track (Android) — so you test real app builds, not simulators. CI/CD via Fastlane and Bitrise.", icon: "💻" },
  { n: 4, title: "QA, Store Submission & Launch", desc: "Device testing across iOS and Android versions, App Store and Google Play submission with store listing optimisation (ASO), launch monitoring, and 90 days of post-launch support.", icon: "🚀" },
];

const FAQS = [
  { q: "What is the difference between React Native and Flutter?", a: "React Native uses JavaScript/TypeScript and renders native iOS/Android components — ideal for teams with web/React expertise. Flutter uses Dart with its own rendering engine for pixel-perfect cross-platform UI. We recommend React Native for most business apps due to ecosystem maturity and code sharing with Next.js web apps." },
  { q: "How long does it take to build and launch a mobile app?", a: "An MVP (core flows, authentication, push notifications) takes 6–10 weeks from brief to App Store/Google Play submission. Full-featured apps with complex data sync, payments, and offline capabilities take 4–6 months. App Store review adds 1–3 days." },
  { q: "Do you handle App Store and Google Play submission?", a: "Yes — full submission management including provisioning profiles, certificates, store listings, screenshots, privacy policy compliance, and review process. We handle rejections and reviewer feedback on your behalf." },
  { q: "Can a React Native app achieve the same performance as a native app?", a: "For the vast majority of business applications — yes. React Native renders native UI components (not a WebView) and achieves 60fps animations. Performance-critical apps (high-end gaming, AR/VR) may benefit from native Swift/Kotlin — we'll advise honestly on the best approach for your use case." },
  { q: "Can you build mobile apps with offline functionality?", a: "Yes — offline-first architecture is a specialisation. We implement local SQLite databases (via Expo SQLite or WatermelonDB), background sync when connectivity is restored, conflict resolution logic, and optimistic UI updates. Critical for field teams, logistics, and remote worker apps." },
  { q: "Do you integrate push notifications?", a: "Yes — push notifications via Firebase Cloud Messaging (FCM) for Android and Apple Push Notification Service (APNS) for iOS, managed through Expo Notifications or a custom notification service. Rich notifications, deep linking, and notification analytics included." },
];

const RELATED = [
  { title: "Web Application Development", href: "/software-development/web-app-development", desc: "Build a companion web app that shares your mobile API.", icon: "🌐" },
  { title: "SaaS Platform Development", href: "/software-development/saas-development", desc: "Add a mobile app to your SaaS product for user retention.", icon: "☁️" },
  { title: "UI/UX Design", href: "/ui-ux-design", desc: "Platform-native mobile UI design before development begins.", icon: "🎨" },
];

export default function MobileAppDevelopmentPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        label="Mobile App Development USA"
        title="One Codebase. Two Stores. Native Performance."
        subtitle="HotBot Studios builds cross-platform iOS and Android apps using React Native and Flutter — delivering native-quality mobile experiences at 40% of the cost of building separate native apps. From MVP to App Store in 6 weeks."
      />

      {/* ── Definition Block (AEO) ─────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pt-4 pb-2">
        <Reveal>
          <div className="p-5 rounded-2xl" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)" }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Cross-platform mobile app development (definition):</strong> The practice of building a single mobile application codebase that deploys natively to both iOS (App Store) and Android (Google Play) — as opposed to building two separate native apps in Swift (iOS) and Kotlin (Android). In 2026, React Native and Flutter are the dominant cross-platform frameworks, enabling businesses to ship to both platforms 40% faster and at significantly lower cost, while still accessing native device APIs including camera, GPS, biometrics, push notifications, and background processing.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── Infographic: Cross-Platform vs Native ──────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">Cross-Platform vs Native Mobile: The 2026 Decision Framework</h2>
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { pct: "40%", label: "cost saving vs building separate native iOS + Android apps", color: "#22c55e" },
                  { pct: "85%", label: "of mobile app use cases are fully served by React Native or Flutter", color: "#3b82f6" },
                  { pct: "6wk", label: "average MVP to App Store using React Native (vs 12–16wk native)", color: "#8b5cf6" },
                  { pct: "90%", label: "code sharing between iOS and Android reduces maintenance overhead", color: "#f59e0b" },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-4 rounded-2xl" style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}25` }}>
                    <div className="text-2xl md:text-3xl font-black mb-1" style={{ color: stat.color }}>{stat.pct}</div>
                    <div className="text-slate-400 text-xs leading-snug">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Framework comparison */}
              <p className="text-slate-500 text-xs text-center mb-4 uppercase tracking-wider font-medium">Mobile Framework Comparison — React Native vs Flutter vs Native</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    name: "React Native", rec: "✅ Recommended for most", color: "#3b82f6",
                    pros: ["TypeScript (shared with web)", "Largest ecosystem", "Native components", "Strong community"],
                    cons: ["Bridge overhead (minimal)", "Some native modules needed"],
                  },
                  {
                    name: "Flutter", rec: "✅ For pixel-perfect UI", color: "#06b6d4",
                    pros: ["Custom rendering (consistent)", "High performance animations", "Strong Google support", "Growing ecosystem"],
                    cons: ["Dart language", "Larger app binary size"],
                  },
                  {
                    name: "Native (Swift/Kotlin)", rec: "⚠️ Specific use cases only", color: "#8b5cf6",
                    pros: ["Maximum platform access", "Best for AR/VR/Games", "Platform-first UX"],
                    cons: ["2× cost and timeline", "2 separate codebases", "Higher maintenance"],
                  },
                ].map((col, i) => (
                  <div key={i} className="p-4 rounded-2xl" style={{ background: `${col.color}08`, border: `1px solid ${col.color}20` }}>
                    <div className="font-bold text-white mb-1">{col.name}</div>
                    <div className="text-xs mb-3" style={{ color: col.color }}>{col.rec}</div>
                    <div className="space-y-1 mb-2">
                      {col.pros.map((p, j) => <div key={j} className="text-slate-300 text-xs flex items-start gap-1"><span className="text-green-400">+</span>{p}</div>)}
                    </div>
                    <div className="space-y-1">
                      {col.cons.map((c, j) => <div key={j} className="text-slate-500 text-xs flex items-start gap-1"><span className="text-slate-600">–</span>{c}</div>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="Mobile Apps We Build" columns={3} />
      <ServiceStats stats={STATS} title="Mobile App Delivery Track Record" />
      <ProcessSteps steps={PROCESS} title="Our Mobile App Development Process" />

      {/* ── Mobile App Categories ──────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-8">Mobile App Categories We Build</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { icon: "👥", title: "Consumer (B2C) Apps", desc: "Apps built for mass adoption: onboarding flows, social features, push notification campaigns, in-app purchases, and user retention systems. Analytics via Amplitude and Segment for data-driven iteration.", color: "#3b82f6" },
            { icon: "🏢", title: "Enterprise & Field Apps", desc: "Apps for employees: offline-first data collection, barcode scanning, GPS tracking, inspection forms, and syncing with ERP/CRM systems. MDM-compatible, SSO-enabled, enterprise-grade security.", color: "#8b5cf6" },
            { icon: "💳", title: "Fintech & Payments Apps", desc: "Mobile banking, lending, expense tracking, and payment apps — with Stripe integration, biometric authentication (Face ID, fingerprint), and OWASP mobile security compliance.", color: "#22c55e" },
            { icon: "🤖", title: "AI-Native Mobile Apps", desc: "Apps where AI is the core product: real-time image recognition (Core ML), voice-to-text interfaces, intelligent recommendation systems, or on-device LLM processing for privacy-first AI.", color: "#ec4899" },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <GlassCard className="p-6 h-full" hover>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-white mb-2 text-lg">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      <FAQSection faqs={FAQS} />

      {/* ── Key Takeaways (AEO) ────────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pb-8">
        <Reveal>
          <div className="p-6 rounded-2xl" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-lg font-bold text-white mb-4">Key Takeaways — Mobile App Development for US Businesses</h2>
            <ul className="space-y-2">
              {[
                "React Native delivers native-quality iOS and Android apps from a single TypeScript codebase — 40% cheaper than separate native builds.",
                "6-week average time from brief to App Store submission for a React Native MVP.",
                "HotBot Studios manages the full App Store and Google Play submission and review process.",
                "AI capabilities (GPT-4o, on-device ML) can be integrated natively into any mobile app we build.",
                "Offline-first architecture available for field teams, logistics, and remote worker apps.",
                "90% code sharing between iOS and Android reduces long-term maintenance cost significantly.",
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                  <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <RelatedServices services={RELATED} />
      <CTASection
        title="Ready to Build Your Mobile App?"
        subtitle="Tell us your app idea, target platform, and the problem it solves. We'll scope it, design it, and ship a working build to TestFlight in 6 weeks. Free technical scoping call included."
        formType="get-started"
      />
    </>
  );
}
