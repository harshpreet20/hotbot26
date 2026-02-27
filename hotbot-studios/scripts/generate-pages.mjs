#!/usr/bin/env node
// scripts/generate-pages.mjs
// Registry-driven deterministic page generator for HotBot Studios
// Usage: node scripts/generate-pages.mjs

import { readFileSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

// ─── Helpers ────────────────────────────────────────────────────────────────

function esc(str) {
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");
}

function jsonInline(obj) {
  return JSON.stringify(obj, null, 2)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

function ensureDir(filePath) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

// ─── Product Page Template ───────────────────────────────────────────────────

function buildProductPage(p) {
  const { slug, name, parentService, parentLabel, schemaType, accentColor, seo, content, related, cta } = p;
  const { features, useCases, stats, process, faqs, takeaways, kpis, definitionTerm, definition, subtitle } = content;

  const schema = {
    "@context": "https://schema.org",
    "@type": schemaType || "SoftwareApplication",
    name: seo.h1 || name,
    description: seo.description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/OnlineOnly" },
    provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
    url: `https://hotbotstudios.com/products/${slug}`,
    featureList: features.map((f) => f.title).join(", "),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
      { "@type": "ListItem", position: 2, name: parentLabel, item: `https://hotbotstudios.com${parentService}` },
      { "@type": "ListItem", position: 3, name: name, item: `https://hotbotstudios.com/products/${slug}` },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  const keywordsArray = seo.keywords.map((k) => `    "${esc(k)}"`).join(",\n");

  const featuresCode = features
    .map(
      (f) =>
        `        <div key="${esc(f.title)}" className="p-5 rounded-2xl border" style={{ background: "${esc(f.color)}10", borderColor: "${esc(f.color)}25" }}>
          <div className="text-2xl mb-3">{String.raw\`${esc(f.icon)}\`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw\`${esc(f.title)}\`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw\`${esc(f.desc)}\`}</p>
        </div>`
    )
    .join("\n");

  const useCasesCode = useCases
    .map(
      (u) =>
        `        <div key="${esc(u.segment)}" className="p-6 rounded-2xl border" style={{ background: "${esc(u.color)}08", borderColor: "${esc(u.color)}20" }}>
          <h3 className="font-semibold mb-2" style={{ color: "${esc(u.color)}" }}>{String.raw\`${esc(u.segment)}\`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw\`${esc(u.challenge)}\`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw\`${esc(u.solution)}\`}</p>
        </div>`
    )
    .join("\n");

  const statsArray = stats
    .map(
      (s) =>
        `    { value: ${s.value}, suffix: "${esc(s.suffix)}", label: "${esc(s.label)}", color: "${esc(s.color)}" }`
    )
    .join(",\n");

  const processArray = process
    .map(
      (s) =>
        `    { n: ${s.n}, title: "${esc(s.title)}", desc: "${esc(s.desc)}", icon: "${esc(s.icon || "📍")}" }`
    )
    .join(",\n");

  const faqsArray = faqs
    .map((f) => `    { q: "${esc(f.q)}", a: "${esc(f.a)}" }`)
    .join(",\n");

  const relatedArray = related
    .map(
      (r) =>
        `    { title: "${esc(r.title)}", href: "${esc(r.href)}", desc: "${esc(r.desc)}", icon: "${esc(r.icon || "")}" }`
    )
    .join(",\n");

  const kpisCode = kpis
    .map((k) => `          <li className="text-slate-300 text-sm">{String.raw\`${esc(k)}\`}</li>`)
    .join("\n");

  const takeawaysCode = takeaways
    .map(
      (t) =>
        `          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw\`${esc(t)}\`}</span>
          </li>`
    )
    .join("\n");

  return `import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";
import { Reveal } from "@/components/shared/Reveal";
import Link from "next/link";

export const metadata: Metadata = {
  title: "${esc(seo.title)}",
  description: "${esc(seo.description)}",
  keywords: [
${keywordsArray}
  ],
  openGraph: {
    title: "${esc(seo.title)}",
    description: "${esc(seo.description)}",
    url: "https://hotbotstudios.com/products/${esc(slug)}",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "${esc(seo.h1)}" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "${esc(seo.title)}",
    description: "${esc(seo.description)}",
  },
  alternates: { canonical: "https://hotbotstudios.com/products/${esc(slug)}" },
};

const productSchema = ${jsonInline(schema)};

const breadcrumbSchema = ${jsonInline(breadcrumbSchema)};

const faqSchema = ${jsonInline(faqSchema)};

const STATS = [
${statsArray}
];

const PROCESS = [
${processArray}
];

const FAQS = [
${faqsArray}
];

const RELATED = [
${relatedArray}
];

export default function ${slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase()).replace(/^./, (c) => c.toUpperCase())}Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Breadcrumb */}
      <nav className="pt-24 pb-0 px-6 max-w-5xl mx-auto">
        <ol className="flex items-center gap-2 text-xs text-slate-500">
          <li><Link href="/" className="hover:text-slate-300 transition-colors">Home</Link></li>
          <li className="text-slate-700">/</li>
          <li><Link href="${esc(parentService)}" className="hover:text-slate-300 transition-colors">${esc(parentLabel)}</Link></li>
          <li className="text-slate-700">/</li>
          <li className="text-slate-400">${esc(name)}</li>
        </ol>
      </nav>

      <PageHeader
        label="${esc(seo.label)}"
        title="${esc(seo.h1)}"
        subtitle="${esc(subtitle)}"
      />

      {/* AEO Definition Block */}
      <Reveal>
        <section className="relative z-10 py-8 px-6 max-w-3xl mx-auto">
          <div
            className="p-6 rounded-2xl border"
            style={{ background: "rgba(59,130,246,0.04)", borderColor: "rgba(59,130,246,0.15)" }}
          >
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">${esc(definitionTerm)}:</strong>{" "}
              ${esc(definition)}
            </p>
          </div>
        </section>
      </Reveal>

      {/* Stats */}
      <ServiceStats stats={STATS} title="By the Numbers" />

      {/* Features Grid */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Core Capabilities</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
${featuresCode}
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Industry Use Cases</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
${useCasesCode}
        </div>
      </section>

      {/* Process */}
      <ProcessSteps steps={PROCESS} title="How We Deploy" />

      {/* KPIs */}
      <Reveal>
        <section className="relative z-10 py-16 px-6 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">KPIs We Track</h2>
          <div
            className="p-8 rounded-2xl border"
            style={{ background: "rgba(139,92,246,0.04)", borderColor: "rgba(139,92,246,0.15)" }}
          >
            <ul className="space-y-3 list-none">
${kpisCode}
            </ul>
          </div>
        </section>
      </Reveal>

      {/* FAQ */}
      <FAQSection faqs={FAQS} />

      {/* Key Takeaways */}
      <Reveal>
        <section className="relative z-10 py-16 px-6 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">Key Takeaways</h2>
          <ul className="space-y-4">
${takeawaysCode}
          </ul>
        </section>
      </Reveal>

      {/* Related Services */}
      <RelatedServices services={RELATED} />

      {/* CTA */}
      <CTASection
        title="${esc(cta.title)}"
        subtitle="${esc(cta.subtitle)}"
        formType="${esc(cta.formType)}"
      />
    </>
  );
}
`;
}

// ─── Sub-Service Page Template ──────────────────────────────────────────────

function buildSubServicePage(p) {
  const { slug, name, parentService, parentLabel, schemaType, accentColor, seo, content, related, cta } = p;
  const { features, useCases, stats, process, faqs, takeaways, kpis, definitionTerm, definition, subtitle } = content;

  const schema = {
    "@context": "https://schema.org",
    "@type": schemaType || "Service",
    name: seo.h1 || name,
    description: seo.description,
    provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
    serviceType: seo.label,
    areaServed: { "@type": "Country", name: "United States" },
    url: `https://hotbotstudios.com${parentService}/${slug}`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
      { "@type": "ListItem", position: 2, name: parentLabel, item: `https://hotbotstudios.com${parentService}` },
      { "@type": "ListItem", position: 3, name: name, item: `https://hotbotstudios.com${parentService}/${slug}` },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  const keywordsArray = seo.keywords.map((k) => `    "${esc(k)}"`).join(",\n");

  const featuresCode = features
    .map(
      (f) =>
        `        <div key="${esc(f.title)}" className="p-5 rounded-2xl border" style={{ background: "${esc(f.color)}10", borderColor: "${esc(f.color)}25" }}>
          <div className="text-2xl mb-3">{String.raw\`${esc(f.icon)}\`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw\`${esc(f.title)}\`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw\`${esc(f.desc)}\`}</p>
        </div>`
    )
    .join("\n");

  const useCasesCode = useCases
    .map(
      (u) =>
        `        <div key="${esc(u.segment)}" className="p-6 rounded-2xl border" style={{ background: "${esc(u.color)}08", borderColor: "${esc(u.color)}20" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "${esc(u.color)}" }}>{String.raw\`${esc(u.segment)}\`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw\`${esc(u.challenge)}\`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw\`${esc(u.solution)}\`}</p>
        </div>`
    )
    .join("\n");

  const statsArray = stats
    .map((s) => `    { value: ${s.value}, suffix: "${esc(s.suffix)}", label: "${esc(s.label)}", color: "${esc(s.color)}" }`)
    .join(",\n");

  const processArray = process
    .map((s) => `    { n: ${s.n}, title: "${esc(s.title)}", desc: "${esc(s.desc)}", icon: "${esc(s.icon || "📍")}" }`)
    .join(",\n");

  const faqsArray = faqs.map((f) => `    { q: "${esc(f.q)}", a: "${esc(f.a)}" }`).join(",\n");

  const relatedArray = related
    .map((r) => `    { title: "${esc(r.title)}", href: "${esc(r.href)}", desc: "${esc(r.desc)}", icon: "${esc(r.icon || "")}" }`)
    .join(",\n");

  const kpisCode = kpis
    .map((k) => `          <li className="text-slate-300 text-sm">{String.raw\`${esc(k)}\`}</li>`)
    .join("\n");

  const takeawaysCode = takeaways
    .map(
      (t) =>
        `          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw\`${esc(t)}\`}</span>
          </li>`
    )
    .join("\n");

  const componentName = slug
    .replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    .replace(/^./, (c) => c.toUpperCase()) + "Page";

  return `import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";
import { Reveal } from "@/components/shared/Reveal";
import Link from "next/link";

export const metadata: Metadata = {
  title: "${esc(seo.title)}",
  description: "${esc(seo.description)}",
  keywords: [
${keywordsArray}
  ],
  openGraph: {
    title: "${esc(seo.title)}",
    description: "${esc(seo.description)}",
    url: "https://hotbotstudios.com${esc(parentService)}/${esc(slug)}",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "${esc(seo.h1)}" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "${esc(seo.title)}",
    description: "${esc(seo.description)}",
  },
  alternates: { canonical: "https://hotbotstudios.com${esc(parentService)}/${esc(slug)}" },
};

const serviceSchema = ${jsonInline(schema)};

const breadcrumbSchema = ${jsonInline(breadcrumbSchema)};

const faqSchema = ${jsonInline(faqSchema)};

const STATS = [
${statsArray}
];

const PROCESS = [
${processArray}
];

const FAQS = [
${faqsArray}
];

const RELATED = [
${relatedArray}
];

export default function ${componentName}() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Breadcrumb */}
      <nav className="pt-24 pb-0 px-6 max-w-5xl mx-auto">
        <ol className="flex items-center gap-2 text-xs text-slate-500">
          <li><Link href="/" className="hover:text-slate-300 transition-colors">Home</Link></li>
          <li className="text-slate-700">/</li>
          <li><Link href="${esc(parentService)}" className="hover:text-slate-300 transition-colors">${esc(parentLabel)}</Link></li>
          <li className="text-slate-700">/</li>
          <li className="text-slate-400">${esc(name)}</li>
        </ol>
      </nav>

      <PageHeader
        label="${esc(seo.label)}"
        title="${esc(seo.h1)}"
        subtitle="${esc(subtitle)}"
      />

      {/* AEO Definition Block */}
      <Reveal>
        <section className="relative z-10 py-8 px-6 max-w-3xl mx-auto">
          <div
            className="p-6 rounded-2xl border"
            style={{ background: "${esc(accentColor)}08", borderColor: "${esc(accentColor)}20" }}
          >
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">${esc(definitionTerm)}:</strong>{" "}
              ${esc(definition)}
            </p>
          </div>
        </section>
      </Reveal>

      {/* Stats */}
      <ServiceStats stats={STATS} title="By the Numbers" />

      {/* Features Grid */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">What We Deliver</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
${featuresCode}
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Who This Is For</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
${useCasesCode}
        </div>
      </section>

      {/* Process */}
      <ProcessSteps steps={PROCESS} title="Our Engagement Process" />

      {/* KPIs */}
      <Reveal>
        <section className="relative z-10 py-16 px-6 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">KPIs We Report On</h2>
          <div
            className="p-8 rounded-2xl border"
            style={{ background: "${esc(accentColor)}05", borderColor: "${esc(accentColor)}18" }}
          >
            <ul className="space-y-3 list-none">
${kpisCode}
            </ul>
          </div>
        </section>
      </Reveal>

      {/* FAQ */}
      <FAQSection faqs={FAQS} />

      {/* Key Takeaways */}
      <Reveal>
        <section className="relative z-10 py-16 px-6 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">Key Takeaways</h2>
          <ul className="space-y-4">
${takeawaysCode}
          </ul>
        </section>
      </Reveal>

      {/* Related Services */}
      <RelatedServices services={RELATED} />

      {/* CTA */}
      <CTASection
        title="${esc(cta.title)}"
        subtitle="${esc(cta.subtitle)}"
        formType="${esc(cta.formType)}"
      />
    </>
  );
}
`;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const created = [];

  // Batch 1: Products
  const productsPath = join(__dirname, "registry", "products.json");
  if (existsSync(productsPath)) {
    const products = JSON.parse(readFileSync(productsPath, "utf-8"));
    console.log(`\nGenerating ${products.length} product pages...`);

    for (const product of products) {
      const outPath = join(ROOT, "src", "app", "products", product.slug, "page.tsx");
      ensureDir(outPath);
      const content = buildProductPage(product);
      writeFileSync(outPath, content, "utf-8");
      created.push(outPath.replace(ROOT, ""));
      console.log(`  ✓ Created: /products/${product.slug}/page.tsx`);
    }
  } else {
    console.warn("  ⚠ No products.json found at", productsPath);
  }

  // Batches 2-7: Sub-service pages
  const subservicesPath = join(__dirname, "registry", "subservices.json");
  if (existsSync(subservicesPath)) {
    const subservices = JSON.parse(readFileSync(subservicesPath, "utf-8"));
    console.log(`\nGenerating ${subservices.length} sub-service pages...`);

    for (const sub of subservices) {
      const parentSlug = sub.parentService.replace(/^\//, "");
      const outPath = join(ROOT, "src", "app", parentSlug, sub.slug, "page.tsx");
      ensureDir(outPath);
      const content = buildSubServicePage(sub);
      writeFileSync(outPath, content, "utf-8");
      created.push(outPath.replace(ROOT, ""));
      console.log(`  ✓ Created: ${sub.parentService}/${sub.slug}/page.tsx`);
    }
  } else {
    console.warn("  ⚠ No subservices.json found at", subservicesPath);
  }

  console.log(`\nDone. ${created.length} files generated.\n`);
  created.forEach((f) => console.log(" ", f));
}

main().catch((err) => {
  console.error("Generator failed:", err);
  process.exit(1);
});
