// lib/readme/compiler.ts

import {
  buildAsciiBannerUrls,
  renderAdaptivePictureHtml,
  type BannerOptions,
} from "../ascii/catalog";
import {
  buildGitHubWidgetUrl,
  buildShieldsBadgeUrl,
  type BadgeConfig,
  type WidgetConfig,
} from "../badges/builder";
import {
  buildCapsuleRenderUrl,
  type CapsuleRenderConfig,
} from "../assets/capsule";
import { buildCategorizedTechStackMarkdown } from "../assets/tech-icons";
import type { ExtendedWidgetConfig } from "../assets/widgets";

export type SectionType =
  // Profile
  | "profile-header"
  | "animated-header"
  | "avatar"
  | "introduction"
  | "about-me"
  | "tagline"
  | "profile-info"
  | "view-counter"
  | "social-links"
  | "contact"
  | "location"
  | "education"
  | "experience"
  | "certifications"
  | "achievements"
  | "sponsor"
  | "footer"
  // Content
  | "text-block"
  | "heading"
  | "paragraph"
  | "quote"
  | "divider"
  | "markdown-block"
  | "custom-html"
  | "announcement"
  | "cta"
  // Skills
  | "skills"
  | "tech-stack-categorized"
  | "languages"
  | "frameworks"
  | "tools"
  // GitHub Stats
  | "github-stats"
  | "top-languages"
  | "streak"
  | "trophies"
  | "contribution-graph"
  | "coding-activity"
  | "repo-showcase"
  // Visuals
  | "gif-banner"
  | "image"
  | "banner"
  | "capsule-render"
  | "ascii-art"
  | "ascii-banner"
  | "svg"
  // Social
  | "socials"
  // Projects
  | "featured-projects"
  | "current-projects"
  | "project-cards"
  // Advanced
  | "custom"
  | "table"
  | "raw-embed";

export type SectionCategory =
  | "profile"
  | "content"
  | "skills"
  | "stats"
  | "visuals"
  | "social"
  | "projects"
  | "advanced";

export interface ReadmeSection {
  id: string;
  type: SectionType;
  title: string;
  enabled: boolean;
  align?: "left" | "center" | "right";
  rawMarkdownOverride?: string;
  data: Record<string, unknown>;
}

export interface ValidationIssue {
  severity: "error" | "warning";
  sectionId?: string;
  message: string;
}

export interface SectionTypeMeta {
  type: SectionType;
  label: string;
  category: SectionCategory;
  description: string;
}

