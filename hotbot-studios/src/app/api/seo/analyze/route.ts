import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { SeoCheck, SeoAnalysis } from "@/types/blog";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function buildLocalChecks(
  title: string,
  metaTitle: string,
  metaDescription: string,
  focusKeyword: string,
  slug: string,
  content: string,
  featuredImageAlt: string,
): SeoCheck[] {
  const kw = focusKeyword.toLowerCase().trim();
  const plainContent = stripHtml(content).toLowerCase();
  const wordCount = countWords(stripHtml(content));
  const checks: SeoCheck[] = [];

  // --- Focus keyword checks ---
  if (kw) {
    const inTitle = title.toLowerCase().includes(kw);
    checks.push({
      id: "kw-in-title",
      label: "Focus keyword in title",
      status: inTitle ? "good" : "error",
      message: inTitle
        ? "Your focus keyword appears in the post title."
        : "Add your focus keyword to the post title.",
    });

    const inMeta = metaDescription.toLowerCase().includes(kw);
    checks.push({
      id: "kw-in-meta-desc",
      label: "Focus keyword in meta description",
      status: inMeta ? "good" : "improvement",
      message: inMeta
        ? "Focus keyword found in meta description."
        : "Include your focus keyword in the meta description.",
    });

    const inSlug = slug.toLowerCase().includes(kw.replace(/\s+/g, "-"));
    checks.push({
      id: "kw-in-slug",
      label: "Focus keyword in slug",
      status: inSlug ? "good" : "improvement",
      message: inSlug
        ? "Focus keyword found in the URL slug."
        : "Consider including your focus keyword in the slug.",
    });

    const firstParagraph = plainContent.slice(0, 300);
    const inIntro = firstParagraph.includes(kw);
    checks.push({
      id: "kw-in-intro",
      label: "Focus keyword in introduction",
      status: inIntro ? "good" : "improvement",
      message: inIntro
        ? "Focus keyword appears in the first paragraph."
        : "Use your focus keyword in the opening paragraph.",
    });

    // Keyword density
    const kwOccurrences = (plainContent.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
    const density = wordCount > 0 ? (kwOccurrences / wordCount) * 100 : 0;
    checks.push({
      id: "kw-density",
      label: "Keyword density",
      status: density >= 0.5 && density <= 2.5 ? "good" : density === 0 ? "error" : "improvement",
      message:
        density === 0
          ? "Focus keyword not found in content."
          : density < 0.5
          ? `Density ${density.toFixed(1)}% — use keyword more naturally (aim for 0.5–2.5%).`
          : density > 2.5
          ? `Density ${density.toFixed(1)}% — may be keyword stuffing. Aim for 0.5–2.5%.`
          : `Keyword density ${density.toFixed(1)}% — looks natural.`,
    });
  }

  // --- Meta title ---
  const metaTitleLen = metaTitle.length;
  checks.push({
    id: "meta-title-length",
    label: "Meta title length",
    status: metaTitleLen === 0 ? "error" : metaTitleLen >= 50 && metaTitleLen <= 60 ? "good" : "improvement",
    message:
      metaTitleLen === 0
        ? "Meta title is empty — add one."
        : metaTitleLen < 50
        ? `${metaTitleLen} chars — too short. Aim for 50–60 characters.`
        : metaTitleLen > 60
        ? `${metaTitleLen} chars — too long. Keep it under 60 characters.`
        : `${metaTitleLen} chars — perfect length.`,
  });

  // --- Meta description ---
  const metaDescLen = metaDescription.length;
  checks.push({
    id: "meta-desc-length",
    label: "Meta description length",
    status: metaDescLen === 0 ? "error" : metaDescLen >= 120 && metaDescLen <= 160 ? "good" : "improvement",
    message:
      metaDescLen === 0
        ? "Meta description is empty — add one for better CTR."
        : metaDescLen < 120
        ? `${metaDescLen} chars — too short. Aim for 120–160 characters.`
        : metaDescLen > 160
        ? `${metaDescLen} chars — too long. May be truncated in search results.`
        : `${metaDescLen} chars — perfect length.`,
  });

  // --- Content length ---
  checks.push({
    id: "content-length",
    label: "Content length",
    status: wordCount >= 600 ? "good" : wordCount >= 300 ? "improvement" : "error",
    message:
      wordCount >= 600
        ? `${wordCount} words — great length for SEO.`
        : wordCount >= 300
        ? `${wordCount} words — decent, but 600+ is recommended for ranking.`
        : `${wordCount} words — too short. Aim for at least 300 words.`,
  });

  // --- Subheadings ---
  const hasH2 = /<h2/i.test(content) || /^##\s/m.test(content);
  const hasH3 = /<h3/i.test(content) || /^###\s/m.test(content);
  checks.push({
    id: "subheadings",
    label: "Subheadings (H2/H3)",
    status: hasH2 ? "good" : "improvement",
    message: hasH2
      ? `Subheadings found${hasH3 ? " (H2 + H3)" : " (H2)"}. Good structure.`
      : "Add H2 subheadings to break up your content and help readers scan.",
  });

  // --- Image alt text ---
  if (featuredImageAlt) {
    checks.push({
      id: "image-alt",
      label: "Featured image alt text",
      status: "good",
      message: "Featured image has alt text.",
    });
  } else {
    checks.push({
      id: "image-alt",
      label: "Featured image alt text",
      status: "improvement",
      message: "Add alt text to your featured image for accessibility and SEO.",
    });
  }

  // --- Links in content ---
  const hasLinks = /<a\s/i.test(content) || /\[.+\]\(https?:\/\//i.test(content);
  checks.push({
    id: "links",
    label: "Links in content",
    status: hasLinks ? "good" : "improvement",
    message: hasLinks
      ? "Content contains links — good for SEO and user experience."
      : "Add internal or external links to improve content authority.",
  });

  return checks;
}

function scoreChecks(checks: SeoCheck[]): { score: number; grade: "good" | "ok" | "poor" } {
  if (checks.length === 0) return { score: 0, grade: "poor" };
  const points = checks.reduce((acc, c) => {
    if (c.status === "good") return acc + 2;
    if (c.status === "improvement") return acc + 1;
    return acc;
  }, 0);
  const max = checks.length * 2;
  const score = Math.round((points / max) * 100);
  const grade = score >= 70 ? "good" : score >= 40 ? "ok" : "poor";
  return { score, grade };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      title: string;
      metaTitle: string;
      metaDescription: string;
      focusKeyword: string;
      slug: string;
      content: string;
      excerpt: string;
      featuredImageAlt: string;
      aiAnalysis?: boolean;
    };

    const {
      title = "",
      metaTitle = "",
      metaDescription = "",
      focusKeyword = "",
      slug = "",
      content = "",
      featuredImageAlt = "",
      aiAnalysis = false,
    } = body;

    const checks = buildLocalChecks(title, metaTitle, metaDescription, focusKeyword, slug, content, featuredImageAlt);
    const { score, grade } = scoreChecks(checks);
    const result: SeoAnalysis = { score, grade, checks };

    // Only call Claude if aiAnalysis flag is true (triggered manually)
    if (aiAnalysis && process.env.ANTHROPIC_API_KEY) {
      const plainText = stripHtml(content).slice(0, 3000);
      const message = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        messages: [
          {
            role: "user",
            content: `You are an expert SEO copywriter and content strategist. Analyze this blog post and give 3–5 concise, actionable suggestions to improve its SEO and readability. Be specific and direct.

Title: ${title}
Focus keyword: ${focusKeyword || "not set"}
Meta description: ${metaDescription || "not set"}
Content (truncated): ${plainText}

Return ONLY a JSON array of strings, each a short actionable suggestion (max 100 chars each). No other text.
Example: ["Use the keyword in the first 100 words", "Add a FAQ section to target long-tail queries"]`,
          },
        ],
      });

      const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "[]";
      try {
        const jsonMatch = raw.match(/\[[\s\S]*\]/);
        result.aiSuggestions = jsonMatch ? (JSON.parse(jsonMatch[0]) as string[]) : [];
      } catch {
        result.aiSuggestions = [];
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("SEO analyze error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
