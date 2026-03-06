import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedGrid } from "@/components/layout/AnimatedGrid";
import { ProgressiveBlur } from "@/components/layout/ProgressiveBlur";
import { HotBotChat } from "@/components/chat/HotBotChat";
import { FormModal } from "@/components/forms/FormModal";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hotbotstudios.com";
// G-5CNWV5X1KC is the production GA4 property — override via NEXT_PUBLIC_GA_ID if needed
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-5CNWV5X1KC";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AI Automation & Digital Marketing Agency for US Businesses | HotBot Studios",
    template: "%s | HotBot Studios",
  },
  description:
    "HotBot Studios is America's full-stack growth agency — custom AI agents, n8n automation, SEO, Google Ads, content production, software development, PR, and UI/UX design for US businesses. 42+ clients. Trusted by US SMBs and scale-ups.",
  keywords: [
    "AI automation agency USA",
    "digital marketing agency USA",
    "custom AI agents for business",
    "n8n workflow automation",
    "SEO agency USA",
    "AI chatbot development USA",
    "growth agency US businesses",
    "software development agency USA",
    "content production agency",
    "public relations agency USA",
    "UI UX design agency",
    "fractional CMO USA",
    "marketing consulting USA",
    "voice AI business USA",
    "HotBot Studios",
  ],
  authors: [{ name: "HotBot Studios", url: SITE_URL }],
  creator: "HotBot Studios",
  publisher: "HotBot Studios",
  category: "AI Automation & Digital Marketing Agency",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "HotBot Studios | AI Automation & Digital Marketing Agency USA",
    description:
      "Full-service growth infrastructure for US businesses — AI, marketing, content, software, PR, and design in one team.",
    url: SITE_URL,
    siteName: "HotBot Studios",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "HotBot Studios — AI Automation & Digital Marketing Agency",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HotBot Studios | AI Automation & Digital Marketing Agency USA",
    description:
      "Full-service growth infrastructure for US businesses — AI, marketing, content, software, PR, and design in one team.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

// JSON-LD: Organization schema (E-E-A-T signals for Google + LLMs)
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "HotBot Studios",
  url: SITE_URL,
  logo: `${SITE_URL}/logos/hotbot-logo.svg`,
  image: `${SITE_URL}/og-image.svg`,
  description:
    "HotBot Studios is America's full-stack growth agency — custom AI agents, n8n workflow automation, SEO, Google Ads, content production, software development, PR, and UI/UX design for US businesses. 42+ clients.",
  foundingDate: "2023",
  numberOfEmployees: { "@type": "QuantitativeValue", minValue: 10, maxValue: 50 },
  areaServed: { "@type": "Country", name: "United States" },
  address: {
    "@type": "PostalAddress",
    addressLocality: "New York",
    addressRegion: "NY",
    addressCountry: "US",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-9700001534",
    contactType: "customer service",
    email: "hello@hotbotstudios.com",
    availableLanguage: "English",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "HotBot Studios Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI Automation", url: `${SITE_URL}/ai-automation` } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Digital Marketing", url: `${SITE_URL}/digital-marketing` } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Content Production", url: `${SITE_URL}/content-studio` } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Software Development", url: `${SITE_URL}/software-development` } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Public Relations", url: `${SITE_URL}/public-relations` } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "UI/UX Design", url: `${SITE_URL}/ui-ux-design` } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Marketing Consulting", url: `${SITE_URL}/marketing-consulting` } },
    ],
  },
  sameAs: [],
};

// JSON-LD: WebSite schema with sitelinks search box
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "HotBot Studios",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics 4 — G-5CNWV5X1KC */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { page_path: window.location.pathname });
          `}
        </Script>

        {/* Structured Data — Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        {/* Structured Data — WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body>
        <div className="min-h-screen relative">
          <AnimatedGrid />
          <Navbar />
          <main className="relative">{children}</main>
          <Footer />
        </div>
        <ProgressiveBlur />
        <FormModal />
        <HotBotChat />
      </body>
    </html>
  );
}
