// lib/readme/templates.ts

import type { ReadmeSection } from "./compiler";
import type { AnalyzedProfile } from "../github/analyzer";

export type TemplateCategory =
  | "minimal"
  | "fullstack"
  | "creative"
  | "terminal"
  | "datascience"
  | "security"
  | "gaming"
  | "portfolio";

export interface StarterTemplate {
  id: string;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  category: TemplateCategory;
  previewAsciiSlug: string;
  createSections: (profile: Partial<AnalyzedProfile>) => ReadmeSection[];
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  // 1. Minimal Developer
  {
    id: "minimal-developer",
    name: "Minimal Developer",
    tagline: "Crisp typography, concise bio, core stack badges, and clean GitHub metrics",
    description:
      "A distraction-free developer profile focused on clarity. Ideal for engineers who prefer fast-loading, readable Markdown.",
    badge: "Minimal",
    category: "minimal",
    previewAsciiSlug: "donut",
    createSections: (p) => {
      const username = p.username || "octocat";
      const name = p.name || username;
      return [
        {
          id: "min-header",
          type: "profile-header",
          title: "Profile Header",
          enabled: true,
          align: "left",
          data: {
            name,
            subtitle: "Software Engineer",
            wave: true,
          },
        },
        {
          id: "min-about",
          type: "about-me",
          title: "About",
          enabled: true,
          align: "left",
          data: {
            markdown:
              p.bio ||
              "Building reliable software, developer tools, and fast web experiences.",
          },
        },
        {
          id: "min-skills",
          type: "skills",
          title: "Core Stack",
          enabled: true,
          align: "left",
          data: {
            badges: [
              { label: "", message: "TypeScript", color: "3178C6", logo: "typescript", style: "flat-square" },
              { label: "", message: "React", color: "20232A", logo: "react", style: "flat-square" },
              { label: "", message: "Node.js", color: "339933", logo: "nodedotjs", style: "flat-square" },
              { label: "", message: "PostgreSQL", color: "4169E1", logo: "postgresql", style: "flat-square" },
            ],
          },
        },
        {
          id: "min-stats",
          type: "github-stats",
          title: "GitHub Stats",
          enabled: true,
          align: "left",
          data: {
            widget: {
              type: "stats",
              username,
              theme: "default",
              hideBorder: true,
            },
          },
        },
        {
          id: "min-contact",
          type: "contact",
          title: "Contact",
          enabled: true,
          align: "left",
          data: {
            email: "hello@example.com",
            blog: p.website || `https://github.com/${username}`,
          },
        },
      ];
    },
  },

  // 2. Modern Developer
  {
    id: "modern-developer",
    name: "Modern Developer",
    tagline: "Sleek gradient header, view counter, categorized stack, and activity graphs",
    description:
      "A balanced modern GitHub profile combining visual polish with structured technical skills and live repository metrics.",
    badge: "Popular",
    category: "fullstack",
    previewAsciiSlug: "aurora-fjord",
    createSections: (p) => {
      const username = p.username || "octocat";
      const name = p.name || username;
      return [
        {
          id: "mod-capsule",
          type: "capsule-render",
          title: "Modern Header",
          enabled: true,
          align: "center",
          data: {
            capsule: {
              type: "soft",
              color: "0:6366F1,100:06B6D4",
              height: 180,
              text: name,
              fontSize: 42,
              fontColor: "ffffff",
              desc: "Modern Software Engineer • Open Source Contributor",
              descSize: 16,
              animation: "fadeIn",
              section: "header",
            },
          },
        },
        {
          id: "mod-views",
          type: "view-counter",
          title: "Profile Views",
          enabled: true,
          align: "center",
          data: { username, color: "6366f1", style: "flat-square" },
        },
        {
          id: "mod-about",
          type: "about-me",
          title: "About Me",
          enabled: true,
          align: "left",
          data: {
            markdown: [
              "- 🔭 Currently building scalable web products with **Next.js & TypeScript**",
              "- 🌱 Exploring **edge computing, WebAssembly, and AI workflows**",
              "- 💬 Ask me about **design systems, APIs, and DX**",
            ].join("\n"),
          },
        },
        {
          id: "mod-stack",
          type: "tech-stack-categorized",
          title: "Tech Stack",
          enabled: true,
          align: "left",
          data: {
            style: "badges",
            selectedIds: ["ts", "js", "react", "nextjs", "tailwind", "nodejs", "postgresql", "docker"],
          },
        },
        {
          id: "mod-stats",
          type: "github-stats",
          title: "GitHub Metrics",
          enabled: true,
          align: "center",
          data: {
            widget: { type: "stats", username, theme: "tokyonight", hideBorder: true },
          },
        },
        {
          id: "mod-langs",
          type: "top-languages",
          title: "Top Languages",
          enabled: true,
          align: "center",
          data: {
            widget: { type: "top-langs", username, theme: "tokyonight", hideBorder: true },
          },
        },
      ];
    },
  },

