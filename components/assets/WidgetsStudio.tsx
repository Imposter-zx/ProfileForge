// components/assets/WidgetsStudio.tsx
"use client";

import React, { useState } from "react";
import {
  BarChart2,
  Copy,
  Check,
  Plus,
  Eye,
  Activity,
  Award,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useStore } from "@/lib/store";
import type { SectionType } from "@/lib/readme/compiler";
import {
  buildExtendedWidgetUrl,
  type ExtendedWidgetConfig,
  type ExtendedWidgetType,
} from "@/lib/assets/widgets";

const WIDGET_OPTIONS = [
  { id: "stats", label: "GitHub Stats", icon: <BarChart2 className="w-4 h-4 text-amber-400" /> },
  { id: "streak", label: "Streak Stats", icon: <Flame className="w-4 h-4 text-orange-400" /> },
  { id: "trophies", label: "GitHub Trophies", icon: <Award className="w-4 h-4 text-yellow-400" /> },
  { id: "activity-graph", label: "Activity Graph", icon: <Activity className="w-4 h-4 text-emerald-400" /> },
  { id: "top-langs", label: "Top Languages", icon: <BarChart2 className="w-4 h-4 text-rose-400" /> },
  { id: "view-counter", label: "Profile Views Counter", icon: <Eye className="w-4 h-4 text-purple-400" /> },
] as const;

const THEMES = [
  "tokyonight",
  "radical",
  "onedark",
  "synthwave",
  "dracula",
  "gruvbox",
  "nord",
  "matrix",
  "github_dark",
  "merko",
] as const;

export function WidgetsStudio() {
  const { addSection, username: storeUsername } = useStore();

  const [widgetType, setWidgetType] = useState<ExtendedWidgetType>("stats");
  const [username, setUsername] = useState(storeUsername || "octocat");
  const [theme, setTheme] = useState("tokyonight");
  const [hideBorder, setHideBorder] = useState(true);

  // View counter specific
  const [vcColor, setVcColor] = useState("blueviolet");
  const [vcStyle, setVcStyle] = useState<"flat" | "flat-square" | "plastic" | "for-the-badge">("flat-square");

  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState(false);

  const widgetConfig: ExtendedWidgetConfig = {
    type: widgetType,
    username: username || "octocat",
    theme,
    hideBorder,
    viewCounterColor: vcColor,
    viewCounterStyle: vcStyle,
  };

  const widgetUrl = buildExtendedWidgetUrl(widgetConfig);

  const markdownSnippet =
    widgetType === "view-counter"
      ? `<div align="center">\n  <img src="${widgetUrl}" alt="Profile Views" />\n</div>`
      : `<div align="center">\n  <img src="${widgetUrl}" alt="${widgetType}" />\n</div>`;

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdownSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleAddToReadme = () => {
    const mapSectionType: Record<ExtendedWidgetType, SectionType> = {
      stats: "github-stats",
      streak: "streak",
      trophies: "trophies",
      "activity-graph": "contribution-graph",
      "top-langs": "top-languages",
      "repo-pin": "custom",
      "view-counter": "view-counter",
    };

    if (widgetType === "view-counter") {
      addSection({
        id: `sec-views-${Math.random().toString(36).slice(2, 8)}`,
        type: "view-counter",
        title: "Profile Views",
        enabled: true,
        align: "center",
        data: {
          username: username || "octocat",
          color: vcColor,
          style: vcStyle,
        },
      });
    } else {
      addSection({
        id: `sec-${widgetType}-${Math.random().toString(36).slice(2, 8)}`,
        type: mapSectionType[widgetType],
        title: widgetType === "stats" ? "GitHub Stats" : widgetType === "streak" ? "Streak Stats" : "GitHub Metrics",
        enabled: true,
        align: "center",
        data: {
          widget: widgetConfig,
        },
      });
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">
              GitHub Metrics & Widgets Studio
            </h3>
            <p className="text-xs text-slate-400">
              Configure and test stats cards, streaks, trophies, activity graphs, and view counters
            </p>
          </div>
        </div>
      </div>

      {/* Widget Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {WIDGET_OPTIONS.map((opt) => {
          const isSelected = widgetType === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setWidgetType(opt.id as ExtendedWidgetType)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Live Preview Screen */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 flex items-center justify-center overflow-x-auto min-h-[180px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={widgetUrl}
          alt="Widget Live Preview"
          className="max-h-[220px] max-w-full rounded object-contain shadow-md"
        />
      </div>

      {/* Configuration Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input
          label="Target GitHub Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="octocat"
        />

        {widgetType !== "view-counter" && (
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
              Color Theme
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            >
              {THEMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}

        {widgetType === "view-counter" && (
          <>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                Counter Color
              </label>
              <select
                value={vcColor}
                onChange={(e) => setVcColor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="blueviolet">BlueViolet (Imposter style)</option>
                <option value="00f2fe">Cyan 00F2FE</option>
                <option value="ff6a00">Neon Orange</option>
                <option value="00ff87">Matrix Green</option>
                <option value="black">Dark Minimal</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                Badge Style
              </label>
              <select
                value={vcStyle}
                onChange={(e) =>
                  setVcStyle(
                    e.target.value as "flat" | "flat-square" | "plastic" | "for-the-badge"
                  )
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="flat-square">Flat Square</option>
                <option value="flat">Flat</option>
                <option value="for-the-badge">For The Badge</option>
                <option value="plastic">Plastic</option>
              </select>
            </div>
          </>
        )}

        {widgetType !== "view-counter" && (
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="widget-border-toggle"
              checked={hideBorder}
              onChange={(e) => setHideBorder(e.target.checked)}
              className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="widget-border-toggle" className="text-xs text-slate-300 cursor-pointer">
              Hide Widget Border (Flat aesthetic)
            </label>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <Button
          onClick={handleCopyMarkdown}
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
          {added ? "Added to Studio!" : `Add ${widgetType} to README`}
        </Button>
      </div>
    </div>
  );
}
