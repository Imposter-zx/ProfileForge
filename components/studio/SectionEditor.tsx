// components/studio/SectionEditor.tsx
"use client";

import React, { useState } from "react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Trash2,
  Palette,
  Layers,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { POPULAR_TECH_BADGES, type BadgeConfig } from "@/lib/badges/builder";
import { ASCII_CATALOG } from "@/lib/ascii/catalog";
import type { BannerOptions } from "@/lib/ascii/catalog";
import {
  CAPSULE_TYPES,
  CAPSULE_COLOR_PRESETS,
  buildCapsuleRenderUrl,
  type CapsuleRenderConfig,
  type CapsuleType,
  type CapsuleAnimation,
} from "@/lib/assets/capsule";
import {
  TECH_CATEGORIES,
  TECH_CATALOG,
} from "@/lib/assets/tech-icons";
import { CURATED_GIFS, RETRO_SPACE_SHOOTER_GIF } from "@/lib/assets/gifs";

const BANNER_FONTS = [
  "block",
  "slim",
  "tall",
  "bold",
  "round",
  "wide",
  "mixed",
  "italic",
] as const;

const BANNER_SHADOWS = [
  "double",
  "single",
  "heavy",
  "rounded",
  "ascii",
  "none",
] as const;

const BANNER_EFFECTS = ["glint", "type", "still"] as const;

const WIDGET_THEMES = [
  "tokyonight",
  "radical",
  "onedark",
  "synthwave",
  "dracula",
  "gruvbox",
  "github_dark",
  "nord",
  "merko",
  "matrix",
] as const;

