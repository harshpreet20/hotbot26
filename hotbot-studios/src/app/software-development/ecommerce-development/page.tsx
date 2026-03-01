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
  title: "E-Commerce Development Agency USA — Shopify, Headless Commerce & Custom Checkout | HotBot Studios",
  description:
    "HotBot Studios builds custom Shopify apps, headless commerce stores (Next.js + Shopify), and bespoke checkout experiences for US e-commerce brands. CRO-focused development. 30% avg conversion rate increase. Free audit.",
  keywords: [
    "e-commerce development agency USA",
    "Shopify development agency USA",
    "headless commerce development USA",
    "custom Shopify app development",
    "Next.js Shopify development",
    "WooCommerce development agency USA",
    "e-commerce CRO agency USA",
    "custom checkout development",
    "Shopify Plus development USA",
    "headless Shopify agency",
    "DTC e-commerce development USA",
    "e-commerce platform development",
    "Shopify theme development USA",
    "e-commerce conversion optimisation",
  ],
  openGraph: {
    title: "E-Commerce Development Agency USA — Shopify, Headless & Custom Checkout | HotBot Studios",
    description: "Custom Shopify apps, headless commerce (Next.js + Shopify) & bespoke checkouts for US e-commerce brands. 30% avg conversion lift.",
    url: "https://hotbotstudios.com/software-development/ecommerce-development",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "E-Commerce Development Agency USA — HotBot Studios" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "E-Commerce Development Agency USA | HotBot Studios",
    description: "Custom Shopify, headless commerce & checkout development for US brands. 30% avg conversion lift.",
  },
  alternates: { canonical: "https://hotbotstudios.com/software-development/ecommerce-development" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "E-Commerce Development Services for US Businesses",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "E-Commerce Development & Shopify Development",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Custom e-commerce development for US brands: Shopify theme and app development, headless commerce with Next.js and Shopify Storefront API, WooCommerce, bespoke checkout experiences, and e-commerce CRO engineering.",
  url: "https://hotbotstudios.com/software-development/ecommerce-development",
  offers: { "@type": "Offer", priceCurrency: "USD", availability: "https://schema.org/InStock" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Software Development", item: "https://hotbotstudios.com/software-development" },
    { "@type": "ListItem", position: 3, name: "E-Commerce Development", item: "https://hotbotstudios.com/software-development/ecommerce-development" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What is headless commerce and when should I use it?", acceptedAnswer: { "@type": "Answer", text: "Headless commerce separates the frontend presentation layer (Next.js) from the backend commerce engine (Shopify, WooCommerce). This gives brands full creative control over the storefront experience without Shopify's Liquid template limitations — enabling faster page loads, richer animations, and omnichannel commerce (web, mobile, in-store kiosks from one codebase). Recommended for brands doing $1M+ GMV or those where brand experience is a key differentiator." } },
    { "@type": "Question", name: "How much can e-commerce development improve conversion rates?", acceptedAnswer: { "@type": "Answer", text: "HotBot Studios clients see an average 30% conversion rate improvement after a CRO-focused rebuild. Key drivers include: page speed optimisation (1s faster load = 7% CR uplift), checkout friction reduction, mobile-first design, personalisation, social proof placement, and A/B tested product page layouts. Every development decision we make is informed by conversion data." } },
    { "@type": "Question", name: "Can you build custom Shopify apps?", acceptedAnswer: { "@type": "Answer", text: "Yes — we build public and private Shopify apps using Shopify CLI, Remix, and the Shopify App Bridge. Custom apps can extend Shopify admin functionality, add custom checkout logic (via Shopify Checkout Extensions), integrate third-party systems, or add subscription billing via Recharge or Skio." } },
  ],
};

const SUB_SERVICES = [
  { icon: "🛍️", title: "Shopify Theme Development", desc: "Custom Shopify themes built in Liquid for brand-aligned storefronts. Performance-optimised (Core Web Vitals 90+), mobile-first, and engineered for conversion — not just visual design.", href: "/software-development/ecommerce-development" },
  { icon: "⚡", title: "Headless Commerce (Next.js + Shopify)", desc: "Next.js 15 frontend connected to Shopify Storefront API — delivering sub-1s page loads, full creative control, and superior SEO vs standard Shopify Liquid themes. The architecture choice for high-GMV DTC brands.", href: "/software-development/ecommerce-development" },
  { icon: "🔧", title: "Custom Shopify App Development", desc: "Shopify apps built with Remix and Shopify CLI — extending admin functionality, adding custom checkout experiences via Shopify Checkout Extensions, or integrating third-party fulfillment, subscriptions, and CRM systems.", href: "/software-development/ecommerce-development" },
  { icon: "💳", title: "Checkout Optimisation & Custom Checkout", desc: "Conversion Rate Optimisation engineering for checkout: reduced field count, address autocomplete, express checkout (Apple Pay, Google Pay, Shop Pay), and Shopify Plus checkout.liquid customisation.", href: "/software-development/ecommerce-development" },
  { icon: "📦", title: "WooCommerce Development", desc: "Custom WooCommerce themes, plugins, and headless WooCommerce builds using the WooCommerce REST API. Advanced product configuration, subscription billing via WooCommerce Subscriptions, and custom tax logic.", href: "/software-development/ecommerce-development" },
  { icon: "🤖", title: "AI-Powered E-Commerce Features", desc: "Personalised product recommendations (AI-driven), AI-powered search (semantic, not keyword), dynamic pricing tools, inventory forecasting, and AI chatbots for e-commerce support — integrated directly into your store.", href: "/software-development/ecommerce-development" },
];

const STATS = [
  { value: 30, suffix: "%", label: "Avg Conversion Rate Uplift", color: "#22c55e" },
  { value: 40, suffix: "+", label: "E-Commerce Stores Built", color: "#3b82f6" },
  { value: 1, suffix: "s", label: "Target Page Load — Core Web Vitals", color: "#ec4899" },
  { value: 90, suffix: "+", label: "Lighthouse Performance Score", color: "#8b5cf6" },
];

const PROCESS = [
  { n: 1, title: "E-Commerce Audit & Strategy", desc: "Analyse current store performance: conversion funnel, page speed, mobile UX, checkout drop-off, and missed revenue opportunities. Prioritised development roadmap delivered with expected CRO impact for each item.", icon: "🔍" },
  { n: 2, title: "Architecture & Platform Decision", desc: "Shopify Liquid vs headless Next.js, Shopify vs WooCommerce, native checkout vs custom — every architectural decision justified against your GMV, growth trajectory, and team capabilities.", icon: "📋" },
  { n: 3, title: "CRO-Informed Development", desc: "Every development decision is backed by CRO principles: product page layouts, image load strategy, cart UX, checkout flow, trust signals, and mobile navigation. A/B test infrastructure set up from day one.", icon: "💻" },
  { n: 4, title: "Launch, A/B Test & Iterate", desc: "Staged launch with traffic split testing, performance monitoring, Hotjar session recording, and a post-launch optimisation sprint. You don't just get a new store — you get a continuously improving revenue engine.", icon: "🚀" },
];

const FAQS = [
  { q: "What is headless commerce and when should I use it?", a: "Headless commerce separates the frontend (Next.js) from the backend commerce engine (Shopify). You get full creative control, faster page loads, and omnichannel capability — without Shopify Liquid limitations. Recommended for brands doing $1M+ GMV where brand experience is a key differentiator." },
  { q: "How much can e-commerce development improve conversion rates?", a: "HotBot Studios clients average 30% conversion rate improvement after a CRO-focused rebuild. Key drivers: page speed (1s faster = 7% CR uplift), checkout friction reduction, mobile-first design, personalisation, social proof placement, and A/B tested layouts." },
  { q: "Can you build custom Shopify apps?", a: "Yes — public and private Shopify apps using Shopify CLI and Remix. Custom apps extend admin functionality, add checkout logic via Shopify Checkout Extensions, or integrate subscriptions via Recharge or Skio." },
  { q: "Shopify vs WooCommerce — which should I choose?", a: "Shopify is easier to manage, has better app ecosystem, and is preferred for DTC brands prioritising speed to market. WooCommerce offers more flexibility for complex product configurations, custom pricing rules, and WordPress content-commerce integration. We work with both and recommend based on your specific requirements." },
  { q: "Do you implement subscription commerce?", a: "Yes — subscription commerce via Recharge, Skio, or Ordergroove for Shopify, and WooCommerce Subscriptions for WooCommerce. Covers subscribe-and-save product options, subscriber portal, churn reduction flows, and subscription analytics dashboard." },
  { q: "How do you integrate e-commerce with our marketing stack?", a: "We connect your store to GA4, Meta Pixel, Google Ads Enhanced Conversions, Klaviyo, Postscript, and your CRM — with server-side tracking for accurate attribution. Product catalogue sync to Meta Commerce Manager and Google Merchant Center is standard." },
];

const RELATED = [
  { title: "AI Automation", href: "/ai-automation", desc: "Add AI product recommendations and chatbots to your store.", icon: "🤖" },
  { title: "Digital Marketing", href: "/marketing-services", desc: "Drive traffic with paid ads, SEO, and email marketing.", icon: "📣" },
  { title: "API Development & Integration", href: "/software-development/api-integrations", desc: "Connect your store to ERP, WMS, and fulfilment systems.", icon: "🔌" },
];

export default function EcommerceDevelopmentPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        label="E-Commerce Development Agency USA"
        title="E-Commerce That Converts, Loads Fast, and Scales"
        subtitle="HotBot Studios builds custom Shopify stores, headless commerce experiences, and AI-powered e-commerce features for US brands. Every pixel is optimised for conversion — not just aesthetics. 30% average CR uplift across client stores."
      />

      {/* ── Definition Block (AEO) ─────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pt-4 pb-2">
        <Reveal>
          <div className="p-5 rounded-2xl" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.12)" }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Headless e-commerce development (definition):</strong> An architecture approach where the e-commerce frontend (the storefront a customer sees) is decoupled from the backend commerce engine (Shopify, WooCommerce) and built with a modern JavaScript framework (Next.js). This allows complete design freedom — no theme template limitations — sub-second page loads via server-side rendering and edge deployment, and omnichannel commerce from a single API layer. In 2026, headless commerce is the preferred architecture for DTC brands above $500K GMV where brand experience and conversion rate are growth levers.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── Infographic: CRO Impact Data ───────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">E-Commerce Development Decisions That Directly Impact Revenue</h2>
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { pct: "7%", label: "conversion rate uplift per 1-second improvement in page load time (Google)", color: "#22c55e" },
                  { pct: "30%", label: "average conversion rate increase after CRO-focused e-commerce rebuild", color: "#3b82f6" },
                  { pct: "68%", label: "of mobile shoppers abandon carts due to poor checkout UX (Baymard 2025)", color: "#ec4899" },
                  { pct: "35%", label: "of e-commerce revenue can be attributed to personalised recommendations (McKinsey)", color: "#8b5cf6" },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-4 rounded-2xl" style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}25` }}>
                    <div className="text-2xl md:text-3xl font-black mb-1" style={{ color: stat.color }}>{stat.pct}</div>
                    <div className="text-slate-400 text-xs leading-snug">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Conversion factors */}
              <p className="text-slate-500 text-xs text-center mb-4 uppercase tracking-wider font-medium">Avg Conversion Rate Impact by Development Investment Area</p>
              <div className="space-y-3">
                {[
                  { label: "Checkout flow simplification", impact: 25, color: "#22c55e" },
                  { label: "Page speed optimisation (sub-1s LCP)", impact: 21, color: "#3b82f6" },
                  { label: "Mobile UX redesign", impact: 18, color: "#ec4899" },
                  { label: "Social proof & trust signal placement", impact: 14, color: "#8b5cf6" },
                  { label: "AI product recommendations", impact: 12, color: "#f59e0b" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-slate-400 text-xs w-52 shrink-0 text-right hidden md:block">{row.label}</span>
                    <div className="flex-1 rounded-full h-5 bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(row.impact / 30) * 100}%`, background: `linear-gradient(90deg, ${row.color}40, ${row.color})` }}>
                        <span className="text-[10px] font-bold text-white hidden md:block">+{row.impact}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs text-center mt-4">Sources: Baymard Institute 2025, Google Web Vitals Research, McKinsey Digital 2025</p>
            </div>
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="E-Commerce Services We Build" columns={3} />
      <ServiceStats stats={STATS} title="E-Commerce Development Results" />
      <ProcessSteps steps={PROCESS} title="Our E-Commerce Development Process" />

      {/* ── Platform Comparison ────────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-10">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">Shopify vs Headless vs WooCommerce — Which is Right for You?</h2>
          <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(34,197,94,0.08)" }}>
                  <th className="text-left p-4 text-slate-300 font-semibold">Factor</th>
                  <th className="text-center p-4 text-green-400 font-semibold">Shopify Liquid</th>
                  <th className="text-center p-4 text-blue-400 font-semibold">Headless (Next.js)</th>
                  <th className="text-center p-4 text-slate-400 font-semibold">WooCommerce</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Speed to launch", "✅ Fastest", "⚠️ 4–8 weeks more", "✅ Fast"],
                  ["Design flexibility", "⚠️ Theme-limited", "✅ Full control", "⚠️ Plugin-dependent"],
                  ["Page performance", "⚠️ Theme-dependent", "✅ Sub-1s LCP", "⚠️ Plugin-dependent"],
                  ["App ecosystem", "✅ 8,000+ apps", "✅ Via Shopify API", "✅ 55,000+ plugins"],
                  ["Best GMV range", "< $2M/yr", "> $500K/yr", "Any"],
                  ["Content + Commerce", "⚠️ Limited", "⚠️ Via CMS", "✅ WordPress native"],
                ].map(([factor, shopify, headless, woo], i) => (
                  <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                    <td className="p-4 text-slate-300 font-medium">{factor}</td>
                    <td className="p-4 text-center text-green-300">{shopify}</td>
                    <td className="p-4 text-center text-blue-300">{headless}</td>
                    <td className="p-4 text-center text-slate-400">{woo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      {/* ── CRO Engineering Approach ───────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-8">Why We Build for Conversion, Not Just Aesthetics</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: "⚡", title: "Performance = Revenue", desc: "Every 100ms of page load time costs conversion rate. We engineer for Lighthouse 90+ scores and sub-1s LCP using Next.js server rendering, image optimisation, and Vercel edge delivery — because faster stores earn more.", color: "#22c55e" },
            { icon: "📱", title: "Mobile-First Always", desc: "68% of US e-commerce traffic is mobile — yet most conversion rate problems are mobile UX problems. We design and develop mobile-first, testing on real devices across iOS and Android before any desktop work.", color: "#3b82f6" },
            { icon: "🧪", title: "A/B Testing Infrastructure", desc: "Every store we build includes A/B testing capability (via Optimizely or Google Optimize) so you can continuously improve product page layouts, CTAs, and checkout flows based on data — not opinions.", color: "#8b5cf6" },
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
            <h2 className="text-lg font-bold text-white mb-4">Key Takeaways — E-Commerce Development for US Brands</h2>
            <ul className="space-y-2">
              {[
                "HotBot Studios clients average 30% conversion rate improvement after a CRO-focused e-commerce rebuild.",
                "Headless commerce (Next.js + Shopify) delivers sub-1s page loads and full design freedom for DTC brands above $500K GMV.",
                "Every 1-second page load improvement generates approximately 7% higher conversion rate (Google research).",
                "68% of mobile shoppers abandon carts due to poor checkout UX — checkout optimisation is our highest-ROI service.",
                "AI-powered product recommendations account for up to 35% of e-commerce revenue (McKinsey).",
                "We integrate your store with GA4, Meta Pixel, Klaviyo, Google Merchant Center, and your 3PL/ERP for full visibility.",
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
        title="Ready to Build an E-Commerce Store That Actually Converts?"
        subtitle="Share your current store, GMV, and the conversion problems you're facing. We'll audit, architect, and build a store that earns more from the same traffic. Free e-commerce audit included."
        formType="get-started"
      />
    </>
  );
}
