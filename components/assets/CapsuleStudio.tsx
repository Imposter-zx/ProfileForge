// components/assets/CapsuleStudio.tsx
"use client";

import React, { useState } from "react";
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
  buildCapsuleRenderUrl,
  CAPSULE_TYPES,
  CAPSULE_COLOR_PRESETS,
  type CapsuleRenderConfig,
  type CapsuleType,
  type CapsuleAnimation,
} from "@/lib/assets/capsule";

export function CapsuleStudio() {
  const { addSection, username } = useStore();

  const [type, setType] = useState<CapsuleType>("waving");
  const [section, setSection] = useState<"header" | "footer">("header");
  const [color, setColor] = useState("0:00F2FE,100:4FACFE");
  const [height, setHeight] = useState(200);
  const [text, setText] = useState(`Hi, I'm ${username || "Developer"}`);
  const [fontSize, setFontSize] = useState(45);
  const [fontColor, setFontColor] = useState("ffffff");
  const [desc, setDesc] = useState("Full-Stack Software Engineer");
  const [descSize, setDescSize] = useState(18);
  const [animation, setAnimation] = useState<CapsuleAnimation>("fadeIn");

  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState(false);

  const config: CapsuleRenderConfig = {
    type,
    section,
    color,
    height,
    text: section === "header" ? text : undefined,
    fontSize: section === "header" ? fontSize : undefined,
    fontColor: section === "header" ? fontColor : undefined,
    desc: section === "header" ? desc : undefined,
    descSize: section === "header" ? descSize : undefined,
    animation,
  };

  const url = buildCapsuleRenderUrl(config);
  const markdownSnippet = `<div align="center">\n  <img src="${url}" width="100%" alt="${text || "Header"}" />\n</div>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleAddToReadme = () => {
    addSection({
      id: `sec-capsule-${Math.random().toString(36).slice(2, 8)}`,
      type: "capsule-render",
      title: section === "header" ? "Capsule Header" : "Capsule Footer",
      enabled: true,
      align: "center",
      data: {
        capsule: config,
      },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">
              Capsule Render Studio
            </h3>
            <p className="text-xs text-slate-400">
              Generate dynamic SVG wave, egg, or cylinder headers and footers powered by capsule-render
            </p>
          </div>
        </div>

        {/* Section Switcher: Header vs Footer */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => {
              setSection("header");
              setHeight(200);
            }}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              section === "header"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Header Banner
          </button>
          <button
            onClick={() => {
              setSection("footer");
              setHeight(100);
            }}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              section === "footer"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Footer Banner
          </button>
        </div>
      </div>

      {/* Live Preview Screen */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 flex items-center justify-center overflow-hidden min-h-[160px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Capsule Render Preview"
          className="w-full max-w-2xl rounded-lg object-contain shadow-lg"
        />
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Shape / Type */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
            Shape Style
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as CapsuleType)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            {CAPSULE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Animation */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
            Animation Effect
          </label>
          <select
            value={animation}
            onChange={(e) => setAnimation(e.target.value as CapsuleAnimation)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="fadeIn">fadeIn</option>
            <option value="scaleIn">scaleIn</option>
            <option value="twinkling">twinkling</option>
            <option value="blinking">blinking</option>
          </select>
        </div>

        {/* Height Slider */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span>Height</span>
            <span className="font-mono text-indigo-400">{height}px</span>
          </div>
          <input
            type="range"
            min={70}
            max={300}
            step={10}
            value={height}
            onChange={(e) => setHeight(parseInt(e.target.value, 10))}
            className="w-full accent-indigo-500 mt-2"
          />
        </div>

        {/* Color Presets */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
            Color Gradient
          </label>
          <select
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            {CAPSULE_COLOR_PRESETS.map((p) => (
              <option key={p.color} value={p.color}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Header-Specific Content Controls */}
      {section === "header" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-800/60">
          <Input
            label="Heading Text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Hi, I'm Alex"
          />
          <Input
            label="Sub-headline / Tagline"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Full-Stack Developer"
          />
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Font Size</span>
              <span className="font-mono text-indigo-400">{fontSize}px</span>
            </div>
            <input
              type="range"
              min={24}
              max={70}
              step={2}
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500 mt-2"
            />
          </div>
          <Input
            label="Font Color Hex"
            value={fontColor}
            onChange={(e) => setFontColor(e.target.value.replace("#", ""))}
            placeholder="ffffff"
          />
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Subtitle Size</span>
              <span className="font-mono text-indigo-400">{descSize}px</span>
            </div>
            <input
              type="range"
              min={12}
              max={32}
              step={1}
              value={descSize}
              onChange={(e) => setDescSize(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500 mt-2"
            />
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <Button
          onClick={handleCopy}
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
          {added ? "Added to Studio!" : `Add ${section === "header" ? "Header" : "Footer"} to Studio`}
        </Button>
      </div>
    </div>
  );
}
