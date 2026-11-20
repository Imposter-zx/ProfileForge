// lib/assets/gifs.ts

export interface GifAsset {
  id: string;
  title: string;
  category:
    | "cyberpunk"
    | "hacker"
    | "space"
    | "gaming"
    | "coding"
    | "matrix"
    | "dividers"
    | "footers";
  url: string;
  tags: string[];
  recommendedWidth?: number;
}

export const GIF_CATEGORIES = [
  { id: "all", label: "All Visuals" },
  { id: "gaming", label: "Retro Gaming & Shooter" },
  { id: "cyberpunk", label: "Cyberpunk & Neon" },
  { id: "coding", label: "Coding & Terminal" },
  { id: "matrix", label: "Matrix & Glitch" },
  { id: "space", label: "Space & Cosmic" },
  { id: "dividers", label: "Animated Dividers" },
  { id: "footers", label: "Footer Banners" },
] as const;

export const CURATED_GIFS: GifAsset[] = [
  // Retro Gaming & Space Shooter (Reference Imposter-zx style)
  {
    id: "space-shooter-arcade",
    title: "Retro Arcade Space Shooter",
    category: "gaming",
    url: "https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif",
    tags: ["space shooter", "arcade", "retro", "pixel art", "game"],
    recommendedWidth: 600,
  },
  {
    id: "space-invader-8bit",
    title: "8-Bit Space Invader Defender",
    category: "gaming",
    url: "https://user-images.githubusercontent.com/74038190/212284115-f47cd8ff-2ffb-4977-b0b3-0ab502402725.gif",
    tags: ["space invader", "pixel", "retro", "arcade"],
    recommendedWidth: 500,
  },
  {
    id: "gameboy-pixel-loop",
    title: "Pixel Arcade Runner",
    category: "gaming",
    url: "https://user-images.githubusercontent.com/74038190/212284087-bbe7e430-757e-4901-90bf-4cd2ce3e1852.gif",
    tags: ["runner", "gameboy", "arcade"],
    recommendedWidth: 450,
  },

  // Cyberpunk & Neon
  {
    id: "cyberpunk-city-drive",
    title: "Cyberpunk Neon City Drive",
    category: "cyberpunk",
    url: "https://user-images.githubusercontent.com/74038190/212284126-e17849e7-578b-4dac-90d5-072d628eb502.gif",
    tags: ["cyberpunk", "synthwave", "city", "neon"],
    recommendedWidth: 600,
  },
  {
    id: "neon-grid-horizon",
    title: "Synthwave Grid Horizon",
    category: "cyberpunk",
    url: "https://user-images.githubusercontent.com/74038190/212284144-59e55938-1647-4952-b883-fa4c22934279.gif",
    tags: ["synthwave", "grid", "sun", "horizon"],
    recommendedWidth: 600,
  },

  // Coding & Terminal
  {
    id: "developer-desk-loop",
    title: "Developer Typing at Night",
    category: "coding",
    url: "https://user-images.githubusercontent.com/74038190/212284136-1e6bb69c-072a-43cf-be62-8e7c10b2a64c.gif",
    tags: ["coding", "laptop", "developer", "terminal"],
    recommendedWidth: 500,
  },
  {
    id: "terminal-matrix-compile",
    title: "CLI Terminal Stream",
    category: "coding",
    url: "https://user-images.githubusercontent.com/74038190/212284158-e9f15230-68d2-4916-9988-6927787fb29b.gif",
    tags: ["terminal", "compile", "code"],
    recommendedWidth: 480,
  },

  // Matrix & Glitch
  {
    id: "matrix-digital-rain",
    title: "Matrix Green Rain Fall",
    category: "matrix",
    url: "https://user-images.githubusercontent.com/74038190/212284167-27b9ef08-2e0e-450f-a9cb-b0ebf490a618.gif",
    tags: ["matrix", "green code", "cyber", "hacker"],
    recommendedWidth: 600,
  },

  // Space & Cosmic
  {
    id: "cosmic-galaxy-swirl",
    title: "Deep Space Orbit",
    category: "space",
    url: "https://user-images.githubusercontent.com/74038190/212284180-87a37e1a-ffc6-464c-85a0-974244d32095.gif",
    tags: ["space", "galaxy", "orbit", "stars"],
    recommendedWidth: 550,
  },

  // Dividers & Animated Rules
  {
    id: "neon-wave-divider",
    title: "Glowing Rainbow Neon Wave Divider",
    category: "dividers",
    url: "https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif",
    tags: ["divider", "wave", "line", "separator"],
    recommendedWidth: 800,
  },

  // Footer Banners
  {
    id: "retro-sunset-footer",
    title: "Pixel Sunset Horizon Footer",
    category: "footers",
    url: "https://user-images.githubusercontent.com/74038190/212284126-e17849e7-578b-4dac-90d5-072d628eb502.gif",
    tags: ["footer", "sunset", "end"],
    recommendedWidth: 800,
  },
];

export const RETRO_SPACE_SHOOTER_GIF = CURATED_GIFS[0];
