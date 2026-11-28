// components/assets/BadgesStudio.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Award,
  Copy,
  Check,
  Plus,
  Search,
  Heart,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useStore } from "@/lib/store";
import {
  buildShieldsBadgeUrl,
  POPULAR_TECH_BADGES,
  type BadgeConfig,
} from "@/lib/badges/builder";
import { validateAssetUrl, escapeHtmlAttr } from "@/lib/assets/validation";
import { useAssetFavorites } from "@/lib/assets/favorites";

const BADGE_STYLES: NonNullable<BadgeConfig["style"]>[] = [
  "for-the-badge",
  "flat-square",
  "flat",
  "plastic",
  "social",
];

const EXTRA_PRESETS: Array<{
  category: string;
  badges: Array<{
    name: string;
    label: string;
    message: string;
    color: string;
    logo: string;
  }>;
}> = [
  {
    category: "Profile & Status",
    badges: [
      { name: "Open to Work", label: "Status", message: "Open to Work", color: "10B981", logo: "github" },
      { name: "MIT License", label: "License", message: "MIT", color: "3B82F6", logo: "opensourceinitiative" },
      { name: "PRs Welcome", label: "PRs", message: "Welcome", color: "8B5CF6", logo: "git" },
      { name: "Maintained", label: "Maintained", message: "Yes", color: "22C55E", logo: "checkmarx" },
    ],
  },
];

