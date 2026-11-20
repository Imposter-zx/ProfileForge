// components/assets/GifLibrary.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Copy,
  Check,
  Plus,
  Search,
  Film,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useStore } from "@/lib/store";
import {
  CURATED_GIFS,
  GIF_CATEGORIES,
  type GifAsset,
} from "@/lib/assets/gifs";

export function GifLibrary() {
  const { addSection } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  // Custom GIF URL input
  const [customUrl, setCustomUrl] = useState("");
  const [customTitle, setCustomTitle] = useState("");

  const filteredGifs = useMemo(() => {
    let list = CURATED_GIFS;
    if (selectedCategory !== "all") {
      list = list.filter((g) => g.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedCategory, searchQuery]);

  const handleCopyMarkdown = async (gif: GifAsset) => {
    const md = `<div align="center">\n  <img src="${gif.url}" alt="${gif.title}" width="${gif.recommendedWidth || 600}" />\n</div>`;
    try {
      await navigator.clipboard.writeText(md);
      setCopiedId(gif.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handleAddToReadme = (gif: GifAsset) => {
    addSection({
      id: `sec-gif-${Math.random().toString(36).slice(2, 9)}`,
      type: "gif-banner",
      title: gif.title,
      enabled: true,
      align: "center",
      data: {
        url: gif.url,
        width: gif.recommendedWidth || 600,
      },
    });
    setAddedId(gif.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  const handleAddCustomGif = () => {
    if (!customUrl.trim()) return;
    const title = customTitle.trim() || "Custom Animated Asset";
    addSection({
      id: `sec-gif-${Math.random().toString(36).slice(2, 9)}`,
      type: "gif-banner",
      title,
      enabled: true,
      align: "center",
      data: {
        url: customUrl.trim(),
        width: 600,
      },
    });
    setCustomUrl("");
    setCustomTitle("");
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">
              Animated Visuals & GIF Library
            </h3>
            <p className="text-xs text-slate-400">
              Curated pixel art, space shooters, retro dividers, and cyberpunk banners ready for GitHub
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search GIFs (e.g. shooter, neon)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {GIF_CATEGORIES.map((c) => {
          const isSelected = selectedCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Custom GIF URL Insertion Box */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            placeholder="Paste any external image or GIF URL (https://...)"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
          />
          <Input
            placeholder="Optional Title / Alt Text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
          />
        </div>
        <Button
          onClick={handleAddCustomGif}
          disabled={!customUrl.trim()}
          variant="secondary"
          size="sm"
          className="w-full sm:w-auto shrink-0"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Custom Asset
        </Button>
      </div>

      {/* GIF Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGifs.map((gif) => (
          <div
            key={gif.id}
            className="rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden flex flex-col justify-between group hover:border-slate-700 transition-all"
          >
            {/* Visual Container */}
            <div className="p-4 bg-slate-950 flex items-center justify-center min-h-[160px] max-h-[220px] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={gif.url}
                alt={gif.title}
                loading="lazy"
                className="max-h-[190px] w-auto max-w-full rounded object-contain"
              />
            </div>

            {/* Bottom Info & Buttons */}
            <div className="p-3.5 border-t border-slate-800 bg-slate-900/40 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-xs text-slate-200 truncate">
                  {gif.title}
                </h4>
                <Badge variant="indigo" size="sm" className="capitalize text-[10px]">
                  {gif.category}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleCopyMarkdown(gif)}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-[11px] py-1"
                  leftIcon={
                    copiedId === gif.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )
                  }
                >
                  {copiedId === gif.id ? "Copied" : "Copy .md"}
                </Button>

                <Button
                  onClick={() => handleAddToReadme(gif)}
                  variant="glow"
                  size="sm"
                  className="flex-1 text-[11px] py-1"
                  leftIcon={
                    addedId === gif.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Plus className="w-3 h-3" />
                    )
                  }
                >
                  {addedId === gif.id ? "Added!" : "Add to README"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
