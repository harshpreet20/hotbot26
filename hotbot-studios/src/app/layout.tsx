import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedGrid } from "@/components/layout/AnimatedGrid";
import { ProgressiveBlur } from "@/components/layout/ProgressiveBlur";
import { HotBotChat } from "@/components/chat/HotBotChat";
import { FormModal } from "@/components/forms/FormModal";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://hotbotstudios.com"),
  title: "HotBot Studios | AI Automation & Digital Marketing Agency USA",
  description:
    "Full-service digital marketing, AI automation, content production, software development, public relations, and UI/UX design for US businesses.",
  keywords:
    "AI automation agency USA, digital marketing services US, chatbot development, SEO agency",
  authors: [{ name: "HotBot Studios" }],
  openGraph: {
    type: "website",
    title: "HotBot Studios",
    description: "Full-service growth infrastructure for US businesses.",
    url: "https://hotbotstudios.com",
    siteName: "HotBot Studios",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HotBot Studios",
    description: "Full-service growth infrastructure for US businesses.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
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
