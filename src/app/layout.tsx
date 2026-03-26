import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedGrid } from "@/components/layout/AnimatedGrid";
import { ProgressiveBlur } from "@/components/layout/ProgressiveBlur";
import { HotBotChat } from "@/components/chat/HotBotChat";
import { FormModal } from "@/components/forms/FormModal";
import { SessionProvider } from "@/components/providers/SessionProvider";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hotbotstudios.com";
// G-5CNWV5X1KC is the production GA4 property — override via NEXT_PUBLIC_GA_ID if needed
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-5CNWV5X1KC";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "HotBot Studios | AI Automation & Digital Marketing Agency USA",
    template: "%s | HotBot Studios",
  },
  description:
    "HotBot Studios is a full-service AI automation and digital marketing agency helping US businesses grow with chatbots, SEO, content, software development, PR, and UI/UX design.",
  keywords: [
    "AI automation agency USA",
    "digital marketing agency US",
    "chatbot development",
    "SEO agency USA",
    "n8n automation",
    "AI chatbot for business",
    "marketing agency New York",
    "software development agency",
    "content production agency",
    "public relations agency USA",
  ],
  authors: [{ name: "HotBot Studios", url: SITE_URL }],
  creator: "HotBot Studios",
  publisher: "HotBot Studios",
  category: "Digital Marketing & AI Automation",
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

// JSON-LD: Organization schema
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "HotBot Studios",
  url: SITE_URL,
  logo: `${SITE_URL}/logos/hotbot-logo.svg`,
  description:
    "Full-service AI automation and digital marketing agency for US businesses.",
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
        <SessionProvider>
          <div className="min-h-screen relative">
            <AnimatedGrid />
            <Navbar />
            <main className="relative">{children}</main>
            <Footer />
          </div>
          <ProgressiveBlur />
          <FormModal />
          <HotBotChat />
        </SessionProvider>
      </body>
    </html>
  );
}