export function BadgesStudio() {
  const { addSection } = useStore();
  const { isFavorite, toggleFavorite } = useAssetFavorites();

  const [mode, setMode] = useState<"shields" | "custom">("shields");
  const [label, setLabel] = useState("Build");
  const [message, setMessage] = useState("Passing");
  const [color, setColor] = useState("10B981");
  const [labelColor, setLabelColor] = useState("1E293B");
  const [logo, setLogo] = useState("githubactions");
  const [logoColor, setLogoColor] = useState("FFFFFF");
  const [style, setStyle] = useState<NonNullable<BadgeConfig["style"]>>("for-the-badge");
  const [href, setHref] = useState("");

  // Custom badge image mode
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [customAlt, setCustomAlt] = useState("Custom Badge");

  // Preset browser
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [previewError, setPreviewError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState(false);

  const badgeCfg: BadgeConfig = {
    label: label.trim(),
    message: message.trim() || "Badge",
    color: color.replace("#", "") || "3178C6",
    labelColor: labelColor.replace("#", "") || undefined,
    logo: logo.trim() || undefined,
    logoColor: logoColor.replace("#", "") || undefined,
    style,
    href: href.trim() || undefined,
  };

  const shieldsUrl = buildShieldsBadgeUrl(badgeCfg);
  const customUrlCheck = validateAssetUrl(customImageUrl, { allowEmpty: true });
  const hrefCheck = validateAssetUrl(href, { allowEmpty: true });

  const activePreviewUrl =
    mode === "shields"
      ? shieldsUrl
      : customUrlCheck.valid && customImageUrl.trim()
      ? customUrlCheck.normalizedUrl || customImageUrl.trim()
      : "";

  const activeAlt =
    mode === "shields"
      ? `${badgeCfg.label ? `${badgeCfg.label}: ` : ""}${badgeCfg.message}`
      : customAlt.trim() || "Custom Badge";

  const markdownSnippet = useMemo(() => {
    if (!activePreviewUrl) return "";
    const img = `<img src="${escapeHtmlAttr(activePreviewUrl)}" alt="${escapeHtmlAttr(activeAlt)}" />`;
    if (href.trim() && hrefCheck.valid) {
      return `<a href="${escapeHtmlAttr(href.trim())}">${img}</a>`;
    }
    return img;
  }, [activePreviewUrl, activeAlt, href, hrefCheck.valid]);

  const allPresetGroups = useMemo(() => {
    const base = POPULAR_TECH_BADGES.map((g) => ({
      category: g.category,
      badges: g.badges.map((b) => ({
        name: b.name,
        label: "",
        message: b.name,
        color: b.color,
        logo: b.logo,
      })),
    }));
    return [...EXTRA_PRESETS, ...base];
  }, []);

  const filteredPresets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allPresetGroups
      .filter((g) => selectedCategory === "all" || g.category === selectedCategory)
      .map((g) => ({
        ...g,
        badges: g.badges.filter(
          (b) =>
            !q ||
            b.name.toLowerCase().includes(q) ||
            b.logo.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.badges.length > 0);
  }, [allPresetGroups, selectedCategory, searchQuery]);

  const favId = `badge-${mode}-${activePreviewUrl}`;
  const favorited = Boolean(activePreviewUrl) && isFavorite(favId);

  const handleCopy = async () => {
    if (!markdownSnippet) return;
    try {
      await navigator.clipboard.writeText(markdownSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleAddToReadme = () => {
    if (!activePreviewUrl) return;
    if (mode === "shields") {
      addSection({
        id: `sec-badge-${Date.now()}`,
        type: "skills",
        title: badgeCfg.label || badgeCfg.message || "Badges",
        enabled: true,
        align: "center",
        data: {
          badges: [badgeCfg],
        },
      });
    } else {
      if (!customUrlCheck.valid) return;
      addSection({
        id: `sec-custom-badge-${Date.now()}`,
        type: "custom",
        title: activeAlt,
        enabled: true,
        align: "center",
        data: {
          markdown: `<div align="center">\n  ${markdownSnippet}\n</div>`,
        },
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">
              Shields.io &amp; Custom Badges Studio
            </h3>
            <p className="text-xs text-slate-400">
              Design crisp Shields.io badges or validate custom badge URLs with live preview
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => {
              setMode("shields");
              setPreviewError(false);
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              mode === "shields"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Shields.io Builder
          </button>
          <button
            onClick={() => {
              setMode("custom");
              setPreviewError(false);
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              mode === "custom"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Custom Badge URL
          </button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 flex flex-col items-center justify-center min-h-[120px] gap-3 relative">
        {activePreviewUrl ? (
          previewError ? (
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <AlertCircle className="w-4 h-4" />
              <span>Could not load badge image. Verify the URL or logo slug.</span>
            </div>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={activePreviewUrl}
              alt={activeAlt}
              loading="lazy"
              onLoad={() => setPreviewError(false)}
              onError={() => setPreviewError(true)}
              className="max-h-16 object-contain"
            />
          )
        ) : (
          <p className="text-xs text-slate-500">
            Enter a valid badge URL below to preview.
          </p>
        )}

        {activePreviewUrl && (
          <button
            onClick={() =>
              toggleFavorite({
                id: favId,
                kind: "badge",
                title: activeAlt,
                previewUrl: activePreviewUrl,
                markdown: markdownSnippet,
              })
            }
            className={`absolute top-3 right-3 p-1.5 rounded-lg border transition-colors ${
              favorited
                ? "text-rose-400 bg-rose-500/10 border-rose-500/30"
                : "text-slate-400 bg-slate-900 border-slate-800 hover:text-slate-200"
            }`}
            title={favorited ? "Remove from favorites" : "Save to favorites"}
          >
            <Heart className={`w-3.5 h-3.5 ${favorited ? "fill-rose-500" : ""}`} />
          </button>
        )}
      </div>

      {mode === "shields" ? (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Left Label (optional)"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                setPreviewError(false);
              }}
              placeholder="e.g. Build"
            />
            <Input
              label="Right Message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setPreviewError(false);
              }}
              placeholder="e.g. Passing"
            />
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                Badge Style
              </label>
              <select
                value={style}
                onChange={(e) =>
                  setStyle(e.target.value as NonNullable<BadgeConfig["style"]>)
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              >
                {BADGE_STYLES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Simple Icons Logo Slug"
              value={logo}
              onChange={(e) => {
                setLogo(e.target.value);
                setPreviewError(false);
              }}
              placeholder="e.g. typescript, react"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Message Color Hex"
              value={color}
              onChange={(e) => setColor(e.target.value.replace("#", ""))}
              placeholder="10B981"
            />
            <Input
              label="Label Color Hex"
              value={labelColor}
              onChange={(e) => setLabelColor(e.target.value.replace("#", ""))}
              placeholder="1E293B"
            />
            <Input
              label="Logo Color Hex"
              value={logoColor}
              onChange={(e) => setLogoColor(e.target.value.replace("#", ""))}
              placeholder="FFFFFF"
            />
            <Input
              label="Click Link URL (optional)"
              value={href}
              onChange={(e) => setHref(e.target.value)}
              error={!hrefCheck.valid ? hrefCheck.error : undefined}
              placeholder="https://github.com/..."
            />
          </div>

          {/* Searchable Presets */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-300">
                Quick Presets
              </span>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter presets..."
                    className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Categories</option>
                  {allPresetGroups.map((g) => (
                    <option key={g.category} value={g.category}>
                      {g.category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {filteredPresets.map((group) => (
                <div key={group.category} className="space-y-1.5">
                  <div className="text-[11px] font-medium text-slate-500">
                    {group.category}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.badges.map((b) => (
                      <button
                        key={`${group.category}-${b.name}`}
                        onClick={() => {
                          setLabel(b.label);
                          setMessage(b.message);
                          setColor(b.color);
                          setLogo(b.logo);
                          setPreviewError(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-colors"
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Custom Badge Image URL"
            value={customImageUrl}
            onChange={(e) => {
              setCustomImageUrl(e.target.value);
              setPreviewError(false);
            }}
            error={!customUrlCheck.valid ? customUrlCheck.error : undefined}
            hint={customUrlCheck.warning}
            placeholder="https://img.shields.io/..."
          />
          <Input
            label="Alt Text"
            value={customAlt}
            onChange={(e) => setCustomAlt(e.target.value)}
            placeholder="Custom Badge"
          />
          <Input
            label="Click Link URL (optional)"
            value={href}
            onChange={(e) => setHref(e.target.value)}
            error={!hrefCheck.valid ? hrefCheck.error : undefined}
            placeholder="https://..."
          />
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <Button
          onClick={handleCopy}
          disabled={!markdownSnippet}
          variant="outline"
          size="sm"
          leftIcon={
            copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )
          }
        >
          {copied ? "Markdown Copied!" : "Copy Markdown"}
        </Button>

        <Button
          onClick={handleAddToReadme}
          disabled={!activePreviewUrl || previewError || !hrefCheck.valid}
          variant="glow"
          size="sm"
          leftIcon={
            added ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )
          }
        >
          {added ? "Inserted into Studio!" : "Insert Badge into Studio"}
        </Button>
      </div>
    </div>
  );
}
