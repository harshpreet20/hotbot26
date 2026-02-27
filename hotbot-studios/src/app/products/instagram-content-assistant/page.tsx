import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";
import { Reveal } from "@/components/shared/Reveal";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Instagram Content Assistant — AI Caption and Content Generator for Brands | HotBot Studios",
  description: "Generate on-brand Instagram captions, hashtag sets, and Reels hooks in under 60 seconds. Fine-tuned to your brand voice. Reduces content creation time by 80 percent. For small businesses, brands, and creators.",
  keywords: [
    "Instagram caption generator for small business",
    "AI content tool for Instagram USA",
    "Reels hook generator AI",
    "Instagram hashtag strategy tool",
    "AI social media content creator",
    "automated Instagram content for brands",
    "Instagram content calendar AI",
    "caption generator for e-commerce brands"
  ],
  openGraph: {
    title: "Instagram Content Assistant — AI Caption and Content Generator for Brands | HotBot Studios",
    description: "Generate on-brand Instagram captions, hashtag sets, and Reels hooks in under 60 seconds. Fine-tuned to your brand voice. Reduces content creation time by 80 percent. For small businesses, brands, and creators.",
    url: "https://hotbotstudios.com/products/instagram-content-assistant",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Instagram Content Assistant: AI-Generated Captions and Hooks That Match Your Brand Voice" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Content Assistant — AI Caption and Content Generator for Brands | HotBot Studios",
    description: "Generate on-brand Instagram captions, hashtag sets, and Reels hooks in under 60 seconds. Fine-tuned to your brand voice. Reduces content creation time by 80 percent. For small businesses, brands, and creators.",
  },
  alternates: { canonical: "https://hotbotstudios.com/products/instagram-content-assistant" },
};

const productSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Instagram Content Assistant: AI-Generated Captions and Hooks That Match Your Brand Voice",
  "description": "Generate on-brand Instagram captions, hashtag sets, and Reels hooks in under 60 seconds. Fine-tuned to your brand voice. Reduces content creation time by 80 percent. For small businesses, brands, and creators.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/OnlineOnly"
  },
  "provider": {
    "@type": "Organization",
    "name": "HotBot Studios",
    "url": "https://hotbotstudios.com"
  },
  "url": "https://hotbotstudios.com/products/instagram-content-assistant",
  "featureList": "On-Brand Caption Generation, Reels Hook Writing, Strategic Hashtag Sets, Content Calendar Templates, E-Commerce Product Copy, Content Repurposing"
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://hotbotstudios.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "AI Automation",
      "item": "https://hotbotstudios.com/ai-automation"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Instagram Content Assistant",
      "item": "https://hotbotstudios.com/products/instagram-content-assistant"
    }
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Will the captions sound generic or AI-generated?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Not with brand voice training completed. The assistant calibrates to your specific tone, vocabulary, and sentence length preferences during the initial setup session. Posts go through a humanization pass before delivery. The output is significantly more authentic than most AI-generated social content because it is trained on your actual writing samples, not generic templates."
      }
    },
    {
      "@type": "Question",
      "name": "Does it work for both B2B brands and consumer products?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. The tone and content style adapt based on your brand voice settings and audience configuration. B2B brands on Instagram use professional tone with educational and thought leadership frameworks. Consumer brands use conversational or lifestyle tones with product discovery and entertainment frameworks. Each voice profile is configured separately."
      }
    },
    {
      "@type": "Question",
      "name": "Can I generate captions in bulk for a content calendar?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. The batch mode allows you to input multiple post concepts in a single session and receive all captions, hooks, and hashtag sets at once. Most users batch generate a full week or month of content in a single 30 to 45 minute session."
      }
    },
    {
      "@type": "Question",
      "name": "Does the assistant generate Reels scripts as well as captions?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The assistant generates Reels hook scripts for the first 3 to 5 seconds, which is the critical scroll-stop window. For full-length Reels scripts and video production support, that falls under the Content Production Studio service which handles end-to-end video content for Instagram and TikTok."
      }
    }
  ]
};

const STATS = [
    { value: 60, suffix: " sec", label: "Caption Generation Time", color: "#ec4899" },
    { value: 80, suffix: "%", label: "Reduction in Content Writing Time", color: "#3b82f6" },
    { value: 5, suffix: " hooks", label: "Reels Hook Formats Per Concept", color: "#8b5cf6" },
    { value: 3, suffix: " tiers", label: "Hashtag Strategy Per Post", color: "#22c55e" }
];

const PROCESS = [
    { n: 1, title: "Brand Voice Setup", desc: "Complete a 10-minute brand voice configuration: select your tone (professional, playful, inspirational, educational) and paste 5 sample captions you like. The assistant calibrates to your style.", icon: "🎨" },
    { n: 2, title: "Content Input", desc: "Input your post concept, product details, or upload an image description. The assistant also accepts blog posts, email content, and product descriptions as source material for repurposing.", icon: "📥" },
    { n: 3, title: "Generate and Refine", desc: "Receive 3 caption variations, 5 Reels hook options, and a 3-tier hashtag set. Edit any output directly in the interface. Most users publish the first variation with minimal changes.", icon: "✍️" },
    { n: 4, title: "Schedule and Publish", desc: "Export directly to Later, Buffer, Hootsuite, or Instagram's native scheduler. Run monthly batch sessions to pre-load your content calendar in a single working session.", icon: "📅" }
];

