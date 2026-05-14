import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact HotBot Studios | Get a Free Consultation",
  description:
    "Reach out to HotBot Studios for a free consultation. Contact our AI automation and digital marketing experts in New York. We respond within 24 hours.",
  keywords: [
    "contact HotBot Studios",
    "free marketing consultation USA",
    "AI agency contact",
    "digital marketing agency New York",
    "hire AI automation agency",
  ],
  openGraph: {
    title: "Contact HotBot Studios | Free Consultation",
    description:
      "Talk to our team about AI automation, digital marketing, content, software, and PR. Free strategy call available.",
    url: "https://hotbotstudios.com/contact",
  },
  alternates: {
    canonical: "https://hotbotstudios.com/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
