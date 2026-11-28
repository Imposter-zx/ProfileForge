// lib/readme/importer.ts

import type { ReadmeSection, SectionType } from "./compiler";

export interface ExportedProjectPayload {
  version: number;
  title: string;
  username?: string;
  exportedAt: string;
  sections: ReadmeSection[];
}

export const PROJECT_EXPORT_VERSION = 2;

function nextId(prefix: string, index: number): string {
  return `${prefix}-${index + 1}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Split raw Markdown into logical top-level blocks without splitting inside
 * fenced code blocks (``` or ~~~) or HTML <div>/<p>/<picture> wrappers.
 */
function splitMarkdownBlocks(markdown: string): string[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: string[] = [];
  let current: string[] = [];
  let inFence = false;
  let fenceMarker = "";
  let htmlDepth = 0;

  const flush = () => {
    const text = current.join("\n").trim();
    if (text) blocks.push(text);
    current = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!inFence && (trimmed.startsWith("```") || trimmed.startsWith("~~~"))) {
      inFence = true;
      fenceMarker = trimmed.slice(0, 3);
      current.push(line);
      continue;
    }

    if (inFence) {
      current.push(line);
      if (trimmed.startsWith(fenceMarker)) {
        inFence = false;
        fenceMarker = "";
      }
      continue;
    }

    // Track simple multi-line HTML container blocks (<div...>, <p...>, <picture>)
    if (/^<(div|p|picture|a)(\s|>)/i.test(trimmed) && !/<\/(div|p|picture|a)>/i.test(trimmed)) {
      htmlDepth++;
      current.push(line);
      continue;
    }
    if (htmlDepth > 0) {
      current.push(line);
      if (/<\/(div|p|picture|a)>/i.test(trimmed)) {
        htmlDepth = Math.max(0, htmlDepth - 1);
        if (htmlDepth === 0) {
          flush();
        }
      }
      continue;
    }

    // Start a new block on H1/H2 headings or horizontal rules
    if (/^#{1,2}\s+/.test(trimmed) || /^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flush();
      current.push(line);
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
        flush();
      }
      continue;
    }

    if (trimmed === "" && current.length > 0) {
      // Keep heading attached to its body until next heading/blank separation
      const prevFirst = current[0]?.trim() || "";
      if (/^#{1,2}\s+/.test(prevFirst) && current.length === 1) {
        current.push(line);
        continue;
      }
      flush();
      continue;
    }

    if (trimmed !== "") {
      current.push(line);
    }
  }

  flush();
  return blocks;
}

function parseQueryParams(urlStr: string): URLSearchParams {
  try {
    const u = new URL(urlStr.replace(/&amp;/g, "&"));
    return u.searchParams;
  } catch {
    return new URLSearchParams();
  }
}

function parseTableBlock(block: string): {
  headers: string[];
  alignments: Array<"left" | "center" | "right">;
  rows: string[][];
} | null {
  const lines = block
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return null;
  if (!lines[0].startsWith("|") || !lines[1].startsWith("|")) return null;
  if (!/^\|[\s:|-]+\|$/.test(lines[1])) return null;

  const parseRow = (line: string) =>
    line
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim().replace(/\\\|/g, "|"));

  const headers = parseRow(lines[0]);
  const sepCells = parseRow(lines[1]);
  const alignments = sepCells.map((cell): "left" | "center" | "right" => {
    if (cell.startsWith(":") && cell.endsWith(":")) return "center";
    if (cell.endsWith(":")) return "right";
    return "left";
  });
  const rows = lines.slice(2).map(parseRow);
  return { headers, alignments, rows };
}

function classifyHeadingSectionType(heading: string): SectionType {
  const lower = heading.toLowerCase();
  if (/about|bio|who|intro|system\.info/.test(lower)) return "about-me";
  if (/skill|tech|stack|language|framework|tool/.test(lower)) return "skills";
  if (/social|connect|follow|community/.test(lower)) return "socials";
  if (/contact|reach|email/.test(lower)) return "contact";
  if (/project|portfolio|work/.test(lower)) return "featured-projects";
  return "custom";
}

