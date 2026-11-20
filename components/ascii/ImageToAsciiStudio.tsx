// components/ascii/ImageToAsciiStudio.tsx
"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Download,
  Copy,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  convertImageFileToAsciiGrid,
  exportAsciiGridToReadmeSvg,
  type AsciiGridResult,
  type ImageToAsciiOptions,
} from "@/lib/ascii/image-to-ascii";

export function ImageToAsciiStudio() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [gridResult, setGridResult] = useState<AsciiGridResult | null>(null);

  // Conversion options
  const [cols, setCols] = useState(60);
  const [charset, setCharset] = useState<ImageToAsciiOptions["charset"]>("dense");
  const [colorMode, setColorMode] = useState<ImageToAsciiOptions["colorMode"]>("color");
  const [invert, setInvert] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const processImage = async (
    file: File,
    overrideCols?: number,
    overrideCharset?: ImageToAsciiOptions["charset"],
    overrideColorMode?: ImageToAsciiOptions["colorMode"],
    overrideInvert?: boolean
  ) => {
    setLoading(true);
    try {
      const res = await convertImageFileToAsciiGrid(file, {
        cols: overrideCols ?? cols,
        charset: overrideCharset ?? charset,
        colorMode: overrideColorMode ?? colorMode,
        invert: overrideInvert ?? invert,
        darkTheme: true,
      });
      setGridResult(res);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error converting image");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      processImage(file);
    }
  };

  const handleDownloadSvg = () => {
    if (!gridResult) return;
    const svg = exportAsciiGridToReadmeSvg(gridResult, {
      darkTheme: true,
      bgHex: "#0d1117",
      fontSize: 10,
    });
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ascii-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyText = async () => {
    if (!gridResult) return;
    try {
      await navigator.clipboard.writeText(gridResult.plainText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch {}
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">
              Client-Side Image-to-ASCII Compiler
            </h3>
            <p className="text-xs text-slate-400">
              Transform any PNG/JPG/WebP/GIF into high-fidelity ASCII or GitHub-safe SVG.
              Zero data leaves your browser.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Zone & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            onChange={handleFileChange}
            className="hidden"
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="primary"
            size="md"
            isLoading={loading}
            className="w-full"
            leftIcon={<Upload className="w-4 h-4" />}
          >
            {selectedFile ? "Change Image" : "Upload Image"}
          </Button>

          {selectedFile && (
            <p className="text-xs text-slate-400 truncate">
              Selected: <strong className="text-slate-200">{selectedFile.name}</strong>
            </p>
          )}

          {/* Columns Slider */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <label>Resolution (Columns)</label>
              <span className="font-mono text-indigo-400">{cols} cols</span>
            </div>
            <input
              type="range"
              min={30}
              max={110}
              step={5}
              value={cols}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setCols(val);
                if (selectedFile) processImage(selectedFile, val);
              }}
              className="w-full accent-indigo-500"
            />
          </div>

          {/* Charset Selector */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
            <label className="text-xs text-slate-300 block">Character Density</label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {(["dense", "blocks", "minimal"] as const).map((cs) => (
                <button
                  key={cs}
                  onClick={() => {
                    setCharset(cs);
                    if (selectedFile) processImage(selectedFile, undefined, cs);
                  }}
                  className={`py-1.5 px-2 rounded-lg font-mono capitalize transition-colors ${
                    charset === cs
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {cs}
                </button>
              ))}
            </div>
          </div>

          {/* Color Mode & Invert */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1.5">
              <label className="text-xs text-slate-300 block">Color Mode</label>
              <div className="flex gap-1 text-xs">
                {(["color", "mono"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setColorMode(m);
                      if (selectedFile)
                        processImage(selectedFile, undefined, undefined, m);
                    }}
                    className={`flex-1 py-1 rounded capitalize transition-colors ${
                      colorMode === m
                        ? "bg-indigo-600 text-white font-medium"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-center">
              <label className="text-xs text-slate-300 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={invert}
                  onChange={(e) => {
                    const inv = e.target.checked;
                    setInvert(inv);
                    if (selectedFile)
                      processImage(
                        selectedFile,
                        undefined,
                        undefined,
                        undefined,
                        inv
                      );
                  }}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Invert Luma</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          {gridResult && (
            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={handleDownloadSvg}
                variant="glow"
                size="sm"
                leftIcon={<Download className="w-4 h-4" />}
              >
                Download README SVG
              </Button>

              <Button
                onClick={handleCopyText}
                variant="outline"
                size="sm"
                leftIcon={
                  copiedText ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )
                }
              >
                {copiedText ? "Plain Text Copied!" : "Copy Plain Text"}
              </Button>
            </div>
          )}
        </div>

        {/* Preview Canvas Area */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-950 p-4 min-h-[340px] flex items-center justify-center overflow-auto">
          {gridResult ? (
            <pre
              className="text-[8px] sm:text-[9px] font-mono leading-none tracking-tighter select-all whitespace-pre"
              style={{
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              }}
            >
              {gridResult.rows.map((row, rIdx) => (
                <div key={rIdx} className="flex">
                  {row.map((cell, cIdx) => (
                    <span key={cIdx} style={{ color: cell.color }}>
                      {cell.char}
                    </span>
                  ))}
                </div>
              ))}
            </pre>
          ) : (
            <div className="text-center text-slate-500 space-y-2 p-8">
              <Upload className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs">
                Upload any profile picture, badge, or logo to see it rendered in ASCII.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