export const SECTION_LIBRARY_META: SectionTypeMeta[] = [
  // Profile
  { type: "profile-header", label: "Profile Header", category: "profile", description: "Main hero heading and subtitle for your README" },
  { type: "avatar", label: "Avatar", category: "profile", description: "Circular or framed profile avatar image" },
  { type: "introduction", label: "Introduction", category: "profile", description: "Short opening bio or greeting" },
  { type: "about-me", label: "About Me", category: "profile", description: "Bulleted or markdown bio section" },
  { type: "view-counter", label: "View Counter", category: "profile", description: "Komarev GitHub profile views badge" },
  { type: "social-links", label: "Social Links", category: "profile", description: "Links and badges to your social profiles" },
  { type: "contact", label: "Contact", category: "profile", description: "Email, website, and direct contact details" },
  { type: "location", label: "Location & Timezone", category: "profile", description: "Current city, country, or availability" },
  // Content
  { type: "text-block", label: "Text Block", category: "content", description: "Freeform rich text or markdown block" },
  { type: "heading", label: "Heading", category: "content", description: "Configurable H1–H4 section heading" },
  { type: "paragraph", label: "Paragraph", category: "content", description: "Clean prose paragraph" },
  { type: "quote", label: "Quote", category: "content", description: "Blockquote with optional attribution" },
  { type: "divider", label: "Divider", category: "content", description: "Horizontal rule separator" },
  { type: "markdown-block", label: "Markdown Block", category: "content", description: "Raw or fenced markdown snippet" },
  { type: "custom-html", label: "Custom HTML", category: "content", description: "GitHub-safe HTML layout block" },
  { type: "announcement", label: "Announcement", category: "content", description: "Highlighted callout or status banner" },
  { type: "cta", label: "Call to Action", category: "content", description: "Button badge with link and prompt" },
  // Skills
  { type: "skills", label: "Skills Badges", category: "skills", description: "Shields.io skill badges" },
  { type: "tech-stack-categorized", label: "Categorized Tech Stack", category: "skills", description: "Multi-row grouped technology matrix" },
  { type: "languages", label: "Languages", category: "skills", description: "Programming languages badge row" },
  { type: "frameworks", label: "Frameworks", category: "skills", description: "Frameworks & libraries badge row" },
  { type: "tools", label: "Developer Tools", category: "skills", description: "CLI, editors, and DevOps tools" },
  // GitHub Stats
  { type: "github-stats", label: "GitHub Stats", category: "stats", description: "Overall commits, stars, and PRs card" },
  { type: "top-languages", label: "Top Languages", category: "stats", description: "Most used languages breakdown card" },
  { type: "streak", label: "Streak Stats", category: "stats", description: "Daily contribution streak card" },
  { type: "trophies", label: "GitHub Trophies", category: "stats", description: "Achievement trophies row" },
  { type: "contribution-graph", label: "Contribution Graph", category: "stats", description: "31-day activity graph" },
  { type: "coding-activity", label: "Coding Activity", category: "stats", description: "Recent coding & commit activity graph" },
  { type: "repo-showcase", label: "Repo Showcase", category: "stats", description: "Pinned GitHub repository cards" },
  // Visuals
  { type: "gif-banner", label: "GIF Banner", category: "visuals", description: "Animated GIF banner with optional link" },
  { type: "image", label: "Image", category: "visuals", description: "Custom image with alt text and width" },
  { type: "banner", label: "Banner", category: "visuals", description: "Wide hero banner image" },
  { type: "capsule-render", label: "Capsule Render", category: "visuals", description: "Dynamic gradient wave header or footer" },
  { type: "ascii-art", label: "ASCII Art", category: "visuals", description: "Animated ascii.rest SVG or custom ASCII" },
  { type: "ascii-banner", label: "ASCII Banner", category: "visuals", description: "Adaptive light/dark ASCII text banner" },
  { type: "svg", label: "SVG Graphic", category: "visuals", description: "Hosted SVG visual element" },
  // Social
  { type: "socials", label: "Social Badges", category: "social", description: "Row of social profile badges" },
  // Projects
  { type: "featured-projects", label: "Featured Projects", category: "projects", description: "Highlighted repositories with stars & tech" },
  { type: "current-projects", label: "Current Projects", category: "projects", description: "What you are currently building" },
  { type: "project-cards", label: "Project Cards", category: "projects", description: "Structured project showcase cards" },
  // Advanced
  { type: "table", label: "Markdown Table", category: "advanced", description: "Structured GFM data table" },
  { type: "raw-embed", label: "Raw Embed", category: "advanced", description: "Custom embed HTML or Markdown" },
  { type: "custom", label: "Custom Markdown", category: "advanced", description: "Unrestricted GitHub-safe Markdown" },
];

/**
 * Sanitize generated Markdown/HTML to strip unsafe GitHub constructs
 * such as <script> tags, inline event handlers, and javascript: URLs.
 */
export function sanitizeMarkdownOutput(markdown: string): string {
  return markdown
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<script\b[^>]*\/?>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript\s*:/gi, "");
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function wrapAlignment(content: string, align?: "left" | "center" | "right"): string {
  if (!content.trim()) return "";
  if (align === "center") return `<div align="center">\n\n${content}\n\n</div>`;
  if (align === "right") return `<div align="right">\n\n${content}\n\n</div>`;
  return content;
}

function wrapInlineHtmlAlignment(html: string, align?: "left" | "center" | "right"): string {
  if (!html.trim()) return "";
  if (align === "center") return `<div align="center">\n  ${html}\n</div>`;
  if (align === "right") return `<div align="right">\n  ${html}\n</div>`;
  return html;
}

function isSafeUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (/^javascript:/i.test(trimmed)) return false;
  return (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("mailto:")
  );
}

