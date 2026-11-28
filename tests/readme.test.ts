// tests/readme.test.ts
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  compileReadmeMarkdown,
  compileSection,
  generateAboutMarkdown,
  generateAdvancedMarkdown,
  generateAsciiMarkdown,
  generateBannerMarkdown,
  generateContentMarkdown,
  generateImageMarkdown,
  generateProjectMarkdown,
  generateSkillsMarkdown,
  generateSocialLinksMarkdown,
  generateStatsMarkdown,
  sanitizeMarkdownOutput,
  validateReadmeForExport,
  type ReadmeSection,
} from "../lib/readme/compiler";
import {
  exportProjectJson,
  importMarkdownToSections,
  importProjectJson,
} from "../lib/readme/importer";
import { STARTER_TEMPLATES } from "../lib/readme/templates";
import { createSafeStorage, DEFAULT_SECTIONS, useStore } from "../lib/store";

describe("lib/readme/compiler.ts", () => {
  it("generates profile & about markdown across profile section types", () => {
    const header = generateAboutMarkdown({
      id: "h1",
      type: "profile-header",
      title: "Header",
      enabled: true,
      align: "center",
      data: { name: "Ada Lovelace", subtitle: "Mathematician", wave: true },
    });
    assert.match(header, /# 👋 Hi, I'm Ada Lovelace/);
    assert.match(header, /### Mathematician/);
    assert.match(header, /<div align="center">/);

    const avatar = generateAboutMarkdown({
      id: "av1",
      type: "avatar",
      title: "Avatar",
      enabled: true,
      data: { url: "https://example.com/avatar.png", size: 96, alt: "Ada" },
    });
    assert.match(avatar, /width="96" height="96"/);

    const location = generateAboutMarkdown({
      id: "loc1",
      type: "location",
      title: "Location",
      enabled: true,
      data: { location: "London", timezone: "UTC", availability: "Open" },
    });
    assert.match(location, /London/);
    assert.match(location, /UTC/);
  });

  it("generates content markdown (heading, quote, divider, announcement, cta)", () => {
    assert.equal(
      generateContentMarkdown({
        id: "d1",
        type: "divider",
        title: "Divider",
        enabled: true,
        data: {},
      }),
      "---"
    );

    const quote = generateContentMarkdown({
      id: "q1",
      type: "quote",
      title: "Quote",
      enabled: true,
      data: { text: "Simplicity is prerequisite for reliability.", author: "Dijkstra" },
    });
    assert.match(quote, /> Simplicity is prerequisite for reliability\./);
    assert.match(quote, /> — \*Dijkstra\*/);

    const alert = generateContentMarkdown({
      id: "a1",
      type: "announcement",
      title: "Notice",
      enabled: true,
      data: { kind: "TIP", title: "Hiring", message: "Open for roles!" },
    });
    assert.match(alert, /> \[!TIP\]/);
    assert.match(alert, /\*\*Hiring\*\* — Open for roles!/);

    const cta = generateContentMarkdown({
      id: "c1",
      type: "cta",
      title: "CTA",
      enabled: true,
      data: { label: "Hire Me", url: "https://example.com", color: "2563EB" },
    });
    assert.match(cta, /https:\/\/img\.shields\.io\/badge\/Hire_Me-2563EB/);
  });

  it("generates skills, socials, stats, projects, visuals, and tables", () => {
    const skills = generateSkillsMarkdown({
      id: "sk1",
      type: "skills",
      title: "Skills",
      enabled: true,
      data: {
        badges: [{ label: "", message: "TypeScript", color: "3178C6", logo: "typescript" }],
      },
    });
    assert.match(skills, /## Skills/);
    assert.match(skills, /img\.shields\.io\/badge\/TypeScript-3178C6/);

    const socials = generateSocialLinksMarkdown({
      id: "so1",
      type: "social-links",
      title: "Socials",
      enabled: true,
      data: {
        links: [{ platform: "GitHub", url: "https://github.com/octocat", color: "181717" }],
      },
    });
    assert.match(socials, /href="https:\/\/github\.com\/octocat"/);

    const stats = generateStatsMarkdown({
      id: "st1",
      type: "github-stats",
      title: "Stats",
      enabled: true,
      data: { widget: { type: "stats", username: "octocat", theme: "tokyonight", hideBorder: true } },
    });
    assert.match(stats, /github-readme-stats\.vercel\.app\/api\?username=octocat/);

    const projects = generateProjectMarkdown({
      id: "p1",
      type: "project-cards",
      title: "Projects",
      enabled: true,
      data: {
        layout: "table",
        projects: [
          { name: "Forge", description: "Studio", url: "https://github.com/a/b", tech: ["TS"], stars: 10 },
        ],
      },
    });
    assert.match(projects, /\| \[\*\*Forge\*\*\]\(https:\/\/github\.com\/a\/b\) \| Studio \| `TS` \| ⭐ 10 \|/);

    const customAscii = generateAsciiMarkdown({
      id: "as1",
      type: "ascii-art",
      title: "ASCII",
      enabled: true,
      data: { customAscii: "  /\\_/\\\n ( o.o )" },
    });
    assert.match(customAscii, /^```text\n/);
    assert.match(customAscii, /\( o\.o \)/);

    const banner = generateBannerMarkdown({
      id: "b1",
      type: "capsule-render",
      title: "Banner",
      enabled: true,
      data: { capsule: { type: "waving", text: "Hello", section: "header" } },
    });
    assert.match(banner, /capsule-render\.vercel\.app\/api/);

    const img = generateImageMarkdown({
      id: "i1",
      type: "svg",
      title: "SVG",
      enabled: true,
      data: { url: "https://example.com/chart.svg", width: 400 },
    });
    assert.match(img, /width="400"/);

    const table = generateAdvancedMarkdown({
      id: "t1",
      type: "table",
      title: "Matrix",
      enabled: true,
      data: {
        headers: ["Tool", "Role"],
        alignments: ["left", "center"],
        rows: [["Vitest", "Testing"]],
      },
    });
    assert.match(table, /\| :--- \| :---: \|/);
    assert.match(table, /\| Vitest \| Testing \|/);
  });

  it("handles empty sections and sanitizes unsafe HTML/JS", () => {
    const emptyCompiled = compileSection({
      id: "empty-1",
      type: "about-me",
      title: "Empty",
      enabled: true,
      data: { markdown: "   " },
    });
    assert.equal(emptyCompiled, "");

    const sanitized = sanitizeMarkdownOutput(
      `<div onclick="alert(1)"><script>evil()</script><a href="javascript:void(0)">x</a></div>`
    );
    assert.doesNotMatch(sanitized, /<script/i);
    assert.doesNotMatch(sanitized, /onclick=/i);
    assert.doesNotMatch(sanitized, /javascript:/i);

    const issues = validateReadmeForExport(
      `<script>alert(1)</script>`,
      [
        {
          id: "empty-sec",
          type: "about-me",
          title: "Empty About",
          enabled: true,
          data: {},
        },
      ]
    );
    assert.ok(issues.some((i) => i.severity === "error" && i.message.includes("<script>")));
    assert.ok(issues.some((i) => i.severity === "warning" && i.sectionId === "empty-sec"));
  });
});

describe("lib/readme/importer.ts", () => {
  it("parses README markdown into structured sections and preserves unknown blocks", () => {
    const sample = [
      `<div align="center">\n  <img src="https://capsule-render.vercel.app/api?type=waving&text=Hi&section=header" alt="Hi" width="100%" />\n</div>`,
      `---`,
      `## About Me\n\nI build developer tools.`,
      `\`\`\`text\n+--+\n|hi|\n+--+\n\`\`\``,
      `Some unsupported custom widget <details><summary>More</summary>Hidden</details>`,
    ].join("\n\n");

    const sections = importMarkdownToSections(sample);
    assert.equal(sections.length, 5);
    assert.equal(sections[0].type, "capsule-render");
    assert.equal(sections[1].type, "divider");
    assert.equal(sections[2].type, "about-me");
    assert.equal(sections[3].type, "ascii-art");
    assert.equal(sections[4].type, "custom");

    const recompiled = compileReadmeMarkdown(sections);
    assert.match(recompiled, /capsule-render\.vercel\.app/);
    assert.match(recompiled, /I build developer tools\./);
    assert.match(recompiled, /<details><summary>More<\/summary>Hidden<\/details>/);
  });

  it("exports and imports project JSON cleanly and rejects invalid JSON", () => {
    const json = exportProjectJson({
      title: "Test Project",
      username: "ada",
      sections: DEFAULT_SECTIONS,
    });
    const imported = importProjectJson(json);
    assert.equal(imported.title, "Test Project");
    assert.equal(imported.username, "ada");
    assert.equal(imported.sections.length, DEFAULT_SECTIONS.length);

    assert.throws(() => importProjectJson("{not valid json"), /Invalid JSON/);
    assert.throws(() => importProjectJson(JSON.stringify({ title: "Missing sections" })), /sections/);
  });
});

describe("lib/readme/templates.ts", () => {
  it("contains all 12+ templates and compiles each without errors", () => {
    assert.ok(STARTER_TEMPLATES.length >= 12, `Expected >= 12 templates, got ${STARTER_TEMPLATES.length}`);

    const requiredIds = [
      "minimal-developer",
      "modern-developer",
      "cyberpunk-developer",
      "mr-robot",
      "ai-engineer",
      "full-stack-developer",
      "cybersecurity-specialist",
      "open-source-developer",
      "terminal-style",
      "clean-portfolio",
      "animated-profile",
      "gaming-developer",
    ];

    const ids = new Set(STARTER_TEMPLATES.map((t) => t.id));
    for (const req of requiredIds) {
      assert.ok(ids.has(req), `Missing required template: ${req}`);
    }

    for (const tmpl of STARTER_TEMPLATES) {
      const sections: ReadmeSection[] = tmpl.createSections({ username: "octocat", name: "Octo Cat" });
      assert.ok(sections.length > 0, `Template ${tmpl.id} produced no sections`);
      const md = compileReadmeMarkdown(sections);
      assert.ok(md.trim().length > 0, `Template ${tmpl.id} compiled to empty markdown`);
      const errors = validateReadmeForExport(md, sections).filter((i) => i.severity === "error");
      assert.equal(errors.length, 0, `Template ${tmpl.id} had validation errors: ${JSON.stringify(errors)}`);
    }
  });
});

describe("lib/store.ts", () => {
  beforeEach(() => {
    useStore.getState().resetWorkspace();
    useStore.setState({
      historyPast: [],
      historyFuture: [],
      savedTemplates: [],
      templateBackup: null,
    });
  });

  it("supports section manipulation with undo/redo history", () => {
    const initialCount = useStore.getState().sections.length;
    useStore.getState().addSection({
      id: "custom-test",
      type: "divider",
      title: "Divider",
      enabled: true,
      data: {},
    });
    assert.equal(useStore.getState().sections.length, initialCount + 1);

    useStore.getState().undo();
    assert.equal(useStore.getState().sections.length, initialCount);

    useStore.getState().redo();
    assert.equal(useStore.getState().sections.length, initialCount + 1);
  });

  it("creates recoverable backup before applying templates and restores it", () => {
    const originalTitle = useStore.getState().projectTitle;
    const originalFirstId = useStore.getState().sections[0].id;

    useStore.getState().applyTemplate("mr-robot");
    assert.equal(useStore.getState().projectTitle, "Mr. Robot Profile");
    assert.ok(useStore.getState().templateBackup !== null);

    useStore.getState().restoreTemplateBackup();
    assert.equal(useStore.getState().projectTitle, originalTitle);
    assert.equal(useStore.getState().sections[0].id, originalFirstId);
    assert.equal(useStore.getState().templateBackup, null);
  });

  it("supports custom templates, collapsedSectionIds, and importMarkdown", () => {
    const saved = useStore.getState().saveCustomTemplate("My Custom", "Test desc");
    assert.equal(useStore.getState().savedTemplates.length, 1);

    const dup = useStore.getState().duplicateTemplate(saved.id);
    assert.ok(dup !== null);
    assert.equal(useStore.getState().savedTemplates.length, 2);

    useStore.getState().deleteCustomTemplate(saved.id);
    assert.equal(useStore.getState().savedTemplates.length, 1);

    const firstId = useStore.getState().sections[0].id;
    useStore.getState().toggleSectionCollapsed(firstId);
    assert.ok(useStore.getState().collapsedSectionIds.includes(firstId));
    useStore.getState().toggleSectionCollapsed(firstId);
    assert.ok(!useStore.getState().collapsedSectionIds.includes(firstId));

    const importedCount = useStore.getState().importMarkdown("# Hello\n\n---\n\n> Quote");
    assert.equal(importedCount, 3);
    assert.equal(useStore.getState().sections.length, 3);
  });

  it("recovers gracefully from corrupted localStorage data", () => {
    const storageMap = new Map<string, string>();
    const mockLocalStorage = {
      getItem: (k: string) => storageMap.get(k) ?? null,
      setItem: (k: string, v: string) => storageMap.set(k, v),
      removeItem: (k: string) => storageMap.delete(k),
      clear: () => storageMap.clear(),
      key: () => null,
      length: 0,
    };

    (globalThis as unknown as { localStorage: Storage }).localStorage = mockLocalStorage as unknown as Storage;
    storageMap.set("profile-forge-storage", "{corrupted-json!!!");

    const safe = createSafeStorage();
    const result = safe.getItem("profile-forge-storage");
    assert.equal(result, null);
    assert.equal(storageMap.has("profile-forge-storage"), false);
  });

  it("supports theme switching (dark/light) and onboarding dismissal", () => {
    assert.equal(useStore.getState().theme, "dark");
    useStore.getState().setTheme("light");
    assert.equal(useStore.getState().theme, "light");
    useStore.getState().setTheme("dark");
    assert.equal(useStore.getState().theme, "dark");

    assert.equal(useStore.getState().hasDismissedOnboarding, false);
    useStore.getState().dismissOnboarding();
    assert.equal(useStore.getState().hasDismissedOnboarding, true);
    useStore.getState().resetOnboarding();
    assert.equal(useStore.getState().hasDismissedOnboarding, false);
  });
});
