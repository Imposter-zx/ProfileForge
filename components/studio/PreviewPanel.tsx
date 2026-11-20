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
} from "lucide-react";
import { useStore } from "@/lib/store";
import {
  compileReadmeMarkdown,
  validateReadmeForExport,
} from "@/lib/readme/compiler";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Button } from "@/components/ui/Button";

export function PreviewPanel() {
  const { sections, activePreviewTab, setActivePreviewTab } = useStore();
  const [copied, setCopied] = useState(false);

  // Compile the Markdown in real-time from active sections
  const markdown = useMemo(() => {
    return compileReadmeMarkdown(sections);
  }, [sections]);

  // Run real-time pre-export validation
  const validationIssues = useMemo(() => {
    return validateReadmeForExport(markdown, sections);
  }, [markdown, sections]);

  const errors = validationIssues.filter((i) => i.severity === "error");
  const warnings = validationIssues.filter((i) => i.severity === "warning");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "README.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0c13] border-l border-slate-800/80">
      {/* Panel Top Bar */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 bg-slate-900/40">
        {/* Tabs: Preview vs Raw */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActivePreviewTab("preview")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activePreviewTab === "preview"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
          <button
            onClick={() => setActivePreviewTab("raw")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activePreviewTab === "raw"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Raw .md</span>
          </button>
        </div>

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
            Download
          </Button>
        </div>
      </div>

      {/* Real-time Pre-Export Validation Warnings */}
      {(errors.length > 0 || warnings.length > 0) && (
        <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
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
      <div className="flex-1 overflow-y-auto p-6">
        {activePreviewTab === "preview" ? (
          <div className="max-w-3xl mx-auto rounded-2xl border border-slate-800 bg-slate-950/80 p-6 sm:p-8 shadow-inner min-h-[400px]">
            <MarkdownRenderer markdown={markdown} />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
              {markdown}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