/** Generate Markdown for profile & about sections. */
export function generateAboutMarkdown(s: ReadmeSection): string {
  const d = s.data || {};
  const align = s.align ?? "left";

  switch (s.type) {
    case "profile-header":
    case "animated-header": {
      const name = String(d.name || "").trim();
      const subtitle = String(d.subtitle || "").trim();
      const wave = d.wave ? "👋 " : "";
      const rawHeading = d.heading
        ? String(d.heading).trim()
        : `${wave}${name ? `Hi, I'm ${name}` : "Hello World!"}`;
      const heading = `# ${rawHeading}`;
      const sub = subtitle ? `\n\n### ${subtitle}` : "";
      const text = `${heading}${sub}`;
      return wrapAlignment(text, s.align ?? "center");
    }

    case "avatar": {
      const url = String(d.url || d.avatarUrl || "").trim();
      if (!url || !isSafeUrl(url)) return "";
      const size = typeof d.size === "number" ? d.size : Number(d.width) || 120;
      const alt = escapeHtmlAttr(String(d.alt || s.title || "Avatar"));
      const img = `<img src="${escapeHtmlAttr(url)}" alt="${alt}" width="${size}" height="${size}" />`;
      return wrapInlineHtmlAlignment(img, s.align ?? "center");
    }

    case "introduction":
    case "about-me": {
      const body = String(d.markdown ?? d.text ?? "").trim();
      if (!body) return "";
      const heading = s.title?.trim() ? `## ${s.title.trim()}\n\n` : "";
      return `${heading}${body}`;
    }

    case "tagline": {
      const text = String(d.text || "").trim();
      if (!text) return "";
      const wrapped = `> *${text}*`;
      return wrapAlignment(wrapped, s.align ?? "center");
    }

    case "location": {
      const city = String(d.location || d.city || "").trim();
      const timezone = String(d.timezone || "").trim();
      const availability = String(d.availability || "").trim();
      const parts = [
        city ? `📍 **Location:** ${city}` : "",
        timezone ? `🕒 **Timezone:** ${timezone}` : "",
        availability ? `💼 **Status:** ${availability}` : "",
      ].filter(Boolean);
      const raw = String(d.markdown || "").trim();
      const body = parts.length ? parts.join("\n\n") : raw;
      if (!body) return "";
      return s.title?.trim() ? `## ${s.title.trim()}\n\n${body}` : body;
    }

    case "profile-info": {
      const items =
        (d.items as Array<{ icon?: string; text: string; link?: string }> | undefined) ?? [];
      if (!items.length) {
        const raw = String(d.markdown || "").trim();
        return raw ? `## ${s.title}\n\n${raw}` : "";
      }
      const list = items
        .filter((it) => it.text?.trim())
        .map((it) => {
          const content = it.link ? `[${it.text}](${it.link})` : it.text;
          return `- ${it.icon ? `${it.icon} ` : ""}${content}`;
        })
        .join("\n");
      return list ? `## ${s.title}\n\n${list}` : "";
    }

    case "contact": {
      const email = d.email ? `📧 Email: [${d.email}](mailto:${d.email})` : "";
      const twitter = d.twitter
        ? `🐦 X / Twitter: [${d.twitter}](https://x.com/${String(d.twitter).replace("@", "")})`
        : "";
      const linkedin = d.linkedin
        ? `💼 LinkedIn: [${d.linkedin}](${d.linkedin})`
        : "";
      const blog = d.blog ? `🌐 Website: [${d.blog}](${d.blog})` : "";
      const discord = d.discord ? `💬 Discord: \`${d.discord}\`` : "";
      const lines = [email, twitter, linkedin, blog, discord].filter(Boolean);
      const raw = String(d.markdown || "").trim();
      const content = lines.length ? lines.map((l) => `- ${l}`).join("\n") : raw;
      if (!content) return "";
      return `## ${s.title}\n\n${content}`;
    }

    case "sponsor": {
      const sponsorUrl = String(d.url || "").trim();
      const msg = String(
        d.message || "If you find my work helpful, consider sponsoring me!"
      ).trim();
      if (!sponsorUrl || !isSafeUrl(sponsorUrl)) return "";
      const buttonBadge = `<a href="${escapeHtmlAttr(sponsorUrl)}"><img src="https://img.shields.io/badge/Sponsor-❤️-ff69b4?style=for-the-badge&logo=githubsponsors" alt="Sponsor" /></a>`;
      const body = `${msg}\n\n${buttonBadge}`;
      return `## ${s.title}\n\n${wrapAlignment(body, s.align ?? "center")}`;
    }

    case "footer": {
      const text = String(d.text || "Crafted with ❤️ and Profile Forge").trim();
      if (!text) return "";
      return `<p align="center">\n  <sub>${text}</sub>\n</p>`;
    }

    case "education":
    case "experience":
    case "certifications":
    case "achievements": {
      const items =
        (d.items as Array<{ title: string; subtitle?: string; period?: string; description?: string }> | undefined) ?? [];
      if (items.length > 0) {
        const lines = items
          .filter((it) => it.title?.trim())
          .map((it) => {
            const head = `**${it.title}**${it.subtitle ? ` — ${it.subtitle}` : ""}${it.period ? ` (${it.period})` : ""}`;
            return it.description ? `- ${head}\n  ${it.description}` : `- ${head}`;
          })
          .join("\n");
        return lines ? `## ${s.title}\n\n${lines}` : "";
      }
      const raw = String(d.markdown || "").trim();
      return raw ? `## ${s.title}\n\n${raw}` : "";
    }

    default: {
      const raw = String(d.markdown ?? d.text ?? "").trim();
      return raw ? wrapAlignment(`## ${s.title}\n\n${raw}`, align) : "";
    }
  }
}

