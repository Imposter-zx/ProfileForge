// lib/ascii/catalog.ts
import type { Category } from "ascii.rest";
import catalogDataRaw from "./catalog.data.json";

export type AsciiCategory = Category;

export interface AsciiPieceEntry {
  slug: string;
  name: string;
  category: AsciiCategory;
  note: string;
  cols: number;
  rows: number;
  fps: number;
  isCanvas: boolean;
  hasHostedReadmeSvg: boolean;
  supportsColor: boolean;
  tags?: string[];
}

export const CATEGORIES: readonly AsciiCategory[] = [
  "scenes",
  "ui",
  "data",
  "type",
  "logos",
  "companies",
  "distros",
  "shapes",
  "space",
  "physics",
  "nature",
  "creatures",
  "objects",
  "generative",
  "effects",
] as const;

export const CATEGORY_LABELS: Record<AsciiCategory, string> = {
  scenes: "Atmospheric Scenes",
  ui: "UI & Terminal",
  data: "Data & Charts",
  type: "Typography & Text",
  logos: "Languages & Frameworks",
  companies: "Companies & Platforms",
  distros: "Linux Distros",
  shapes: "Geometric & 3D Shapes",
  space: "Cosmos & Astronomy",
  physics: "Physics & Simulators",
  nature: "Nature & Weather",
  creatures: "Creatures & Wildlife",
  objects: "Objects & Machines",
  generative: "Generative & Math Art",
  effects: "VFX & Shaders",
};

// Tag definitions for cross-category thematic exploration
const TAG_RULES: Record<string, string[]> = {
  cats: ["cat"],
  animals: ["cat", "fox", "owl", "snake", "spider", "starlings", "whale", "butterfly", "jellyfish", "aquarium", "tux"],
  space: [
    "black-hole", "earth", "eclipse", "galaxy", "moon-phases", "planet", "rocket",
    "saptarishi", "solar-system", "starfield", "three-body", "saturn-rise", "earthrise", "edge-orbit"
  ],
  planets: ["earth", "planet", "saturn-rise", "earthrise", "black-hole", "solar-system"],
  nature: [
    "aurora", "bonsai", "campfire", "cherry-blossom", "contour-map", "fern",
    "fireflies", "fractal-tree", "landscape", "lightning", "rain", "ruled-mountains",
    "sea-swell", "snowfall", "sunrise", "wind", "alpine-dawn", "aurora-fjord", "deep-reef",
    "desert-night", "jungle-falls", "misty-forest", "ocean-sunset", "snow-train", "tokyo-rain"
  ],
  ocean: ["deep-reef", "sea-swell", "ocean-sunset", "whale", "jellyfish", "aquarium"],
  fire: ["campfire", "doom-fire", "sparks", "volcano-night", "candle"],
  cyberpunk: [
    "matrix-rain", "synthwave", "doom-fire", "tunnel", "tv-static", "glitch",
    "terminal", "boot-log", "command-city", "prism-city"
  ],
  matrix: ["matrix-rain", "glitch", "terminal"],
  terminal: ["terminal", "boot-log", "command-city", "pipeline", "git-graph", "cpu-meters"],
  shapes3d: [
    "donut", "cube", "dna-helix", "tesseract", "torus-knot", "twisted-ring",
    "icosahedron", "mobius-strip", "spring", "glxgears", "gyroscope"
  ],
  loading: ["spinners", "progress-bar", "skeleton", "digital-clock", "analog-clock", "hourglass"],
  math: [
    "mandelbrot", "julia-set", "reaction-diffusion", "hilbert-curve", "flow-field",
    "epicycles", "langtons-ant", "sierpinski", "voronoi", "rule-30"
  ],
};

function assignTags(slug: string, category: string): string[] {
  const tags = new Set<string>([category]);
  for (const [tag, slugs] of Object.entries(TAG_RULES)) {
    if (slugs.includes(slug)) tags.add(tag);
  }
  return Array.from(tags);
}

export const ASCII_CATALOG: AsciiPieceEntry[] = (catalogDataRaw as AsciiPieceEntry[]).map(
  (p) => ({
    ...p,
    tags: assignTags(p.slug, p.category),
  })
);

export const POPULAR_PIECES: string[] = [
  "donut",
  "matrix-rain",
  "tokyo-rain",
  "synthwave",
  "terminal",
  "arch-linux",
  "black-hole",
  "galaxy",
  "bonsai",
  "cat",
  "dna-helix",
  "tesseract",
  "aurora-fjord",
  "command-city",
  "rust",
  "typescript",
  "tux",
];

export const SLUG_TO_PIECE: Map<string, AsciiPieceEntry> = new Map(
  ASCII_CATALOG.map((p) => [p.slug, p])
);

