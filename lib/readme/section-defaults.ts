// lib/readme/section-defaults.ts
import type { ReadmeSection, SectionType } from "./compiler";

let sectionCounter = 100;

export function createSectionFromType(
  type: SectionType,
  title: string,
  username = "octocat"
): ReadmeSection {
  sectionCounter += 1;
  const id = `sec-${type}-${Date.now().toString(36)}-${sectionCounter}`;
  const targetUser = username || "octocat";
  const centerTypes = new Set<SectionType>([
    "capsule-render",
    "view-counter",
    "gif-banner",
    "image",
    "banner",
    "svg",
    "ascii-banner",
    "ascii-art",
    "animated-header",
    "profile-header",
    "avatar",
    "github-stats",
    "top-languages",
    "streak",
    "trophies",
    "contribution-graph",
    "coding-activity",
    "repo-showcase",
    "tech-stack-categorized",
    "skills",
    "languages",
    "frameworks",
    "tools",
    "socials",
    "social-links",
    "cta",
    "footer",
  ]);

  return {
    id,
    type,
    title,
    enabled: true,
    align: centerTypes.has(type) ? "center" : "left",
    data: getDefaultDataForSectionType(type, targetUser),
  };
}

export function getDefaultDataForSectionType(
  type: SectionType,
  username = "octocat"
): Record<string, unknown> {
  switch (type) {
    case "profile-header":
    case "animated-header":
      return {
        name: username,
        heading: `Hi there, I'm ${username} 👋`,
        subtitle: "Full-Stack Engineer • Open Source Contributor • Builder",
        wave: true,
      };
    case "avatar":
      return {
        url: `https://github.com/${username}.png?size=160`,
        size: 128,
        alt: `${username} avatar`,
      };
    case "introduction":
      return {
        markdown: `I'm a software engineer passionate about developer tools, clean architecture, and open-source software.`,
      };
    case "about-me":
      return {
        markdown: `- 🔭 I’m currently working on **awesome open-source projects**\n- 🌱 I’m currently learning **Rust, TypeScript & Distributed Systems**\n- 💬 Ask me about **React, Next.js, Node.js, or System Design**\n- ⚡ Fun fact: **I automate everything I do twice**`,
      };
    case "tagline":
      return {
        text: "Crafting fast, resilient software & developer experiences.",
      };
    case "profile-info":
      return {
        items: [
          { label: "Role", value: "Senior Full-Stack Engineer" },
          { label: "Focus", value: "TypeScript, Cloud Native, AI Tooling" },
          { label: "Status", value: "Open to interesting collaborations" },
        ],
      };
    case "view-counter":
      return {
        viewCounter: {
          username,
          label: "PROFILE VIEWS",
          color: "6366f1",
          style: "for-the-badge",
        },
      };
    case "social-links":
    case "socials":
      return {
        badges: [
          {
            label: "GitHub",
            message: `@${username}`,
            color: "181717",
            logo: "github",
            style: "for-the-badge",
            link: `https://github.com/${username}`,
          },
          {
            label: "LinkedIn",
            message: "Connect",
            color: "0A66C2",
            logo: "linkedin",
            style: "for-the-badge",
            link: "https://linkedin.com",
          },
          {
            label: "X",
            message: "Follow",
            color: "000000",
            logo: "x",
            style: "for-the-badge",
            link: "https://x.com",
          },
        ],
      };
    case "contact":
      return {
        email: `${username}@example.com`,
        website: `https://${username}.dev`,
        twitter: username,
        linkedin: username,
      };
    case "location":
      return {
        city: "San Francisco, CA",
        timezone: "UTC-8 (PST)",
        availability: "Available for remote collaborations",
      };
    case "education":
    case "experience":
    case "certifications":
    case "achievements":
      return {
        items: [
          {
            title:
              type === "education"
                ? "B.S. in Computer Science"
                : type === "certifications"
                  ? "AWS Certified Solutions Architect"
                  : type === "achievements"
                    ? "GitHub Arctic Code Vault Contributor"
                    : "Senior Software Engineer",
            subtitle:
              type === "education"
                ? "University of Technology"
                : type === "certifications"
                  ? "Amazon Web Services"
                  : type === "achievements"
                    ? "Open Source Milestone"
                    : "Acme Labs",
            period: "2023 — Present",
            description: "Building scalable developer platforms and high-craft user interfaces.",
          },
        ],
      };
    case "sponsor":
      return {
        username,
        message: "If you enjoy my open-source work, consider sponsoring me!",
      };
    case "footer":
      return {
        text: `Made with ❤️ by ${username}`,
      };
    case "heading":
      return {
        level: 2,
        text: "Section Heading",
      };
    case "paragraph":
    case "text-block":
      return {
        text: "Write a clear summary about your engineering journey, current focus, or favorite technologies.",
      };
    case "quote":
      return {
        text: "Simplicity is prerequisite for reliability.",
        author: "Edsger W. Dijkstra",
      };
    case "divider":
      return {};
    case "markdown-block":
      return {
        markdown: "### Custom Notes\n\n- Highlight key accomplishments\n- Link to your favorite articles",
      };
    case "custom-html":
      return {
        html: `<p align="center">\n  <strong>Thanks for visiting my profile!</strong>\n</p>`,
      };
    case "announcement":
      return {
        kind: "TIP",
        title: "Currently Open to Collaboration",
        message: "Reach out via email or LinkedIn if you'd like to build something together.",
      };
    case "cta":
      return {
        label: "Visit Portfolio",
        url: `https://github.com/${username}`,
        color: "6366f1",
        message: "Explore my work",
      };
    case "skills":
    case "languages":
    case "frameworks":
    case "tools":
      return {
        badges: [
          { label: "TypeScript", color: "3178C6", logo: "typescript", logoColor: "white", style: "for-the-badge" },
          { label: "React", color: "20232A", logo: "react", logoColor: "61DAFB", style: "for-the-badge" },
          { label: "Next.js", color: "000000", logo: "nextdotjs", logoColor: "white", style: "for-the-badge" },
          { label: "Node.js", color: "339933", logo: "nodedotjs", logoColor: "white", style: "for-the-badge" },
        ],
      };
    case "tech-stack-categorized":
      return {
        style: "badges",
        selectedIds: ["ts", "js", "python", "react", "nextjs", "nodejs", "postgres", "docker", "git"],
      };
    case "github-stats":
    case "top-languages":
    case "streak":
    case "trophies":
    case "contribution-graph":
    case "coding-activity": {
      const widgetTypeMap: Record<string, string> = {
        "github-stats": "stats",
        "top-languages": "top-langs",
        streak: "streak",
        trophies: "trophies",
        "contribution-graph": "activity-graph",
        "coding-activity": "activity-graph",
      };
      return {
        widget: {
          type: widgetTypeMap[type] || "stats",
          username,
          theme: "tokyonight",
          hideBorder: true,
          showIcons: true,
          layout: "compact",
        },
      };
    }
    case "repo-showcase":
      return {
        repos: [
          { username, repo: "awesome-project", theme: "tokyonight", hideBorder: true },
        ],
      };
    case "capsule-render":
      return {
        capsule: {
          type: "waving",
          height: 200,
          text: `Hi, I'm ${username}`,
          fontSize: 48,
          subtext: "Software Engineer & Open Source Builder",
          subfontSize: 20,
          color: "gradient",
          customColor: "0:6366f1,100:06b6d4",
          animation: "twinkling",
          section: "header",
        },
      };
    case "gif-banner":
      return {
        gif: {
          url: "https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif",
          alt: "Animated Developer Banner",
          width: "100%",
        },
      };
    case "image":
    case "banner":
    case "svg":
      return {
        url: "https://capsule-render.vercel.app/api?type=rect&color=gradient&height=140&text=Profile%20Banner&fontSize=36&fontColor=ffffff",
        alt: "Profile Banner",
        width: "100%",
      };
    case "ascii-banner":
      return {
        banner: {
          text: username.toUpperCase(),
          font: "block",
          effect: "glint",
          shadow: "double",
          speed: 35,
          loop: true,
        },
      };
    case "ascii-art":
      return {
        slug: "donut",
        mode: "svg",
        caption: "Animated ASCII Art",
      };
    case "featured-projects":
    case "current-projects":
    case "project-cards":
      return {
        layout: "list",
        projects: [
          {
            name: "ProfileForge",
            description: "Visual GitHub Profile README builder with live preview and ASCII studio.",
            url: `https://github.com/${username}/ProfileForge`,
            tech: ["Next.js", "TypeScript", "Tailwind CSS"],
          },
        ],
      };
    case "table":
      return {
        headers: ["Category", "Tools", "Experience"],
        rows: [
          ["Frontend", "React, Next.js, Tailwind", "5+ years"],
          ["Backend", "Node.js, Go, PostgreSQL", "4+ years"],
        ],
        alignments: ["left", "left", "center"],
      };
    case "raw-embed":
    case "custom":
    default:
      return {
        markdown: "<!-- Add your custom Markdown or GitHub-safe HTML here -->",
      };
  }
}
