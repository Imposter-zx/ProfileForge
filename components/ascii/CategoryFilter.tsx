// components/ascii/CategoryFilter.tsx
"use client";

import React from "react";
import { Heart, Sparkles, Flame, Orbit, Monitor, Shapes, Globe2, Loader2, Cat } from "lucide-react";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  ASCII_CATALOG,
  POPULAR_PIECES,
  type AsciiCategory,
} from "@/lib/ascii/catalog";
import { useStore } from "@/lib/store";

export const THEMATIC_TAGS = [
  { id: "all", label: "All Themes" },
  { id: "popular", label: "⭐ Most Popular" },
  { id: "space", label: "🌌 Space & Cosmos", icon: <Orbit className="w-3 h-3 text-cyan-400" /> },
  { id: "cyberpunk", label: "⚡ Cyberpunk & Matrix", icon: <Sparkles className="w-3 h-3 text-purple-400" /> },
  { id: "shapes3d", label: "🧊 3D Shapes & Math", icon: <Shapes className="w-3 h-3 text-indigo-400" /> },
  { id: "nature", label: "🌿 Nature & Landscapes", icon: <Globe2 className="w-3 h-3 text-emerald-400" /> },
  { id: "ocean", label: "🌊 Ocean & Waters", icon: <Sparkles className="w-3 h-3 text-blue-400" /> },
  { id: "fire", label: "🔥 Fire & Energy", icon: <Flame className="w-3 h-3 text-amber-400" /> },
  { id: "terminal", label: "📟 Terminal & Hacker", icon: <Monitor className="w-3 h-3 text-green-400" /> },
  { id: "cats", label: "🐱 Cats & Wildlife", icon: <Cat className="w-3 h-3 text-pink-400" /> },
  { id: "loading", label: "⏳ Spinners & UI", icon: <Loader2 className="w-3 h-3 text-orange-400" /> },
] as const;

export interface CategoryFilterProps {
  selectedCategory: AsciiCategory | "all" | "favorites";
  onSelectCategory: (cat: AsciiCategory | "all" | "favorites") => void;
  selectedTag: string;
  onSelectTag: (tag: string) => void;
}

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  selectedTag,
  onSelectTag,
}: CategoryFilterProps) {
  const { favoriteSlugs } = useStore();

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      all: ASCII_CATALOG.length,
      favorites: favoriteSlugs.length,
      popular: POPULAR_PIECES.length,
    };
    for (const cat of CATEGORIES) {
      counts[cat] = ASCII_CATALOG.filter((p) => p.category === cat).length;
    }
    return counts;
  }, [favoriteSlugs]);

  return (
    <div className="space-y-2.5">
      {/* THEMATIC TAGS ROW */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
        {THEMATIC_TAGS.map((t) => {
          const isSelected = selectedTag === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTag(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* CORE 15 CATEGORIES ROW */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none select-none">
        {/* "All" Button */}
        <button
          onClick={() => {
            onSelectCategory("all");
            onSelectTag("all");
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            selectedCategory === "all" && selectedTag === "all"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
              : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <span>All ({categoryCounts.all})</span>
        </button>

        {/* "Favorites" Button */}
        <button
          onClick={() => onSelectCategory("favorites")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            selectedCategory === "favorites"
              ? "bg-rose-600 text-white shadow-md shadow-rose-500/20"
              : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <Heart className="w-3 h-3 text-rose-400 fill-current" />
          <span>Favorites</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              selectedCategory === "favorites"
                ? "bg-white/20 text-white"
                : "bg-slate-800 text-slate-500"
            }`}
          >
            {categoryCounts.favorites}
          </span>
        </button>

        {/* 15 Categories */}
        {CATEGORIES.map((cat) => {
          const count = categoryCounts[cat] || 0;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <span>{CATEGORY_LABELS[cat]}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
