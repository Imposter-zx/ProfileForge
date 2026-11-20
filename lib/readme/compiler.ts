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
import {
  buildCategorizedTechStackMarkdown,
} from "../assets/tech-icons";
import type { ExtendedWidgetConfig } from "../assets/widgets";

export type SectionType =
  | "animated-header"
  | "ascii-banner"
  | "ascii-art"
  | "capsule-render"
  | "view-counter"
  | "gif-banner"
  | "tech-stack-categorized"
  | "about-me"
  | "tagline"
  | "profile-info"
  | "current-projects"
  | "featured-projects"
  | "skills"
  | "languages"
  | "frameworks"
  | "tools"
  | "github-stats"
  | "contribution-graph"
  | "trophies"
  | "streak"
  | "top-languages"
  | "coding-activity"
  | "education"
  | "experience"
  | "certifications"
  | "achievements"
  | "socials"
  | "contact"
  | "sponsor"
  | "footer"
  | "custom";

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

export function compileReadmeMarkdown(sections: ReadmeSection[]): string {
  const blocks: string[] = [];

  for (const section of sections) {
    if (!section.enabled) continue;

    if (section.rawMarkdownOverride?.trim()) {
      blocks.push(section.rawMarkdownOverride.trim());
      continue;
    }

    const compiled = compileSection(section);
    if (compiled.trim()) blocks.push(compiled.trim());
  }

  return blocks.join("\n\n") + "\n";
}

