// components/ascii/AsciiPreviewCard.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Heart, Plus, Maximize2, Play, Pause, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/Badge";
import type { AsciiPieceEntry } from "@/lib/ascii/catalog";
import type { PieceName } from "ascii.rest";

const Ascii = dynamic(
  () => import("ascii.rest/react").then((m) => m.Ascii),
  {
    ssr: false,
    loading: () => (
      <div className="text-[10px] text-slate-500 font-mono py-8">
        Loading piece...
      </div>
    ),
  }
);

export interface AsciiPreviewCardProps {
  piece: AsciiPieceEntry;
  onInspect: (piece: AsciiPieceEntry) => void;
  onAddToReadme: (piece: AsciiPieceEntry) => void;
}

export function AsciiPreviewCard({
  piece,
  onInspect,
  onAddToReadme,
}: AsciiPreviewCardProps) {
  const { isFavorite, toggleFavorite } = useStore();
  const favorited = isFavorite(piece.slug);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [added, setAdded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setIsVisible(entry.isIntersecting);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleUse = () => {
    onAddToReadme(piece);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div
      ref={cardRef}
      className="group relative flex flex-col justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 overflow-hidden"
    >
      {/* Top Header */}
      <div className="p-3 border-b border-slate-800/60 flex items-center justify-between gap-2 shrink-0 bg-slate-950/40">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-xs text-slate-200 truncate">
            {piece.name}
          </span>
          {piece.isCanvas && (
            <Badge
              variant="cyan"
              size="sm"
              className="text-[9px] px-1.5 py-0 font-mono"
            >
              canvas
            </Badge>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(piece.slug);
          }}
          className={`p-1 rounded-md transition-colors ${
            favorited
              ? "text-rose-500 bg-rose-500/10"
              : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
          }`}
          title={favorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`w-3.5 h-3.5 ${favorited ? "fill-rose-500" : ""}`} />
        </button>
      </div>

      {/* ASCII Preview Canvas Area */}
      <div
        onClick={() => onInspect(piece)}
        className="relative flex items-center justify-center p-3 h-44 overflow-hidden bg-slate-950/80 cursor-pointer select-none text-center"
      >
        {!isPlaying ? (
          <div className="text-xs text-slate-500 font-mono">Paused</div>
        ) : isVisible ? (
          <div className="scale-75 sm:scale-90 transition-transform group-hover:scale-95 duration-200">
            <Ascii piece={piece.slug as PieceName} label={piece.name} />
          </div>
        ) : (
          <div className="text-[10px] text-slate-600 font-mono">
            {piece.name}
          </div>
        )}

        {/* Overlay hover prompt */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
          <span className="text-[11px] font-medium bg-slate-900/90 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/30 shadow-md">
            Click to Inspect
          </span>
        </div>
      </div>

      {/* Bottom Footer Details & Actions */}
      <div className="p-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/40">
        <span className="font-mono text-slate-500 text-[10px]">
          {piece.cols}×{piece.rows} • {piece.fps}fps
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            title={isPlaying ? "Pause animation" : "Play animation"}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={() => onInspect(piece)}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            title="Inspect & Customize"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleUse}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-medium transition-colors ${
              added
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                : "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border-indigo-500/20"
            }`}
            title="Add to current README"
          >
            {added ? (
              <>
                <Check className="w-3 h-3" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                <span>Use</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
