// components/assets/CustomImageStudio.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Image as ImageIcon,
  Copy,
  Check,
  Plus,
  Heart,
  AlertCircle,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useStore } from "@/lib/store";
import { validateAssetUrl, escapeHtmlAttr } from "@/lib/assets/validation";
import { useAssetFavorites } from "@/lib/assets/favorites";

export function CustomImageStudio() {
  const { addSection } = useStore();
  const { isFavorite, toggleFavorite } = useAssetFavorites();

  const [imageUrl, setImageUrl] = useState("");
  const [darkImageUrl, setDarkImageUrl] = useState("");
  const [altText, setAltText] = useState("Profile Showcase");
  const [width, setWidth] = useState("600");
  const [align, setAlign] = useState<"left" | "center" | "right">("center");
  const [href, setHref] = useState("");
  const [previewTheme, setPreviewTheme] = useState<"dark" | "light">("dark");

  const [imgStatus, setImgStatus] = useState<{
    loaded: boolean;
    error: boolean;
    dimensions?: string;
  }>({ loaded: false, error: false });

  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState(false);

  const primaryCheck = validateAssetUrl(imageUrl, { allowEmpty: true });
  const darkCheck = validateAssetUrl(darkImageUrl, { allowEmpty: true });
  const hrefCheck = validateAssetUrl(href, { allowEmpty: true });

  const hasValidPrimary =
    Boolean(imageUrl.trim()) && primaryCheck.valid && Boolean(primaryCheck.normalizedUrl);
  const hasValidDark =
    Boolean(darkImageUrl.trim()) && darkCheck.valid && Boolean(darkCheck.normalizedUrl);

  const activePreviewSrc =
    previewTheme === "dark" && hasValidDark
      ? darkCheck.normalizedUrl!
      : hasValidPrimary
      ? primaryCheck.normalizedUrl!
      : "";

  const markdownSnippet = useMemo(() => {
    if (!hasValidPrimary) return "";
    const lightSrc = escapeHtmlAttr(primaryCheck.normalizedUrl!);
    const alt = escapeHtmlAttr(altText.trim() || "Image");
    const numericWidth = parseInt(width, 10);
    const widthAttr =
      !Number.isNaN(numericWidth) && numericWidth > 0
        ? ` width="${numericWidth}"`
        : "";

    const imgTag = `<img src="${lightSrc}" alt="${alt}"${widthAttr} />`;
    const core = hasValidDark
      ? `<picture>\n  <source media="(prefers-color-scheme: dark)" srcset="${escapeHtmlAttr(darkCheck.normalizedUrl!)}" />\n  ${imgTag}\n</picture>`
      : imgTag;

    const linked =
      href.trim() && hrefCheck.valid
        ? `<a href="${escapeHtmlAttr(href.trim())}">\n${core}\n</a>`
        : core;

    if (align === "center") return `<div align="center">\n${linked}\n</div>`;
    if (align === "right") return `<div align="right">\n${linked}\n</div>`;
    return linked;
  }, [
    hasValidPrimary,
    hasValidDark,
    primaryCheck.normalizedUrl,
    darkCheck.normalizedUrl,
    altText,
    width,
    align,
    href,
    hrefCheck.valid,
  ]);

  const favId = `image-${primaryCheck.normalizedUrl || imageUrl}`;
  const favorited = hasValidPrimary && isFavorite(favId);

  const handleCopy = async () => {
    if (!markdownSnippet) return;
    try {
      await navigator.clipboard.writeText(markdownSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleAddToReadme = () => {
    if (!markdownSnippet || imgStatus.error) return;
    addSection({
      id: `sec-image-${Date.now()}`,
      type: "custom",
      title: altText.trim() || "Custom Image",
      enabled: true,
      align,
      data: {
        markdown: markdownSnippet,
      },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">
              Custom Images &amp; Adaptive &lt;picture&gt; Studio
            </h3>
            <p className="text-xs text-slate-400">
              Validate external PNG, SVG, WebP, or GIF URLs with optional dark-mode &lt;picture&gt; support
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setPreviewTheme((t) => (t === "dark" ? "light" : "dark"))
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white self-start sm:self-auto"
        >
          {previewTheme === "dark" ? (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-400" /> Dark Preview
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" /> Light Preview
            </>
          )}
        </button>
      </div>

      {/* Live Preview */}
      <div
        className={`rounded-xl border p-6 flex flex-col items-center justify-center min-h-[180px] relative transition-colors ${
          previewTheme === "dark"
            ? "bg-[#0d1117] border-slate-800"
            : "bg-[#f6f8fa] border-slate-300"
        }`}
      >
        {activePreviewSrc ? (
          imgStatus.error ? (
            <div className="flex items-center gap-2 text-xs text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>Image failed to load. Check that the URL is publicly accessible.</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePreviewSrc}
                alt={altText || "Preview"}
                loading="lazy"
                onLoad={(e) => {
                  const img = e.currentTarget;
                  setImgStatus({
                    loaded: true,
                    error: false,
                    dimensions: `${img.naturalWidth}×${img.naturalHeight}`,
                  });
                }}
                onError={() =>
                  setImgStatus({ loaded: false, error: true })
                }
                style={{
                  width: width ? `${Math.min(720, parseInt(width, 10) || 600)}px` : undefined,
                }}
                className="max-w-full max-h-64 rounded object-contain"
              />
              {imgStatus.dimensions && (
                <span className="text-[10px] font-mono text-slate-500">
                  Loaded • {imgStatus.dimensions}px
                </span>
              )}
            </div>
          )
        ) : (
          <p className="text-xs text-slate-500">
            Paste a valid https:// image URL below to verify and preview it.
          </p>
        )}

        {hasValidPrimary && (
          <button
            onClick={() =>
              toggleFavorite({
                id: favId,
                kind: "image",
                title: altText.trim() || "Custom Image",
                previewUrl: primaryCheck.normalizedUrl!,
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

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Image URL (Light / Default)"
          value={imageUrl}
          onChange={(e) => {
            setImageUrl(e.target.value);
            setImgStatus({ loaded: false, error: false });
          }}
          error={!primaryCheck.valid ? primaryCheck.error : undefined}
          hint={primaryCheck.warning}
          placeholder="https://raw.githubusercontent.com/..."
        />
        <Input
          label="Dark Mode Image URL (optional <picture>)"
          value={darkImageUrl}
          onChange={(e) => {
            setDarkImageUrl(e.target.value);
            setImgStatus({ loaded: false, error: false });
          }}
          error={!darkCheck.valid ? darkCheck.error : undefined}
          hint={darkCheck.warning}
          placeholder="https://... (optional)"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Input
          label="Alt Text"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Profile Showcase"
        />
        <Input
          label="Width (px)"
          type="number"
          min={50}
          max={1200}
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          placeholder="600"
        />
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
            Alignment
          </label>
          <select
            value={align}
            onChange={(e) =>
              setAlign(e.target.value as "left" | "center" | "right")
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="center">center</option>
            <option value="left">left</option>
            <option value="right">right</option>
          </select>
        </div>
        <Input
          label="Click Link URL (optional)"
          value={href}
          onChange={(e) => setHref(e.target.value)}
          error={!hrefCheck.valid ? hrefCheck.error : undefined}
          placeholder="https://..."
        />
      </div>

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
          disabled={!hasValidPrimary || imgStatus.error || !hrefCheck.valid || !darkCheck.valid}
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
          {added ? "Inserted into Studio!" : "Insert Image into Studio"}
        </Button>
      </div>
    </div>
  );
}
