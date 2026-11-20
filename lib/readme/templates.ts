// lib/readme/templates.ts

import type { ReadmeSection } from "./compiler";
import type { AnalyzedProfile } from "../github/analyzer";

export interface StarterTemplate {
  id: string;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  category: "minimal" | "fullstack" | "creative" | "terminal" | "datascience";
  previewAsciiSlug: string;
  createSections: (profile: Partial<AnalyzedProfile>) => ReadmeSection[];
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: "imposter-ultra",
    name: "Cyberpunk Arcade (Imposter-zx Style)",
    tagline: "Animated Capsule header, view counter, arcade shooter GIF, categorized tech matrix & full stats suite",
    description:
      "Exact architectural reproduction of the popular Imposter-zx README: Waving capsule gradient header, Komarev views badge, retro space shooter GIF, organized multi-row technology stacks, and full GitHub metrics array.",
    badge: "Reference Match",
    category: "creative",
    previewAsciiSlug: "synthwave",
    createSections: (p) => {
      const username = p.username || "octocat";
      const name = p.name || username;
      return [
        {
          id: "capsule-header",
          type: "capsule-render",
          title: "Capsule Header",
          enabled: true,
          align: "center",
          data: {
            capsule: {
              type: "waving",
              color: "0:00F2FE,100:4FACFE",
              height: 200,
              text: `Hi, I'm ${name}`,
              fontSize: 45,
              fontColor: "ffffff",
              desc: "Full-Stack Developer & Tech Explorer",
              descSize: 18,
              animation: "fadeIn",
              section: "header",
            },
          },
        },
        {
          id: "views-counter",
          type: "view-counter",
          title: "Profile Views Counter",
          enabled: true,
          align: "center",
          data: {
            username,
            color: "blueviolet",
            style: "flat-square",
          },
        },
        {
          id: "space-shooter-gif",
          type: "gif-banner",
          title: "Retro Space Shooter Banner",
          enabled: true,
          align: "center",
          data: {
            url: "https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif",
            width: 600,
          },
        },
        {
          id: "about-me",
          type: "about-me",
          title: "About Me",
          enabled: true,
          align: "left",
          data: {
            markdown: [
              `* 🔭 I’m currently building high-performance modern web platforms.`,
              `* 🌱 Deeply exploring **TypeScript, React, Next.js, and Cloud Infrastructure**.`,
              `* 💬 Ask me about **frontend architectures, microservices, and UI/UX design**.`,
              `* ⚡ Fun fact: *I believe code is modern magic.*`,
            ].join("\n"),
          },
        },
        {
          id: "tech-matrix",
          type: "tech-stack-categorized",
          title: "Technologies & Tools",
          enabled: true,
          align: "left",
          data: {
            style: "badges",
            selectedIds: [
              "ts", "js", "python", "cpp", "go", "rust",
              "react", "nextjs", "vue", "tailwind", "html5", "css3",
              "nodejs", "express", "fastapi", "graphql", "nestjs",
              "postgresql", "mongodb", "redis", "mysql", "supabase",
              "docker", "kubernetes", "aws", "linux", "githubactions",
              "git", "github", "vscode", "postman", "figma"
            ],
          },
        },
        {
          id: "stats-1",
          type: "github-stats",
          title: "GitHub Stats",
          enabled: true,
          align: "center",
          data: {
            widget: {
              type: "stats",
              username,
              theme: "tokyonight",
              hideBorder: true,
            },
          },
        },
        {
          id: "streak-1",
          type: "streak",
          title: "Streak Stats",
          enabled: true,
          align: "center",
          data: {
            widget: {
              type: "streak",
              username,
              theme: "tokyonight",
              hideBorder: true,
            },
          },
        },
        {
          id: "trophies-1",
          type: "trophies",
          title: "GitHub Trophies",
          enabled: false,
          align: "center",
          data: {
            widget: {
              type: "trophies",
              username,
              theme: "onedark",
              hideBorder: true,
            },
          },
        },
        {
          id: "activity-graph-1",
          type: "coding-activity",
          title: "Contribution Activity Graph",
          enabled: true,
          align: "center",
          data: {
            widget: {
              type: "activity-graph",
              username,
              theme: "tokyo-night",
              hideBorder: true,
            },
          },
        },
        {
          id: "top-langs-1",
          type: "top-languages",
          title: "Top Languages",
          enabled: true,
          align: "center",
          data: {
            widget: {
              type: "top-langs",
              username,
              theme: "tokyonight",
              hideBorder: true,
            },
          },
        },
        {
          id: "capsule-footer",
          type: "capsule-render",
          title: "Footer Banner",
          enabled: true,
          align: "center",
          data: {
            capsule: {
              type: "waving",
              color: "0:00F2FE,100:4FACFE",
              height: 100,
              section: "footer",
            },
          },
        },
      ];
    },
  },
  {
    id: "minimalist-cyberpunk",
    name: "Minimalist Cyberpunk",
    tagline: "Ultra-clean animated ASCII banner, punchy bio, and minimal tech metrics",
    description:
      "A dark, sleek layout for developers who believe less is more. Features a customizable glowing ASCII banner, compact status badges, and TokyoNight widgets.",
    badge: "Popular",
    category: "minimal",
    previewAsciiSlug: "matrix-rain",
    createSections: (p) => {
      const username = p.username || "octocat";
      const name = p.name || username;
      return [
        {
          id: "banner-1",
          type: "ascii-banner",
          title: "Header Banner",
          enabled: true,
          align: "center",
          data: {
            banner: {
              text: name.toUpperCase(),
              font: "block",
              effect: "glint",
              color: ["00F2FE", "4FACFE"],
              shadow: "double",
            },
          },
        },
        {
          id: "tagline-1",
          type: "tagline",
          title: "Tagline",
          enabled: true,
          align: "center",
          data: {
            text: p.bio || "Crafting robust software systems and beautiful digital experiences.",
          },
        },
        {
          id: "skills-1",
          type: "skills",
          title: "Core Stack",
          enabled: true,
          align: "center",
          data: {
            badges: [
              { label: "", message: "TypeScript", color: "3178C6", logo: "typescript", style: "flat-square" },
              { label: "", message: "React", color: "20232A", logo: "react", style: "flat-square" },
              { label: "", message: "Next.js", color: "000000", logo: "nextdotjs", style: "flat-square" },
              { label: "", message: "Rust", color: "000000", logo: "rust", style: "flat-square" },
              { label: "", message: "Tailwind", color: "06B6D4", logo: "tailwindcss", style: "flat-square" },
            ],
          },
        },
        {
          id: "stats-1",
          type: "github-stats",
          title: "GitHub Stats",
          enabled: true,
          align: "center",
          data: {
            widget: {
              type: "stats",
              username,
              theme: "tokyonight",
              hideBorder: true,
            },
          },
        },
        {
          id: "streak-1",
          type: "streak",
          title: "Contribution Streak",
          enabled: true,
          align: "center",
          data: {
            widget: {
              type: "streak",
              username,
              theme: "tokyonight",
              hideBorder: true,
            },
          },
        },
        {
          id: "footer-1",
          type: "footer",
          title: "Footer",
          enabled: true,
          align: "center",
          data: {
            text: "⭐ Thanks for stopping by my profile! Powered by Profile Forge.",
          },
        },
      ];
    },
  },

  {
    id: "full-stack-architect",
    name: "Full-Stack Architect",
    tagline: "Comprehensive stack breakdown, featured repositories, and detailed metrics",
    description:
      "Designed for seniors and leads. Showcases pinned work, language distributions, architecture tools, and structured contact points.",
    badge: "Recommended",
    category: "fullstack",
    previewAsciiSlug: "command-city",
    createSections: (p) => {
      const username = p.username || "octocat";
      const name = p.name || username;
      return [
        {
          id: "header-1",
          type: "animated-header",
          title: "Greeting",
          enabled: true,
          align: "left",
          data: {
            name,
            subtitle: "Full-Stack Software Engineer & Distributed Systems Enthusiast",
            wave: true,
          },
        },
        {
          id: "about-1",
          type: "about-me",
          title: "About Me",
          enabled: true,
          align: "left",
          data: {
            markdown: [
              `🔭 I’m currently architecting scalable cloud-native platforms.`,
              `🌱 Deepening my knowledge in **distributed consensus, zero-knowledge proofs, and LLM inference**.`,
              `💬 Ask me about **Next.js, TypeScript, PostgreSQL, and Docker**.`,
              `📫 Reach out at: **${p.website || "https://github.com/" + username}**`,
            ].join("\n"),
          },
        },
        {
          id: "skills-langs",
          type: "languages",
          title: "Languages & Core",
          enabled: true,
          align: "left",
          data: {
            badges: [
              { label: "", message: "TypeScript", color: "3178C6", logo: "typescript", style: "for-the-badge" },
              { label: "", message: "Go", color: "00ADD8", logo: "go", style: "for-the-badge" },
              { label: "", message: "Python", color: "3776AB", logo: "python", style: "for-the-badge" },
              { label: "", message: "SQL", color: "4169E1", logo: "postgresql", style: "for-the-badge" },
            ],
          },
        },
        {
          id: "skills-frameworks",
          type: "frameworks",
          title: "Frameworks & Ecosystem",
          enabled: true,
          align: "left",
          data: {
            badges: [
              { label: "", message: "Next.js", color: "000000", logo: "nextdotjs", style: "for-the-badge" },
              { label: "", message: "React", color: "20232A", logo: "react", style: "for-the-badge" },
              { label: "", message: "Node.js", color: "339933", logo: "nodedotjs", style: "for-the-badge" },
              { label: "", message: "Docker", color: "2496ED", logo: "docker", style: "for-the-badge" },
              { label: "", message: "Postgres", color: "4169E1", logo: "postgresql", style: "for-the-badge" },
            ],
          },
        },
        {
          id: "stats-1",
          type: "github-stats",
          title: "GitHub Activity",
          enabled: true,
          align: "center",
          data: {
            widget: {
              type: "stats",
              username,
              theme: "tokyonight",
              hideBorder: true,
            },
          },
        },
        {
          id: "top-langs-1",
          type: "top-languages",
          title: "Most Used Languages",
          enabled: true,
          align: "center",
          data: {
            widget: {
              type: "top-langs",
              username,
              theme: "tokyonight",
              hideBorder: true,
            },
          },
        },
      ];
    },
  },

  {
    id: "retro-terminal-hacker",
    name: "Retro Terminal Hacker",
    tagline: "ASCII terminal boot log, monochrome Linux distro art, and neovim aesthetic",
    description:
      "For CLI aficionados, Linux power users, and vim ninjas. Features retro terminal vibes and system stats.",
    badge: "Retro",
    category: "terminal",
    previewAsciiSlug: "terminal",
    createSections: (p) => {
      const username = p.username || "octocat";
      return [
        {
          id: "ascii-art-1",
          type: "ascii-art",
          title: "Terminal Art",
          enabled: true,
          align: "center",
          data: {
            slug: "terminal",
            width: 480,
          },
        },
        {
          id: "about-1",
          type: "about-me",
          title: "system.info",
          enabled: true,
          align: "left",
          data: {
            markdown: [
              "```bash",
              `$ whoami`,
              `${username}`,
              `$ neofetch --stdout`,
              `OS: Arch Linux x86_64`,
              `Host: ThinkPad X1 Carbon Gen 10`,
              `Kernel: 6.8.9-arch1-1`,
              `Shell: zsh 5.9`,
              `WM: Hyprland (wayland)`,
              `Editor: Neovim (Lua-configured)`,
              `Terminal: Alacritty`,
              "```",
            ].join("\n"),
          },
        },
        {
          id: "streak-1",
          type: "streak",
          title: "Commit Uptime",
          enabled: true,
          align: "center",
          data: {
            widget: {
              type: "streak",
              username,
              theme: "matrix",
              hideBorder: true,
            },
          },
        },
        {
          id: "socials-1",
          type: "socials",
          title: "ssh-keys & links",
          enabled: true,
          align: "left",
          data: {
            badges: [
              { label: "github", message: username, color: "00ff66", style: "flat-square" },
              { label: "gpg", message: "verified", color: "00ff66", style: "flat-square" },
            ],
          },
        },
      ];
    },
  },

  {
    id: "open-source-creator",
    name: "Open Source Creator",
    tagline: "Highlight active contributions, community sponsors, and golden trophies",
    description:
      "Geared toward maintainers and prolific library authors. Puts projects, sponsor links, and community impact front and center.",
    badge: "Community",
    category: "creative",
    previewAsciiSlug: "aurora-fjord",
    createSections: (p) => {
      const username = p.username || "octocat";
      const name = p.name || username;
      return [
        {
          id: "banner-1",
          type: "ascii-banner",
          title: "Creator Banner",
          enabled: true,
          align: "center",
          data: {
            banner: {
              text: name,
              font: "tall",
              effect: "glint",
              color: ["FF6A00", "EE0979"],
            },
          },
        },
        {
          id: "trophies-1",
          type: "trophies",
          title: "GitHub Trophies",
          enabled: false,
          align: "center",
          data: {
            widget: {
              type: "trophies",
              username,
              theme: "onedark",
              hideBorder: true,
            },
          },
        },
        {
          id: "sponsor-1",
          type: "sponsor",
          title: "Sponsor My Open Source Work",
          enabled: true,
          align: "center",
          data: {
            url: `https://github.com/sponsors/${username}`,
            message: "Building open source tools for developers worldwide. Your support keeps me coding full time!",
          },
        },
        {
          id: "stats-1",
          type: "github-stats",
          title: "Contribution Snapshot",
          enabled: true,
          align: "center",
          data: {
            widget: {
              type: "stats",
              username,
              theme: "radical",
              hideBorder: true,
            },
          },
        },
      ];
    },
  },
];
