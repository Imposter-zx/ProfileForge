// components/ascii/CustomAsciiEditor.tsx
"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  FileCode2,
  Undo2,
  Redo2,
  Upload,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  Eye,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useStore } from "@/lib/store";
import {
  CUSTOM_ASCII_PRESETS,
  buildSafeMarkdownAsciiBlock,
  extractAsciiFromImportedText,
  getAsciiStats,
  normalizeAsciiText,
} from "@/lib/ascii/custom-editor";

export interface CustomAsciiEditorProps {
  initialText?: string;
}

const MAX_HISTORY = 100;

export function CustomAsciiEditor({ initialText }: CustomAsciiEditorProps) {
  const { addSection } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("Custom ASCII Art");
  const [text, setText] = useState<string>(
    initialText ?? CUSTOM_ASCII_PRESETS[0].art
  );
  const [historyPast, setHistoryPast] = useState<string[]>([]);
  const [historyFuture, setHistoryFuture] = useState<string[]>([]);

  const [fontSize, setFontSize] = useState(13);
  const [previewTheme, setPreviewTheme] = useState<"dark" | "light">("dark");
  const [collapsible, setCollapsible] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [added, setAdded] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [prevInitialText, setPrevInitialText] = useState<string | undefined>(
    initialText
  );

  if (initialText !== prevInitialText) {
    setPrevInitialText(initialText);
    if (initialText !== undefined && initialText !== text) {
      setHistoryPast((prev) => [...prev.slice(-MAX_HISTORY + 1), text]);
      setHistoryFuture([]);
      setText(normalizeAsciiText(initialText));
    }
  }

  const commitChange = useCallback(
    (nextValue: string) => {
      const normalized = normalizeAsciiText(nextValue);
      if (normalized === text) return;
      setHistoryPast((prev) => [...prev.slice(-MAX_HISTORY + 1), text]);
      setHistoryFuture([]);
      setText(normalized);
    },
    [text]
  );

  const handleUndo = useCallback(() => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    setHistoryPast((prev) => prev.slice(0, -1));
    setHistoryFuture((prev) => [text, ...prev.slice(0, MAX_HISTORY - 1)]);
    setText(previous);
  }, [historyPast, text]);

  const handleRedo = useCallback(() => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    setHistoryFuture((prev) => prev.slice(1));
    setHistoryPast((prev) => [...prev.slice(-MAX_HISTORY + 1), text]);
    setText(next);
  }, [historyFuture, text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMod = e.ctrlKey || e.metaKey;
    if (isMod && e.key.toLowerCase() === "z") {
      e.preventDefault();
      if (e.shiftKey) {
        handleRedo();
      } else {
        handleUndo();
      }
      return;
    }
    if (isMod && e.key.toLowerCase() === "y") {
      e.preventDefault();
      handleRedo();
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const next = text.slice(0, start) + "  " + text.slice(end);
      commitChange(next);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    if (file.size > 512 * 1024) {
      setImportError("File is too large (max 512 KB for README ASCII art).");
      return;
    }
    try {
      const content = await file.text();
      const extracted = extractAsciiFromImportedText(content);
      commitChange(extracted);
    } catch {
      setImportError("Failed to read file.");
    } finally {
      e.target.value = "";
    }
  };

  const safeMarkdown = buildSafeMarkdownAsciiBlock(text, {
    title,
    collapsible,
    summary: title,
  });

  const stats = getAsciiStats(text);

  const handleCopyRaw = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    } catch {}
  };

  const handleCopyMarkdown = async () => {
    if (!safeMarkdown) return;
    try {
      await navigator.clipboard.writeText(safeMarkdown);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    } catch {}
  };

  const handleExportFile = (ext: "txt" | "md") => {
    const content = ext === "md" ? safeMarkdown : text;
    if (!content.trim()) return;
    const mime =
      ext === "md" ? "text/markdown;charset=utf-8" : "text/plain;charset=utf-8";
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "ascii-art"}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleInsertIntoStudio = () => {
    if (!safeMarkdown) return;
    addSection({
      id: `sec-custom-ascii-${Date.now()}`,
      type: "custom",
      title: title.trim() || "Custom ASCII Art",
      enabled: true,
      align: "left",
      data: {
        markdown: safeMarkdown,
      },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FileCode2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">
              Custom ASCII Editor
            </h3>
            <p className="text-xs text-slate-400">
              Edit, import, and export raw ASCII with preserved whitespace, horizontal scrolling, and safe Markdown fencing.
            </p>
          </div>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {CUSTOM_ASCII_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                setTitle(preset.name);
                commitChange(preset.art);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-colors"
              title={preset.description}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={handleUndo}
            disabled={historyPast.length === 0}
            variant="outline"
            size="sm"
            leftIcon={<Undo2 className="w-3.5 h-3.5" />}
            title="Undo (Ctrl/Cmd+Z)"
          >
            Undo
          </Button>
          <Button
            onClick={handleRedo}
            disabled={historyFuture.length === 0}
            variant="outline"
            size="sm"
            leftIcon={<Redo2 className="w-3.5 h-3.5" />}
            title="Redo (Ctrl/Cmd+Shift+Z)"
          >
            Redo
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.asc,.ans,.md,text/plain,text/markdown"
            onChange={handleImportFile}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="secondary"
            size="sm"
            leftIcon={<Upload className="w-3.5 h-3.5" />}
          >
            Import .txt / .md
          </Button>

          <Button
            onClick={() => commitChange("")}
            disabled={!text}
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Clear
          </Button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>Size:</span>
            <input
              type="range"
              min={10}
              max={18}
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
              className="w-20 accent-indigo-500"
            />
            <span className="font-mono text-indigo-400 w-8">{fontSize}px</span>
          </div>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-colors ${
              showPreview
                ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {importError && (
        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
          {importError}
        </div>
      )}

      {/* Title & Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
        <Input
          label="Section Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Custom ASCII Art"
        />
        <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={collapsible}
              onChange={(e) => setCollapsible(e.target.checked)}
              className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Wrap in collapsible &lt;details&gt;</span>
          </label>
          <span className="text-[11px] font-mono text-slate-500">
            {stats.lines} lines • {stats.maxWidth} cols
          </span>
        </div>
      </div>

      {/* Editor + Live Preview */}
      <div
        className={`grid gap-4 ${
          showPreview ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {/* Monospace Editor */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">
              Raw ASCII Input (whitespace &amp; line breaks preserved)
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              {stats.chars} chars
            </span>
          </div>
          <textarea
            value={text}
            onChange={(e) => commitChange(e.target.value)}
            onKeyDown={handleKeyDown}
            wrap="off"
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            placeholder="Paste or type your ASCII art here..."
            style={{
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontSize: `${fontSize}px`,
              lineHeight: 1.25,
              tabSize: 2,
              whiteSpace: "pre",
            }}
            className="w-full h-80 p-4 rounded-xl bg-slate-950 text-slate-100 border border-slate-800 focus:outline-none focus:border-indigo-500 overflow-x-auto overflow-y-auto resize-y"
          />
        </div>

        {/* Live GitHub-style Monospace Preview */}
        {showPreview && (
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">
                GitHub Code Block Preview
              </span>
              <button
                onClick={() =>
                  setPreviewTheme((t) => (t === "dark" ? "light" : "dark"))
                }
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:text-white"
              >
                {previewTheme === "dark" ? (
                  <>
                    <Moon className="w-3 h-3 text-indigo-400" /> Dark
                  </>
                ) : (
                  <>
                    <Sun className="w-3 h-3 text-amber-400" /> Light
                  </>
                )}
              </button>
            </div>
            <div
              className={`h-80 p-4 rounded-xl border overflow-auto ${
                previewTheme === "dark"
                  ? "bg-[#0d1117] text-[#e6edf3] border-slate-800"
                  : "bg-[#f6f8fa] text-[#1f2328] border-slate-300"
              }`}
            >
              {text.trim() ? (
                <pre
                  style={{
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    fontSize: `${fontSize}px`,
                    lineHeight: 1.25,
                    whiteSpace: "pre",
                    margin: 0,
                  }}
                >
                  {text}
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center text-xs opacity-50">
                  Empty ASCII canvas
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleCopyRaw}
            disabled={!text.trim()}
            variant="outline"
            size="sm"
            leftIcon={
              copiedRaw ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )
            }
          >
            {copiedRaw ? "Raw Copied!" : "Copy Raw ASCII"}
          </Button>

          <Button
            onClick={handleCopyMarkdown}
            disabled={!safeMarkdown}
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
            {copiedMd ? "Markdown Copied!" : "Copy Fenced Markdown"}
          </Button>

          <Button
            onClick={() => handleExportFile("txt")}
            disabled={!text.trim()}
            variant="secondary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export .txt
          </Button>

          <Button
            onClick={() => handleExportFile("md")}
            disabled={!safeMarkdown}
            variant="secondary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export .md
          </Button>
        </div>

        <Button
          onClick={handleInsertIntoStudio}
          disabled={!safeMarkdown}
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
          {added ? "Inserted into Studio!" : "Insert into README Studio"}
        </Button>
      </div>
    </div>
  );
}