function parseBlockToSection(block: string, index: number): ReadmeSection {
  const trimmed = block.trim();

  // 1. Divider
  if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
    return {
      id: nextId("divider", index),
      type: "divider",
      title: "Divider",
      enabled: true,
      data: {},
    };
  }

  // 2. Capsule Render
  const capsuleMatch = trimmed.match(/https:\/\/capsule-render\.vercel\.app\/api\?[^\s"')>]+/i);
  if (capsuleMatch) {
    const params = parseQueryParams(capsuleMatch[0]);
    return {
      id: nextId("capsule", index),
      type: "capsule-render",
      title: params.get("section") === "footer" ? "Footer Banner" : "Capsule Header",
      enabled: true,
      align: "center",
      data: {
        capsule: {
          type: params.get("type") || "waving",
          color: params.get("color") || "auto",
          height: Number(params.get("height")) || 200,
          text: params.get("text") || "",
          fontSize: Number(params.get("fontSize")) || undefined,
          fontColor: params.get("fontColor") || undefined,
          desc: params.get("desc") || undefined,
          descSize: Number(params.get("descSize")) || undefined,
          animation: params.get("animation") || undefined,
          section: (params.get("section") as "header" | "footer") || "header",
        },
      },
    };
  }

  // 3. Komarev View Counter
  const viewMatch = trimmed.match(/https:\/\/komarev\.com\/ghpvc\/\?[^\s"')>]+/i);
  if (viewMatch) {
    const params = parseQueryParams(viewMatch[0]);
    return {
      id: nextId("views", index),
      type: "view-counter",
      title: "Profile Views",
      enabled: true,
      align: "center",
      data: {
        username: params.get("username") || "octocat",
        color: params.get("color") || "00f2fe",
        style: params.get("style") || "flat-square",
      },
    };
  }

  // 4. ASCII Banner
  const asciiBannerMatch = trimmed.match(/https:\/\/ascii\.rest\/banner\/([^.?\s"')>]+)(?:\.dark)?\.svg(?:\?([^\s"')>]+))?/i);
  if (asciiBannerMatch) {
    const text = decodeURIComponent(asciiBannerMatch[1]);
    const params = asciiBannerMatch[2]
      ? new URLSearchParams(asciiBannerMatch[2].replace(/&amp;/g, "&"))
      : new URLSearchParams();
    return {
      id: nextId("ascii-banner", index),
      type: "ascii-banner",
      title: "ASCII Banner",
      enabled: true,
      align: "center",
      data: {
        banner: {
          text,
          color: params.get("color")?.split(","),
          effect: params.get("effect") || "glint",
          font: params.get("font") || "block",
          shadow: params.get("shadow") || "double",
        },
      },
    };
  }

  // 5. ASCII Art SVG
  const asciiArtMatch = trimmed.match(/https:\/\/ascii\.rest\/svg\/([^.?\s"')>]+)(?:\.dark)?\.svg/i);
  if (asciiArtMatch) {
    const slug = asciiArtMatch[1];
    return {
      id: nextId("ascii-art", index),
      type: "ascii-art",
      title: `ASCII ${slug}`,
      enabled: true,
      align: "center",
      data: { slug },
    };
  }

  // 6. GitHub Stats / Top Langs / Streak / Trophies / Activity Graph
  const statsMatch = trimmed.match(/https:\/\/github-readme-stats\.vercel\.app\/api\/top-langs\/\?[^\s"')>]+/i);
  if (statsMatch) {
    const params = parseQueryParams(statsMatch[0]);
    return {
      id: nextId("top-langs", index),
      type: "top-languages",
      title: "Top Languages",
      enabled: true,
      align: "center",
      data: {
        widget: {
          type: "top-langs",
          username: params.get("username") || "octocat",
          theme: params.get("theme") || "tokyonight",
          hideBorder: params.get("hide_border") === "true",
        },
      },
    };
  }

  const ghStatsMatch = trimmed.match(/https:\/\/github-readme-stats\.vercel\.app\/api\?[^\s"')>]+/i);
  if (ghStatsMatch) {
    const params = parseQueryParams(ghStatsMatch[0]);
    return {
      id: nextId("stats", index),
      type: "github-stats",
      title: "GitHub Stats",
      enabled: true,
      align: "center",
      data: {
        widget: {
          type: "stats",
          username: params.get("username") || "octocat",
          theme: params.get("theme") || "tokyonight",
          hideBorder: params.get("hide_border") === "true",
        },
      },
    };
  }

  const streakMatch = trimmed.match(/https:\/\/streak-stats\.demolab\.com\/?\?[^\s"')>]+/i);
  if (streakMatch) {
    const params = parseQueryParams(streakMatch[0]);
    return {
      id: nextId("streak", index),
      type: "streak",
      title: "Contribution Streak",
      enabled: true,
      align: "center",
      data: {
        widget: {
          type: "streak",
          username: params.get("user") || "octocat",
          theme: params.get("theme") || "tokyonight",
          hideBorder: params.get("hide_border") === "true",
        },
      },
    };
  }

  const trophyMatch = trimmed.match(/https:\/\/github-profile-trophy\.vercel\.app\/?\?[^\s"')>]+/i);
  if (trophyMatch) {
    const params = parseQueryParams(trophyMatch[0]);
    return {
      id: nextId("trophies", index),
      type: "trophies",
      title: "GitHub Trophies",
      enabled: true,
      align: "center",
      data: {
        widget: {
          type: "trophies",
          username: params.get("username") || "octocat",
          theme: params.get("theme") || "onedark",
          hideBorder: params.get("no-frame") === "true",
        },
      },
    };
  }

  const activityMatch = trimmed.match(/https:\/\/github-readme-activity-graph\.vercel\.app\/graph\?[^\s"')>]+/i);
  if (activityMatch) {
    const params = parseQueryParams(activityMatch[0]);
    return {
      id: nextId("activity", index),
      type: "coding-activity",
      title: "Activity Graph",
      enabled: true,
      align: "center",
      data: {
        widget: {
          type: "activity-graph",
          username: params.get("username") || "octocat",
          theme: params.get("theme") || "tokyo-night",
          hideBorder: params.get("hide_border") === "true",
        },
      },
    };
  }

  // 7. Fenced code block (custom ASCII or markdown-block)
  if (/^```[\s\S]*```$/.test(trimmed)) {
    const fenceMatch = trimmed.match(/^```([^\n]*)\n([\s\S]*?)\n?```$/);
    if (fenceMatch) {
      const lang = fenceMatch[1].trim().toLowerCase();
      const content = fenceMatch[2];
      if (!lang || lang === "text" || lang === "ascii") {
        return {
          id: nextId("ascii-custom", index),
          type: "ascii-art",
          title: "Custom ASCII",
          enabled: true,
          align: "left",
          data: { customAscii: content },
        };
      }
      return {
        id: nextId("code", index),
        type: "markdown-block",
        title: `Code (${lang})`,
        enabled: true,
        data: { markdown: trimmed },
      };
    }
  }

  // 8. GFM Table
  const tableData = parseTableBlock(trimmed);
  if (tableData) {
    return {
      id: nextId("table", index),
      type: "table",
      title: "",
      enabled: true,
      data: tableData,
    };
  }

  // 9. Blockquote
  if (trimmed.split("\n").every((l) => l.trim().startsWith(">"))) {
    const quoteText = trimmed
      .split("\n")
      .map((l) => l.trim().replace(/^>\s?/, ""))
      .join("\n");
    return {
      id: nextId("quote", index),
      type: "quote",
      title: "Quote",
      enabled: true,
      data: { text: quoteText },
    };
  }

  // 10. Standalone image or GIF
  const mdImgMatch = trimmed.match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/);
  if (mdImgMatch) {
    const [, alt, url] = mdImgMatch;
    const isGif = /\.gif(\?|$)/i.test(url);
    return {
      id: nextId(isGif ? "gif" : "img", index),
      type: isGif ? "gif-banner" : "image",
      title: alt || (isGif ? "GIF Banner" : "Image"),
      enabled: true,
      align: "center",
      data: { url, alt },
    };
  }

  const htmlImgMatch = trimmed.match(/^(?:<div[^>]*>\s*)?<img\s+[^>]*src="([^"]+)"[^>]*>(?:\s*<\/div>)?$/i);
  if (htmlImgMatch && !trimmed.includes("img.shields.io")) {
    const url = htmlImgMatch[1];
    const isGif = /\.gif(\?|$)/i.test(url);
    return {
      id: nextId(isGif ? "gif" : "img", index),
      type: isGif ? "gif-banner" : "image",
      title: isGif ? "GIF Banner" : "Image",
      enabled: true,
      align: "center",
      data: { url },
    };
  }

  // 11. H1 Heading
  const h1Match = trimmed.match(/^#\s+(.+)$/);
  if (h1Match) {
    return {
      id: nextId("header", index),
      type: "heading",
      title: h1Match[1].trim(),
      enabled: true,
      data: { level: 1, text: h1Match[1].trim() },
    };
  }

  // 12. H2 Section with body
  const h2Match = trimmed.match(/^##\s+([^\n]+)\n+([\s\S]+)$/);
  if (h2Match) {
    const heading = h2Match[1].trim();
    const body = h2Match[2].trim();
    const inferredType = classifyHeadingSectionType(heading);
    if (inferredType === "about-me") {
      return {
        id: nextId("about", index),
        type: "about-me",
        title: heading,
        enabled: true,
        align: "left",
        data: { markdown: body },
      };
    }
    if (inferredType === "skills" || inferredType === "socials" || inferredType === "contact" || inferredType === "featured-projects") {
      return {
        id: nextId(inferredType, index),
        type: inferredType,
        title: heading,
        enabled: true,
        data: { markdown: body },
      };
    }
    return {
      id: nextId("custom", index),
      type: "custom",
      title: heading,
      enabled: true,
      data: { markdown: trimmed },
    };
  }

  // 13. Fallback: preserve unsupported/complex block losslessly as custom markdown
  return {
    id: nextId("custom", index),
    type: "custom",
    title: "Imported Block",
    enabled: true,
    data: { markdown: trimmed },
  };
}

/**
 * Parse an existing README.md or pasted Markdown string into structured ReadmeSection[].
 * Preserves unsupported or complex blocks as `custom` sections so nothing is lost.
 */
export function importMarkdownToSections(markdown: string): ReadmeSection[] {
  if (!markdown || !markdown.trim()) return [];
  const blocks = splitMarkdownBlocks(markdown);
  return blocks.map((block, index) => parseBlockToSection(block, index));
}

/** Export a project configuration as a versioned JSON string. */
export function exportProjectJson(project: {
  title: string;
  username?: string;
  sections: ReadmeSection[];
}): string {
  const payload: ExportedProjectPayload = {
    version: PROJECT_EXPORT_VERSION,
    title: project.title || "My Profile README",
    username: project.username || "",
    exportedAt: new Date().toISOString(),
    sections: project.sections,
  };
  return JSON.stringify(payload, null, 2);
}

/** Parse and validate an imported project JSON string. */
export function importProjectJson(jsonString: string): ExportedProjectPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error("Invalid JSON file: unable to parse project configuration.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid project JSON: expected an object.");
  }

  const obj = parsed as Record<string, unknown>;
  if (!Array.isArray(obj.sections)) {
    throw new Error("Invalid project JSON: missing 'sections' array.");
  }

  const normalizedSections: ReadmeSection[] = obj.sections.map((raw, idx) => {
    const s = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    return {
      id: typeof s.id === "string" && s.id.trim() ? s.id : nextId("imported", idx),
      type: (typeof s.type === "string" ? s.type : "custom") as SectionType,
      title: typeof s.title === "string" ? s.title : `Section ${idx + 1}`,
      enabled: typeof s.enabled === "boolean" ? s.enabled : true,
      align:
        s.align === "left" || s.align === "center" || s.align === "right"
          ? s.align
          : undefined,
      rawMarkdownOverride:
        typeof s.rawMarkdownOverride === "string" ? s.rawMarkdownOverride : undefined,
      data: s.data && typeof s.data === "object" ? (s.data as Record<string, unknown>) : {},
    };
  });

  return {
    version: typeof obj.version === "number" ? obj.version : 1,
    title: typeof obj.title === "string" && obj.title.trim() ? obj.title : "Imported Profile",
    username: typeof obj.username === "string" ? obj.username : "",
    exportedAt:
      typeof obj.exportedAt === "string" ? obj.exportedAt : new Date().toISOString(),
    sections: normalizedSections,
  };
}
