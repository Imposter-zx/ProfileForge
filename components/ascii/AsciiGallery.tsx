// components/ascii/AsciiGallery.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  X,
  Shuffle,
  Clock,
  ArrowUpDown,
} from "lucide-react";
import {
  ASCII_CATALOG,
  POPULAR_PIECES,
  getRandomPiece,
  getPieceBySlug,
  type AsciiPieceEntry,
} from "@/lib/ascii/catalog";
import { useStore } from "@/lib/store";
import { AsciiPreviewCard } from "./AsciiPreviewCard";
import { AsciiViewer } from "./AsciiViewer";
import { CategoryFilter } from "./CategoryFilter";
import { BannerCustomizer } from "./BannerCustomizer";
import { ImageToAsciiStudio } from "./ImageToAsciiStudio";
import { Button } from "@/components/ui/Button";

type GalleryViewMode = "gallery" | "banner" | "image-to-ascii";
type SortOption = "default" | "name" | "canvas" | "fps";

export function AsciiGallery() {
  const {
    favoriteSlugs,
    recentlyViewedSlugs,
    selectedCategory,
    setSelectedCategory,
    selectedTagFilter,
    setSelectedTagFilter,
    asciiSearchQuery,
    setAsciiSearchQuery,
    addSection,
    addRecentlyViewed,
  } = useStore();

  const [activeTab, setActiveTab] = useState<GalleryViewMode>("gallery");
  const [inspectedPiece, setInspectedPiece] = useState<AsciiPieceEntry | null>(
    null
  );
  const [sortBy, setSortBy] = useState<SortOption>("default");

  // Filter pieces based on search query, category, and thematic tag
  const filteredPieces = useMemo(() => {
    let list: AsciiPieceEntry[] = ASCII_CATALOG;

    // Thematic tag filter
    if (selectedTagFilter === "popular") {
      list = list.filter((p) => POPULAR_PIECES.includes(p.slug));
    } else if (selectedTagFilter !== "all") {
      list = list.filter((p) => p.tags?.includes(selectedTagFilter));
    }

    // Category filter
    if (selectedCategory === "favorites") {
      list = list.filter((p) => favoriteSlugs.includes(p.slug));
    } else if (selectedCategory !== "all") {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Keyword search
    if (asciiSearchQuery.trim()) {
      const q = asciiSearchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.note.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort order
    if (sortBy === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "canvas") {
      list = [...list].sort((a, b) => Number(b.isCanvas) - Number(a.isCanvas));
    } else if (sortBy === "fps") {
      list = [...list].sort((a, b) => b.fps - a.fps);
    }

    return list;
  }, [selectedCategory, favoriteSlugs, asciiSearchQuery, selectedTagFilter, sortBy]);

  const handleInspect = (piece: AsciiPieceEntry) => {
    addRecentlyViewed(piece.slug);
    setInspectedPiece(piece);
  };

  const handleRandomPiece = () => {
    const random = getRandomPiece();
    handleInspect(random);
  };

  const handleAddToReadme = (piece: AsciiPieceEntry) => {
    addRecentlyViewed(piece.slug);
    addSection({
      id: `sec-ascii-${Date.now()}`,
      type: "ascii-art",
      title: `${piece.name} Art`,
      enabled: true,
      align: "center",
      data: {
        slug: piece.slug,
        width: Math.min(500, piece.cols * 10),
      },
    });
  };

  // Resolve recently viewed items
  const recentlyViewedPieces = useMemo(() => {
    return recentlyViewedSlugs
      .map((slug) => getPieceBySlug(slug))
      .filter((p): p is AsciiPieceEntry => Boolean(p));
  }, [recentlyViewedSlugs]);

  return (
    <div className="space-y-8">
      {/* Top Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            ASCII Engine & Art Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse {ASCII_CATALOG.length} upstream pieces from ascii.rest across 15
            categories, generate custom banners, or compile your own images.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
          <button
            onClick={() => setActiveTab("gallery")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === "gallery"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>217-Piece Gallery</span>
          </button>

          <button
            onClick={() => setActiveTab("banner")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === "banner"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Banner Studio</span>
          </button>

          <button
            onClick={() => setActiveTab("image-to-ascii")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === "image-to-ascii"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Image-to-ASCII</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ALL PIECES GALLERY */}
      {activeTab === "gallery" && (
        <div className="space-y-6">
          {/* Controls: Search, Surprise Me & Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, category, or note..."
                value={asciiSearchQuery}
                onChange={(e) => setAsciiSearchQuery(e.target.value)}
                className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 text-sm pl-9 pr-9 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
              />
              {asciiSearchQuery && (
                <button
                  onClick={() => setAsciiSearchQuery("")}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRandomPiece}
                variant="outline"
                size="sm"
                leftIcon={<Shuffle className="w-3.5 h-3.5 text-indigo-400" />}
              >
                Surprise Me!
              </Button>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="default" className="bg-slate-900">Sort: Default</option>
                  <option value="name" className="bg-slate-900">Name (A-Z)</option>
                  <option value="canvas" className="bg-slate-900">Color Canvas First</option>
                  <option value="fps" className="bg-slate-900">Highest FPS</option>
                </select>
              </div>
            </div>
          </div>

          {/* Recently Viewed Shelf */}
          {recentlyViewedPieces.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-[11px] text-slate-500 font-mono shrink-0">
                <Clock className="w-3 h-3" /> Recent:
              </span>
              {recentlyViewedPieces.slice(0, 8).map((p) => (
                <button
                  key={p.slug}
                  onClick={() => handleInspect(p)}
                  className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-mono shrink-0 transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}

          {/* Category Filter Tabs */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
            selectedTag={selectedTagFilter}
            onSelectTag={(tag) => setSelectedTagFilter(tag)}
          />

          {/* Results count banner */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Showing <strong className="text-slate-200">{filteredPieces.length}</strong> pieces
            </span>
            {(selectedCategory !== "all" || selectedTagFilter !== "all" || asciiSearchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedTagFilter("all");
                  setAsciiSearchQuery("");
                }}
                className="text-indigo-400 hover:text-indigo-300 text-[11px]"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Pieces Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPieces.map((piece) => (
              <AsciiPreviewCard
                key={piece.slug}
                piece={piece}
                onInspect={handleInspect}
                onAddToReadme={handleAddToReadme}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredPieces.length === 0 && (
            <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
              <Sparkles className="w-8 h-8 mx-auto text-slate-600" />
              <h3 className="text-base font-semibold text-slate-300">
                No matching ASCII pieces found
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Try a different keyword or reset category/tag filters.
              </p>
              <Button
                onClick={() => {
                  setAsciiSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedTagFilter("all");
                }}
                variant="outline"
                size="sm"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BANNER STUDIO */}
      {activeTab === "banner" && <BannerCustomizer />}

      {/* TAB 3: IMAGE-TO-ASCII STUDIO */}
      {activeTab === "image-to-ascii" && <ImageToAsciiStudio />}

      {/* ASCII Piece Inspector Modal */}
      <AsciiViewer
        piece={inspectedPiece}
        onClose={() => setInspectedPiece(null)}
      />
    </div>
  );
}
