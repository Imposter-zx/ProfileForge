// lib/assets/capsule.ts

export type CapsuleType =
  | "wave"
  | "waving"
  | "egg"
  | "shark"
  | "slice"
  | "rect"
  | "soft"
  | "rounded"
  | "cylinder"
  | "transparent";

export type CapsuleAnimation = "fadeIn" | "scaleIn" | "twinkling" | "blinking";

export interface CapsuleRenderConfig {
  type: CapsuleType;
  color?: string; // "auto", "gradient", "timeGradient", or custom hex e.g. "0:00F2FE,100:4FACFE"
  height?: number; // e.g. 150 - 250 for header, 80 - 120 for footer
  text?: string;
  fontSize?: number;
  fontColor?: string;
  fontAlign?: number; // 0 - 100, default 50
  fontAlignY?: number; // 0 - 100, default 50
  desc?: string;
  descSize?: number;
  descAlign?: number;
  descAlignY?: number;
  animation?: CapsuleAnimation;
  section?: "header" | "footer";
  stroke?: string;
  strokeWidth?: number;
}

export const CAPSULE_TYPES: readonly CapsuleType[] = [
  "waving",
  "wave",
  "egg",
  "shark",
  "slice",
  "rect",
  "soft",
  "rounded",
  "cylinder",
  "transparent",
] as const;

export const CAPSULE_COLOR_PRESETS = [
  { name: "Cyberpunk Cyan-Purple", color: "0:00F2FE,100:4FACFE" },
  { name: "Neon Sunset Orange-Pink", color: "0:FF6A00,100:EE0979" },
  { name: "Deep Galaxy Violet", color: "0:8A2387,50:E94057,100:F27121" },
  { name: "Matrix Emerald Glow", color: "0:00FF87,100:60EFFF" },
  { name: "Midnight Obsidian", color: "0:141E30,100:243B55" },
  { name: "Dynamic Auto Theme", color: "auto" },
  { name: "Time of Day Gradient", color: "timeGradient" },
] as const;

export function buildCapsuleRenderUrl(cfg: CapsuleRenderConfig): string {
  const params = new URLSearchParams();

  params.set("type", cfg.type || "waving");
  params.set("color", cfg.color || "auto");
  params.set("height", String(cfg.height || (cfg.section === "footer" ? 100 : 200)));
  params.set("section", cfg.section || "header");

  if (cfg.text) {
    params.set("text", cfg.text);
    if (cfg.fontSize) params.set("fontSize", String(cfg.fontSize));
    if (cfg.fontColor) params.set("fontColor", cfg.fontColor.replace("#", ""));
    if (typeof cfg.fontAlign === "number") params.set("fontAlign", String(cfg.fontAlign));
    if (typeof cfg.fontAlignY === "number") params.set("fontAlignY", String(cfg.fontAlignY));
  }

  if (cfg.desc) {
    params.set("desc", cfg.desc);
    if (cfg.descSize) params.set("descSize", String(cfg.descSize));
    if (typeof cfg.descAlign === "number") params.set("descAlign", String(cfg.descAlign));
    if (typeof cfg.descAlignY === "number") params.set("descAlignY", String(cfg.descAlignY));
  }

  if (cfg.animation) {
    params.set("animation", cfg.animation);
  }

  if (cfg.stroke) {
    params.set("stroke", cfg.stroke.replace("#", ""));
    if (cfg.strokeWidth) params.set("strokeWidth", String(cfg.strokeWidth));
  }

  return `https://capsule-render.vercel.app/api?${params.toString()}`;
}
