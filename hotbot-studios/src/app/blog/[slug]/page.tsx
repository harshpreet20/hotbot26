import type { Metadata } from "next";
import Link from "next/link";
import { CTASection } from "@/components/sections/CTASection";

interface PageProps {
  params: { slug: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  return {
    title: `Blog | HotBot Studios`,
    description: `Read our latest insights on ${params.slug.replace(/-/g, " ")}.`,
  };
}

export default function BlogPostPage({ params }: PageProps) {
  return (
    <>
      <section className="relative z-10 pt-32 pb-8 px-6 max-w-3xl mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-2 text-slate-400 text-sm hover:text-white transition-colors mb-8">
          ← Back to Blog
        </Link>
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
          style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#93c5fd" }}
        >
          Article
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
          {params.slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </h1>
        <p className="text-slate-400 text-sm mb-8">Published by HotBot Studios</p>
        <div className="prose prose-invert max-w-none">
          <p className="text-slate-300 text-lg leading-relaxed">
            This article is coming soon. In the meantime, explore our services or get in touch with our team to discuss how we can help your business grow.
          </p>
        </div>
      </section>
      <CTASection title="Ready to Transform Your Business?" subtitle="Talk to our team about your specific goals and challenges." />
    </>
  );
}
