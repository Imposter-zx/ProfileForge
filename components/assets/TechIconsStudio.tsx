// components/assets/TechIconsStudio.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Code2,
  Copy,
  Check,
  Plus,
  Search,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import {
  TECH_CATALOG,
  TECH_CATEGORIES,
  buildCategorizedTechStackMarkdown,
  type TechCategory,
  type TechIconStyle,
} from "@/lib/assets/tech-icons";
import { useAssetFavorites } from "@/lib/assets/favorites";

export function TechIconsStudio() {
  const { addSection } = useStore();
  const { isFavorite, toggleFavorite } = useAssetFavorites();

  const [activeCategory, setActiveCategory] = useState<TechCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [iconStyle, setIconStyle] = useState<TechIconStyle>("badges");
  const [selectedIds, setSelectedIds] = useState<string[]>([
    "ts", "js", "python", "cpp", "go", "rust",
    "react", "nextjs", "vue", "tailwind",
    "nodejs", "express", "fastapi", "graphql",
    "postgresql", "mongodb", "redis", "supabase",
    "docker", "kubernetes", "aws", "linux", "githubactions",
    "git", "github", "vscode", "postman"
  ]);

  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAllCategory = (cat: TechCategory) => {
    const items = TECH_CATALOG.filter((t) => t.category === cat).map((t) => t.id);
    setSelectedIds((prev) => Array.from(new Set([...prev, ...items])));
  };

  const deselectAllCategory = (cat: TechCategory) => {
    const items = new Set(TECH_CATALOG.filter((t) => t.category === cat).map((t) => t.id));
    setSelectedIds((prev) => prev.filter((id) => !items.has(id)));
  };

  const filteredItems = useMemo(() => {
    let list = TECH_CATALOG;
    if (activeCategory !== "all") {
      list = list.filter((t) => t.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((t) => t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
    }
    return list;
  }, [activeCategory, searchQuery]);

  const generatedMarkdown = useMemo(() => {
    return buildCategorizedTechStackMarkdown(selectedIds, iconStyle);
  }, [selectedIds, iconStyle]);

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(generatedMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleAddToReadme = () => {
    addSection({
      id: `sec-tech-matrix-${Math.random().toString(36).slice(2, 9)}`,
      type: "tech-stack-categorized",
      title: "Technologies & Tools",
      enabled: true,
      align: "left",
      data: {
        selectedIds,
        style: iconStyle,
      },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">
              Categorized Technology Matrix Studio
            </h3>
            <p className="text-xs text-slate-400">
              Select languages, frameworks, databases, and DevOps tools to build reference-grade multi-tier stacks
            </p>
          </div>
        </div>

        {/* Style Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs shrink-0 overflow-x-auto max-w-full">
          <button
            onClick={() => setIconStyle("badges")}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              iconStyle === "badges"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Shields.io Badges
          </button>
          <button
            onClick={() => setIconStyle("devicon")}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              iconStyle === "devicon"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Devicon
          </button>
          <button
            onClick={() => setIconStyle("simpleicons")}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              iconStyle === "simpleicons"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Simple Icons
          </button>
          <button
            onClick={() => setIconStyle("skillicons")}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              iconStyle === "skillicons"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Skill Icons
          </button>
        </div>
      </div>

      {/* Category Pills & Quick Select */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter 120+ technologies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === "all"
                ? "bg-slate-800 text-white border border-slate-700"
                : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            All Categories ({TECH_CATALOG.length})
          </button>
          {TECH_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? "bg-slate-800 text-white border border-slate-700"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Selected count */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>
            Selected: <strong className="text-indigo-400">{selectedIds.length}</strong> icons
          </span>
          {activeCategory !== "all" && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => selectAllCategory(activeCategory)}
                className="text-[11px] text-indigo-400 hover:underline"
              >
                Select Category
              </button>
              <span>•</span>
              <button
                onClick={() => deselectAllCategory(activeCategory)}
                className="text-[11px] text-slate-500 hover:underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Technologies Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-[300px] overflow-y-auto p-1">
        {filteredItems.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggleSelect(item.id)}
              className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all text-left ${
                isSelected
                  ? "bg-indigo-600/20 border-indigo-500 text-white shadow-sm"
                  : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: `#${item.color}` }}
              />
              <span className="truncate">{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* Live Markdown & HTML Preview */}
      <div className="space-y-3 pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">
            Live Categorized Output Preview
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {TECH_CATEGORIES.filter((c) =>
              TECH_CATALOG.some((t) => t.category === c.id && selectedIds.includes(t.id))
            ).length}{" "}
            active categories
          </span>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-5 min-h-[120px]">
          {TECH_CATEGORIES.map((cat) => {
            const items = TECH_CATALOG.filter(
              (t) => t.category === cat.id && selectedIds.includes(t.id)
            );
            if (!items.length) return null;

            return (
              <div key={cat.id} className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </h4>
                <div className="flex flex-wrap gap-2 items-center">
                  {items.map((t) => {
                    const src =
                      iconStyle === "devicon" && t.deviconSlug
                        ? `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${t.deviconSlug}.svg`
                        : iconStyle === "simpleicons"
                        ? `https://cdn.simpleicons.org/${t.logo}/${t.color}`
                        : iconStyle === "skillicons" && t.skillIconSlug
                        ? `https://skillicons.dev/icons?i=${t.skillIconSlug}`
                        : `https://img.shields.io/badge/${encodeURIComponent(t.name)}-${t.color}?style=for-the-badge&logo=${t.logo}&logoColor=white`;
                    return (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        key={t.id}
                        src={src}
                        alt={t.name}
                        loading="lazy"
                        className={
                          iconStyle === "badges"
                            ? "h-7 object-contain"
                            : "h-9 w-auto object-contain"
                        }
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
          {selectedIds.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-4">
              Select one or more technologies above to preview the organized matrix.
            </p>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleCopyMarkdown}
            disabled={!selectedIds.length}
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
            {copied ? "Markdown Copied!" : "Copy Categorized Markdown"}
          </Button>

          <Button
            onClick={() =>
              toggleFavorite({
                id: `tech-${iconStyle}-${selectedIds.slice().sort().join(",")}`,
                kind: "tech",
                title: `Tech Stack (${selectedIds.length} ${iconStyle})`,
                markdown: generatedMarkdown,
              })
            }
            disabled={!selectedIds.length}
            variant="ghost"
            size="sm"
            leftIcon={
              <Heart
                className={`w-3.5 h-3.5 ${
                  isFavorite(`tech-${iconStyle}-${selectedIds.slice().sort().join(",")}`)
                    ? "fill-rose-500 text-rose-500"
                    : ""
                }`}
              />
            }
          >
            Save Preset
          </Button>
        </div>

        <Button
          onClick={handleAddToReadme}
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
          {added ? "Added to Studio!" : "Add Tech Matrix to README"}
        </Button>
      </div>
    </div>
  );
}
