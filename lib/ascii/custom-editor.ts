// lib/ascii/custom-editor.ts

export interface CustomAsciiPreset {
  id: string;
  name: string;
  description: string;
  art: string;
}

export const CUSTOM_ASCII_PRESETS: CustomAsciiPreset[] = [
  {
    id: "terminal-box",
    name: "Terminal Welcome Box",
    description: "Clean double-line box header",
    art: [
      "╔══════════════════════════════════════════════════╗",
      "║   WELCOME TO MY GITHUB PROFILE                   ║",
      "║   $ whoami -> full-stack-engineer                ║",
      "╚══════════════════════════════════════════════════╝",
    ].join("\n"),
  },
  {
    id: "retro-cat",
    name: "Sleeping Terminal Cat",
    description: "Compact ASCII cat for footers or sidebars",
    art: [
      "      |\\      _,,,---,,_",
      "ZZZzz /,`.-'`'    -.  ;-;;,_",
      "     |,4-  ) )-,_. ,\\ (  `'-'",
      "    '---''(_/--'  `-'\\_)",
    ].join("\n"),
  },
  {
    id: "rocket-ship",
    name: "Launch Rocket",
    description: "Classic vertical ASCII rocket",
    art: [
      "        /\\",
      "       /  \\",
      "      |    |",
      "      |    |",
      "      |____|",
      "     /|    |\\",
      "    /_|____|_\\",
      "      /_\\/_\\",
      "       *  *",
    ].join("\n"),
  },
  {
    id: "wave-divider",
    name: "Wave Divider",
    description: "Horizontal section separator",
    art: "~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~",
  },
];

/**
 * Normalizes line endings to LF while preserving all leading/trailing spaces
 * and internal whitespace on every line.
 */
export function normalizeAsciiText(raw: string): string {
  return raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/**
 * Computes the longest consecutive backtick run in the text and returns a
 * Markdown code fence guaranteed not to collide with the ASCII content.
 */
export function buildSafeMarkdownAsciiBlock(
  rawAscii: string,
  options?: {
    title?: string;
    collapsible?: boolean;
    summary?: string;
  }
): string {
  const normalized = normalizeAsciiText(rawAscii);
  if (!normalized.trim()) return "";

  const matches = normalized.match(/`+/g);
  const maxRun = matches
    ? matches.reduce((max, run) => Math.max(max, run.length), 0)
    : 0;
  const fence = "`".repeat(Math.max(3, maxRun + 1));

  // Ensure a trailing newline before the closing fence without altering art lines
  const body = normalized.endsWith("\n") ? normalized : `${normalized}\n`;
  const fenced = `${fence}text\n${body}${fence}`;

  if (options?.collapsible) {
    const summary = (options.summary || options.title || "ASCII Art").replace(
      /[<>]/g,
      ""
    );
    return `<details>\n<summary>${summary}</summary>\n\n${fenced}\n\n</details>`;
  }

  return fenced;
}

/**
 * Strips an outer Markdown code fence if the user imports a .md file or
 * pastes a fenced block into the Custom ASCII Editor.
 */
export function extractAsciiFromImportedText(raw: string): string {
  const normalized = normalizeAsciiText(raw);
  const fenceMatch = normalized.match(
    /^\s*(`{3,}|~{3,})[^\n]*\n([\s\S]*?)\n\1\s*$/
  );
  if (fenceMatch) {
    return fenceMatch[2];
  }
  return normalized;
}

export function getAsciiStats(raw: string): {
  lines: number;
  maxWidth: number;
  chars: number;
} {
  const normalized = normalizeAsciiText(raw);
  const split = normalized.split("\n");
  const maxWidth = split.reduce((max, line) => Math.max(max, line.length), 0);
  return {
    lines: split.length,
    maxWidth,
    chars: normalized.length,
  };
}
