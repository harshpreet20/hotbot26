/**
 * HotBot Studios — Rule-based SEO / AEO / GEO / Local SEO analyzer
 * Zero API calls. Pure JS logic based on Google Search Essentials,
 * Google's AI Overviews guidelines, GEO research (Aggarwal et al. 2023),
 * and answer engine optimization best practices.
 */

import type { SeoCheck, SeoCheckStatus, SeoAnalysis } from "@/types/blog";

// ─── helpers ────────────────────────────────────────────────────────────────

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function check(
  id: string,
  label: string,
  status: SeoCheckStatus,
  message: string,
): SeoCheck {
  return { id, label, status, message };
}

function scoreChecks(checks: SeoCheck[]): { score: number; grade: "good" | "ok" | "poor" } {
  if (!checks.length) return { score: 0, grade: "poor" };
  const pts = checks.reduce((a, c) => a + (c.status === "good" ? 2 : c.status === "improvement" ? 1 : 0), 0);
  const score = Math.round((pts / (checks.length * 2)) * 100);
  return { score, grade: score >= 70 ? "good" : score >= 40 ? "ok" : "poor" };
}

// ─── SEO (Traditional / Google) ─────────────────────────────────────────────

export function analyzeSeo(p: AnalyzerInput): SeoCheck[] {
  const kw = p.focusKeyword.toLowerCase().trim();
  const plain = stripHtml(p.content).toLowerCase();
  const words = wordCount(stripHtml(p.content));
  const checks: SeoCheck[] = [];

  // Focus keyword in title
  if (kw) {
    const inTitle = p.title.toLowerCase().includes(kw);
    checks.push(check("seo-kw-title", "Keyword in title",
      inTitle ? "good" : "error",
      inTitle ? "Focus keyword appears in the post title." : "Add your focus keyword to the post title."));

    const inSlug = p.slug.includes(kw.replace(/\s+/g, "-"));
    checks.push(check("seo-kw-slug", "Keyword in URL slug",
      inSlug ? "good" : "improvement",
      inSlug ? "Focus keyword found in the URL." : "Include your focus keyword in the slug."));

    const inMeta = p.metaDescription.toLowerCase().includes(kw);
    checks.push(check("seo-kw-meta", "Keyword in meta description",
      inMeta ? "good" : "improvement",
      inMeta ? "Focus keyword in meta description." : "Include focus keyword in meta description."));

    const inIntro = plain.slice(0, 300).includes(kw);
    checks.push(check("seo-kw-intro", "Keyword in introduction",
      inIntro ? "good" : "improvement",
      inIntro ? "Keyword in opening paragraph — good signal." : "Use focus keyword in the first paragraph."));

    const count = (plain.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
    const density = words > 0 ? (count / words) * 100 : 0;
    checks.push(check("seo-density", "Keyword density",
      density >= 0.5 && density <= 2.5 ? "good" : density === 0 ? "error" : "improvement",
      density === 0 ? "Keyword not found in content."
        : density < 0.5 ? `${density.toFixed(1)}% density — too low. Aim for 0.5–2.5%.`
        : density > 2.5 ? `${density.toFixed(1)}% — may look like stuffing. Aim for 0.5–2.5%.`
        : `${density.toFixed(1)}% keyword density — natural and correct.`));
  }

  // Meta title
  const mtLen = p.metaTitle.length;
  checks.push(check("seo-meta-title", "Meta title length",
    mtLen === 0 ? "error" : mtLen >= 50 && mtLen <= 60 ? "good" : "improvement",
    mtLen === 0 ? "Meta title is empty."
      : mtLen < 50 ? `${mtLen} chars — aim for 50–60.`
      : mtLen > 60 ? `${mtLen} chars — may be truncated in results.`
      : `${mtLen} chars — perfect.`));

  // Meta description
  const mdLen = p.metaDescription.length;
  checks.push(check("seo-meta-desc", "Meta description length",
    mdLen === 0 ? "error" : mdLen >= 120 && mdLen <= 160 ? "good" : "improvement",
    mdLen === 0 ? "Meta description is empty — hurts CTR."
      : mdLen < 120 ? `${mdLen} chars — too short. Aim for 120–160.`
      : mdLen > 160 ? `${mdLen} chars — may be truncated. Keep under 160.`
      : `${mdLen} chars — perfect.`));

  // Content length
  checks.push(check("seo-length", "Content length",
    words >= 800 ? "good" : words >= 300 ? "improvement" : "error",
    words >= 800 ? `${words} words — strong for ranking.`
      : words >= 300 ? `${words} words — minimum met, 800+ is better.`
      : `${words} words — too short. Write at least 300 words.`));

  // H2/H3 subheadings
  const h2 = /<h2/i.test(p.content);
  const h3 = /<h3/i.test(p.content);
  checks.push(check("seo-headings", "H2/H3 subheadings",
    h2 ? "good" : "improvement",
    h2 ? `Subheadings found (${[h2 && "H2", h3 && "H3"].filter(Boolean).join(", ")}). Good document structure.`
       : "Add H2 subheadings to structure your content."));

  // Links
  const hasLinks = /<a\s[^>]*href/i.test(p.content);
  checks.push(check("seo-links", "Links in content",
    hasLinks ? "good" : "improvement",
    hasLinks ? "Content contains links — good for authority." : "Add internal or external links."));

  // Image alt
  const hasAlt = !!p.featuredImageAlt.trim();
  checks.push(check("seo-img-alt", "Featured image alt text",
    hasAlt ? "good" : "improvement",
    hasAlt ? "Featured image has descriptive alt text." : "Add alt text to your featured image."));

  // Title power words (CTR signals)
  const powerWords = ["guide", "best", "top", "how", "why", "what", "complete", "ultimate", "proven", "free", "new", "2025", "2026"];
  const hasPower = powerWords.some((w) => p.title.toLowerCase().includes(w));
  checks.push(check("seo-ctr", "CTR-boosting title words",
    hasPower ? "good" : "improvement",
    hasPower ? "Title contains power words that improve click-through rate."
             : `Add words like: ${powerWords.slice(0, 6).join(", ")} to boost CTR.`));

  return checks;
}

// ─── AEO (Answer Engine Optimization) ───────────────────────────────────────
// Optimises for AI assistants: ChatGPT, Siri, Alexa, Google AI Overviews
// Sources: Google's featured snippet guidelines, HowTo/FAQ schema signals

export function analyzeAeo(p: AnalyzerInput): SeoCheck[] {
  const plain = stripHtml(p.content);
  const lower = plain.toLowerCase();
  const words = wordCount(plain);
  const checks: SeoCheck[] = [];

  // Question-based headings
  const questionHeadings = /<h[23][^>]*>[^<]*(what|why|how|when|where|who|which|can|does|is|are|do)[^<]*[?]?<\/h[23]>/i.test(p.content)
    || /<h[23][^>]*>[^<]*\?<\/h[23]>/i.test(p.content);
  checks.push(check("aeo-q-headings", "Question-based headings",
    questionHeadings ? "good" : "improvement",
    questionHeadings ? "Headings contain questions — AI assistants prioritise these for featured snippets."
                     : "Add question headings (e.g. <h2>What is X?</h2>) to target featured snippets and AI answers."));

  // FAQ section
  const hasFaq = /FAQ|frequently asked questions|common questions/i.test(p.content);
  checks.push(check("aeo-faq", "FAQ section",
    hasFaq ? "good" : "improvement",
    hasFaq ? "FAQ section detected — strongly signals answer engine eligibility."
           : "Add a FAQ section to increase chances of being pulled into AI answers and People Also Ask."));

  // Concise definition (direct answer)
  const firstPara = plain.slice(0, 500);
  const shortSentences = firstPara.split(/[.!?]/).filter((s) => s.trim().split(/\s+/).length <= 25 && s.trim().length > 20);
  const hasDirectAnswer = shortSentences.length >= 2;
  checks.push(check("aeo-direct", "Direct answer in opening",
    hasDirectAnswer ? "good" : "improvement",
    hasDirectAnswer ? "Opening has concise sentences ideal for AI snippet extraction."
                    : "Start with a short, direct definition or answer (≤25 words) to target AI overviews."));

  // Numbered/structured lists
  const hasOrderedList = /<ol/i.test(p.content);
  const hasUnorderedList = /<ul/i.test(p.content);
  const listItemCount = (p.content.match(/<li/gi) || []).length;
  const goodLists = listItemCount >= 3;
  checks.push(check("aeo-lists", "Structured lists",
    goodLists ? "good" : hasOrderedList || hasUnorderedList ? "improvement" : "improvement",
    goodLists ? `${listItemCount} list items found — great for AI extraction of step-by-step answers.`
              : "Add numbered or bullet lists (3+ items) to help AI parse your content into structured answers."));

  // How-to steps
  const hasSteps = /step \d|step-by-step|\d\.\s+[A-Z]/i.test(p.content);
  checks.push(check("aeo-steps", "Step-by-step content",
    hasSteps ? "good" : "improvement",
    hasSteps ? "Step-by-step structure detected — eligible for HowTo rich results."
             : "Include numbered steps for processes (e.g. 'Step 1: ...') to target HowTo rich results."));

  // Conversational tone
  const youCount = (lower.match(/\byou\b|\byour\b/g) || []).length;
  const goodTone = words > 0 && (youCount / words) * 100 >= 0.5;
  checks.push(check("aeo-tone", "Conversational / second-person tone",
    goodTone ? "good" : "improvement",
    goodTone ? "Good use of 'you/your' — conversational content performs better in voice and AI answers."
             : "Use more 'you/your' language. Voice assistants and AI prefer conversational content."));

  // Concise paragraph under 300 chars (featured snippet target)
  const paragraphs = p.content.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  const snippetCandidate = paragraphs.some((pg) => {
    const t = stripHtml(pg).trim();
    const wc = wordCount(t);
    return wc >= 40 && wc <= 60;
  });
  checks.push(check("aeo-snippet", "Featured snippet paragraph",
    snippetCandidate ? "good" : "improvement",
    snippetCandidate ? "40–60 word paragraph found — ideal for Google featured snippet extraction."
                     : "Write a standalone 40–60 word paragraph that directly answers the main topic."));

  return checks;
}

// ─── GEO (Generative Engine Optimization) ───────────────────────────────────
// Optimises for ChatGPT, Perplexity, Gemini, Claude
// Based on: Aggarwal et al. (2023) "GEO: Generative Engine Optimization",
// Perplexity's content signals, ChatGPT Browse quality signals

export function analyzeGeo(p: AnalyzerInput): SeoCheck[] {
  const plain = stripHtml(p.content);
  const lower = plain.toLowerCase();
  const words = wordCount(plain);
  const checks: SeoCheck[] = [];

  // Statistics and specific numbers
  const statsPattern = /\d+[\.,]?\d*\s*(%|percent|million|billion|trillion|x\s*faster|x\s*more|times|\$[\d,]+)/i;
  const hasStats = statsPattern.test(p.content);
  checks.push(check("geo-stats", "Statistics & specific numbers",
    hasStats ? "good" : "improvement",
    hasStats ? "Contains statistics — generative AI engines use data-rich content as sources."
             : "Add specific statistics (e.g. '47% of businesses...' or '$2.3M saved') to become citable by AI engines."));

  // Citations / attributions
  const hasCitation = /according to|study shows|research (shows|finds|indicates|suggests)|report by|source:|via |cited by|published by|\[[\d]+\]/i.test(lower);
  checks.push(check("geo-citations", "Citations & attributions",
    hasCitation ? "good" : "improvement",
    hasCitation ? "Sources/citations found — GenAI engines heavily favour attributed claims."
                : "Add attributions ('According to [Source]...') to boost trustworthiness for AI engines."));

  // Content depth / comprehensiveness
  checks.push(check("geo-depth", "Content comprehensiveness",
    words >= 1500 ? "good" : words >= 800 ? "improvement" : "error",
    words >= 1500 ? `${words} words — comprehensive coverage signals expertise to GenAI.`
      : words >= 800 ? `${words} words — decent, but 1500+ words are more likely cited by ChatGPT/Perplexity.`
      : `${words} words — too short. Generative AI prefers in-depth authoritative content (1500+ words).`));

  // Comparison / vs content
  const hasComparison = /\bvs\.?\b|versus|compared to|comparison|better than|alternative/i.test(lower);
  checks.push(check("geo-comparison", "Comparison content",
    hasComparison ? "good" : "improvement",
    hasComparison ? "Comparison content found — commonly cited in AI-generated answers."
                  : "Add comparisons ('X vs Y', 'better than') — GenAI frequently cites comparison content."));

  // Definitive / authoritative statements
  const hasDefinitive = /\bis the (best|most|top|leading|only|first|largest|fastest)\b|\bthe #1\b|\bmust(-| )have\b/i.test(lower);
  checks.push(check("geo-authority", "Authoritative statements",
    hasDefinitive ? "good" : "improvement",
    hasDefinitive ? "Contains definitive statements — AI engines quote confident, authoritative claims."
                  : "Include authoritative statements ('X is the most effective...') to be quoted by AI engines."));

  // Expert angle (first-person expertise signals)
  const hasExpert = /\bwe (have|use|built|created|helped|work|recommend|offer)\b|\bour (clients|customers|experience|approach|method)\b/i.test(lower);
  checks.push(check("geo-expert", "Expert / first-hand experience",
    hasExpert ? "good" : "improvement",
    hasExpert ? "First-hand expertise signals detected — E-E-A-T factor for AI trust."
              : "Mention your own experience/clients ('We helped 50+ businesses...') to signal E-E-A-T."));

  // Tables
  const hasTable = /<table/i.test(p.content);
  checks.push(check("geo-table", "Comparison tables",
    hasTable ? "good" : "improvement",
    hasTable ? "Table found — AI engines extract structured tabular data well."
             : "Add a comparison or data table — AI engines frequently cite and re-use tabular content."));

  // Recency signals
  const currentYear = new Date().getFullYear();
  const hasRecent = new RegExp(`${currentYear}|${currentYear - 1}`).test(p.content);
  checks.push(check("geo-recency", "Recency signals",
    hasRecent ? "good" : "improvement",
    hasRecent ? `Year ${currentYear}/${currentYear - 1} found — AI engines prefer fresh, dated content.`
              : `Add '${currentYear}' references. Generative AI engines prefer recently updated content.`));

  return checks;
}

// ─── Local SEO ───────────────────────────────────────────────────────────────
// Optimises for Google Maps, local packs, 'near me' searches, SGE local

export function analyzeLocal(p: AnalyzerInput): SeoCheck[] {
  const plain = stripHtml(p.content).toLowerCase();
  const fullText = (p.content + " " + p.title + " " + p.metaDescription).toLowerCase();
  const checks: SeoCheck[] = [];

  // Location mentions — US states / major cities
  const usLocations = [
    "united states", "usa", "u.s.", " us ", "new york", "los angeles", "chicago", "houston", "phoenix",
    "philadelphia", "san antonio", "san diego", "dallas", "san jose", "austin", "jacksonville", "fort worth",
    "columbus", "charlotte", "indianapolis", "san francisco", "seattle", "denver", "nashville", "oklahoma city",
    "atlanta", "miami", "minneapolis", "boston", "las vegas", "portland", "memphis", "louisville", "baltimore",
    "milwaukee", "albuquerque", "tucson", "fresno", "sacramento", "mesa", "kansas city", "omaha", "raleigh",
    "colorado", "california", "texas", "florida", "new york", "illinois", "ohio", "georgia", "michigan",
    "virginia", "washington", "arizona", "massachusetts", "tennessee", "indiana", "maryland", "missouri",
  ];
  const hasLocation = usLocations.some((loc) => fullText.includes(loc));
  checks.push(check("local-geo-target", "Geographic target location",
    hasLocation ? "good" : "improvement",
    hasLocation ? "US location mentioned — helps search engines understand geographic relevance."
                : "Mention your target US city, state, or region in the title, content, or meta description."));

  // 'Near me' or local service area keywords
  const hasNearMe = /near me|in (my area|your area|the area)|local|nearby|serving|service area|[a-z]+ area/i.test(fullText);
  checks.push(check("local-nearme", "'Near me' / local intent keywords",
    hasNearMe ? "good" : "improvement",
    hasNearMe ? "Local intent keywords found — signals relevance for 'near me' searches."
              : "Include 'local', 'near me', or 'serving [city]' to capture local intent searches."));

  // NAP signals (Name, Address, Phone)
  const hasPhone = /\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}|\+1[\s.-]\d{3}/.test(p.content);
  const hasAddress = /\d+\s+[a-z]+\s+(street|st|avenue|ave|road|rd|blvd|boulevard|drive|dr|lane|ln)/i.test(plain);
  const napScore = [hasPhone, hasAddress].filter(Boolean).length;
  checks.push(check("local-nap", "NAP signals (Name, Address, Phone)",
    napScore >= 1 ? "good" : "improvement",
    napScore >= 1 ? "Business contact/address found — supports local NAP consistency."
                 : "Include phone number and/or address in contact-focused pages to support local SEO."));

  // Service area description
  const hasServiceArea = /we (serve|cover|operate in|work (in|across|with clients in))|serving (clients|businesses|companies) (in|across|throughout)/i.test(plain);
  checks.push(check("local-service-area", "Service area description",
    hasServiceArea ? "good" : "improvement",
    hasServiceArea ? "Service area description found — important local ranking signal."
                   : "Describe your service area explicitly ('We serve businesses in [city/region]')."));

  // Local business schema signals
  const hasLocalKeywords = /agency|studio|company|services|solutions/i.test(fullText) && hasLocation;
  checks.push(check("local-schema", "Local business context",
    hasLocalKeywords ? "good" : "improvement",
    hasLocalKeywords ? "Business + location context — aligns with local business schema signals."
                     : "Combine your business type ('agency', 'studio') with location for stronger local relevance."));

  // Reviews / testimonial mentions
  const hasReviews = /review|testimonial|rated|5[\s-]star|4[\s-]star|client said|customer said/i.test(plain);
  checks.push(check("local-reviews", "Reviews / social proof mention",
    hasReviews ? "good" : "improvement",
    hasReviews ? "Social proof/reviews mentioned — local pack ranking uses review signals."
               : "Mention reviews, ratings, or testimonials to signal local credibility."));

  // 'Best [service] in [location]' pattern
  const hasBestIn = /best\s+\w+(\s+\w+)?\s+(in|near|for)\s+[a-z]+/i.test(fullText);
  checks.push(check("local-best", "'Best [service] in [location]' pattern",
    hasBestIn ? "good" : "improvement",
    hasBestIn ? "'Best X in [location]' pattern found — high-value local intent signal."
              : "Use 'best [service] in [city]' pattern in title or H1 — top local intent search format."));

  return checks;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface AnalyzerInput {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  featuredImageAlt: string;
}

export type AnalysisTab = "seo" | "aeo" | "geo" | "local";

export interface FullAnalysis {
  overall: { score: number; grade: "good" | "ok" | "poor" };
  seo: SeoAnalysis;
  aeo: SeoAnalysis;
  geo: SeoAnalysis;
  local: SeoAnalysis;
}

export function analyzeAll(input: AnalyzerInput): FullAnalysis {
  const seoChecks = analyzeSeo(input);
  const aeoChecks = analyzeAeo(input);
  const geoChecks = analyzeGeo(input);
  const localChecks = analyzeLocal(input);

  const allChecks = [...seoChecks, ...aeoChecks, ...geoChecks, ...localChecks];
  const { score: overallScore, grade: overallGrade } = scoreChecks(allChecks);

  function toAnalysis(checks: SeoCheck[]): SeoAnalysis {
    const { score, grade } = scoreChecks(checks);
    return { score, grade, checks };
  }

  return {
    overall: { score: overallScore, grade: overallGrade },
    seo: toAnalysis(seoChecks),
    aeo: toAnalysis(aeoChecks),
    geo: toAnalysis(geoChecks),
    local: toAnalysis(localChecks),
  };
}