  // 3. Cyberpunk Developer
  {
    id: "cyberpunk-developer",
    name: "Cyberpunk Developer",
    tagline: "Neon ASCII banner, synthwave vibes, full-stack matrix, and TokyoNight stats",
    description:
      "High-contrast neon cyberpunk aesthetic with adaptive light/dark ASCII banners, retro GIFs, and glowing stats.",
    badge: "Featured",
    category: "creative",
    previewAsciiSlug: "synthwave",
    createSections: (p) => {
      const username = p.username || "octocat";
      const name = p.name || username;
      return [
        {
          id: "cp-banner",
          type: "ascii-banner",
          title: "Cyberpunk Banner",
          enabled: true,
          align: "center",
          data: {
            banner: {
              text: name.toUpperCase(),
              font: "block",
              effect: "glint",
              color: ["00F2FE", "FF0080"],
              shadow: "double",
            },
          },
        },
        {
          id: "cp-views",
          type: "view-counter",
          title: "Profile Views",
          enabled: true,
          align: "center",
          data: { username, color: "00f2fe", style: "for-the-badge" },
        },
        {
          id: "cp-tagline",
          type: "tagline",
          title: "Tagline",
          enabled: true,
          align: "center",
          data: {
            text: p.bio || "Architecting high-voltage interfaces & distributed backends in the neon grid.",
          },
        },
        {
          id: "cp-stack",
          type: "tech-stack-categorized",
          title: "Cybernetic Stack",
          enabled: true,
          align: "left",
          data: {
            style: "badges",
            selectedIds: ["ts", "rust", "go", "react", "nextjs", "tailwind", "docker", "kubernetes"],
          },
        },
        {
          id: "cp-stats",
          type: "github-stats",
          title: "Grid Telemetry",
          enabled: true,
          align: "center",
          data: {
            widget: { type: "stats", username, theme: "synthwave", hideBorder: true },
          },
        },
        {
          id: "cp-streak",
          type: "streak",
          title: "Uptime Streak",
          enabled: true,
          align: "center",
          data: {
            widget: { type: "streak", username, theme: "synthwave", hideBorder: true },
          },
        },
      ];
    },
  },

  // 4. Mr. Robot
  {
    id: "mr-robot",
    name: "Mr. Robot",
    tagline: "fsociety terminal aesthetic, monochrome ASCII, red/green matrix telemetry",
    description:
      "Inspired by Mr. Robot & fsociety: encrypted terminal logs, stark ASCII art, and minimal hacker-grade GitHub stats.",
    badge: "Cult Classic",
    category: "security",
    previewAsciiSlug: "matrix-rain",
    createSections: (p) => {
      const username = p.username || "elliot";
      return [
        {
          id: "mr-ascii",
          type: "ascii-banner",
          title: "fsociety Banner",
          enabled: true,
          align: "center",
          data: {
            banner: {
              text: username.toUpperCase(),
              font: "tall",
              effect: "type",
              color: ["FF2A2A", "00FF66"],
              shadow: "single",
            },
          },
        },
        {
          id: "mr-quote",
          type: "quote",
          title: "Transmission",
          enabled: true,
          data: {
            text: "Control is an illusion. Sometimes you need to rewrite the kernel.",
            author: "fsociety",
          },
        },
        {
          id: "mr-shell",
          type: "markdown-block",
          title: "Terminal Session",
          enabled: true,
          data: {
            markdown: [
              "```bash",
              `root@fsociety:~# whoami`,
              `${username}`,
              `root@fsociety:~# cat /etc/mission`,
              `> Systems Engineering | Reverse Engineering | Privacy Tools`,
              "```",
            ].join("\n"),
          },
        },
        {
          id: "mr-streak",
          type: "streak",
          title: "Commit Uptime",
          enabled: true,
          align: "center",
          data: {
            widget: { type: "streak", username, theme: "matrix", hideBorder: true },
          },
        },
        {
          id: "mr-socials",
          type: "socials",
          title: "Encrypted Channels",
          enabled: true,
          align: "center",
          data: {
            badges: [
              { label: "github", message: username, color: "111111", logo: "github", style: "flat-square" },
              { label: "pgp", message: "verified", color: "00FF66", style: "flat-square" },
            ],
          },
        },
      ];
    },
  },