const FAQS = [
    { q: "Will the captions sound generic or AI-generated?", a: "Not with brand voice training completed. The assistant calibrates to your specific tone, vocabulary, and sentence length preferences during the initial setup session. Posts go through a humanization pass before delivery. The output is significantly more authentic than most AI-generated social content because it is trained on your actual writing samples, not generic templates." },
    { q: "Does it work for both B2B brands and consumer products?", a: "Yes. The tone and content style adapt based on your brand voice settings and audience configuration. B2B brands on Instagram use professional tone with educational and thought leadership frameworks. Consumer brands use conversational or lifestyle tones with product discovery and entertainment frameworks. Each voice profile is configured separately." },
    { q: "Can I generate captions in bulk for a content calendar?", a: "Yes. The batch mode allows you to input multiple post concepts in a single session and receive all captions, hooks, and hashtag sets at once. Most users batch generate a full week or month of content in a single 30 to 45 minute session." },
    { q: "Does the assistant generate Reels scripts as well as captions?", a: "The assistant generates Reels hook scripts for the first 3 to 5 seconds, which is the critical scroll-stop window. For full-length Reels scripts and video production support, that falls under the Content Production Studio service which handles end-to-end video content for Instagram and TikTok." }
];

const RELATED = [
    { title: "LinkedIn Post Assistant", href: "/products/linkedin-post-assistant", desc: "AI-generated B2B content for LinkedIn posts, thought leadership, and founder presence.", icon: "💼" },
    { title: "Social Media Marketing", href: "/marketing-services/social-media", desc: "Fully managed Instagram, LinkedIn, and multi-platform social strategy and content.", icon: "📣" },
    { title: "Content Production Studio", href: "/content-studio", desc: "Video production, photography, and creative content for Instagram and TikTok campaigns.", icon: "🎬" }
];