export function compileSection(s: ReadmeSection): string {
  const d = s.data || {};
  const align = s.align ?? "center";

  switch (s.type) {
    case "capsule-render": {
      const capsuleCfg = d.capsule as CapsuleRenderConfig | undefined;
      if (!capsuleCfg) return "";
      const url = buildCapsuleRenderUrl(capsuleCfg);
      const img = `<img src="${url}" alt="${capsuleCfg.text || s.title}" width="100%" />`;
      return align === "center" ? `<div align="center">\n  ${img}\n</div>` : img;
    }

    case "view-counter": {
      const widget = d.widget as ExtendedWidgetConfig | undefined;
      const vc = d.viewCounter as Record<string, unknown> | undefined;
      const username = String(widget?.username || vc?.username || d.username || "octocat");
      const color = String(widget?.viewCounterColor || vc?.color || d.color || "00f2fe");
      const style = String(widget?.viewCounterStyle || vc?.style || d.style || "flat-square");
      const label = String(vc?.label || "Profile+Views").replace(/\s+/g, "+");
      const url = `https://komarev.com/ghpvc/?username=${encodeURIComponent(username)}&color=${encodeURIComponent(color)}&style=${encodeURIComponent(style)}&label=${label}`;
      const img = `<img src="${url}" alt="Profile Views" />`;
      return align === "center" ? `<div align="center">\n  ${img}\n</div>` : img;
    }

    case "gif-banner": {
      const gifObj = d.gif as Record<string, unknown> | undefined;
      const url = String(d.url || gifObj?.url || "");
      if (!url) return "";
      const width = d.width || gifObj?.width;
      const widthAttr = width ? ` width="${width}"` : "";
      const img = `<img src="${url}" alt="${s.title}"${widthAttr} />`;
      const linked = d.href ? `<a href="${d.href}">\n  ${img}\n</a>` : img;
      return align === "center" ? `<div align="center">\n  ${linked}\n</div>` : linked;
    }

    case "tech-stack-categorized": {
      const selectedIds = (d.selectedIds as string[]) || [];
      const style = (d.style as "badges" | "devicon" | "skillicons") || "badges";
      return buildCategorizedTechStackMarkdown(selectedIds, style);
    }

    case "ascii-banner": {
      const bannerOpts = d.banner as BannerOptions | undefined;
      if (!bannerOpts?.text) return "";
      const { lightUrl, darkUrl } = buildAsciiBannerUrls(bannerOpts);
      return renderAdaptivePictureHtml({
        lightSrc: lightUrl,
        darkSrc: darkUrl,
        alt: bannerOpts.text,
        align,
      });
    }

    case "ascii-art": {
      const slug = String(d.slug || "donut");
      const lightUrl = String(d.lightUrl || `https://ascii.rest/svg/${slug}.svg`);
      const darkUrl = String(d.darkUrl || `https://ascii.rest/svg/${slug}.dark.svg`);
      const width = typeof d.width === "number" ? d.width : undefined;
      return renderAdaptivePictureHtml({
        lightSrc: lightUrl,
        darkSrc: darkUrl,
        alt: `ASCII ${slug}`,
        align,
        width,
      });
    }

    case "animated-header": {
      const name = String(d.name || "").trim();
      const subtitle = String(d.subtitle || "").trim();
      const wave = d.wave ? "👋 " : "";
      const heading = `# ${wave}${name ? `Hi, I'm ${name}` : "Hello World!"}`;
      const sub = subtitle ? `\n\n### ${subtitle}` : "";
      const text = `${heading}${sub}`;
      return align === "center" ? `<div align="center">\n\n${text}\n\n</div>` : text;
    }

    case "about-me": {
      const body = String(d.markdown ?? "").trim();
      if (!body) return "";
      return `## ${s.title}\n\n${body}`;
    }

    case "tagline": {
      const text = String(d.text || "").trim();
      if (!text) return "";
      const wrapped = `> *${text}*`;
      return align === "center" ? `<div align="center">\n\n${wrapped}\n\n</div>` : wrapped;
    }

    case "profile-info": {
      const items =
        (d.items as Array<{ icon: string; text: string; link?: string }> | undefined) ?? [];
      if (!items.length) {
        const raw = String(d.markdown || "").trim();
        return raw ? `## ${s.title}\n\n${raw}` : "";
      }
      const list = items
        .map((it) => {
          const content = it.link ? `[${it.text}](${it.link})` : it.text;
          return `- ${it.icon ? `${it.icon} ` : ""}${content}`;
        })
        .join("\n");
      return `## ${s.title}\n\n${list}`;
    }

    case "skills":
    case "languages":
    case "frameworks":
    case "tools":
    case "socials": {
      const badges = (d.badges as BadgeConfig[] | undefined) ?? [];
      if (!badges.length) {
        const raw = String(d.markdown || "").trim();
        return raw ? `## ${s.title}\n\n${raw}` : "";
      }
      const imgs = badges
        .map((b) => {
          const url = buildShieldsBadgeUrl(b);
          const img = `<img src="${url}" alt="${b.label || b.message}" />`;
          return b.href ? `<a href="${b.href}">${img}</a>` : img;
        })
        .join("\n  ");
      const wrapped =
        align === "center" ? `<p align="center">\n  ${imgs}\n</p>` : imgs;
      return `## ${s.title}\n\n${wrapped}`;
    }

    case "github-stats":
    case "top-languages":
    case "streak":
    case "trophies":
    case "contribution-graph":
    case "coding-activity": {
      const widget = d.widget as WidgetConfig | undefined;
      if (!widget?.username) return "";
      const src = d.useLocalAssetPath
        ? String(d.useLocalAssetPath)
        : buildGitHubWidgetUrl(widget);
      const tag = `<img src="${src}" alt="${s.title}" />`;
      const body =
        align === "center" ? `<div align="center">\n  ${tag}\n</div>` : tag;
      return `## ${s.title}\n\n${body}`;
    }

    case "featured-projects":
    case "current-projects": {
      const projects =
        (d.projects as Array<{
          name: string;
          description: string;
          url: string;
          stars?: number;
          language?: string;
        }> | undefined) ?? [];
      if (!projects.length) {
        const raw = String(d.markdown || "").trim();
        return raw ? `## ${s.title}\n\n${raw}` : "";
      }
      const list = projects
        .map((p) => {
          const title = `### 🚀 [${p.name}](${p.url})`;
          const desc = p.description ? `\n${p.description}` : "";
          const meta = [
            p.language ? `\`${p.language}\`` : null,
            typeof p.stars === "number" && p.stars > 0 ? `⭐ ${p.stars}` : null,
          ]
            .filter(Boolean)
            .join(" • ");
          return `${title}${desc}${meta ? `\n\n*${meta}*` : ""}`;
        })
        .join("\n\n");
      return `## ${s.title}\n\n${list}`;
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
      const lines = [email, twitter, linkedin, blog].filter(Boolean);
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
      if (!sponsorUrl) return "";
      const buttonBadge = `<a href="${sponsorUrl}"><img src="https://img.shields.io/badge/Sponsor-❤️-ff69b4?style=for-the-badge&logo=githubsponsors" alt="Sponsor" /></a>`;
      const body = `${msg}\n\n${buttonBadge}`;
      const wrapped =
        align === "center" ? `<div align="center">\n\n${body}\n\n</div>` : body;
      return `## ${s.title}\n\n${wrapped}`;
    }

    case "footer": {
      const text = String(d.text || "Crafted with ❤️ and Profile Forge").trim();
      if (!text) return "";
      const centered = `<p align="center">\n  <sub>${text}</sub>\n</p>`;
      return centered;
    }

    case "custom": {
      return String(d.markdown ?? "").trim();
    }

    default: {
      const markdown = String(d.markdown ?? "").trim();
      return markdown ? `## ${s.title}\n\n${markdown}` : "";
    }
  }
}

/** Validates exported Markdown against GitHub README rendering restrictions */
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
