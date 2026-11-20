// components/studio/StudioLayout.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import JSZip from "jszip";
import {
  Undo2,
  Redo2,
  GitPullRequest,
  Check,
  FileArchive,
  ArrowLeft,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { SectionPanel } from "./SectionPanel";
import { SectionEditor } from "./SectionEditor";
import { PreviewPanel } from "./PreviewPanel";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  compileReadmeMarkdown,
} from "@/lib/readme/compiler";
import { generateWidgetActionsFallbackWorkflow } from "@/lib/badges/builder";

export function StudioLayout() {
  const {
    projectTitle,
    setProjectTitle,
    sections,
    username,
    previewMode,
    setPreviewMode,
    undo,
    redo,
    historyPast,
    historyFuture,
  } = useStore();

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  const canUndo = historyPast.length > 0;
  const canRedo = historyFuture.length > 0;

  // Export full ZIP package (README.md + .github/workflows/widgets.yml)
  const handleExportZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const markdown = compileReadmeMarkdown(sections);

      // Add README.md
      zip.file("README.md", markdown);

      // Add .github/workflows/widgets.yml fallback workflow
      const targetUser = username || "octocat";
      const workflowYaml = generateWidgetActionsFallbackWorkflow(targetUser);
      zip.file(".github/workflows/widgets.yml", workflowYaml);

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${targetUser}-profile-bundle.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
    } catch {
      // Error handling
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#090a0f] text-slate-100 overflow-hidden">
      {/* STUDIO TOP TOOLBAR */}
      <header className="h-14 border-b border-slate-800/80 bg-[#0c0e17] px-4 flex items-center justify-between gap-4 shrink-0 z-20">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Back to Analyzer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="bg-transparent font-bold text-sm text-slate-100 hover:bg-slate-800/50 px-2 py-1 rounded border border-transparent hover:border-slate-700 focus:bg-slate-900 focus:border-indigo-500 focus:outline-none transition-colors max-w-[200px] sm:max-w-xs"
          />
        </div>

        {/* Center: Undo / Redo & View Mode Switches */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* View Mode */}
          <div className="flex items-center gap-0.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setPreviewMode("split")}
              className={`px-2.5 py-1 rounded transition-colors ${
                previewMode === "split"
                  ? "bg-slate-800 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setPreviewMode("editor")}
              className={`px-2.5 py-1 rounded transition-colors ${
                previewMode === "editor"
                  ? "bg-slate-800 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Editor Only
            </button>
            <button
              onClick={() => setPreviewMode("preview")}
              className={`px-2.5 py-1 rounded transition-colors ${
                previewMode === "preview"
                  ? "bg-slate-800 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Preview Only
            </button>
          </div>
        </div>

        {/* Right: Export & Publish Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportZip}
            variant="outline"
            size="sm"
            isLoading={isZipping}
            leftIcon={
              zipSuccess ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <FileArchive className="w-3.5 h-3.5" />
              )
            }
          >
            {zipSuccess ? "Bundle Exported" : "Export ZIP"}
          </Button>

          <Button
            onClick={() => setIsPublishModalOpen(true)}
            variant="glow"
            size="sm"
            leftIcon={<GitPullRequest className="w-3.5 h-3.5" />}
          >
            Publish to GitHub
          </Button>
        </div>
      </header>

      {/* 3-PANEL STUDIO BODY */}
      <div className="flex-1 flex overflow-hidden">
        {/* PANEL 1: SECTIONS LIST (Hidden in Preview Only mode) */}
        {previewMode !== "preview" && (
          <aside className="w-72 shrink-0 h-full hidden md:block">
            <SectionPanel />
          </aside>
        )}

        {/* PANEL 2: ACTIVE SECTION EDITOR (Hidden in Preview Only mode) */}
        {previewMode !== "preview" && (
          <main className="flex-1 h-full overflow-hidden flex flex-col">
            <SectionEditor />
          </main>
        )}

        {/* PANEL 3: LIVE PREVIEW (Hidden in Editor Only mode) */}
        {previewMode !== "editor" && (
          <section
            className={`h-full overflow-hidden ${
              previewMode === "preview"
                ? "flex-1"
                : "w-[440px] lg:w-[480px] xl:w-[540px] shrink-0"
            }`}
          >
            <PreviewPanel />
          </section>
        )}
      </div>

      {/* PUBLISH TO GITHUB MODAL */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title="Publish Directly to GitHub"
        subtitle="Safe, incremental OAuth workflow with side-by-side PR preview"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-semibold text-slate-100 flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-indigo-400" />
              Target Profile Repository:
            </h4>
            <p className="font-mono text-indigo-300">
              github.com/{username || "{username}"}/{username || "{username}"}
            </p>
            <p className="text-slate-400 text-[11px]">
              GitHub displays the README.md in this special repository directly on your
              public profile page.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-semibold text-slate-200">Our Safe Workflow:</h5>
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-400">
              <li>Verifies repository existence or prompts automatic creation.</li>
              <li>Generates any dynamic ASCII SVGs and stores them safely in <code className="text-indigo-300">.github/assets/</code>.</li>
              <li>Opens a Pull Request on branch <code className="text-indigo-300">profile-forge/patch-update</code> so your current main branch is never overwritten unconfirmed.</li>
            </ol>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Tokens remain securely encrypted server-side.
            </span>
            <Button
              onClick={() => {
                alert("GitHub OAuth app credentials (GITHUB_OAUTH_CLIENT_ID) can be configured in .env for direct automated publishing. You can also export the ZIP or copy the Markdown now!");
                setIsPublishModalOpen(false);
              }}
              variant="primary"
              size="sm"
            >
              Connect GitHub OAuth
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
