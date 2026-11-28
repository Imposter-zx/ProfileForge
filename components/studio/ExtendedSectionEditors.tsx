// components/studio/ExtendedSectionEditors.tsx
"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { ReadmeSection } from "@/lib/readme/compiler";

export function ExtendedSectionEditor({ section }: { section: ReadmeSection }) {
  const { updateSectionData } = useStore();
  const d = section.data || {};

  switch (section.type) {
    case "profile-header":
      return (
        <div className="space-y-4">
          <Input
            label="Heading"
            placeholder="Hi there, I'm Developer 👋"
            value={String(d.heading || "")}
            onChange={(e) =>
              updateSectionData(section.id, { heading: e.target.value })
            }
          />
          <Input
            label="Name (used if Heading is empty)"
            placeholder="octocat"
            value={String(d.name || "")}
            onChange={(e) =>
              updateSectionData(section.id, { name: e.target.value })
            }
          />
          <Input
            label="Subtitle"
            placeholder="Full-Stack Engineer • Open Source Contributor"
            value={String(d.subtitle || "")}
            onChange={(e) =>
              updateSectionData(section.id, { subtitle: e.target.value })
            }
          />
        </div>
      );

    case "avatar":
      return (
        <div className="space-y-4">
          <Input
            label="Avatar Image URL"
            placeholder="https://github.com/username.png?size=160"
            value={String(d.url || "")}
            onChange={(e) =>
              updateSectionData(section.id, { url: e.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Size (px)"
              type="number"
              value={String(d.size ?? 128)}
              onChange={(e) =>
                updateSectionData(section.id, {
                  size: Number(e.target.value) || 128,
                })
              }
            />
            <Input
              label="Alt Text"
              placeholder="Profile avatar"
              value={String(d.alt || "")}
              onChange={(e) =>
                updateSectionData(section.id, { alt: e.target.value })
              }
            />
          </div>
        </div>
      );

    case "introduction":
    case "markdown-block":
    case "raw-embed":
      return (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            {section.type === "introduction"
              ? "Introduction Bio (Markdown)"
              : section.type === "raw-embed"
                ? "Raw Embed / HTML Snippet"
                : "Markdown Content"}
          </label>
          <textarea
            rows={8}
            value={String(d.markdown ?? d.html ?? d.text ?? "")}
            onChange={(e) =>
              updateSectionData(section.id, { markdown: e.target.value })
            }
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed resize-y"
            placeholder="Write Markdown or GitHub-safe HTML..."
          />
        </div>
      );

    case "custom-html":
      return (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            GitHub-Safe HTML Block
          </label>
          <textarea
            rows={8}
            value={String(d.html ?? d.markdown ?? "")}
            onChange={(e) =>
              updateSectionData(section.id, { html: e.target.value })
            }
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed resize-y"
            placeholder='<p align="center">...</p>'
          />
        </div>
      );

    case "heading":
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">
              Heading Level
            </label>
            <div className="flex gap-2">
              {([1, 2, 3, 4] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() =>
                    updateSectionData(section.id, { level: lvl })
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                    (d.level || 2) === lvl
                      ? "bg-indigo-600 text-white border-indigo-500"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  H{lvl}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Heading Text"
            value={String(d.text || "")}
            onChange={(e) =>
              updateSectionData(section.id, { text: e.target.value })
            }
          />
        </div>
      );

    case "paragraph":
    case "text-block":
    case "footer":
      return (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            {section.type === "footer" ? "Footer Text" : "Paragraph Text"}
          </label>
          <textarea
            rows={5}
            value={String(d.text ?? d.markdown ?? "")}
            onChange={(e) =>
              updateSectionData(section.id, { text: e.target.value })
            }
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed resize-y"
            placeholder="Write text..."
          />
        </div>
      );

    case "quote":
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">
              Quote Text
            </label>
            <textarea
              rows={3}
              value={String(d.text || "")}
              onChange={(e) =>
                updateSectionData(section.id, { text: e.target.value })
              }
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <Input
            label="Author (optional)"
            placeholder="Edsger W. Dijkstra"
            value={String(d.author || "")}
            onChange={(e) =>
              updateSectionData(section.id, { author: e.target.value })
            }
          />
        </div>
      );

    case "divider":
      return (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
          Horizontal rule divider (<code className="text-indigo-300">---</code>).
          No additional settings required.
        </div>
      );

    case "announcement":
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">
              Callout Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(["NOTE", "TIP", "IMPORTANT", "WARNING", "CAUTION"] as const).map(
                (kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => updateSectionData(section.id, { kind })}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-colors ${
                      (d.kind || "NOTE") === kind
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    {kind}
                  </button>
                )
              )}
            </div>
          </div>
          <Input
            label="Title (optional)"
            value={String(d.title || "")}
            onChange={(e) =>
              updateSectionData(section.id, { title: e.target.value })
            }
          />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">
              Message
            </label>
            <textarea
              rows={3}
              value={String(d.message || "")}
              onChange={(e) =>
                updateSectionData(section.id, { message: e.target.value })
              }
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      );

    case "cta":
      return (
        <div className="space-y-4">
          <Input
            label="Button Label"
            placeholder="Visit Portfolio"
            value={String(d.label || "")}
            onChange={(e) =>
              updateSectionData(section.id, { label: e.target.value })
            }
          />
          <Input
            label="Destination URL"
            placeholder="https://github.com/username"
            value={String(d.url || "")}
            onChange={(e) =>
              updateSectionData(section.id, { url: e.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Badge Color (hex)"
              placeholder="6366f1"
              value={String(d.color || "6366f1")}
              onChange={(e) =>
                updateSectionData(section.id, { color: e.target.value })
              }
            />
            <Input
              label="Prompt Text (optional)"
              placeholder="Explore my work"
              value={String(d.message || "")}
              onChange={(e) =>
                updateSectionData(section.id, { message: e.target.value })
              }
            />
          </div>
        </div>
      );

    case "location":
      return (
        <div className="space-y-4">
          <Input
            label="City / Country"
            placeholder="San Francisco, CA"
            value={String(d.city ?? d.location ?? "")}
            onChange={(e) =>
              updateSectionData(section.id, { city: e.target.value })
            }
          />
          <Input
            label="Timezone"
            placeholder="UTC-8 (PST)"
            value={String(d.timezone || "")}
            onChange={(e) =>
              updateSectionData(section.id, { timezone: e.target.value })
            }
          />
          <Input
            label="Availability"
            placeholder="Open to remote collaborations"
            value={String(d.availability || "")}
            onChange={(e) =>
              updateSectionData(section.id, { availability: e.target.value })
            }
          />
        </div>
      );

    case "image":
    case "banner":
    case "svg":
      return (
        <div className="space-y-4">
          <Input
            label="Image / SVG URL"
            placeholder="https://..."
            value={String(d.url || "")}
            onChange={(e) =>
              updateSectionData(section.id, { url: e.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Alt Text"
              placeholder="Banner"
              value={String(d.alt || "")}
              onChange={(e) =>
                updateSectionData(section.id, { alt: e.target.value })
              }
            />
            <Input
              label="Width (e.g. 100% or 600)"
              placeholder="100%"
              value={String(d.width || "")}
              onChange={(e) =>
                updateSectionData(section.id, { width: e.target.value })
              }
            />
          </div>
          <Input
            label="Click Link URL (optional)"
            placeholder="https://..."
            value={String(d.href || "")}
            onChange={(e) =>
              updateSectionData(section.id, { href: e.target.value })
            }
          />
        </div>
      );

    case "profile-info": {
      const items = (
        (d.items as Array<{ label: string; value: string }>) || []
      ).slice();
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Profile Info Rows ({items.length})
            </span>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() =>
                updateSectionData(section.id, {
                  items: [...items, { label: "Field", value: "Value" }],
                })
              }
            >
              Add Row
            </Button>
          </div>
          {items.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center"
            >
              <Input
                placeholder="Label"
                value={item.label}
                onChange={(e) => {
                  const next = [...items];
                  next[idx] = { ...item, label: e.target.value };
                  updateSectionData(section.id, { items: next });
                }}
              />
              <Input
                placeholder="Value"
                value={item.value}
                onChange={(e) => {
                  const next = [...items];
                  next[idx] = { ...item, value: e.target.value };
                  updateSectionData(section.id, { items: next });
                }}
              />
              <button
                type="button"
                onClick={() =>
                  updateSectionData(section.id, {
                    items: items.filter((_, i) => i !== idx),
                  })
                }
                className="p-2 text-slate-400 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      );
    }

    case "education":
    case "experience":
    case "certifications":
    case "achievements": {
      const items = (
        (d.items as Array<{
          title: string;
          subtitle?: string;
          period?: string;
          description?: string;
        }>) || []
      ).slice();
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Entries ({items.length})
            </span>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() =>
                updateSectionData(section.id, {
                  items: [
                    ...items,
                    {
                      title: "New Entry",
                      subtitle: "Organization",
                      period: "2024 — Present",
                      description: "",
                    },
                  ],
                })
              }
            >
              Add Entry
            </Button>
          </div>
          {items.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <Input
                  placeholder="Title"
                  value={item.title}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...item, title: e.target.value };
                    updateSectionData(section.id, { items: next });
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    updateSectionData(section.id, {
                      items: items.filter((_, i) => i !== idx),
                    })
                  }
                  className="p-1.5 text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Organization / Subtitle"
                  value={item.subtitle || ""}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...item, subtitle: e.target.value };
                    updateSectionData(section.id, { items: next });
                  }}
                />
                <Input
                  placeholder="Period"
                  value={item.period || ""}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...item, period: e.target.value };
                    updateSectionData(section.id, { items: next });
                  }}
                />
              </div>
              <Input
                placeholder="Description"
                value={item.description || ""}
                onChange={(e) => {
                  const next = [...items];
                  next[idx] = { ...item, description: e.target.value };
                  updateSectionData(section.id, { items: next });
                }}
              />
            </div>
          ))}
        </div>
      );
    }

    case "social-links": {
      const links = (
        (d.links as Array<{ platform: string; url: string; color?: string }>) ||
        []
      ).slice();
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Social Links ({links.length})
            </span>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() =>
                updateSectionData(section.id, {
                  links: [
                    ...links,
                    { platform: "GitHub", url: "https://github.com", color: "181717" },
                  ],
                })
              }
            >
              Add Link
            </Button>
          </div>
          {links.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1fr_1.4fr_auto] gap-2 items-center"
            >
              <Input
                placeholder="Platform"
                value={item.platform}
                onChange={(e) => {
                  const next = [...links];
                  next[idx] = { ...item, platform: e.target.value };
                  updateSectionData(section.id, { links: next });
                }}
              />
              <Input
                placeholder="https://..."
                value={item.url}
                onChange={(e) => {
                  const next = [...links];
                  next[idx] = { ...item, url: e.target.value };
                  updateSectionData(section.id, { links: next });
                }}
              />
              <button
                type="button"
                onClick={() =>
                  updateSectionData(section.id, {
                    links: links.filter((_, i) => i !== idx),
                  })
                }
                className="p-2 text-slate-400 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      );
    }

    case "repo-showcase": {
      const repos = (
        (d.repos as Array<{ username?: string; repo: string; theme?: string }>) ||
        []
      ).slice();
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Pinned Repositories ({repos.length})
            </span>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() =>
                updateSectionData(section.id, {
                  repos: [
                    ...repos,
                    { username: "octocat", repo: "Hello-World", theme: "tokyonight" },
                  ],
                })
              }
            >
              Add Repo
            </Button>
          </div>
          {repos.map((r, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center"
            >
              <Input
                placeholder="Owner username"
                value={r.username || ""}
                onChange={(e) => {
                  const next = [...repos];
                  next[idx] = { ...r, username: e.target.value };
                  updateSectionData(section.id, { repos: next });
                }}
              />
              <Input
                placeholder="Repository name"
                value={r.repo}
                onChange={(e) => {
                  const next = [...repos];
                  next[idx] = { ...r, repo: e.target.value };
                  updateSectionData(section.id, { repos: next });
                }}
              />
              <button
                type="button"
                onClick={() =>
                  updateSectionData(section.id, {
                    repos: repos.filter((_, i) => i !== idx),
                  })
                }
                className="p-2 text-slate-400 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      );
    }

    case "featured-projects":
    case "current-projects":
    case "project-cards": {
      const projects = (
        (d.projects as Array<{
          name: string;
          description?: string;
          url: string;
          tech?: string[];
        }>) || []
      ).slice();
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Projects ({projects.length})
            </span>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() =>
                updateSectionData(section.id, {
                  projects: [
                    ...projects,
                    {
                      name: "New Project",
                      description: "Short project description",
                      url: "https://github.com/octocat/project",
                      tech: ["TypeScript"],
                    },
                  ],
                })
              }
            >
              Add Project
            </Button>
          </div>
          {projects.map((p, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <Input
                  placeholder="Project Name"
                  value={p.name}
                  onChange={(e) => {
                    const next = [...projects];
                    next[idx] = { ...p, name: e.target.value };
                    updateSectionData(section.id, { projects: next });
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    updateSectionData(section.id, {
                      projects: projects.filter((_, i) => i !== idx),
                    })
                  }
                  className="p-1.5 text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <Input
                placeholder="Repository or Demo URL"
                value={p.url}
                onChange={(e) => {
                  const next = [...projects];
                  next[idx] = { ...p, url: e.target.value };
                  updateSectionData(section.id, { projects: next });
                }}
              />
              <Input
                placeholder="Description"
                value={p.description || ""}
                onChange={(e) => {
                  const next = [...projects];
                  next[idx] = { ...p, description: e.target.value };
                  updateSectionData(section.id, { projects: next });
                }}
              />
              <Input
                placeholder="Tech stack (comma-separated)"
                value={(p.tech || []).join(", ")}
                onChange={(e) => {
                  const next = [...projects];
                  next[idx] = {
                    ...p,
                    tech: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  };
                  updateSectionData(section.id, { projects: next });
                }}
              />
            </div>
          ))}
        </div>
      );
    }

    case "table": {
      const headers = ((d.headers as string[]) || ["Column 1", "Column 2"]).slice();
      const rows = ((d.rows as string[][]) || [["Cell 1", "Cell 2"]]).slice();
      return (
        <div className="space-y-3">
          <Input
            label="Column Headers (comma-separated)"
            value={headers.join(", ")}
            onChange={(e) => {
              const nextHeaders = e.target.value
                .split(",")
                .map((h) => h.trim())
                .filter(Boolean);
              updateSectionData(section.id, {
                headers: nextHeaders.length > 0 ? nextHeaders : ["Col 1"],
              });
            }}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Table Rows ({rows.length})
            </span>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() =>
                updateSectionData(section.id, {
                  rows: [...rows, headers.map(() => "")],
                })
              }
            >
              Add Row
            </Button>
          </div>
          <div className="space-y-2">
            {rows.map((row, rIdx) => (
              <div key={rIdx} className="flex items-center gap-2">
                {headers.map((_, cIdx) => (
                  <input
                    key={cIdx}
                    type="text"
                    value={row[cIdx] || ""}
                    placeholder={headers[cIdx]}
                    onChange={(e) => {
                      const nextRows = rows.map((r) => [...r]);
                      nextRows[rIdx][cIdx] = e.target.value;
                      updateSectionData(section.id, { rows: nextRows });
                    }}
                    className="flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                ))}
                <button
                  type="button"
                  onClick={() =>
                    updateSectionData(section.id, {
                      rows: rows.filter((_, i) => i !== rIdx),
                    })
                  }
                  className="p-1.5 text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