  // 5. AI Engineer
  {
    id: "ai-engineer",
    name: "AI Engineer",
    tagline: "LLM systems, PyTorch/Python stack, research highlights, and benchmark tables",
    description:
      "Tailored for ML/AI engineers and researchers. Highlights models, papers, Python/CUDA stack, and open-weight projects.",
    badge: "AI / ML",
    category: "datascience",
    previewAsciiSlug: "neural-net",
    createSections: (p) => {
      const username = p.username || "octocat";
      const name = p.name || username;
      return [
        {
          id: "ai-capsule",
          type: "capsule-render",
          title: "AI Header",
          enabled: true,
          align: "center",
          data: {
            capsule: {
              type: "waving",
              color: "0:8A2387,50:E94057,100:F27121",
              height: 190,
              text: name,
              fontSize: 40,
              fontColor: "ffffff",
              desc: "AI & Machine Learning Engineer • LLM Systems",
              descSize: 16,
              animation: "fadeIn",
              section: "header",
            },
          },
        },
        {
          id: "ai-about",
          type: "about-me",
          title: "Research & Engineering Focus",
          enabled: true,
          align: "left",
          data: {
            markdown: [
              "- 🧠 Building **agentic workflows, RAG pipelines, and fine-tuned models**",
              "- ⚡ Optimizing **PyTorch, CUDA, and vLLM inference**",
              "- 📚 Sharing reproducible experiments and open-source evaluation suites",
            ].join("\n"),
          },
        },
        {
          id: "ai-skills",
          type: "skills",
          title: "ML & AI Stack",
          enabled: true,
          align: "center",
          data: {
            badges: [
              { label: "", message: "Python", color: "3776AB", logo: "python", style: "for-the-badge" },
              { label: "", message: "PyTorch", color: "EE4C2C", logo: "pytorch", style: "for-the-badge" },
              { label: "", message: "HuggingFace", color: "FFD21E", logo: "huggingface", style: "for-the-badge" },
              { label: "", message: "FastAPI", color: "009688", logo: "fastapi", style: "for-the-badge" },
              { label: "", message: "Docker", color: "2496ED", logo: "docker", style: "for-the-badge" },
            ],
          },
        },
        {
          id: "ai-table",
          type: "table",
          title: "Focus Areas",
          enabled: true,
          data: {
            headers: ["Domain", "Tools", "Status"],
            alignments: ["left", "left", "center"],
            rows: [
              ["LLM Inference", "vLLM, llama.cpp, TensorRT", "Active"],
              ["Agent Frameworks", "TypeScript, Python, MCP", "Shipping"],
              ["Evaluations", "pytest, OpenEval", "Maintained"],
            ],
          },
        },
        {
          id: "ai-stats",
          type: "github-stats",
          title: "GitHub Stats",
          enabled: true,
          align: "center",
          data: {
            widget: { type: "stats", username, theme: "radical", hideBorder: true },
          },
        },
      ];
    },
  },

