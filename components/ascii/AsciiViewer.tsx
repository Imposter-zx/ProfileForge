// components/ascii/AsciiViewer.tsx
"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Copy,
  Check,
  Plus,
  ExternalLink,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useStore } from "@/lib/store";
import { renderAdaptivePictureHtml, buildPieceReadmeUrls } from "@/lib/ascii/catalog";
import type { AsciiPieceEntry } from "@/lib/ascii/catalog";
import type { PieceName } from "ascii.rest";

const Ascii = dynamic(
  () => import("ascii.rest/react").then((m) => m.Ascii),
  { ssr: false, loading: () => <div className="text-xs text-indigo-400 font-mono py-12">Loading piece...</div> }
);

export interface AsciiViewerProps {
  piece: AsciiPieceEntry | null;
  onClose: () => void;
}

export function AsciiViewer({ piece, onClose }: AsciiViewerProps) {
  const { addSection } = useStore();
  const [mono, setMono] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!piece) return null;

  const { lightUrl, darkUrl } = buildPieceReadmeUrls(piece.slug);

  const markdownSnippet = renderAdaptivePictureHtml({
    lightSrc: lightUrl,
    darkSrc: darkUrl,
    alt: piece.name,
    align: "center",
  });

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdownSnippet);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    } catch {}
  };

  const handleCopySvgUrl = async () => {
    try {
      const fullUrl = darkUrl.startsWith("http")
        ? darkUrl
        : `${window.location.origin}${darkUrl}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {}
  };

  const handleAddToReadme = () => {
    addSection({
      id: `sec-ascii-${Date.now()}`,
      type: "ascii-art",
      title: `${piece.name} Art`,
      enabled: true,
      align: "center",
      data: {
        slug: piece.slug,
        lightUrl,
        darkUrl,
        width: Math.min(500, piece.cols * 10),
      },
    });
    onClose();
  };

  return (
    <Modal
      isOpen={Boolean(piece)}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>{piece.name}</span>
          <Badge variant="indigo" size="sm">
            {piece.category}
          </Badge>
          {piece.isCanvas && (
            <Badge variant="cyan" size="sm">
              canvas
            </Badge>
          )}
        </div>
      }
      subtitle={piece.note || "Animated ASCII art from ascii.rest"}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Large Live Preview */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-800 min-h-[260px] overflow-hidden text-center relative select-none">
          <Ascii
            piece={piece.slug as PieceName}
            label={piece.name}
            mono={mono}
            className="scale-90 sm:scale-100"
          />

          {/* Mono toggle button */}
          <div className="absolute top-3 right-3">
            <button
              onClick={() => setMono(!mono)}
              className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
                mono
                  ? "bg-indigo-600 text-white border-indigo-500"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              {mono ? "Mono: ON" : "Mono: OFF"}
            </button>
          </div>
        </div>

        {/* Technical specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Columns × Rows</span>
            <span className="font-mono font-semibold text-slate-200 mt-0.5 block">
              {piece.cols} × {piece.rows}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Frame Rate</span>
            <span className="font-mono font-semibold text-slate-200 mt-0.5 block">
              {piece.fps} FPS
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Rendering Mode</span>
            <span className="font-mono font-semibold text-slate-200 mt-0.5 block">
              {piece.isCanvas ? "HTML5 Canvas" : "<pre> Text"}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">README SVG</span>
            <span className="font-mono font-semibold text-slate-200 mt-0.5 block">
              {piece.hasHostedReadmeSvg ? "Hosted (CDN)" : "Compiled SVG"}
            </span>
          </div>
        </div>

        {/* GitHub Markdown Embed Snippet */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">
              GitHub Adaptive &lt;picture&gt; Snippet
            </span>
            <button
              onClick={handleCopyMarkdown}
              className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-mono text-[11px]"
            >
              {copiedMd ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy Markdown
                </>
              )}
            </button>
          </div>
          <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed select-all">
            {markdownSnippet}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <Button
            onClick={handleCopySvgUrl}
            variant="outline"
            size="sm"
            leftIcon={
              copiedUrl ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ExternalLink className="w-3.5 h-3.5" />
              )
            }
          >
            {copiedUrl ? "URL Copied" : "Copy SVG URL"}
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={handleAddToReadme}
              variant="glow"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Add to README Studio
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