export default function InstagramContentAssistantPage() {
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
          <li><Link href="/ai-automation" className="hover:text-slate-300 transition-colors">AI Automation</Link></li>
          <li className="text-slate-700">/</li>
          <li className="text-slate-400">Instagram Content Assistant</li>
        </ol>
      </nav>

      <PageHeader
        label="Instagram Content Automation"
        title="Instagram Content Assistant: AI-Generated Captions and Hooks That Match Your Brand Voice"
        subtitle="Consistent Instagram presence is the gap between a brand that grows and one that stalls. The Instagram Content Assistant generates on-brand captions, strategic hashtag sets, and creative hooks for Reels, Stories, and Feed posts in under 60 seconds. Fine-tuned to your brand voice through a one-time setup session. Eliminates 80 percent of content creation time while maintaining the quality and consistency your audience expects."
      />

      {/* AEO Definition Block */}
      <Reveal>
        <section className="relative z-10 py-8 px-6 max-w-3xl mx-auto">
          <div
            className="p-6 rounded-2xl border"
            style={{ background: "rgba(59,130,246,0.04)", borderColor: "rgba(59,130,246,0.15)" }}
          >
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Instagram Content Assistant:</strong>{" "}
              The Instagram Content Assistant is an AI content generation tool that produces captions, hashtag strategies, and creative hooks for Instagram formats including Reels, Stories, and Feed posts. It adapts to your brand voice through machine learning calibration and applies engagement pattern analysis from high-performing Instagram content in your industry vertical to maximize reach and interaction rate for US businesses, brands, and content creators.
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
        <div key="On-Brand Caption Generation" className="p-5 rounded-2xl border" style={{ background: "#ec489910", borderColor: "#ec489925" }}>
          <div className="text-2xl mb-3">{String.raw`✍️`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`On-Brand Caption Generation`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Generate captions for Feed posts, Reels, Carousels, and Stories in under 60 seconds. Each caption is calibrated to your brand voice: formal, conversational, humorous, or inspirational. Outputs include a primary caption and 2 alternatives.`}</p>
        </div>
        <div key="Reels Hook Writing" className="p-5 rounded-2xl border" style={{ background: "#3b82f610", borderColor: "#3b82f625" }}>
          <div className="text-2xl mb-3">{String.raw`🎬`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Reels Hook Writing`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`The first 3 seconds determine if your Reel gets watched. The assistant generates 5 proven hook formats for each video concept: curiosity gap, bold claim, question, before/after, and listicle. Tested against scroll-stop performance data.`}</p>
        </div>
        <div key="Strategic Hashtag Sets" className="p-5 rounded-2xl border" style={{ background: "#8b5cf610", borderColor: "#8b5cf625" }}>
          <div className="text-2xl mb-3">{String.raw`#️⃣`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Strategic Hashtag Sets`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Generates 3-tier hashtag strategies for every post: broad reach tags (500K to 5M posts), niche community tags (50K to 500K), and micro-niche tags (under 50K). Balanced for discoverability without competing in oversaturated categories.`}</p>
        </div>
        <div key="Content Calendar Templates" className="p-5 rounded-2xl border" style={{ background: "#22c55e10", borderColor: "#22c55e25" }}>
          <div className="text-2xl mb-3">{String.raw`📅`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Content Calendar Templates`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Generate a full month of post concepts and captions in a single session. Organized by content pillar: educational, promotional, user-generated, behind-the-scenes, and engagement. Exports to your preferred scheduling tool.`}</p>
        </div>
        <div key="E-Commerce Product Copy" className="p-5 rounded-2xl border" style={{ background: "#f59e0b10", borderColor: "#f59e0b25" }}>
          <div className="text-2xl mb-3">{String.raw`🛍️`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`E-Commerce Product Copy`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Generate product-focused captions that balance promotional intent with organic engagement. Includes call-to-action variations: link in bio, swipe up, DM for pricing, and shop tag prompts. Optimized for both discovery and conversion.`}</p>
        </div>
        <div key="Content Repurposing" className="p-5 rounded-2xl border" style={{ background: "#06b6d410", borderColor: "#06b6d425" }}>
          <div className="text-2xl mb-3">{String.raw`🔁`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Content Repurposing`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Convert blog posts, product descriptions, and email content into Instagram-native copy. Upload any text input and receive caption, Story slide text, and Reel script variations formatted for each Instagram surface.`}</p>
        </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Industry Use Cases</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div key="Small Business Owners" className="p-6 rounded-2xl border" style={{ background: "#ec489908", borderColor: "#ec489920" }}>
          <h3 className="font-semibold mb-2" style={{ color: "#ec4899" }}>{String.raw`Small Business Owners`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Need to post consistently on Instagram to grow but do not have time or budget to hire a social media manager.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Generate a week of captions and hashtag sets in 20 minutes. Maintain a consistent 5 to 7 post per week schedule without daily writing time.`}</p>
        </div>
        <div key="E-Commerce Brands" className="p-6 rounded-2xl border" style={{ background: "#3b82f608", borderColor: "#3b82f620" }}>
          <h3 className="font-semibold mb-2" style={{ color: "#3b82f6" }}>{String.raw`E-Commerce Brands`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Product launch campaigns require high volume of caption variations across promotional, lifestyle, and UGC posts. Writing is the bottleneck.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Batch generate all caption variations for a product launch in a single session. A/B test different hook styles and CTAs without additional copywriting costs.`}</p>
        </div>
        <div key="Content Creators and Influencers" className="p-6 rounded-2xl border" style={{ background: "#8b5cf608", borderColor: "#8b5cf620" }}>
          <h3 className="font-semibold mb-2" style={{ color: "#8b5cf6" }}>{String.raw`Content Creators and Influencers`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Creating captions for daily posting while producing video content is unsustainable. Quality and posting frequency both suffer.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Generate captions in bulk at the start of each week. Focus creative energy on video production. The assistant handles caption writing, hashtags, and hook formats.`}</p>
        </div>
        <div key="Marketing Agencies" className="p-6 rounded-2xl border" style={{ background: "#22c55e08", borderColor: "#22c55e20" }}>
          <h3 className="font-semibold mb-2" style={{ color: "#22c55e" }}>{String.raw`Marketing Agencies`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Managing Instagram content for 15 to 25 brand clients requires significant writer time each week. Quality varies across accounts.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Build brand voice profiles for each client. Batch generate all captions weekly using client brand assets as inputs. Reduce per-client content time by 75 percent.`}</p>
        </div>
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
          <li className="text-slate-300 text-sm">{String.raw`Posts published per week (target: 5 to 7)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Average post reach over 30-day rolling period`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Engagement rate per post (likes, comments, saves, shares)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Follower growth rate per month`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Story completion rate (swipe-away reduction)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Reels average watch percentage`}</li>
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
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Generates on-brand captions for Feed posts, Reels, Stories, and Carousels in under 60 seconds`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Brand voice training ensures output matches your tone, not generic AI templates`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`3-tier hashtag strategy balances broad reach with niche community discoverability per post`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`5 Reels hook formats are generated per concept to maximize scroll-stop performance`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Batch mode generates a full month of content calendar captions in a single session`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Supports e-commerce, service brands, personal brands, and agency multi-client workflows`}</span>
          </li>
          </ul>
        </section>
      </Reveal>

      {/* Related Services */}
      <RelatedServices services={RELATED} />

      {/* CTA */}
      <CTASection
        title="Generate Your First Caption in 60 Seconds"
        subtitle="Set up your brand voice profile and generate 5 captions and hashtag sets free. No credit card required."
        formType="get-started"
      />
    </>
  );
}
