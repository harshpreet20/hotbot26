import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";

export const metadata: Metadata = {
  title: "E-Commerce Development Agency USA — Headless Shopify & Custom Checkout | HotBot Studios",
  description:
    "HotBot Studios builds high-performance headless e-commerce stores with Next.js and Shopify for US brands. Custom checkout flows, product configurators, and CRO-engineered UX. Free e-commerce scoping call.",
  keywords: [
    "ecommerce development agency USA",
    "Shopify development agency USA",
    "headless ecommerce development USA",
    "Next.js Shopify development",
    "custom ecommerce development USA",
    "WooCommerce development USA",
    "ecommerce CRO development USA",
    "custom checkout development USA",
  ],
  alternates: { canonical: "https://hotbotstudios.com/software-development/ecommerce-development" },
  openGraph: {
    title: "E-Commerce Development Agency USA — Headless Shopify & Custom Checkout | HotBot Studios",
    description: "High-performance headless e-commerce with Next.js and Shopify. Custom checkout flows and CRO-engineered UX for US brands.",
    url: "https://hotbotstudios.com/software-development/ecommerce-development",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "E-Commerce Development",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "E-Commerce Development and Optimisation",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Custom e-commerce development using headless Next.js with Shopify or WooCommerce for US brands. CRO-engineered checkout flows, product configurators, and multi-channel integrations.",
  url: "https://hotbotstudios.com/software-development/ecommerce-development",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Software Development", item: "https://hotbotstudios.com/software-development" },
    { "@type": "ListItem", position: 3, name: "E-Commerce Development", item: "https://hotbotstudios.com/software-development/ecommerce-development" },
  ],
};

const CONTENT = [
  {
    heading: "The Performance Gap Between Template Stores and Custom E-Commerce",
    body: "Shopify themes and WooCommerce templates are designed to be good enough for the median store — which means they are optimised for the average product catalogue, the average customer journey, and the average checkout conversion rate. If your e-commerce business has specific requirements — complex product configuration, subscription and bundling logic, B2B pricing tiers, custom loyalty mechanics, or a checkout experience that differentiates your brand — template limitations become revenue limitations. A one-second improvement in page load time translates to a 7% improvement in conversion rate on e-commerce stores, according to Google's own research. Custom-built headless e-commerce on Next.js, with server-side rendering and edge delivery, routinely achieves Lighthouse performance scores of 95 or above — compared to 40 to 60 for the average theme-based Shopify store loaded with apps.",
    color: "#f59e0b",
  },
  {
    heading: "Headless Commerce: Next.js Frontend, Shopify or WooCommerce Backend",
    body: "Headless commerce separates the customer-facing storefront (the frontend) from the commerce engine (inventory, orders, payments, fulfilment) — using the Shopify or WooCommerce API as the backend while building a fully custom Next.js frontend that loads at edge speed and can be designed without any theme constraints. The result is the best of both worlds: Shopify's reliable, battle-tested commerce infrastructure (inventory management, Shopify Payments, Shopify Fulfilment, the Partner ecosystem) combined with a frontend that behaves exactly the way your brand and your customers need it to. HotBot Studios builds headless Shopify storefronts using the Shopify Storefront API and Shopify Hydrogen patterns, and headless WooCommerce storefronts using the WooCommerce REST API — both deployed on Vercel for global edge performance.",
    color: "#ec4899",
  },
  {
    heading: "Checkout Optimisation: Where Most E-Commerce Revenue Is Lost",
    body: "The industry average checkout abandonment rate is 70% — meaning seven out of ten customers who add an item to their cart never complete a purchase. The causes are well-documented: too many form fields, surprise shipping costs revealed only at checkout, lack of trust signals at the payment step, a checkout flow that requires account creation, and a mobile checkout experience that is frustrating to complete. HotBot Studios builds custom checkout flows engineered around conversion: guest checkout as the default path, address autocomplete with Google Places API, real-time shipping cost calculation, trust badges and security indicators positioned at the payment step, one-click upsells and order bumps integrated natively, and a mobile checkout layout tested on actual devices rather than simulated in browser DevTools. Every checkout we build is instrumented with session recording and funnel analytics so you can see exactly where customers drop off.",
    color: "#3b82f6",
  },
  {
    heading: "Integrations: Inventory, Payments, Shipping, and Marketing Automation",
    body: "A high-performing e-commerce store is a hub of integrations — and the quality of those integrations directly affects operational efficiency and customer experience. HotBot Studios connects your e-commerce platform to the tools your business runs on: inventory management systems (TradeGecko, Linnworks, Cin7) for real-time stock sync across channels; third-party logistics (3PL) providers and shipping carriers (FedEx, UPS, ShipStation) for automated fulfilment and tracking updates; email and SMS marketing platforms (Klaviyo, Postscript) with segmented flows triggered by purchase behaviour; and loyalty and referral programmes (Smile.io, ReferralCandy) integrated natively into the checkout and post-purchase experience. We also build custom Shopify apps for brands that need functionality the app store cannot provide — bespoke product configurators, complex pricing rules, B2B wholesale portals, and multi-location inventory management.",
    color: "#8b5cf6",
  },
];

export default function EcommerceDevelopmentPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <PageHeader
        label="E-Commerce Development"
        title="E-Commerce That Converts — Not Just a Store That Exists"
        subtitle="Headless Next.js storefronts with Shopify or WooCommerce backends — CRO-engineered checkout flows, edge performance, and custom integrations for US e-commerce brands ready to grow beyond their template."
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
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free E-Commerce Audit & Proposal</h2>
            <p className="text-slate-400">Share your current store URL and your biggest conversion or performance challenge. We will respond with an audit and a proposal within 24 hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="software-ecommerce"
            accentColor="#f59e0b"
            title="Start Your E-Commerce Project"
            subtitle="No obligation. Share your platform, your product catalogue, and your key goals and we will scope the build."
          />
        </Reveal>
      </section>
    </>
  );
}