/** Generate Markdown for content blocks (headings, paragraphs, quotes, dividers, etc.). */
export function generateContentMarkdown(s: ReadmeSection): string {
  const d = s.data || {};
  const align = s.align;

  switch (s.type) {
    case "heading": {
      const text = String(d.text || s.title || "").trim();
      if (!text) return "";
      const rawLevel = Number(d.level ?? 2);
      const level = Math.min(4, Math.max(1, Number.isFinite(rawLevel) ? rawLevel : 2));
      const hashes = "#".repeat(level);
      return wrapAlignment(`${hashes} ${text}`, align);
    }

    case "paragraph":
    case "text-block": {
      const text = String(d.text ?? d.markdown ?? "").trim();
      if (!text) return "";
      return wrapAlignment(text, align);
    }

    case "quote": {
      const text = String(d.text || "").trim();
      if (!text) return "";
      const author = String(d.author || "").trim();
      const lines = text
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");
      const attribution = author ? `\n> — *${author}*` : "";
      return `${lines}${attribution}`;
    }

    case "divider": {
      return "---";
    }

    case "markdown-block": {
      const md = String(d.markdown ?? d.text ?? "").trim();
      return md;
    }

    case "custom-html": {
      const html = String(d.html ?? d.markdown ?? "").trim();
      return html;
    }

    case "announcement": {
      const title = String(d.title || s.title || "Announcement").trim();
      const message = String(d.message || d.text || "").trim();
      const kind = String(d.kind || "NOTE").toUpperCase();
      if (!message) return "";
      const validKinds = new Set(["NOTE", "TIP", "IMPORTANT", "WARNING", "CAUTION"]);
      const alertType = validKinds.has(kind) ? kind : "NOTE";
      return `> [!${alertType}]\n> **${title}** — ${message}`;
    }

    case "cta": {
      const label = String(d.label || "Get Started").trim();
      const url = String(d.url || "").trim();
      const color = String(d.color || "00F2FE").replace(/^#/, "");
      const message = String(d.message || "").trim();
      if (!url || !isSafeUrl(url)) return "";
      const badgeUrl = buildShieldsBadgeUrl({
        label: "",
        message: label,
        color,
        style: "for-the-badge",
      });
      const linkHtml = `<a href="${escapeHtmlAttr(url)}"><img src="${escapeHtmlAttr(badgeUrl)}" alt="${escapeHtmlAttr(label)}" /></a>`;
      const content = message ? `${message}\n\n${linkHtml}` : linkHtml;
      return wrapAlignment(content, align ?? "center");
    }

    default:
      return "";
  }
}

/** Generate Markdown for skills, languages, frameworks, tools, and categorized tech stack. */
export function generateSkillsMarkdown(s: ReadmeSection): string {
  const d = s.data || {};
  const align = s.align ?? "center";

  if (s.type === "tech-stack-categorized") {
    const selectedIds = (d.selectedIds as string[]) || [];
    const style = (d.style as "badges" | "devicon" | "skillicons") || "badges";
    if (!selectedIds.length) {
      const raw = String(d.markdown || "").trim();
      return raw ? `## ${s.title}\n\n${raw}` : "";
    }
    return buildCategorizedTechStackMarkdown(selectedIds, style);
  }

  const badges = (d.badges as BadgeConfig[] | undefined) ?? [];
  if (!badges.length) {
    const items = (d.items as string[] | undefined) ?? [];
    if (items.length > 0) {
      const list = items.filter(Boolean).map((item) => `- ${item}`).join("\n");
      return list ? `## ${s.title}\n\n${list}` : "";
    }
    const raw = String(d.markdown || "").trim();
    return raw ? `## ${s.title}\n\n${raw}` : "";
  }

  const imgs = badges
    .filter((b) => b.message || b.label)
    .map((b) => {
      const url = buildShieldsBadgeUrl(b);
      const img = `<img src="${escapeHtmlAttr(url)}" alt="${escapeHtmlAttr(b.label || b.message)}" />`;
      return b.href && isSafeUrl(b.href)
        ? `<a href="${escapeHtmlAttr(b.href)}">${img}</a>`
        : img;
    })
    .join("\n  ");

  if (!imgs) return "";
  const wrapped = align === "center" ? `<p align="center">\n  ${imgs}\n</p>` : imgs;
  return `## ${s.title}\n\n${wrapped}`;
}

/** Generate Markdown for social links and social badges. */
export function generateSocialLinksMarkdown(s: ReadmeSection): string {
  const d = s.data || {};
  const align = s.align ?? "center";

  const badges = (d.badges as BadgeConfig[] | undefined) ?? [];
  if (badges.length > 0) {
    const imgs = badges
      .map((b) => {
        const url = buildShieldsBadgeUrl(b);
        const img = `<img src="${escapeHtmlAttr(url)}" alt="${escapeHtmlAttr(b.label || b.message)}" />`;
        return b.href && isSafeUrl(b.href)
          ? `<a href="${escapeHtmlAttr(b.href)}">${img}</a>`
          : img;
      })
      .join("\n  ");
    const wrapped = align === "center" ? `<p align="center">\n  ${imgs}\n</p>` : imgs;
    return `## ${s.title}\n\n${wrapped}`;
  }

  const links =
    (d.links as Array<{ platform: string; url: string; color?: string; logo?: string }> | undefined) ??
    [];
  if (links.length > 0) {
    const imgs = links
      .filter((l) => l.platform && l.url && isSafeUrl(l.url))
      .map((l) => {
        const url = buildShieldsBadgeUrl({
          label: "",
          message: l.platform,
          color: l.color || "181717",
          logo: l.logo,
          style: "for-the-badge",
        });
        return `<a href="${escapeHtmlAttr(l.url)}"><img src="${escapeHtmlAttr(url)}" alt="${escapeHtmlAttr(l.platform)}" /></a>`;
      })
      .join("\n  ");
    if (!imgs) return "";
    const wrapped = align === "center" ? `<p align="center">\n  ${imgs}\n</p>` : imgs;
    return `## ${s.title}\n\n${wrapped}`;
  }

  const raw = String(d.markdown || "").trim();
  return raw ? `## ${s.title}\n\n${raw}` : "";
}

/** Generate Markdown for GitHub stats, streaks, trophies, view counters, and repo showcase. */
export function generateStatsMarkdown(s: ReadmeSection): string {
  const d = s.data || {};
  const align = s.align ?? "center";

  if (s.type === "view-counter") {
    const widget = d.widget as ExtendedWidgetConfig | undefined;
    const vc = d.viewCounter as Record<string, unknown> | undefined;
    const username = String(widget?.username || vc?.username || d.username || "").trim();
    if (!username) return "";
    const color = String(widget?.viewCounterColor || vc?.color || d.color || "00f2fe");
    const style = String(widget?.viewCounterStyle || vc?.style || d.style || "flat-square");
    const label = String(vc?.label || "Profile+Views").replace(/\s+/g, "+");
    const url = `https://komarev.com/ghpvc/?username=${encodeURIComponent(username)}&color=${encodeURIComponent(color)}&style=${encodeURIComponent(style)}&label=${label}`;
    const img = `<img src="${escapeHtmlAttr(url)}" alt="Profile Views" />`;
    return wrapInlineHtmlAlignment(img, align);
  }

  if (s.type === "repo-showcase") {
    const repos = (d.repos as Array<{ username?: string; repo: string; theme?: string; hideBorder?: boolean }> | undefined) ?? [];
    const fallbackWidget = d.widget as WidgetConfig | undefined;
    if (repos.length > 0) {
      const tags = repos
        .filter((r) => r.repo?.trim())
        .map((r) => {
          const username = r.username || fallbackWidget?.username || String(d.username || "octocat");
          const src = buildGitHubWidgetUrl({
            type: "repo-pin",
            username,
            repo: r.repo,
            theme: r.theme || fallbackWidget?.theme || "tokyonight",
            hideBorder: r.hideBorder ?? fallbackWidget?.hideBorder ?? true,
          });
          return `<a href="https://github.com/${encodeURIComponent(username)}/${encodeURIComponent(r.repo)}"><img src="${escapeHtmlAttr(src)}" alt="${escapeHtmlAttr(r.repo)}" /></a>`;
        })
        .join("\n  ");
      if (!tags) return "";
      const body = align === "center" ? `<p align="center">\n  ${tags}\n</p>` : tags;
      return `## ${s.title}\n\n${body}`;
    }
    if (fallbackWidget?.username && fallbackWidget?.repo) {
      const src = buildGitHubWidgetUrl({ ...fallbackWidget, type: "repo-pin" });
      const tag = `<img src="${escapeHtmlAttr(src)}" alt="${escapeHtmlAttr(fallbackWidget.repo)}" />`;
      return `## ${s.title}\n\n${wrapInlineHtmlAlignment(tag, align)}`;
    }
    return "";
  }

  const widget = d.widget as WidgetConfig | undefined;
  if (!widget?.username) return "";
  const src = d.useLocalAssetPath
    ? String(d.useLocalAssetPath)
    : buildGitHubWidgetUrl(widget);
  const tag = `<img src="${escapeHtmlAttr(src)}" alt="${escapeHtmlAttr(s.title)}" />`;
  return `## ${s.title}\n\n${wrapInlineHtmlAlignment(tag, align)}`;
}

/** Generate Markdown for project sections (featured, current, project cards). */
export function generateProjectMarkdown(s: ReadmeSection): string {
  const d = s.data || {};
  const projects =
    (d.projects as Array<{
      name: string;
      description?: string;
      url: string;
      stars?: number;
      language?: string;
      tech?: string[];
      demoUrl?: string;
    }> | undefined) ?? [];

  if (!projects.length) {
    const raw = String(d.markdown || "").trim();
    return raw ? `## ${s.title}\n\n${raw}` : "";
  }

  const layout = String(d.layout || "list");

  if (layout === "table") {
    const header = "| Project | Description | Tech | Stars |\n| :--- | :--- | :--- | :---: |";
    const rows = projects
      .filter((p) => p.name?.trim())
      .map((p) => {
        const nameLink = p.url && isSafeUrl(p.url) ? `[**${p.name}**](${p.url})` : `**${p.name}**`;
        const desc = (p.description || "").replace(/\|/g, "\\|");
        const tech = p.tech?.length
          ? p.tech.map((t) => `\`${t}\``).join(" ")
          : p.language
          ? `\`${p.language}\``
          : "-";
        const stars = typeof p.stars === "number" ? `⭐ ${p.stars}` : "-";
        return `| ${nameLink} | ${desc} | ${tech} | ${stars} |`;
      })
      .join("\n");
    return rows ? `## ${s.title}\n\n${header}\n${rows}` : "";
  }

  const list = projects
    .filter((p) => p.name?.trim())
    .map((p) => {
      const title =
        p.url && isSafeUrl(p.url) ? `### 🚀 [${p.name}](${p.url})` : `### 🚀 ${p.name}`;
      const desc = p.description ? `\n${p.description}` : "";
      const metaParts = [
        p.language ? `\`${p.language}\`` : null,
        ...(p.tech?.map((t) => `\`${t}\``) ?? []),
        typeof p.stars === "number" && p.stars > 0 ? `⭐ ${p.stars}` : null,
        p.demoUrl && isSafeUrl(p.demoUrl) ? `[Live Demo](${p.demoUrl})` : null,
      ].filter(Boolean);
      const meta = metaParts.join(" • ");
      return `${title}${desc}${meta ? `\n\n*${meta}*` : ""}`;
    })
    .join("\n\n");

  return list ? `## ${s.title}\n\n${list}` : "";
}

/** Generate Markdown for ASCII art and ASCII banner sections. */
export function generateAsciiMarkdown(s: ReadmeSection): string {
  const d = s.data || {};
  const align = s.align ?? "center";

  // Safe fenced custom ASCII text (preserves whitespace and line breaks)
  const customAscii = typeof d.customAscii === "string" ? d.customAscii : typeof d.asciiText === "string" ? d.asciiText : "";
  if (customAscii.trim()) {
    const cleanAscii = customAscii.replace(/```/g, "'''");
    return `\`\`\`text\n${cleanAscii.replace(/\n+$/, "")}\n\`\`\``;
  }

  if (s.type === "ascii-banner") {
    const bannerOpts = d.banner as BannerOptions | undefined;
    if (!bannerOpts?.text?.trim()) return "";
    const { lightUrl, darkUrl } = buildAsciiBannerUrls(bannerOpts);
    return renderAdaptivePictureHtml({
      lightSrc: lightUrl,
      darkSrc: darkUrl,
      alt: bannerOpts.text,
      align,
    });
  }

  const slug = String(d.slug || "").trim();
  if (!slug && !d.lightUrl) return "";
  const resolvedSlug = slug || "donut";
  const lightUrl = String(d.lightUrl || `https://ascii.rest/svg/${resolvedSlug}.svg`);
  const darkUrl = String(d.darkUrl || `https://ascii.rest/svg/${resolvedSlug}.dark.svg`);
  const width = typeof d.width === "number" ? d.width : undefined;
  return renderAdaptivePictureHtml({
    lightSrc: lightUrl,
    darkSrc: darkUrl,
    alt: `ASCII ${resolvedSlug}`,
    align,
    width,
  });
}

/** Generate Markdown for Capsule Render, GIF banners, and standard banners. */
export function generateBannerMarkdown(s: ReadmeSection): string {
  const d = s.data || {};
  const align = s.align ?? "center";

  if (s.type === "capsule-render") {
    const capsuleCfg = d.capsule as CapsuleRenderConfig | undefined;
    if (!capsuleCfg) return "";
    const url = buildCapsuleRenderUrl(capsuleCfg);
    const img = `<img src="${escapeHtmlAttr(url)}" alt="${escapeHtmlAttr(capsuleCfg.text || s.title)}" width="100%" />`;
    return wrapInlineHtmlAlignment(img, align);
  }

  const gifObj = d.gif as Record<string, unknown> | undefined;
  const url = String(d.url || gifObj?.url || "").trim();
  if (!url || !isSafeUrl(url)) return "";
  const width = d.width || gifObj?.width;
  const widthAttr = width ? ` width="${escapeHtmlAttr(String(width))}"` : "";
  const alt = escapeHtmlAttr(String(d.alt || s.title || "Banner"));
  const img = `<img src="${escapeHtmlAttr(url)}" alt="${alt}"${widthAttr} />`;
  const href = String(d.href || "").trim();
  const linked =
    href && isSafeUrl(href) ? `<a href="${escapeHtmlAttr(href)}">\n  ${img}\n</a>` : img;
  return wrapInlineHtmlAlignment(linked, align);
}

/** Generate Markdown for standalone images and SVG graphics. */
export function generateImageMarkdown(s: ReadmeSection): string {
  const d = s.data || {};
  const align = s.align ?? "center";
  const url = String(d.url || d.src || "").trim();
  if (!url || !isSafeUrl(url)) return "";

  const alt = escapeHtmlAttr(String(d.alt || s.title || "Image"));
  const widthAttr = d.width ? ` width="${escapeHtmlAttr(String(d.width))}"` : "";
  const heightAttr = d.height ? ` height="${escapeHtmlAttr(String(d.height))}"` : "";
  const img = `<img src="${escapeHtmlAttr(url)}" alt="${alt}"${widthAttr}${heightAttr} />`;
  const href = String(d.href || "").trim();
  const linked =
    href && isSafeUrl(href) ? `<a href="${escapeHtmlAttr(href)}">\n  ${img}\n</a>` : img;
  return wrapInlineHtmlAlignment(linked, align);
}

/** Generate Markdown for advanced sections: tables, raw embeds, and custom markdown. */
export function generateAdvancedMarkdown(s: ReadmeSection): string {
  const d = s.data || {};

  if (s.type === "table") {
    const headers = (d.headers as string[] | undefined) ?? [];
    const rows = (d.rows as string[][] | undefined) ?? [];
    const alignments = (d.alignments as Array<"left" | "center" | "right"> | undefined) ?? [];

    if (!headers.length) {
      const raw = String(d.markdown || "").trim();
      return raw ? (s.title?.trim() ? `## ${s.title.trim()}\n\n${raw}` : raw) : "";
    }

    const escapeCell = (cell: string) => String(cell ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
    const headerLine = `| ${headers.map(escapeCell).join(" | ")} |`;
    const sepLine = `| ${headers
      .map((_, i) => {
        const a = alignments[i] ?? "left";
        if (a === "center") return ":---:";
        if (a === "right") return "---:";
        return ":---";
      })
      .join(" | ")} |`;
    const bodyLines = rows.map(
      (row) => `| ${headers.map((_, i) => escapeCell(row[i] ?? "")).join(" | ")} |`
    );
    const tableMd = [headerLine, sepLine, ...bodyLines].join("\n");
    return s.title?.trim() ? `## ${s.title.trim()}\n\n${tableMd}` : tableMd;
  }

  return String(d.markdown ?? d.html ?? "").trim();
}

/** Compile a single ReadmeSection into sanitized GitHub-compatible Markdown. */
export function compileSection(s: ReadmeSection): string {
  let raw = "";

  switch (s.type) {
    // Profile
    case "profile-header":
    case "animated-header":
    case "avatar":
    case "introduction":
    case "about-me":
    case "tagline":
    case "profile-info":
    case "contact":
    case "location":
    case "education":
    case "experience":
    case "certifications":
    case "achievements":
    case "sponsor":
    case "footer":
      raw = generateAboutMarkdown(s);
      break;

    // Content
    case "text-block":
    case "heading":
    case "paragraph":
    case "quote":
    case "divider":
    case "markdown-block":
    case "custom-html":
    case "announcement":
    case "cta":
      raw = generateContentMarkdown(s);
      break;

    // Skills
    case "skills":
    case "tech-stack-categorized":
    case "languages":
    case "frameworks":
    case "tools":
      raw = generateSkillsMarkdown(s);
      break;

    // Social
    case "socials":
    case "social-links":
      raw = generateSocialLinksMarkdown(s);
      break;

    // GitHub Stats & View Counter
    case "view-counter":
    case "github-stats":
    case "top-languages":
    case "streak":
    case "trophies":
    case "contribution-graph":
    case "coding-activity":
    case "repo-showcase":
      raw = generateStatsMarkdown(s);
      break;

    // Projects
    case "featured-projects":
    case "current-projects":
    case "project-cards":
      raw = generateProjectMarkdown(s);
      break;

    // Visuals
    case "ascii-art":
    case "ascii-banner":
      raw = generateAsciiMarkdown(s);
      break;

    case "capsule-render":
    case "gif-banner":
    case "banner":
      raw = generateBannerMarkdown(s);
      break;

    case "image":
    case "svg":
      raw = generateImageMarkdown(s);
      break;

    // Advanced
    case "custom":
    case "table":
    case "raw-embed":
      raw = generateAdvancedMarkdown(s);
      break;

    default: {
      const markdown = String(s.data?.markdown ?? "").trim();
      raw = markdown ? `## ${s.title}\n\n${markdown}` : "";
      break;
    }
  }

  return sanitizeMarkdownOutput(raw);
}

/** Compile all enabled sections into a single GitHub README.md string. */
export function compileReadmeMarkdown(sections: ReadmeSection[]): string {
  const blocks: string[] = [];

  for (const section of sections) {
    if (!section.enabled) continue;

    if (section.rawMarkdownOverride?.trim()) {
      blocks.push(sanitizeMarkdownOutput(section.rawMarkdownOverride.trim()));
      continue;
    }

    const compiled = compileSection(section);
    if (compiled.trim()) blocks.push(compiled.trim());
  }

  return blocks.length ? blocks.join("\n\n") + "\n" : "";
}

/** Validates exported Markdown against GitHub README rendering restrictions. */
export function validateReadmeForExport(
  markdown: string,
  sections: ReadmeSection[],
  availableLocalAssets: Set<string> = new Set()
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (/<script[\s>]/i.test(markdown)) {
    issues.push({
      severity: "error",
      message: "Detected <script> tag. GitHub strips JavaScript from README files.",
    });
  }
  if (/\son\w+\s*=/i.test(markdown)) {
    issues.push({
      severity: "error",
      message: "Detected inline event handler (e.g., onclick=). Unsupported on GitHub.",
    });
  }
  if (/https?:\/\/localhost|127\.0\.0\.1/i.test(markdown)) {
    issues.push({
      severity: "error",
      message: "Detected localhost URL. External visitors on GitHub will see broken images/links.",
    });
  }

  // Check local relative asset paths exist in export bundle
  const localAssetRegex = /(?:src|srcset)="(\.\/?[^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = localAssetRegex.exec(markdown)) !== null) {
    const cleanPath = match[1].replace(/^\.\//, "");
    if (!availableLocalAssets.has(cleanPath)) {
      issues.push({
        severity: "error",
        message: `Missing local asset referenced in README: "${cleanPath}".`,
      });
    }
  }

  // Detect empty enabled sections
  for (const s of sections) {
    if (s.enabled && !s.rawMarkdownOverride && !compileSection(s).trim()) {
      issues.push({
        severity: "warning",
        sectionId: s.id,
        message: `Section "${s.title}" is enabled but currently produces empty content.`,
      });
    }
  }

  // Check invalid URLs in Markdown links/images
  const mdLinkRegex = /\[[^\]]*\]\(([^)]+)\)/g;
  while ((match = mdLinkRegex.exec(markdown)) !== null) {
    const href = match[1].trim();
    if (
      !href.startsWith("https://") &&
      !href.startsWith("http://") &&
      !href.startsWith("#") &&
      !href.startsWith("./") &&
      !href.startsWith("mailto:")
    ) {
      issues.push({
        severity: "warning",
        message: `Potentially invalid link format: "${href}".`,
      });
    }
  }

  return issues;
}
