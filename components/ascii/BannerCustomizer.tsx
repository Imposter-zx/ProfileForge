// components/ascii/BannerCustomizer.tsx
"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Sparkles,
  Copy,
  Check,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useStore } from "@/lib/store";
import {
  buildAsciiBannerUrls,
  renderAdaptivePictureHtml,
  type BannerOptions,
} from "@/lib/ascii/catalog";

// Dynamic import for Banner component from ascii.rest/react
const Banner = dynamic(
  () => import("ascii.rest/react").then((m) => m.Banner),
  {
    ssr: false,
    loading: () => (
      <div className="text-xs text-indigo-400 font-mono py-12">
        Rendering banner...
      </div>
    ),
  }
);

const FONTS = [
  "block",
  "slim",
  "tall",
  "bold",
  "round",
  "wide",
  "mixed",
  "italic",
] as const;

const SHADOWS = [
  "double",
  "single",
  "heavy",
  "rounded",
  "ascii",
  "none",
] as const;

const EFFECTS = ["glint", "type", "still"] as const;

export function BannerCustomizer() {
  const { addSection } = useStore();

  const [text, setText] = useState("PROFILE FORGE");
  const [font, setFont] = useState<BannerOptions["font"]>("block");
  const [shadow, setShadow] = useState<BannerOptions["shadow"]>("double");
  const [effect, setEffect] = useState<BannerOptions["effect"]>("glint");
  const [color1, setColor1] = useState("00F2FE");
  const [color2, setColor2] = useState("4FACFE");
  const [tagline, setTagline] = useState("Next-Gen GitHub README Studio");
  const [copiedMd, setCopiedMd] = useState(false);
  const [added, setAdded] = useState(false);

  const bannerOpts: BannerOptions = {
    text: text || "HELLO",
    font,
    shadow,
    effect,
    color: [color1, color2],
    tagline: tagline || undefined,
  };

  const { lightUrl, darkUrl } = buildAsciiBannerUrls(bannerOpts);

  const markdownSnippet = renderAdaptivePictureHtml({
    lightSrc: lightUrl,
    darkSrc: darkUrl,
    alt: text,
    align: "center",
  });

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdownSnippet);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    } catch {}
  };

  const handleAddToReadme = () => {
    addSection({
      id: `sec-banner-${Date.now()}`,
      type: "ascii-banner",
      title: `${text} Banner`,
      enabled: true,
      align: "center",
      data: {
        banner: bannerOpts,
      },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">
              Interactive Banner Studio
            </h3>
            <p className="text-xs text-slate-400">
              Generate animated GitHub README headers in real-time with zero JS
            </p>
          </div>
        </div>
      </div>

      {/* Live Preview Display */}
      <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-950 border border-slate-800/80 min-h-[180px] overflow-x-auto text-center relative select-none">
        <Banner
          text={text || "HELLO"}
          font={font}
          shadow={shadow}
          effect={effect}
          color={[`#${color1}`, `#${color2}`]}
        />
        {tagline && (
          <p className="text-xs text-slate-400 font-mono mt-3 opacity-80">
            {tagline}
          </p>
        )}
      </div>

      {/* Customizer Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
            Banner Text (Max 25)
          </label>
          <input
            type="text"
            maxLength={25}
            value={text}
            onChange={(e) => setText(e.target.value.toUpperCase())}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 uppercase focus:outline-none focus:border-indigo-500"
            placeholder="TEXT"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
            Font Face
          </label>
          <select
            value={font}
            onChange={(e) => setFont(e.target.value as BannerOptions["font"])}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            {FONTS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
            Drop Shadow
          </label>
          <select
            value={shadow}
            onChange={(e) => setShadow(e.target.value as BannerOptions["shadow"])}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            {SHADOWS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
            Animation Effect
          </label>
          <select
            value={effect}
            onChange={(e) => setEffect(e.target.value as BannerOptions["effect"])}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            {EFFECTS.map((eff) => (
              <option key={eff} value={eff}>
                {eff}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Colors & Tagline */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Gradient Start Hex"
          value={color1}
          onChange={(e) => setColor1(e.target.value.replace("#", ""))}
          placeholder="00F2FE"
        />
        <Input
          label="Gradient End Hex"
          value={color2}
          onChange={(e) => setColor2(e.target.value.replace("#", ""))}
          placeholder="4FACFE"
        />
        <Input
          label="Optional Tagline"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="e.g. Building scalable software"
        />
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
        <Button
          onClick={handleCopyMarkdown}
          variant="outline"
          size="sm"
          leftIcon={
            copiedMd ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )
          }
        >
          {copiedMd ? "Markdown Copied!" : "Copy Adaptive Markdown"}
        </Button>

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
          {added ? "Added to Studio!" : "Add Banner to Studio"}
        </Button>
      </div>
    </div>
  );
}