  // 6. Full Stack Developer
  {
    id: "full-stack-developer",
    name: "Full Stack Developer",
    tagline: "End-to-end architecture, categorized languages/frameworks, and featured projects",
    description:
      "Designed for full-stack engineers and tech leads. Showcases frontend, backend, database, and DevOps proficiency.",
    badge: "Recommended",
    category: "fullstack",
    previewAsciiSlug: "command-city",
    createSections: (p) => {
      const username = p.username || "octocat";
      const name = p.name || username;
      return [
        {
          id: "fs-header",
          type: "animated-header",
          title: "Greeting",
          enabled: true,
          align: "left",
          data: {
            name,
            subtitle: "Full-Stack Software Engineer & Cloud Architect",
            wave: true,
          },
        },
        {
          id: "fs-about",
          type: "about-me",
          title: "About Me",
          enabled: true,
          align: "left",
          data: {
            markdown: [
              "- 🔭 Architecting end-to-end web platforms from database schema to pixel-perfect UI",
              "- 🌱 Deepening expertise in **distributed systems, GraphQL, and edge runtimes**",
              `- 📫 Reach out: [${p.website || "https://github.com/" + username}](${p.website || "https://github.com/" + username})`,
            ].join("\n"),
          },
        },
        {
          id: "fs-stack",
          type: "tech-stack-categorized",
          title: "Full-Stack Matrix",
          enabled: true,
          align: "left",
          data: {
            style: "badges",
            selectedIds: [
              "ts", "js", "python", "go",
              "react", "nextjs", "tailwind",
              "nodejs", "express", "fastapi", "graphql",
              "postgresql", "redis", "docker", "aws",
            ],
          },
        },
        {
          id: "fs-projects",
          type: "featured-projects",
          title: "Featured Projects",
          enabled: true,
          data: {
            projects: [
              {
                name: "Profile Forge",
                description: "Interactive GitHub Profile README studio with live preview and ASCII art.",
                url: `https://github.com/${username}`,
                language: "TypeScript",
                stars: 120,
              },
            ],
          },
        },
        {
          id: "fs-stats",
          type: "github-stats",
          title: "GitHub Activity",
          enabled: true,
          align: "center",
          data: {
            widget: { type: "stats", username, theme: "tokyonight", hideBorder: true },
          },
        },
        {
          id: "fs-langs",
          type: "top-languages",
          title: "Most Used Languages",
          enabled: true,
          align: "center",
          data: {
            widget: { type: "top-langs", username, theme: "tokyonight", hideBorder: true },
          },
        },
      ];
    },
  },

  // 7. Cybersecurity Specialist
  {
    id: "cybersecurity-specialist",
    name: "Cybersecurity Specialist",
    tagline: "AppSec & Red/Blue team credentials, security tooling, and PGP-ready contact",
    description:
      "Built for security researchers, penetration testers, and AppSec engineers. Features threat-modeling focus and security badges.",
    badge: "Security",
    category: "security",
    previewAsciiSlug: "terminal",
    createSections: (p) => {
      const username = p.username || "octocat";
      const name = p.name || username;
      return [
        {
          id: "sec-banner",
          type: "ascii-banner",
          title: "Security Header",
          enabled: true,
          align: "center",
          data: {
            banner: {
              text: name.toUpperCase(),
              font: "bold",
              effect: "glint",
              color: ["00FF87", "00B4D8"],
              shadow: "double",
            },
          },
        },
        {
          id: "sec-announcement",
          type: "announcement",
          title: "Responsible Disclosure",
          enabled: true,
          data: {
            kind: "IMPORTANT",
            title: "Security & PGP",
            message: "For vulnerability reports or encrypted correspondence, use my verified PGP key.",
          },
        },
        {
          id: "sec-skills",
          type: "tools",
          title: "Security Arsenal",
          enabled: true,
          align: "center",
          data: {
            badges: [
              { label: "", message: "Linux", color: "FCC624", logo: "linux", style: "for-the-badge" },
              { label: "", message: "Kali", color: "557C94", logo: "kalilinux", style: "for-the-badge" },
              { label: "", message: "Python", color: "3776AB", logo: "python", style: "for-the-badge" },
              { label: "", message: "Rust", color: "000000", logo: "rust", style: "for-the-badge" },
              { label: "", message: "Wireshark", color: "1679A7", logo: "wireshark", style: "for-the-badge" },
            ],
          },
        },
        {
          id: "sec-certs",
          type: "certifications",
          title: "Focus & Certifications",
          enabled: true,
          data: {
            items: [
              { title: "Application Security & Threat Modeling", subtitle: "OWASP / Zero-Trust" },
              { title: "Network & Cloud Hardening", subtitle: "AWS / Kubernetes RBAC" },
            ],
          },
        },
        {
          id: "sec-stats",
          type: "github-stats",
          title: "GitHub Stats",
          enabled: true,
          align: "center",
          data: {
            widget: { type: "stats", username, theme: "dark", hideBorder: true },
          },
        },
      ];
    },
  },