export function getPieceBySlug(slug: string): AsciiPieceEntry | undefined {
  return SLUG_TO_PIECE.get(slug);
}

export function getRandomPiece(): AsciiPieceEntry {
  const idx = Math.floor(Math.random() * ASCII_CATALOG.length);
  return ASCII_CATALOG[idx];
}

export function getCatalogByCategory(category: AsciiCategory | "all"): AsciiPieceEntry[] {
  if (category === "all") return ASCII_CATALOG;
  return ASCII_CATALOG.filter((p) => p.category === category);
}

export function searchCatalog(
  query: string,
  category: AsciiCategory | "all" = "all",
  tagFilter?: string
): AsciiPieceEntry[] {
  const q = query.trim().toLowerCase();
  let list = getCatalogByCategory(category);

  if (tagFilter && tagFilter !== "all") {
    list = list.filter((p) => p.tags?.includes(tagFilter));
  }

  if (!q) return list;

  return list.filter((p) => {
    return (
      p.slug.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.note.toLowerCase().includes(q) ||
      p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });
}

export interface BannerOptions {
  text: string;
  color?: string[]; // hex without '#', e.g. ['ff6a00', 'f778ba'] or ['art']
  effect?: "glint" | "type" | "still";
  speed?: "slow" | "normal" | "fast";
  font?: "block" | "slim" | "tall" | "bold" | "round" | "wide" | "mixed" | "italic";
  shadow?: "double" | "single" | "heavy" | "rounded" | "ascii" | "none";
  fill?: "shade" | "block" | "light" | "hash" | "at";
  tagline?: string;
  art?: string; // slug of a logo, company, or distro
  place?: "left" | "right" | "above" | "below";
  size?: "s" | "m" | "l";
  bg?: string; // hex without '#'
}

export function buildAsciiBannerUrls(opts: BannerOptions): {
  lightUrl: string;
  darkUrl: string;
} {
  const safeText = opts.text.slice(0, 30).trim() || "welcome";
  const encodedText = encodeURIComponent(safeText);
  const params = new URLSearchParams();

  if (opts.color?.length) {
    params.set("color", opts.color.map((c) => c.replace("#", "")).join(","));
  }
  if (opts.effect && opts.effect !== "glint") params.set("effect", opts.effect);
  if (opts.speed && opts.speed !== "normal") params.set("speed", opts.speed);
  if (opts.font && opts.font !== "block") params.set("font", opts.font);
  if (opts.shadow && opts.shadow !== "double") params.set("shadow", opts.shadow);
  if (opts.fill && opts.fill !== "shade") params.set("fill", opts.fill);
  if (opts.tagline) params.set("tagline", opts.tagline.slice(0, 60));
  if (opts.art) params.set("art", opts.art);
  if (opts.place && opts.place !== "left") params.set("place", opts.place);
  if (opts.size && opts.size !== "m") params.set("size", opts.size);
  if (opts.bg) params.set("bg", opts.bg.replace("#", ""));

  const qs = params.toString();
  const suffix = qs ? `?${qs}` : "";

  return {
    lightUrl: `https://ascii.rest/banner/${encodedText}.svg${suffix}`,
    darkUrl: `https://ascii.rest/banner/${encodedText}.dark.svg${suffix}`,
  };
}

export function buildPieceReadmeUrls(slug: string): {
  lightUrl: string;
  darkUrl: string;
} {
  const piece = getPieceBySlug(slug);
  if (piece?.hasHostedReadmeSvg) {
    return {
      lightUrl: `https://ascii.rest/svg/${slug}.svg`,
      darkUrl: `https://ascii.rest/svg/${slug}.dark.svg`,
    };
  }
  return {
    lightUrl: `/api/ascii/svg/${slug}?dark=0`,
    darkUrl: `/api/ascii/svg/${slug}?dark=1`,
  };
}

export function renderAdaptivePictureHtml(params: {
  lightSrc: string;
  darkSrc: string;
  alt: string;
  width?: number;
  align?: "left" | "center" | "right";
  href?: string;
}): string {
  const widthAttr = params.width ? ` width="${params.width}"` : "";
  const img = `<img alt="${escapeAttr(params.alt)}" src="${escapeAttr(params.lightSrc)}"${widthAttr} />`;
  const picture = [
    `<picture>`,
    `  <source media="(prefers-color-scheme: dark)" srcset="${escapeAttr(params.darkSrc)}" />`,
    `  ${img}`,
    `</picture>`,
  ].join("\n");

  const linked = params.href
    ? `<a href="${escapeAttr(params.href)}">\n${picture}\n</a>`
    : picture;

  if (params.align === "center") return `<div align="center">\n${linked}\n</div>`;
  if (params.align === "right") return `<div align="right">\n${linked}\n</div>`;
  return linked;
}

function escapeAttr(val: string): string {
  return val
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
