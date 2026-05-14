import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

export const metadata: Metadata = {
  title: "Mobile App Development Agency USA - iOS & Android | HotBot Studios",
  description:
    "HotBot Studios builds cross-platform iOS and Android apps with React Native and Flutter for US businesses. Native performance, single codebase, App Store and Google Play deployment. Free app scoping call.",
  keywords: [
    "mobile app development agency USA",
    "iOS app development USA",
    "Android app development USA",
    "React Native development agency",
    "Flutter app development USA",
    "cross-platform mobile app USA",
    "custom mobile app development USA",
    "app development company USA",
  ],
  alternates: { canonical: "https://hotbotstudios.com/software-development/mobile-app-development" },
  openGraph: {
    title: "Mobile App Development Agency USA - iOS & Android | HotBot Studios",
    description: "Cross-platform iOS and Android apps with React Native and Flutter. Native performance, single codebase, App Store and Google Play deployment.",
    url: "https://hotbotstudios.com/software-development/mobile-app-development",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Mobile App Development (iOS & Android)",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Mobile Application Development",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Cross-platform iOS and Android mobile app development using React Native and Flutter for US businesses. App Store and Google Play deployment included.",
  url: "https://hotbotstudios.com/software-development/mobile-app-development",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Software Development", item: "https://hotbotstudios.com/software-development" },
    { "@type": "ListItem", position: 3, name: "Mobile App Development", item: "https://hotbotstudios.com/software-development/mobile-app-development" },
  ],
};

const CONTENT = [
  {
    heading: "Why Your Business Needs a Mobile App, Not Just a Mobile Website",
    body: "Mobile websites and mobile apps serve fundamentally different user needs. A mobile-responsive website is appropriate for content consumption, SEO-driven discovery, and one-time transactions. A mobile app is the right choice when your business requires repeat engagement, offline functionality, push notification access, native device features (camera, GPS, biometrics, Bluetooth), or a user experience that needs to feel as fast and fluid as a native consumer app. In 2026, customers expect app-quality experiences from business tools, field service software, customer loyalty programmes, and B2B platforms. If your users are accessing your product on mobile more than 40% of the time and your web experience is the bottleneck - a dedicated mobile app will measurably improve retention, engagement, and conversion.",
    color: "#06b6d4",
  },
  {
    heading: "React Native and Flutter: Native Performance from a Single Codebase",
    body: "Building separate native apps for iOS (Swift) and Android (Kotlin) means two codebases, two development teams, two release cycles, and double the maintenance cost. HotBot Studios builds cross-platform mobile apps using React Native and Flutter - frameworks that compile to native code and deliver performance indistinguishable from fully native apps while sharing a single codebase across both platforms. React Native is our default choice for teams with existing JavaScript expertise and applications that integrate heavily with web-based APIs. Flutter is our recommendation for applications requiring pixel-perfect custom UI and the smoothest possible animations. Both frameworks give you one sprint cycle per feature, one QA pass, and one deployment pipeline - typically cutting mobile development costs by 40 to 60 percent compared to building two native apps.",
    color: "#8b5cf6",
  },
  {
    heading: "App Store and Google Play: Submission, Review, and ASO",
    body: "Getting a mobile app into the hands of your users involves more than writing the code - it requires navigating Apple's App Store review process (typically 2 to 3 business days, with a 30% first-submission rejection rate for teams unfamiliar with Apple's guidelines) and Google Play's review policies, setting up developer accounts, configuring signing certificates, and writing store listings optimised for App Store Search (ASO). HotBot Studios handles the entire submission process: we prepare your App Store Connect and Google Play Console listings with keyword-optimised descriptions, prepare screenshot sets in all required device sizes, submit the app for review, manage any rejection feedback, and confirm successful publication. We also advise on ASO best practices - keyword targeting, rating solicitation, and A/B testing of store listing assets - to maximise organic downloads from day one.",
    color: "#ec4899",
  },
  {
    heading: "Push Notifications, Analytics, and Ongoing App Maintenance",
    body: "A mobile app is a live product that requires ongoing investment to remain competitive. HotBot Studios sets up the full post-launch infrastructure from the start: Firebase or OneSignal for push notification campaigns segmented by user behaviour; Mixpanel or Amplitude for in-app analytics tracking user flows, drop-off points, and feature adoption; Crashlytics for real-time crash reporting with stack traces; and an over-the-air update pipeline using Expo EAS Update for shipping JavaScript-layer fixes without requiring a full App Store submission. We offer monthly maintenance retainers that cover OS version compatibility updates (Apple and Google both release major OS versions annually that require app updates), security patch reviews, dependency updates, and feature enhancements based on your product roadmap. Describe your app idea below and we will respond with a scope and timeline within 24 hours.",
    color: "#f59e0b",
  },
];

export default function MobileAppDevelopmentPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <Breadcrumb items={[{ label: "Software Development", href: "/software-development" }, { label: "Mobile App Development" }]} />

      <PageHeader
        label="Mobile App Development (iOS & Android)"
        title="One Codebase. Two Platforms. Native Performance."
        subtitle="Cross-platform iOS and Android apps built with React Native and Flutter for US businesses - App Store and Google Play deployment, push notifications, and analytics included."
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
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free App Scoping Call</h2>
            <p className="text-slate-400">Describe your app idea or current mobile challenge. We will respond with a scope, platform recommendation, and cost estimate within 24 hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="software-mobile-app"
            accentColor="#06b6d4"
            title="Start Your Mobile App Project"
            subtitle="No obligation. Share your app concept and target platforms and we will scope the build."
          />
        </Reveal>
      </section>
    </>
  );
}
