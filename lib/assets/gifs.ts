// lib/assets/gifs.ts

export type GifCategory =
  | "developer"
  | "coding"
  | "cybersecurity"
  | "ai"
  | "gaming"
  | "cyberpunk"
  | "space"
  | "dividers"
  | "footers";

export interface GifAsset {
  id: string;
  title: string;
  category: GifCategory;
  url: string;
  tags: string[];
  recommendedWidth?: number;
}

export const GIF_CATEGORIES = [
  { id: "all", label: "All Visuals" },
  { id: "developer", label: "Developer" },
  { id: "coding", label: "Coding & Terminal" },
  { id: "cybersecurity", label: "Cybersecurity" },
  { id: "ai", label: "AI & Neural" },
  { id: "gaming", label: "Gaming & Retro" },
  { id: "cyberpunk", label: "Cyberpunk & Neon" },
  { id: "space", label: "Space & Cosmic" },
  { id: "dividers", label: "Animated Dividers" },
  { id: "footers", label: "Footer Banners" },
] as const;

export const CURATED_GIFS: GifAsset[] = [
  // Developer
  {
    id: "developer-desk-loop",
    title: "Developer Typing at Night",
    category: "developer",
    url: "https://user-images.githubusercontent.com/74038190/212284136-1e6bb69c-072a-43cf-be62-8e7c10b2a64c.gif",
    tags: ["developer", "laptop", "setup", "desk"],
    recommendedWidth: 500,
  },
  {
    id: "developer-coffee-code",
    title: "Late Night Code & Coffee",
    category: "developer",
    url: "https://user-images.githubusercontent.com/74038190/229223263-cf2e4b07-2615-4f87-9c38-e37600f8381a.gif",
    tags: ["developer", "coffee", "night", "workflow"],
    recommendedWidth: 480,
  },

  // Coding & Terminal
  {
    id: "terminal-matrix-compile",
    title: "CLI Terminal Stream",
    category: "coding",
    url: "https://user-images.githubusercontent.com/74038190/212284158-e9f15230-68d2-4916-9988-6927787fb29b.gif",
    tags: ["terminal", "compile", "code", "cli"],
    recommendedWidth: 480,
  },
  {
    id: "coding-typing-wave",
    title: "Hello World Typing Banner",
    category: "coding",
    url: "https://user-images.githubusercontent.com/74038190/213870853-5856627a-8696-410c-8565-2e6f18e677a0.gif",
    tags: ["coding", "hello world", "typing"],
    recommendedWidth: 520,
  },

  // Cybersecurity
  {
    id: "matrix-digital-rain",
    title: "Matrix Green Rain Fall",
    category: "cybersecurity",
    url: "https://user-images.githubusercontent.com/74038190/212284167-27b9ef08-2e0e-450f-a9cb-b0ebf490a618.gif",
    tags: ["matrix", "cybersecurity", "hacker", "green code"],
    recommendedWidth: 600,
  },
  {
    id: "cybersec-shield-pulse",
    title: "Cyber Grid Lock Pulse",
    category: "cybersecurity",
    url: "https://user-images.githubusercontent.com/74038190/212748842-9fc70b55-68a9-45e0-a6f6-a7f8636d8d3b.gif",
    tags: ["security", "shield", "network", "infosec"],
    recommendedWidth: 460,
  },

  // AI & Neural
  {
    id: "ai-neural-core",
    title: "Neural Network Pulse",
    category: "ai",
    url: "https://user-images.githubusercontent.com/74038190/212749447-bfb7e725-6987-49d9-ae85-2015e3e7cc41.gif",
    tags: ["ai", "neural", "machine learning", "data"],
    recommendedWidth: 520,
  },
  {
    id: "ai-orbital-nodes",
    title: "Autonomous Agent Nodes",
    category: "ai",
    url: "https://user-images.githubusercontent.com/74038190/212749171-b8460336-33e6-4c3b-991a-09356f92a38a.gif",
    tags: ["ai", "agents", "graph", "llm"],
    recommendedWidth: 520,
  },

  // Gaming & Retro
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
    tags: ["runner", "gameboy", "arcade", "gaming"],
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
    id: "rainbow-line-divider",
    title: "Animated Rainbow Gradient Divider",
    category: "dividers",
    url: "https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif",
    tags: ["divider", "wave", "line", "separator", "rainbow"],
    recommendedWidth: 800,
  },

  // Footer Banners
  {
    id: "retro-wave-footer",
    title: "Pixel Wave Horizon Footer",
    category: "footers",
    url: "https://user-images.githubusercontent.com/74038190/212257472-08e52665-c4f8-4bd5-9e39-c2e0c419076f.gif",
    tags: ["footer", "wave", "end", "banner"],
    recommendedWidth: 800,
  },
];

export const RETRO_SPACE_SHOOTER_GIF = CURATED_GIFS.find(
  (g) => g.id === "space-shooter-arcade"
)!;