export function SectionEditor() {
  const { sections, selectedSectionId, updateSection, updateSectionData } =
    useStore();

  const section = sections.find((s) => s.id === selectedSectionId);

  if (!section) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
        <Layers className="w-10 h-10 mb-3 opacity-30" />
        <h3 className="text-sm font-semibold text-slate-400">
          No section selected
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Select a section from the left panel to customize its content and visual
          properties.
        </p>
      </div>
    );
  }

  const d = section.data || {};

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0c13] overflow-y-auto">
      {/* Editor Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/60 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Input
            value={section.title}
            onChange={(e) => updateSection(section.id, { title: e.target.value })}
            className="font-semibold text-sm max-w-xs bg-slate-950"
          />
          <Badge variant="indigo" size="sm">
            {section.type}
          </Badge>
        </div>

        {/* Alignment controls */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => updateSection(section.id, { align: "left" })}
            className={`p-1.5 rounded transition-colors ${
              (section.align || "left") === "left"
                ? "bg-slate-800 text-indigo-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => updateSection(section.id, { align: "center" })}
            className={`p-1.5 rounded transition-colors ${
              section.align === "center"
                ? "bg-slate-800 text-indigo-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => updateSection(section.id, { align: "right" })}
            className={`p-1.5 rounded transition-colors ${
              section.align === "right"
                ? "bg-slate-800 text-indigo-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic Form Body */}
      <div className="p-6 space-y-6 max-w-3xl">
        {/* TYPE: CAPSULE RENDER */}
        {section.type === "capsule-render" && (
          <CapsuleRenderEditor sectionId={section.id} data={d} />
        )}

        {/* TYPE: VIEW COUNTER */}
        {section.type === "view-counter" && (
          <ViewCounterEditor sectionId={section.id} data={d} />
        )}

        {/* TYPE: GIF BANNER */}
        {section.type === "gif-banner" && (
          <GifBannerEditor sectionId={section.id} data={d} />
        )}

        {/* TYPE: CATEGORIZED TECH STACK */}
        {section.type === "tech-stack-categorized" && (
          <TechStackCategorizedEditor sectionId={section.id} data={d} />
        )}

        {/* TYPE: ASCII BANNER */}
        {section.type === "ascii-banner" && (
          <AsciiBannerEditor sectionId={section.id} data={d} />
        )}

        {/* TYPE: ASCII ART PIECE */}
        {section.type === "ascii-art" && (
          <AsciiArtPieceEditor sectionId={section.id} data={d} />
        )}

        {/* TYPE: GREETING & HEADER */}
        {section.type === "animated-header" && (
          <AnimatedHeaderEditor sectionId={section.id} data={d} />
        )}

        {/* TYPE: ABOUT ME */}
        {section.type === "about-me" && (
          <AboutMeEditor sectionId={section.id} data={d} />
        )}

        {/* TYPE: TAGLINE */}
        {section.type === "tagline" && (
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300">
              Tagline Text
            </label>
            <input
              type="text"
              value={String(d.text || "")}
              onChange={(e) =>
                updateSectionData(section.id, { text: e.target.value })
              }
              placeholder="e.g. Crafting resilient web experiences and distributed systems."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}

        {/* TYPE: SKILLS / BADGES */}
        {(section.type === "skills" ||
          section.type === "languages" ||
          section.type === "frameworks" ||
          section.type === "tools" ||
          section.type === "socials") && (
          <BadgesEditor sectionId={section.id} data={d} />
        )}

        {/* TYPE: GITHUB WIDGETS */}
        {(section.type === "github-stats" ||
          section.type === "top-languages" ||
          section.type === "streak" ||
          section.type === "trophies" ||
          section.type === "contribution-graph" ||
          section.type === "coding-activity") && (
          <GitHubWidgetEditor sectionId={section.id} data={d} />
        )}

        {/* TYPE: CONTACT */}
        {section.type === "contact" && (
          <ContactEditor sectionId={section.id} data={d} />
        )}

        {/* TYPE: SPONSOR */}
        {section.type === "sponsor" && (
          <div className="space-y-4">
            <Input
              label="Sponsor URL"
              placeholder="https://github.com/sponsors/username"
              value={String(d.url || "")}
              onChange={(e) =>
                updateSectionData(section.id, { url: e.target.value })
              }
            />
            <Input
              label="Call-to-Action Message"
              placeholder="If you find my work helpful, consider sponsoring me!"
              value={String(d.message || "")}
              onChange={(e) =>
                updateSectionData(section.id, { message: e.target.value })
              }
            />
          </div>
        )}

        {/* TYPE: CUSTOM / FALLBACK */}
        {section.type === "custom" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Custom Markdown Content
              </label>
              <span className="text-[11px] text-slate-500">
                Supports GitHub Markdown & HTML tags
              </span>
            </div>
            <textarea
              rows={12}
              value={String(d.markdown || "")}
              onChange={(e) =>
                updateSectionData(section.id, { markdown: e.target.value })
              }
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed resize-y"
              placeholder="Write your custom Markdown or paste HTML snippets..."
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// Sub-Editors
// ==========================================

function AsciiBannerEditor({
  sectionId,
  data,
}: {
  sectionId: string;
  data: Record<string, unknown>;
}) {
  const { updateSectionData } = useStore();
  const banner = (data.banner as BannerOptions) || { text: "HELLO WORLD" };

  const updateBanner = (updates: Partial<BannerOptions>) => {
    updateSectionData(sectionId, { banner: { ...banner, ...updates } });
  };

  const currentColor1 = banner.color?.[0] || "00F2FE";
  const currentColor2 = banner.color?.[1] || "4FACFE";

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
          Banner Text (Max 25 characters)
        </label>
        <input
          type="text"
          maxLength={25}
          value={banner.text || ""}
          onChange={(e) => updateBanner({ text: e.target.value.toUpperCase() })}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 uppercase focus:outline-none focus:border-indigo-500"
          placeholder="ENTER TEXT"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
            Font Style
          </label>
          <select
            value={banner.font || "block"}
            onChange={(e) =>
              updateBanner({ font: e.target.value as BannerOptions["font"] })
            }
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            {BANNER_FONTS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
            Shadow Style
          </label>
          <select
            value={banner.shadow || "double"}
            onChange={(e) =>
              updateBanner({
                shadow: e.target.value as BannerOptions["shadow"],
              })
            }
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            {BANNER_SHADOWS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
            Animation Effect
          </label>
          <select
            value={banner.effect || "glint"}
            onChange={(e) =>
              updateBanner({
                effect: e.target.value as BannerOptions["effect"],
              })
            }
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            {BANNER_EFFECTS.map((eff) => (
              <option key={eff} value={eff}>
                {eff}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Colors */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
          <Palette className="w-4 h-4 text-indigo-400" />
          Gradient Colors (Hex without #)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Color"
            value={currentColor1}
            onChange={(e) =>
              updateBanner({
                color: [e.target.value.replace("#", ""), currentColor2],
              })
            }
            placeholder="00F2FE"
          />
          <Input
            label="End Color"
            value={currentColor2}
            onChange={(e) =>
              updateBanner({
                color: [currentColor1, e.target.value.replace("#", "")],
              })
            }
            placeholder="4FACFE"
          />
        </div>
      </div>

      {/* Tagline */}
      <Input
        label="Optional Tagline Under Banner"
        placeholder="e.g. Full-Stack Engineer & Open Source Maker"
        value={banner.tagline || ""}
        onChange={(e) => updateBanner({ tagline: e.target.value })}
      />
    </div>
  );
}

function AsciiArtPieceEditor({
  sectionId,
  data,
}: {
  sectionId: string;
  data: Record<string, unknown>;
}) {
  const { updateSectionData } = useStore();
  const currentSlug = String(data.slug || "donut");
  const width = typeof data.width === "number" ? data.width : 420;

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
          Select ASCII Artwork ({ASCII_CATALOG.length} available)
        </label>
        <select
          value={currentSlug}
          onChange={(e) => updateSectionData(sectionId, { slug: e.target.value })}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
        >
          {ASCII_CATALOG.map((p) => (
            <option key={p.slug} value={p.slug}>
              [{p.category}] {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Width (px)</span>
          <span className="font-mono">{width}px</span>
        </div>
        <input
          type="range"
          min={200}
          max={800}
          step={20}
          value={width}
          onChange={(e) =>
            updateSectionData(sectionId, { width: parseInt(e.target.value, 10) })
          }
          className="w-full accent-indigo-500"
        />
      </div>
    </div>
  );
}

function AnimatedHeaderEditor({
  sectionId,
  data,
}: {
  sectionId: string;
  data: Record<string, unknown>;
}) {
  const { updateSectionData } = useStore();

  return (
    <div className="space-y-4">
      <Input
        label="Your Name or Nickname"
        placeholder="John Doe"
        value={String(data.name || "")}
        onChange={(e) =>
          updateSectionData(sectionId, { name: e.target.value })
        }
      />
      <Input
        label="Subtitle / Headline"
        placeholder="Full-Stack Engineer crafting great products"
        value={String(data.subtitle || "")}
        onChange={(e) =>
          updateSectionData(sectionId, { subtitle: e.target.value })
        }
      />
      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="wave-toggle"
          checked={Boolean(data.wave)}
          onChange={(e) =>
            updateSectionData(sectionId, { wave: e.target.checked })
          }
          className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="wave-toggle" className="text-xs text-slate-300">
          Show animated waving hand emoji (👋)
        </label>
      </div>
    </div>
  );
}

function AboutMeEditor({
  sectionId,
  data,
}: {
  sectionId: string;
  data: Record<string, unknown>;
}) {
  const { updateSectionData } = useStore();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300">
          Bio / Description
        </label>
        <span className="text-[11px] text-slate-500">
          Markdown format supported
        </span>
      </div>
      <textarea
        rows={8}
        value={String(data.markdown || "")}
        onChange={(e) =>
          updateSectionData(sectionId, { markdown: e.target.value })
        }
        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed resize-y"
        placeholder="Write about yourself, your hobbies, current projects..."
      />
    </div>
  );
}

function BadgesEditor({
  sectionId,
  data,
}: {
  sectionId: string;
  data: Record<string, unknown>;
}) {
  const { updateSectionData } = useStore();
  const badges = (data.badges as BadgeConfig[]) || [];

  const [newLabel, setNewLabel] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newColor, setNewColor] = useState("3178C6");
  const [newLogo, setNewLogo] = useState("");

  const addCustomBadge = () => {
    if (!newMessage.trim()) return;
    const badge: BadgeConfig = {
      label: newLabel.trim(),
      message: newMessage.trim(),
      color: newColor.trim().replace("#", ""),
      logo: newLogo.trim() || undefined,
      style: "flat-square",
    };
    updateSectionData(sectionId, { badges: [...badges, badge] });
    setNewMessage("");
    setNewLabel("");
  };

  const addPresetBadge = (preset: { name: string; slug: string; color: string; logo: string }) => {
    const badge: BadgeConfig = {
      label: "",
      message: preset.name,
      color: preset.color,
      logo: preset.logo,
      style: "flat-square",
    };
    updateSectionData(sectionId, { badges: [...badges, badge] });
  };

  const removeBadge = (index: number) => {
    updateSectionData(sectionId, {
      badges: badges.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Badges List */}
      <div>
        <label className="text-xs font-semibold text-slate-300 mb-2 block">
          Current Badges ({badges.length})
        </label>
        <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-slate-800 bg-slate-950/60 min-h-[50px]">
          {badges.map((b, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-200"
            >
              <span>{b.message}</span>
              <button
                onClick={() => removeBadge(idx)}
                className="text-slate-500 hover:text-red-400"
                title="Remove badge"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          {badges.length === 0 && (
            <span className="text-xs text-slate-500">
              No badges added yet. Pick from the presets below or add a custom badge.
            </span>
          )}
        </div>
      </div>

      {/* Quick Add Presets */}
      <div>
        <label className="text-xs font-semibold text-slate-300 mb-2 block">
          Quick Add Popular Technologies
        </label>
        <div className="space-y-3">
          {POPULAR_TECH_BADGES.map((group) => (
            <div key={group.category} className="space-y-1.5">
              <span className="text-[11px] font-mono text-slate-500">
                {group.category}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {group.badges.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => addPresetBadge(item)}
                    className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
                  >
                    + {item.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Badge Form */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3">
        <span className="text-xs font-semibold text-slate-300 block">
          Add Custom Shields.io Badge
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input
            placeholder="Label (opt)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          />
          <Input
            placeholder="Message *"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Input
            placeholder="Color hex"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
          />
          <Input
            placeholder="Logo slug"
            value={newLogo}
            onChange={(e) => setNewLogo(e.target.value)}
          />
        </div>
        <Button
          onClick={addCustomBadge}
          variant="secondary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Badge
        </Button>
      </div>
    </div>
  );
}

function GitHubWidgetEditor({
  sectionId,
  data,
}: {
  sectionId: string;
  data: Record<string, unknown>;
}) {
  const { updateSectionData } = useStore();
  const widget = (data.widget as Record<string, unknown>) || {};

  const updateWidget = (updates: Record<string, unknown>) => {
    updateSectionData(sectionId, { widget: { ...widget, ...updates } });
  };

  return (
    <div className="space-y-4">
      <Input
        label="GitHub Username"
        value={String(widget.username || "")}
        onChange={(e) => updateWidget({ username: e.target.value })}
        placeholder="octocat"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
            Widget Theme
          </label>
          <select
            value={String(widget.theme || "tokyonight")}
            onChange={(e) => updateWidget({ theme: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            {WIDGET_THEMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="hide-border"
            checked={Boolean(widget.hideBorder)}
            onChange={(e) => updateWidget({ hideBorder: e.target.checked })}
            className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="hide-border" className="text-xs text-slate-300">
            Hide Widget Border (Flat design)
          </label>
        </div>
      </div>

      {widget.type === "trophies" && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-2">
          <p className="font-semibold">⚠️ Upstream Service Notice</p>
          <p className="text-slate-400 leading-relaxed">
            The public domain <code className="text-amber-200">github-profile-trophy.vercel.app</code> is temporarily throttled by Vercel (HTTP 402 Payment Required - free bandwidth exceeded). If you deploy your own fork on Vercel, enter its URL below:
          </p>
          <Input
            label="Personal Deployment URL (optional)"
            placeholder="https://your-trophy-fork.vercel.app/"
            value={String(widget.customBaseUrl || "")}
            onChange={(e) => updateWidget({ customBaseUrl: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}

function ContactEditor({
  sectionId,
  data,
}: {
  sectionId: string;
  data: Record<string, unknown>;
}) {
  const { updateSectionData } = useStore();

  return (
    <div className="space-y-4">
      <Input
        label="Email Address"
        placeholder="you@example.com"
        value={String(data.email || "")}
        onChange={(e) => updateSectionData(sectionId, { email: e.target.value })}
      />
      <Input
        label="Twitter / X Handle"
        placeholder="@yourhandle"
        value={String(data.twitter || "")}
        onChange={(e) =>
          updateSectionData(sectionId, { twitter: e.target.value })
        }
      />
      <Input
        label="LinkedIn URL"
        placeholder="https://linkedin.com/in/yourprofile"
        value={String(data.linkedin || "")}
        onChange={(e) =>
          updateSectionData(sectionId, { linkedin: e.target.value })
        }
      />
      <Input
        label="Website / Portfolio URL"
        placeholder="https://yourwebsite.com"
        value={String(data.blog || "")}
        onChange={(e) => updateSectionData(sectionId, { blog: e.target.value })}
      />
    </div>
  );
}

function CapsuleRenderEditor({
  sectionId,
  data,
}: {
  sectionId: string;
  data: Record<string, unknown>;
}) {
  const { updateSectionData } = useStore();
  const capsule = (data.capsule as CapsuleRenderConfig) || {
    type: "waving",
    height: 200,
    text: "WELCOME TO MY PROFILE",
    fontSize: 50,
    desc: "Full Stack Engineer & Open Source Maker",
    color: "0:00F2FE,100:4FACFE",
    animation: "twinkling",
    section: "header",
  };

  const updateCapsule = (updates: Partial<CapsuleRenderConfig>) => {
    updateSectionData(sectionId, { capsule: { ...capsule, ...updates } });
  };

  const previewUrl = buildCapsuleRenderUrl(capsule);

  return (
    <div className="space-y-5">
      {/* Live Preview */}
      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden flex flex-col items-center justify-center">
        <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider mb-2 self-start">
          Live Capsule Preview
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="Capsule Render Preview"
          className="max-w-full rounded shadow"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
            Banner Shape / Type
          </label>
          <select
            value={capsule.type || "waving"}
            onChange={(e) =>
              updateCapsule({ type: e.target.value as CapsuleType })
            }
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            {CAPSULE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
            Position / Section
          </label>
          <select
            value={capsule.section || "header"}
            onChange={(e) =>
              updateCapsule({
                section: e.target.value as "header" | "footer",
                height: e.target.value === "footer" ? 100 : 200,
              })
            }
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="header">Header (Top)</option>
            <option value="footer">Footer (Bottom)</option>
          </select>
        </div>
      </div>

      <Input
        label="Main Text"
        placeholder="HI, I'M DEVELOPER"
        value={capsule.text || ""}
        onChange={(e) => updateCapsule({ text: e.target.value })}
      />

      <Input
        label="Subtitle / Description"
        placeholder="Full Stack Engineer & Open Source Maker"
        value={capsule.desc || (data.subtext as string) || ""}
        onChange={(e) => updateCapsule({ desc: e.target.value })}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
            Animation
          </label>
          <select
            value={capsule.animation || "twinkling"}
            onChange={(e) =>
              updateCapsule({
                animation: (e.target.value || undefined) as CapsuleAnimation | undefined,
              })
            }
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="twinkling">twinkling (stars glow)</option>
            <option value="fadeIn">fadeIn</option>
            <option value="scaleIn">scaleIn</option>
            <option value="blinking">blinking</option>
            <option value="">none</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
            <span className="font-semibold">Height</span>
            <span className="font-mono text-slate-400">{capsule.height || 200}px</span>
          </div>
          <input
            type="range"
            min={80}
            max={350}
            step={10}
            value={capsule.height || 200}
            onChange={(e) =>
              updateCapsule({ height: parseInt(e.target.value, 10) })
            }
            className="w-full accent-indigo-500 mt-2"
          />
        </div>
      </div>

      {/* Color Themes */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
        <label className="text-xs font-semibold text-slate-300 block">
          Color Gradient Presets
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CAPSULE_COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => updateCapsule({ color: preset.color })}
              className={`p-2 rounded-lg text-left text-xs border transition-all ${
                capsule.color === preset.color
                  ? "border-indigo-500 bg-indigo-500/10 text-white"
                  : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700"
              }`}
            >
              <div className="truncate font-medium">{preset.name}</div>
            </button>
          ))}
        </div>
        <div className="pt-2">
          <Input
            label="Custom Color / Gradient String"
            placeholder="0:00F2FE,100:4FACFE or auto"
            value={capsule.color || ""}
            onChange={(e) => updateCapsule({ color: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

function ViewCounterEditor({
  sectionId,
  data,
}: {
  sectionId: string;
  data: Record<string, unknown>;
}) {
  const { updateSectionData, username: storeUsername } = useStore();
  const vc = (data.viewCounter as Record<string, unknown>) || {};
  const currentUsername = String(vc.username || data.username || storeUsername || "octocat");
  const currentColor = String(vc.color || data.color || "00f2fe");
  const currentStyle = String(vc.style || data.style || "flat-square");
  const currentLabel = String(vc.label || data.label || "PROFILE VIEWS");

  const update = (updates: Record<string, unknown>) => {
    updateSectionData(sectionId, {
      viewCounter: {
        username: currentUsername,
        color: currentColor,
        style: currentStyle,
        label: currentLabel,
        ...updates,
      },
      ...updates,
    });
  };

  const previewUrl = `https://komarev.com/ghpvc/?username=${encodeURIComponent(
    currentUsername
  )}&color=${encodeURIComponent(currentColor)}&style=${encodeURIComponent(
    currentStyle
  )}&label=${encodeURIComponent(currentLabel.replace(/\s+/g, "+"))}`;

  return (
    <div className="space-y-5">
      {/* Preview */}
      <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
        <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider mb-3">
          Live Counter Preview
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={previewUrl} alt="Profile Views Preview" className="h-7" />
      </div>

      <Input
        label="GitHub Username"
        value={currentUsername}
        onChange={(e) => update({ username: e.target.value })}
        placeholder="octocat"
      />

      <Input
        label="Badge Label"
        value={currentLabel}
        onChange={(e) => update({ label: e.target.value })}
        placeholder="PROFILE VIEWS"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Color (Hex without # or color name)"
          value={currentColor}
          onChange={(e) => update({ color: e.target.value.replace("#", "") })}
          placeholder="00f2fe"
        />

        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
            Badge Style
          </label>
          <select
            value={currentStyle}
            onChange={(e) => update({ style: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="flat-square">flat-square</option>
            <option value="flat">flat</option>
            <option value="for-the-badge">for-the-badge</option>
            <option value="plastic">plastic</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function GifBannerEditor({
  sectionId,
  data,
}: {
  sectionId: string;
  data: Record<string, unknown>;
}) {
  const { updateSectionData } = useStore();
  const gif = (data.gif as Record<string, unknown>) || {};
  const currentUrl = String(data.url || gif.url || RETRO_SPACE_SHOOTER_GIF.url);
  const currentAlt = String(data.alt || gif.alt || "Animated GIF Banner");
  const currentWidth = String(data.width || gif.width || "100%");
  const currentHref = String(data.href || gif.href || "");

  const update = (updates: Record<string, unknown>) => {
    updateSectionData(sectionId, {
      ...updates,
      gif: {
        url: currentUrl,
        alt: currentAlt,
        width: currentWidth,
        href: currentHref,
        ...updates,
      },
    });
  };

  return (
    <div className="space-y-5">
      {/* Preview */}
      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col items-center justify-center overflow-hidden">
        <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider mb-2 self-start">
          GIF Preview
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentUrl}
          alt={currentAlt}
          className="max-h-56 rounded object-contain"
        />
      </div>

      {/* Preset pickers */}
      <div>
        <label className="text-xs font-semibold text-slate-300 mb-2 block">
          Choose from Curated Presets
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CURATED_GIFS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() =>
                update({
                  url: g.url,
                  alt: g.title,
                })
              }
              className={`p-2 rounded-lg text-left text-xs border transition-all ${
                currentUrl === g.url
                  ? "border-indigo-500 bg-indigo-500/10 text-white"
                  : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700"
              }`}
            >
              <div className="truncate font-medium">{g.title}</div>
              <div className="text-[10px] text-slate-500 capitalize">{g.category}</div>
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Custom GIF / Image URL"
        value={currentUrl}
        onChange={(e) => update({ url: e.target.value })}
        placeholder="https://..."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Display Width"
          value={currentWidth}
          onChange={(e) => update({ width: e.target.value })}
          placeholder="100% or 600px"
        />

        <Input
          label="Optional Link (href)"
          value={currentHref}
          onChange={(e) => update({ href: e.target.value })}
          placeholder="https://github.com/..."
        />
      </div>
    </div>
  );
}

function TechStackCategorizedEditor({
  sectionId,
  data,
}: {
  sectionId: string;
  data: Record<string, unknown>;
}) {
  const { updateSectionData } = useStore();
  const selectedIds = (data.selectedIds as string[]) || [
    "ts", "js", "python", "react", "nextjs", "tailwind", "nodejs", "postgresql", "docker"
  ];
  const style = (data.style as "badges" | "devicon" | "skillicons") || "badges";

  const toggleTech = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    updateSectionData(sectionId, { selectedIds: next });
  };

  const setStyle = (s: "badges" | "devicon" | "skillicons") => {
    updateSectionData(sectionId, { style: s });
  };

  return (
    <div className="space-y-6">
      {/* Style selector */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/60">
        <span className="text-xs font-semibold text-slate-300">Icon Visual Style</span>
        <div className="flex gap-1">
          {(["badges", "devicon", "skillicons"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStyle(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                style === s
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              {s === "badges" ? "Shields Badges" : s}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-slate-400">
        Selected: <span className="font-semibold text-indigo-400">{selectedIds.length}</span> technologies
      </div>

      {/* Categories & Items */}
      <div className="space-y-4">
        {TECH_CATEGORIES.map((cat) => {
          const items = TECH_CATALOG.filter((t) => t.category === cat.id);
          return (
            <div
              key={cat.id}
              className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <span>{cat.icon}</span> {cat.label}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {items.filter((i) => selectedIds.includes(i.id)).length}/{items.length}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {items.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleTech(item.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                        isSelected
                          ? "bg-indigo-600/20 border-indigo-500 text-indigo-200"
                          : "bg-slate-900 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