  // 8. Open Source Developer
  {
    id: "open-source-developer",
    name: "Open Source Developer",
    tagline: "Highlight maintained repositories, GitHub Sponsors CTA, and contribution graph",
    description:
      "Geared toward maintainers and library authors. Puts open-source impact, sponsor links, and community metrics front and center.",
    badge: "Community",
    category: "creative",
    previewAsciiSlug: "aurora-fjord",
    createSections: (p) => {
      const username = p.username || "octocat";
      const name = p.name || username;
      return [
        {
          id: "oss-banner",
          type: "ascii-banner",
          title: "Maintainer Banner",
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
          id: "oss-intro",
          type: "introduction",
          title: "Open Source Mission",
          enabled: true,
          data: {
            text: "Maintaining developer-first open source libraries, CLI tools, and documentation.",
          },
        },
        {
          id: "oss-projects",
          type: "project-cards",
          title: "Maintained Projects",
          enabled: true,
          data: {
            layout: "table",
            projects: [
              {
                name: "Awesome CLI",
                description: "Zero-config developer productivity toolkit.",
                url: `https://github.com/${username}`,
                tech: ["TypeScript", "Node.js"],
                stars: 450,
              },
            ],
          },
        },
        {
          id: "oss-sponsor",
          type: "sponsor",
          title: "Sponsor My Open Source Work",
          enabled: true,
          align: "center",
          data: {
            url: `https://github.com/sponsors/${username}`,
            message: "Your sponsorship helps keep my open source projects maintained and free for everyone!",
          },
        },
        {
          id: "oss-activity",
          type: "coding-activity",
          title: "Contribution Activity",
          enabled: true,
          align: "center",
          data: {
            widget: { type: "activity-graph", username, theme: "tokyo-night", hideBorder: true },
          },
        },
      ];
    },
  },

