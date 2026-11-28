// components/assets/GifLibrary.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Copy,
  Check,
  Plus,
  Search,
  Film,
  Heart,
  AlertCircle,
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
import { validateAssetUrl, escapeHtmlAttr } from "@/lib/assets/validation";
import { useAssetFavorites } from "@/lib/assets/favorites";

export function GifLibrary() {
  const { addSection } = useStore();
  const { isFavorite, toggleFavorite } = useAssetFavorites();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [brokenIds, setBrokenIds] = useState<Record<string, boolean>>({});

  // Custom GIF URL input
  const [customUrl, setCustomUrl] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customPreviewError, setCustomPreviewError] = useState(false);

  const customUrlCheck = validateAssetUrl(customUrl, { allowEmpty: true });
  const hasValidCustom =
    Boolean(customUrl.trim()) &&
    customUrlCheck.valid &&
    Boolean(customUrlCheck.normalizedUrl);

  const filteredGifs = useMemo(() => {
    let list = CURATED_GIFS;
    if (selectedCategory === "favorites") {
      list = list.filter((g) => isFavorite(`gif-${g.id}`));
    } else if (selectedCategory !== "all") {
      list = list.filter((g) => g.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          g.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedCategory, searchQuery, isFavorite]);

  const buildGifMarkdown = (gif: GifAsset) =>
    `<div align="center">\n  <img src="${escapeHtmlAttr(gif.url)}" alt="${escapeHtmlAttr(gif.title)}" width="${gif.recommendedWidth || 600}" />\n</div>`;

  const handleCopyMarkdown = async (gif: GifAsset) => {
    try {
      await navigator.clipboard.writeText(buildGifMarkdown(gif));
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
    if (!hasValidCustom || customPreviewError) return;
    const title = customTitle.trim() || "Custom Animated Asset";
    addSection({
      id: `sec-gif-${Math.random().toString(36).slice(2, 9)}`,
      type: "gif-banner",
      title,
      enabled: true,
      align: "center",
      data: {
        url: customUrlCheck.normalizedUrl!,
        width: 600,
      },
    });
    setCustomUrl("");
    setCustomTitle("");
    setCustomPreviewError(false);
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
              Animated Visuals &amp; GIF Library
            </h3>
            <p className="text-xs text-slate-400">
              Curated Developer, Coding, Cybersecurity, AI, and Gaming GIFs plus validated custom GIF URLs
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search GIFs (e.g. ai, security, gaming)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory("favorites")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            selectedCategory === "favorites"
              ? "bg-rose-600 text-white shadow-md shadow-rose-500/20"
              : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <Heart className="w-3 h-3 fill-current" />
          <span>Favorites</span>
        </button>

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

      {/* Custom GIF URL Insertion Box with Validation & Live Preview */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
        <div className="flex flex-col sm:flex-row items-start gap-3">
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Paste custom GIF URL (https://...)"
              value={customUrl}
              onChange={(e) => {
                setCustomUrl(e.target.value);
                setCustomPreviewError(false);
              }}
              error={!customUrlCheck.valid ? customUrlCheck.error : undefined}
              hint={customUrlCheck.warning}
            />
            <Input
              placeholder="Optional Title / Alt Text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
            />
          </div>
          <Button
            onClick={handleAddCustomGif}
            disabled={!hasValidCustom || customPreviewError}
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto shrink-0 mt-0.5"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Custom GIF
          </Button>
        </div>

        {hasValidCustom && (
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 flex items-center justify-center min-h-[100px]">
            {customPreviewError ? (
              <div className="flex items-center gap-2 text-xs text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>Could not load custom GIF URL.</span>
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={customUrlCheck.normalizedUrl}
                alt={customTitle || "Custom GIF Preview"}
                loading="lazy"
                onError={() => setCustomPreviewError(true)}
                className="max-h-36 rounded object-contain"
              />
            )}
          </div>
        )}
      </div>

      {/* GIF Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGifs.map((gif) => {
          const favId = `gif-${gif.id}`;
          const favorited = isFavorite(favId);
          const isBroken = Boolean(brokenIds[gif.id]);

          return (
            <div
              key={gif.id}
              className="rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden flex flex-col justify-between group hover:border-slate-700 transition-all relative"
            >
              {/* Favorite button */}
              <button
                onClick={() =>
                  toggleFavorite({
                    id: favId,
                    kind: "gif",
                    title: gif.title,
                    previewUrl: gif.url,
                    markdown: buildGifMarkdown(gif),
                  })
                }
                className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-lg border transition-colors ${
                  favorited
                    ? "text-rose-400 bg-rose-500/20 border-rose-500/30"
                    : "text-slate-400 bg-slate-900/80 border-slate-800 hover:text-slate-200"
                }`}
                title={favorited ? "Remove from favorites" : "Save to favorites"}
              >
                <Heart className={`w-3.5 h-3.5 ${favorited ? "fill-rose-500" : ""}`} />
              </button>

              {/* Visual Container */}
              <div className="p-4 bg-slate-950 flex items-center justify-center min-h-[160px] max-h-[220px] overflow-hidden">
                {isBroken ? (
                  <div className="flex flex-col items-center gap-1.5 text-xs text-slate-500">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    <span>Preview unavailable</span>
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={gif.url}
                    alt={gif.title}
                    loading="lazy"
                    onError={() =>
                      setBrokenIds((prev) => ({ ...prev, [gif.id]: true }))
                    }
                    className="max-h-[190px] w-auto max-w-full rounded object-contain"
                  />
                )}
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
          );
        })}
      </div>

      {filteredGifs.length === 0 && (
        <div className="text-center py-12 text-xs text-slate-500 border border-slate-800 rounded-xl bg-slate-950/40">
          No GIFs match the current filter.
        </div>
      )}
    </div>
  );
}
