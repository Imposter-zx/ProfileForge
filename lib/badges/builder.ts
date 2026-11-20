// lib/badges/builder.ts

export interface BadgeConfig {
  label: string;
  message: string;
  color: string; // hex without '#' or named shields color (e.g. "61DAFB", "blue")
  labelColor?: string;
  logo?: string; // simple-icons slug (e.g. "react", "typescript", "tailwindcss")
  logoColor?: string;
  style?: "flat" | "flat-square" | "plastic" | "for-the-badge" | "social";
  href?: string;
}

function escapeShieldsSegment(input: string): string {
  return encodeURIComponent(
    input
      .replace(/-/g, "--")
      .replace(/_/g, "__")
      .replace(/ /g, "_")
  );
}

export function buildShieldsBadgeUrl(cfg: BadgeConfig): string {
  const label = cfg.label ? escapeShieldsSegment(cfg.label) : "";
  const message = escapeShieldsSegment(cfg.message || "");
  const color = cfg.color.replace(/^#/, "") || "blue";

  const path = label ? `${label}-${message}-${color}` : `${message}-${color}`;

  const params = new URLSearchParams();
  if (cfg.style) params.set("style", cfg.style);
  if (cfg.logo) params.set("logo", cfg.logo);
  if (cfg.logoColor) params.set("logoColor", cfg.logoColor.replace(/^#/, ""));
  if (cfg.labelColor) params.set("labelColor", cfg.labelColor.replace(/^#/, ""));

  const qs = params.toString();
  return `https://img.shields.io/badge/${path}${qs ? `?${qs}` : ""}`;
}

export type WidgetType =
  | "stats"
  | "top-langs"
  | "streak"
  | "trophies"
  | "activity-graph"
  | "repo-pin";

export interface WidgetConfig {
  type: WidgetType;
  username: string;
  theme?: string;
  hideBorder?: boolean;
  repo?: string;
  customBaseUrl?: string; // supports self-hosted instances
}

export function buildGitHubWidgetUrl(w: WidgetConfig): string {
  const user = encodeURIComponent(w.username);
  const theme = encodeURIComponent(w.theme || "tokyonight");
  const border = w.hideBorder ? "true" : "false";

  switch (w.type) {
    case "stats": {
      const base = w.customBaseUrl || "https://github-readme-stats.vercel.app/api";
      return `${base}?username=${user}&show_icons=true&theme=${theme}&hide_border=${border}&count_private=true`;
    }
    case "top-langs": {
      const base =
        w.customBaseUrl || "https://github-readme-stats.vercel.app/api/top-langs/";
      return `${base}?username=${user}&layout=compact&theme=${theme}&hide_border=${border}`;
    }
    case "repo-pin": {
      const base =
        w.customBaseUrl || "https://github-readme-stats.vercel.app/api/pin/";
      const repo = encodeURIComponent(w.repo || "");
      return `${base}?username=${user}&repo=${repo}&theme=${theme}&hide_border=${border}`;
    }
    case "streak": {
      const base = w.customBaseUrl || "https://streak-stats.demolab.com";
      return `${base}/?user=${user}&theme=${theme}&hide_border=${border}`;
    }
    case "trophies": {
      const base = w.customBaseUrl || "https://github-profile-trophy.vercel.app/";
      return `${base}?username=${user}&theme=${theme}&no-frame=${border}`;
    }
    case "activity-graph": {
      const base =
        w.customBaseUrl || "https://github-readme-activity-graph.vercel.app/graph";
      return `${base}?username=${user}&theme=tokyo-night&hide_border=${border}`;
    }
  }
}

/** Fallback static-SVG workflow so user READMEs do not break when public widget hosts hit rate limits */
export function generateWidgetActionsFallbackWorkflow(username: string): string {
  return `name: Update Profile Widgets
on:
  schedule:
    - cron: "0 3 * * *"
  workflow_dispatch:

jobs:
  widgets:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - name: Generate Streak Stats SVG
        uses: DenverCoder1/github-readme-streak-stats@v1
        with:
          options: user=${username}&theme=tokyonight&hide_border=true
          path: .github/assets/streak.svg
      - name: Commit updated SVGs
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add .github/assets/
          git diff --quiet && git diff --staged --quiet || (git commit -m "chore: refresh profile widgets" && git push)
`;
}

// Popular predefined tech badges for quick selection
export const POPULAR_TECH_BADGES: {
  category: string;
  badges: Array<{ name: string; slug: string; color: string; logo: string }>;
}[] = [
  {
    category: "Languages",
    badges: [
      { name: "TypeScript", slug: "typescript", color: "3178C6", logo: "typescript" },
      { name: "JavaScript", slug: "javascript", color: "F7DF1E", logo: "javascript" },
      { name: "Python", slug: "python", color: "3776AB", logo: "python" },
      { name: "Rust", slug: "rust", color: "000000", logo: "rust" },
      { name: "Go", slug: "go", color: "00ADD8", logo: "go" },
      { name: "C++", slug: "cplusplus", color: "00599C", logo: "cplusplus" },
      { name: "Java", slug: "java", color: "ED8B00", logo: "openjdk" },
      { name: "Kotlin", slug: "kotlin", color: "7F52FF", logo: "kotlin" },
      { name: "Swift", slug: "swift", color: "F05138", logo: "swift" },
      { name: "PHP", slug: "php", color: "777BB4", logo: "php" },
    ],
  },
  {
    category: "Frameworks & Libraries",
    badges: [
      { name: "React", slug: "react", color: "20232A", logo: "react" },
      { name: "Next.js", slug: "nextjs", color: "000000", logo: "nextdotjs" },
      { name: "Vue.js", slug: "vue", color: "4FC08D", logo: "vuedotjs" },
      { name: "Svelte", slug: "svelte", color: "FF3E00", logo: "svelte" },
      { name: "Node.js", slug: "nodejs", color: "339933", logo: "nodedotjs" },
      { name: "Tailwind CSS", slug: "tailwind", color: "06B6D4", logo: "tailwindcss" },
      { name: "Express", slug: "express", color: "000000", logo: "express" },
      { name: "FastAPI", slug: "fastapi", color: "009688", logo: "fastapi" },
      { name: "Django", slug: "django", color: "092E20", logo: "django" },
      { name: "GraphQL", slug: "graphql", color: "E10098", logo: "graphql" },
    ],
  },
  {
    category: "Databases & Cloud",
    badges: [
      { name: "PostgreSQL", slug: "postgresql", color: "4169E1", logo: "postgresql" },
      { name: "Redis", slug: "redis", color: "DC382D", logo: "redis" },
      { name: "MongoDB", slug: "mongodb", color: "47A248", logo: "mongodb" },
      { name: "Supabase", slug: "supabase", color: "3ECF8E", logo: "supabase" },
      { name: "Docker", slug: "docker", color: "2496ED", logo: "docker" },
      { name: "AWS", slug: "aws", color: "232F3E", logo: "amazonwebservices" },
      { name: "Vercel", slug: "vercel", color: "000000", logo: "vercel" },
      { name: "Cloudflare", slug: "cloudflare", color: "F38020", logo: "cloudflare" },
    ],
  },
  {
    category: "Socials",
    badges: [
      { name: "GitHub", slug: "github", color: "181717", logo: "github" },
      { name: "Twitter/X", slug: "twitter", color: "000000", logo: "x" },
      { name: "LinkedIn", slug: "linkedin", color: "0A66C2", logo: "linkedin" },
      { name: "YouTube", slug: "youtube", color: "FF0000", logo: "youtube" },
      { name: "Discord", slug: "discord", color: "5865F2", logo: "discord" },
      { name: "Portfolio", slug: "portfolio", color: "4B32C3", logo: "googlechrome" },
    ],
  },
];
