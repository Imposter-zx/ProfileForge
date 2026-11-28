// components/ascii/AsciiViewer.tsx
"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Copy,
  Check,
  Plus,
  ExternalLink,
  Play,
  Image as ImageIcon,
  Sun,
  Moon,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useStore } from "@/lib/store";
import {
  renderAdaptivePictureHtml,
  buildPieceReadmeUrls,
} from "@/lib/ascii/catalog";
import type { AsciiPieceEntry } from "@/lib/ascii/catalog";
import type { PieceName } from "ascii.rest";

const Ascii = dynamic(
  () => import("ascii.rest/react").then((m) => m.Ascii),
  {
    ssr: false,
    loading: () => (
      <div className="text-xs text-indigo-400 font-mono py-12">
        Loading piece...
      </div>
    ),
  }
);

export interface AsciiViewerProps {
  piece: AsciiPieceEntry | null;
  onClose: () => void;
}

export function AsciiViewer({ piece, onClose }: AsciiViewerProps) {
  const { addSection } = useStore();
  const [mono, setMono] = useState(false);
  const [previewMode, setPreviewMode] = useState<"animated" | "static">(
    "animated"
  );
  const [colorTheme, setColorTheme] = useState<"dark" | "light">("dark");
  const [width, setWidth] = useState(480);
  const [tintColor, setTintColor] = useState("#e2e8f0");
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [svgLoadError, setSvgLoadError] = useState(false);
  const [prevSlug, setPrevSlug] = useState<string | undefined>(piece?.slug);

  if (piece && piece.slug !== prevSlug) {
    setPrevSlug(piece.slug);
    setWidth(Math.min(600, Math.max(240, piece.cols * 8)));
    setSvgLoadError(false);
  }

  if (!piece) return null;

  const { lightUrl, darkUrl } = buildPieceReadmeUrls(piece.slug);

  const markdownSnippet = renderAdaptivePictureHtml({
    lightSrc: lightUrl,
    darkSrc: darkUrl,
    alt: piece.name,
    width,
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
      const targetUrl = colorTheme === "dark" ? darkUrl : lightUrl;
      await navigator.clipboard.writeText(targetUrl);
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
        width,
      },
    });
    onClose();
  };

  const activeSvgUrl = colorTheme === "dark" ? darkUrl : lightUrl;

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
      <div className="space-y-5">
        {/* Preview Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
          {/* Animated vs Static */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setPreviewMode("animated")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                previewMode === "animated"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Play className="w-3 h-3" /> Live Animated
            </button>
            <button
              onClick={() => {
                setPreviewMode("static");
                setSvgLoadError(false);
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                previewMode === "static"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ImageIcon className="w-3 h-3" /> README SVG
            </button>
          </div>

          {/* Mono + Theme + Tint */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMono(!mono)}
              className={`px-2.5 py-1 rounded-lg font-mono border transition-colors ${
                mono
                  ? "bg-indigo-600 text-white border-indigo-500"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              {mono ? "Mono: ON" : "Mono: OFF"}
            </button>

            {mono && previewMode === "animated" && (
              <label
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 cursor-pointer"
                title="Custom Mono Tint Color"
              >
                <span className="text-[11px]">Tint</span>
                <input
                  type="color"
                  value={tintColor}
                  onChange={(e) => setTintColor(e.target.value)}
                  className="w-4 h-4 rounded border-0 bg-transparent cursor-pointer"
                />
              </label>
            )}

            <button
              onClick={() =>
                setColorTheme((t) => (t === "dark" ? "light" : "dark"))
              }
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              title="Toggle GitHub Light/Dark Background"
            >
              {colorTheme === "dark" ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" /> Dark
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> Light
                </>
              )}
            </button>
          </div>
        </div>

        {/* Large Live Preview */}
        <div
          className={`flex flex-col items-center justify-center p-6 rounded-2xl border min-h-[250px] overflow-auto text-center relative select-none transition-colors ${
            colorTheme === "dark"
              ? "bg-[#0d1117] border-slate-800"
              : "bg-[#f6f8fa] border-slate-300"
          }`}
        >
          {previewMode === "animated" ? (
            <div
              style={{
                width: `${width}px`,
                maxWidth: "100%",
                color: mono ? tintColor : undefined,
              }}
              className="flex items-center justify-center"
            >
              <Ascii
                piece={piece.slug as PieceName}
                label={piece.name}
                mono={mono}
                className="scale-90 sm:scale-100"
              />
            </div>
          ) : svgLoadError ? (
            <div className="text-xs text-amber-400 font-mono space-y-1">
              <p>Hosted SVG unavailable for this piece.</p>
              <p className="text-slate-500">
                Switch to Live Animated preview or use the compiled Markdown snippet.
              </p>
            </div>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={activeSvgUrl}
              alt={piece.name}
              width={width}
              onError={() => setSvgLoadError(true)}
              className="max-w-full rounded object-contain"
            />
          )}
        </div>

        {/* Resize Slider */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-4 text-xs">
          <span className="text-slate-300 font-medium shrink-0">
            README Width
          </span>
          <input
            type="range"
            min={200}
            max={800}
            step={20}
            value={width}
            onChange={(e) => setWidth(parseInt(e.target.value, 10))}
            className="flex-1 accent-indigo-500"
          />
          <span className="font-mono text-indigo-400 w-14 text-right">
            {width}px
          </span>
        </div>

        {/* Technical specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">
              Columns × Rows
            </span>
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
            <span className="text-slate-500 block text-[10px]">
              Rendering Mode
            </span>
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
