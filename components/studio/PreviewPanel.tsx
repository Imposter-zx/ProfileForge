// components/studio/PreviewPanel.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Copy,
  Check,
  Download,
  AlertTriangle,
  Eye,
  Code2,
  Monitor,
  Smartphone,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import { useStore } from "@/lib/store";
import {
  compileReadmeMarkdown,
  validateReadmeForExport,
} from "@/lib/readme/compiler";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Button } from "@/components/ui/Button";

type ViewportMode = "desktop" | "mobile" | "wide";

export function PreviewPanel() {
  const {
    sections,
    username,
    activePreviewTab,
    setActivePreviewTab,
    importMarkdown,
    theme,
  } = useStore();
  const [copied, setCopied] = useState(false);
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [zoom, setZoom] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rawDraft, setRawDraft] = useState<string | null>(null);
  const [syncedToast, setSyncedToast] = useState(false);

  const markdown = useMemo(() => {
    return compileReadmeMarkdown(sections);
  }, [sections]);

  const validationIssues = useMemo(() => {
    return validateReadmeForExport(markdown, sections);
  }, [markdown, sections]);

  const errors = validationIssues.filter((i) => i.severity === "error");
  const warnings = validationIssues.filter((i) => i.severity === "warning");

  const activeRawText = rawDraft !== null ? rawDraft : markdown;
  const hasRawChanges = rawDraft !== null && rawDraft !== markdown;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeRawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([activeRawText], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "README.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleApplyRaw = () => {
    if (rawDraft === null) return;
    importMarkdown(rawDraft);
    setRawDraft(null);
    setSyncedToast(true);
    setTimeout(() => setSyncedToast(false), 2000);
  };

  const viewportClass =
    viewport === "mobile"
      ? "max-w-[390px]"
      : viewport === "wide"
        ? "max-w-5xl"
        : "max-w-3xl";

  return (
    <div
      className={`flex flex-col bg-[#0a0c13] border-l border-slate-800/80 ${
        isFullscreen ? "fixed inset-0 z-50" : "h-full"
      }`}
    >
      {/* Panel Top Bar */}
      <div className="p-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0 bg-slate-900/40">
        {/* Tabs: GitHub Preview vs Editable Raw */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setActivePreviewTab("preview")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activePreviewTab === "preview"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>GitHub Profile</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActivePreviewTab("raw");
              if (rawDraft === null) setRawDraft(markdown);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activePreviewTab === "raw"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Raw .md</span>
          </button>
        </div>

        {/* Viewport & Zoom Controls */}
        {activePreviewTab === "preview" && (
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              className={`p-1 rounded transition-colors ${
                viewport === "desktop"
                  ? "bg-slate-800 text-indigo-300"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Desktop width"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              className={`p-1 rounded transition-colors ${
                viewport === "mobile"
                  ? "bg-slate-800 text-indigo-300"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Mobile width (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewport("wide")}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                viewport === "wide"
                  ? "bg-slate-800 text-indigo-300"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Wide width"
            >
              Wide
            </button>
            <span className="w-px h-3.5 bg-slate-800 mx-0.5" />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(70, z - 10))}
              className="p-1 rounded text-slate-400 hover:text-white"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-400 w-8 text-center">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(130, z + 10))}
              className="p-1 rounded text-slate-400 hover:text-white"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {zoom !== 100 && (
              <button
                type="button"
                onClick={() => setZoom(100)}
                className="p-1 rounded text-slate-400 hover:text-white"
                title="Reset zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
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
            {copied ? "Copied" : "Copy"}
          </Button>

          <Button
            onClick={handleDownload}
            variant="secondary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            .md
          </Button>

          <button
            type="button"
            onClick={() => setIsFullscreen((f) => !f)}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen preview"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Real-time Pre-Export Validation Warnings */}
      {(errors.length > 0 || warnings.length > 0) && (
        <div className="p-2.5 bg-amber-500/10 border-b border-amber-500/20 text-xs space-y-1 shrink-0">
          <div className="flex items-center gap-1.5 font-semibold text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>GitHub Compatibility Checker</span>
          </div>
          {errors.map((e, idx) => (
            <p key={idx} className="text-red-400 text-[11px] pl-5">
              • {e.message}
            </p>
          ))}
          {warnings.map((w, idx) => (
            <p key={idx} className="text-amber-300/80 text-[11px] pl-5">
              • {w.message}
            </p>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {activePreviewTab === "preview" ? (
          <div
            className={`${viewportClass} mx-auto transition-all origin-top`}
            style={{
              transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
            }}
          >
            <div
              className={`rounded-xl border shadow-2xl overflow-hidden ${
                theme === "light"
                  ? "border-[#d0d7de] bg-white"
                  : "border-[#30363d] bg-[#0d1117]"
              }`}
            >
              {/* GitHub README file header */}
              <div
                className={`px-4 py-2.5 border-b flex items-center justify-between text-xs font-mono ${
                  theme === "light"
                    ? "border-[#d0d7de] bg-[#f6f8fa] text-slate-600"
                    : "border-[#30363d] bg-[#161b22] text-slate-400"
                }`}
              >
                <span>
                  {username || "octocat"} /{" "}
                  <strong
                    className={
                      theme === "light" ? "text-slate-900" : "text-slate-200"
                    }
                  >
                    README.md
                  </strong>
                </span>
                <span
                  className={`text-[10px] ${
                    theme === "light" ? "text-slate-500" : "text-slate-500"
                  }`}
                >
                  GitHub Profile Preview ({theme === "light" ? "Light" : "Dark"})
                </span>
              </div>
              <div className="p-5 sm:p-8 min-h-[400px]">
                <MarkdownRenderer markdown={markdown} theme={theme} />
              </div>
            </div>
          </div>
        ) : (
          <div className={`${viewportClass} mx-auto space-y-3`}>
            <div className="flex items-center justify-between gap-2 bg-slate-900/70 border border-slate-800 rounded-xl px-3 py-2">
              <span className="text-xs text-slate-400">
                Edit raw Markdown directly and sync back into structured sections.
              </span>
              <div className="flex items-center gap-2">
                {hasRawChanges && (
                  <button
                    type="button"
                    onClick={() => setRawDraft(markdown)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Discard
                  </button>
                )}
                <Button
                  size="sm"
                  variant={hasRawChanges ? "primary" : "outline"}
                  disabled={!hasRawChanges}
                  onClick={handleApplyRaw}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  {syncedToast ? "Synced!" : "Sync to Sections"}
                </Button>
              </div>
            </div>
            <textarea
              rows={24}
              value={activeRawText}
              onChange={(e) => setRawDraft(e.target.value)}
              spellCheck={false}
              className="w-full p-4 rounded-xl bg-[#0d1117] border border-[#30363d] text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500 resize-y"
            />
          </div>
        )}
      </div>
    </div>
  );
}