  // 9. Terminal Style
  {
    id: "terminal-style",
    name: "Terminal Style",
    tagline: "Neofetch system info, terminal ASCII art, and monochrome commit streak",
    description:
      "For CLI aficionados, Linux power users, and Neovim ninjas. Features retro terminal vibes and clean monospace blocks.",
    badge: "Retro",
    category: "terminal",
    previewAsciiSlug: "terminal",
    createSections: (p) => {
      const username = p.username || "octocat";
      return [
        {
          id: "term-art",
          type: "ascii-art",
          title: "Terminal Art",
          enabled: true,
          align: "center",
          data: { slug: "terminal", width: 480 },
        },
        {
          id: "term-neofetch",
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
              `Shell: zsh 5.9`,
              `Editor: Neovim (Lua)`,
              `Terminal: Ghostty / Alacritty`,
              "```",
            ].join("\n"),
          },
        },
        {
          id: "term-streak",
          type: "streak",
          title: "Commit Uptime",
          enabled: true,
          align: "center",
          data: {
            widget: { type: "streak", username, theme: "matrix", hideBorder: true },
          },
        },
        {
          id: "term-socials",
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

  // 10. Clean Portfolio
  {
    id: "clean-portfolio",
    name: "Clean Portfolio",
    tagline: "Structured project showcase, location badge, CTA button, and polished footer",
    description:
      "A recruiter-friendly portfolio README with clear project outcomes, tech stack, and direct call-to-action.",
    badge: "Portfolio",
    category: "portfolio",
    previewAsciiSlug: "alpine-dawn",
    createSections: (p) => {
      const username = p.username || "octocat";
      const name = p.name || username;
      return [
        {
          id: "port-header",
          type: "profile-header",
          title: "Portfolio Header",
          enabled: true,
          align: "center",
          data: {
            name,
            subtitle: "Product-Minded Software Engineer",
            wave: false,
          },
        },
        {
          id: "port-location",
          type: "location",
          title: "Availability",
          enabled: true,
          data: {
            location: p.location || "Remote / Worldwide",
            availability: "Open to interesting engineering challenges",
          },
        },
        {
          id: "port-projects",
          type: "featured-projects",
          title: "Selected Work",
          enabled: true,
          data: {
            projects: [
              {
                name: "Cloud Analytics Dashboard",
                description: "Real-time telemetry platform processing 10M+ events/day.",
                url: `https://github.com/${username}`,
                language: "TypeScript",
                stars: 85,
              },
            ],
          },
        },
        {
          id: "port-cta",
          type: "cta",
          title: "Let's Connect",
          enabled: true,
          align: "center",
          data: {
            label: "View My Website",
            url: p.website || `https://github.com/${username}`,
            color: "2563EB",
            message: "Interested in collaborating or hiring?",
          },
        },
        {
          id: "port-footer",
          type: "footer",
          title: "Footer",
          enabled: true,
          align: "center",
          data: { text: `© ${new Date().getFullYear()} ${name} • Built with Profile Forge` },
        },
      ];
    },
  },

  // 11. Animated Profile
  {
    id: "animated-profile",
    name: "Animated Profile",
    tagline: "Waving Capsule Render, animated GIF banner, twinkling ASCII, and dynamic stats",
    description:
      "Maximum visual motion: waving gradient header, retro coding GIF, animated SVG art, and a matching footer wave.",
    badge: "Animated",
    category: "creative",
    previewAsciiSlug: "tokyo-rain",
    createSections: (p) => {
      const username = p.username || "octocat";
      const name = p.name || username;
      return [
        {
          id: "anim-header",
          type: "capsule-render",
          title: "Waving Header",
          enabled: true,
          align: "center",
          data: {
            capsule: {
              type: "waving",
              color: "0:00F2FE,100:4FACFE",
              height: 200,
              text: `Hi, I'm ${name}`,
              fontSize: 44,
              fontColor: "ffffff",
              desc: "Creative Developer & Motion Enthusiast",
              descSize: 18,
              animation: "fadeIn",
              section: "header",
            },
          },
        },
        {
          id: "anim-gif",
          type: "gif-banner",
          title: "Coding GIF Banner",
          enabled: true,
          align: "center",
          data: {
            url: "https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif",
            width: 560,
          },
        },
        {
          id: "anim-ascii",
          type: "ascii-art",
          title: "Animated ASCII Scene",
          enabled: true,
          align: "center",
          data: { slug: "tokyo-rain", width: 420 },
        },
        {
          id: "anim-stats",
          type: "github-stats",
          title: "GitHub Stats",
          enabled: true,
          align: "center",
          data: {
            widget: { type: "stats", username, theme: "tokyonight", hideBorder: true },
          },
        },
        {
          id: "anim-footer",
          type: "capsule-render",
          title: "Waving Footer",
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

  // 12. Gaming Developer
  {
    id: "gaming-developer",
    name: "Gaming Developer",
    tagline: "Game engines, C++/Rust/C# stack, shader art, and interactive project showcase",
    description:
      "Built for game developers, graphics programmers, and indie creators using Unreal, Unity, Godot, and custom engines.",
    badge: "GameDev",
    category: "gaming",
    previewAsciiSlug: "doom-fire",
    createSections: (p) => {
      const username = p.username || "octocat";
      const name = p.name || username;
      return [
        {
          id: "game-banner",
          type: "ascii-banner",
          title: "Player Banner",
          enabled: true,
          align: "center",
          data: {
            banner: {
              text: name.toUpperCase(),
              font: "wide",
              effect: "glint",
              color: ["FF4500", "FFD700"],
              shadow: "heavy",
            },
          },
        },
        {
          id: "game-about",
          type: "about-me",
          title: "Player Stats & Lore",
          enabled: true,
          align: "left",
          data: {
            markdown: [
              "- 🎮 Building **real-time 3D engines, shaders, and indie games**",
              "- 🛠️ Main Quest: **60+ FPS rendering pipelines & procedural worlds**",
              "- 🕹️ Side Quest: **Game jams, pixel art, and retro console homebrew**",
            ].join("\n"),
          },
        },
        {
          id: "game-skills",
          type: "skills",
          title: "Engines & Languages",
          enabled: true,
          align: "center",
          data: {
            badges: [
              { label: "", message: "C++", color: "00599C", logo: "cplusplus", style: "for-the-badge" },
              { label: "", message: "Rust", color: "000000", logo: "rust", style: "for-the-badge" },
              { label: "", message: "C#", color: "239120", logo: "csharp", style: "for-the-badge" },
              { label: "", message: "Unity", color: "000000", logo: "unity", style: "for-the-badge" },
              { label: "", message: "Godot", color: "478CBF", logo: "godotengine", style: "for-the-badge" },
              { label: "", message: "Unreal Engine", color: "0E1128", logo: "unrealengine", style: "for-the-badge" },
            ],
          },
        },
        {
          id: "game-projects",
          type: "featured-projects",
          title: "Released & WIP Games",
          enabled: true,
          data: {
            projects: [
              {
                name: "Neon Voxel Engine",
                description: "Custom Vulkan voxel renderer with real-time raymarched lighting.",
                url: `https://github.com/${username}`,
                language: "C++",
                stars: 210,
              },
            ],
          },
        },
        {
          id: "game-stats",
          type: "github-stats",
          title: "GitHub XP",
          enabled: true,
          align: "center",
          data: {
            widget: { type: "stats", username, theme: "gruvbox", hideBorder: true },
          },
        },
      ];
    },
  },
];
