import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import SiteTracker from "@/components/SiteTracker";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-primary",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hotbotstudios.com";
// G-5CNWV5X1KC is the production GA4 property - override via NEXT_PUBLIC_GA_ID if needed
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-5CNWV5X1KC";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:  "HotBot Studios | AI Automation & Digital Marketing Agency for US Businesses",
    template: "%s | HotBot Studios",
  },
  description:
    "HotBot Studios is America's full-stack growth agency — custom AI agents, performance marketing, ecommerce services, and software development under one roof. 42+ clients served. Book your free strategy call today.",
  keywords: [
    "AI automation agency USA",
    "digital marketing agency USA",
    "custom AI agents for business",
    "AI chatbot development USA",
    "n8n workflow automation",
    "ecommerce services agency",
    "performance marketing agency USA",
    "software development agency USA",
    "growth agency US businesses",
    "SEO agency USA",
    "Google Ads agency USA",
    "content production agency",
    "public relations agency USA",
    "UI UX design agency",
    "fractional CMO USA",
    "marketing consulting USA",
    "voice AI business USA",
    "free strategy call marketing",
    "HotBot Studios",
  ],
  authors:   [{ name: "HotBot Studios", url: SITE_URL }],
  creator:   "HotBot Studios",
  publisher: "HotBot Studios",
  category:  "AI Automation & Digital Marketing Agency",
  openGraph: {
    type:        "website",
    locale:      "en_US",
    title:       "HotBot Studios | Full-Service Growth Infrastructure for US Businesses",
    description:
      "AI agents, performance marketing, ecommerce, and software dev — all in one team. 42+ clients. Pioneering Digital Outreach.",
    url:      SITE_URL,
    siteName: "HotBot Studios",
    // images omitted — Next.js auto-fills from app/opengraph-image.tsx
  },
  twitter: {
    card:        "summary_large_image",
    title:       "HotBot Studios | Full-Service Growth Infrastructure for US Businesses",
    description:
      "AI agents, performance marketing, ecommerce, and software dev — all in one team. 42+ clients. Pioneering Digital Outreach.",
    // images omitted — inherits from openGraph (opengraph-image.tsx)
  },
  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:               true,
      follow:              true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },
  verification: {
    google: "yARlP-A-QY90Nn3j4wuITug9wXMXUb08AIzTXYWrk1I",
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon:    "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

// JSON-LD: Organization schema (E-E-A-T signals for Google + LLMs)
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "HotBot Studios",
  url: SITE_URL,
  logo: `${SITE_URL}/logos/brand-logo.png`,
  image: `${SITE_URL}/opengraph-image`,
  description:
    "HotBot Studios is America's full-stack growth agency - custom AI agents, n8n workflow automation, SEO, Google Ads, content production, software development, PR, and UI/UX design for US businesses. 42+ clients.",
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
    email: "info@hotbotstudios.com",
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
    <html lang="en" className={jakartaSans.variable}>
      <head>
        <meta name="theme-color" content="#0a0e1a" />
        <meta name="color-scheme" content="dark" />

        {/* Performance: DNS prefetch for analytics — fonts are self-hosted via next/font */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* LCP: preload logo so browser fetches it in parallel with HTML parse.
            The Navbar is a client component so Next.js cannot inject this automatically. */}
        <link rel="preload" as="image" href="/logos/brand-logo.png" fetchPriority="high" />

        {/* Google Analytics 4 — lazyOnload keeps it off the critical path */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="lazyOnload"
        />
        <Script id="gtag-init" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { page_path: window.location.pathname, anonymize_ip: true });
          `}
        </Script>

        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        {/* Structured Data - WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body style={{ backgroundColor: "#0a0e1a" }}>
        {children}
        <Analytics />
        <SiteTracker />
      </body>
    </html>
  );
}
