// components/studio/StudioLayout.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import JSZip from "jszip";
import {
  Undo2,
  Redo2,
  GitPullRequest,
  Check,
  FileArchive,
  ArrowLeft,
  Upload,
  FileJson,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
  HelpCircle,
  Layers,
  Sliders,
  Eye,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { SectionPanel } from "./SectionPanel";
import { SectionEditor } from "./SectionEditor";
import { PreviewPanel } from "./PreviewPanel";
import { StudioOnboarding } from "./StudioOnboarding";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PublishModal } from "@/components/github/PublishModal";
import { useGitHubAuth } from "@/hooks/useGitHubAuth";
import { compileReadmeMarkdown } from "@/lib/readme/compiler";
import { exportProjectJson } from "@/lib/readme/importer";
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
    lastSavedAt,
    markSaved,
    importMarkdown,
    importProject,
    resetWorkspace,
    hasDismissedOnboarding,
    resetOnboarding,
  } = useStore();

  const { user, isConnected } = useGitHubAuth();

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [mobilePane, setMobilePane] = useState<"sections" | "editor" | "preview">("editor");
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    canUndo?: boolean;
  } | null>(null);

  const canUndo = historyPast.length > 0;
  const canRedo = historyFuture.length > 0;

  const showToast = (text: string, canUndo = false) => {
    setToastMessage({ text, canUndo });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

  // Global keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z / Ctrl+Y, Ctrl+S, Escape)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (e.key === "Escape") {
        setIsImportModalOpen(false);
        setIsPublishModalOpen(false);
        return;
      }

      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        markSaved();
        showToast("Workspace saved locally");
        return;
      }

      if (isInput) return;

      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (mod && e.key.toLowerCase() === "z" && e.shiftKey) ||
        (mod && e.key.toLowerCase() === "y")
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo, markSaved]);

  const handleExportZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const markdown = compileReadmeMarkdown(sections);
      zip.file("README.md", markdown);
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
      // ignore
    } finally {
      setIsZipping(false);
    }
  };

  const handleExportJson = () => {
    const json = exportProjectJson({
      title: projectTitle,
      username,
      sections,
    });
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(username || "profile-forge").toLowerCase()}-project.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Exported project JSON");
  };

  const handleImportSubmit = () => {
    const trimmed = importText.trim();
    if (!trimmed) {
      setImportError("Paste README.md Markdown or Project JSON first.");
      return;
    }
    setImportError(null);
    try {
      if (trimmed.startsWith("{")) {
        importProject(trimmed);
        showToast("Imported project JSON");
      } else {
        const count = importMarkdown(trimmed);
        showToast(`Imported ${count} section${count === 1 ? "" : "s"} from Markdown`);
      }
      setImportText("");
      setIsImportModalOpen(false);
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : "Failed to parse import content."
      );
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setImportText(text);
    setImportError(null);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#090a0f] text-slate-100 overflow-hidden">
      {/* STUDIO TOP TOOLBAR */}
      <header className="h-14 border-b border-slate-800/80 bg-[#0c0e17] px-3 sm:px-4 flex items-center justify-between gap-2 shrink-0 z-20">
        {/* Left: Back, Panel Toggle & Title */}
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Back to Analyzer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          {previewMode !== "preview" && (
            <button
              type="button"
              onClick={() => setShowLeftPanel((v) => !v)}
              className="hidden md:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={showLeftPanel ? "Collapse sections sidebar" : "Expand sections sidebar"}
            >
              {showLeftPanel ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeftOpen className="w-4 h-4" />
              )}
            </button>
          )}

          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="bg-transparent font-bold text-sm text-slate-100 hover:bg-slate-800/50 px-2 py-1 rounded border border-transparent hover:border-slate-700 focus:bg-slate-900 focus:border-indigo-500 focus:outline-none transition-colors max-w-[140px] sm:max-w-[220px]"
          />

          {lastSavedAt && (
            <span className="hidden xl:inline-block text-[10px] font-mono text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Saved
            </span>
          )}
        </div>

        {/* Center: Undo / Redo & View Mode Switches */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-0.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-0.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setPreviewMode("split")}
              className={`px-2.5 py-1 rounded transition-colors ${
                previewMode === "split"
                  ? "bg-slate-800 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Split
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("editor")}
              className={`px-2.5 py-1 rounded transition-colors ${
                previewMode === "editor"
                  ? "bg-slate-800 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("preview")}
              className={`px-2.5 py-1 rounded transition-colors ${
                previewMode === "preview"
                  ? "bg-slate-800 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Preview
            </button>
          </div>

          {previewMode === "split" && (
            <button
              type="button"
              onClick={() => setShowRightPanel((v) => !v)}
              className="hidden lg:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={showRightPanel ? "Collapse preview panel" : "Expand preview panel"}
            >
              {showRightPanel ? (
                <PanelRightClose className="w-4 h-4" />
              ) : (
                <PanelRightOpen className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Right: Import, Export & Publish Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isConnected && user ? (
            <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              {user.avatar_url && (
                <Image
                  src={user.avatar_url}
                  alt={user.login}
                  width={20}
                  height={20}
                  className="rounded-full"
                  unoptimized
                />
              )}
              <span className="font-mono text-[11px] text-indigo-300">
                @{user.login}
              </span>
            </div>
          ) : (
            <a href="/api/auth/github/login" className="hidden xl:block">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<GitPullRequest className="w-3.5 h-3.5" />}
              >
                Connect GitHub
              </Button>
            </a>
          )}

          <Button
            onClick={() => setIsImportModalOpen(true)}
            variant="outline"
            size="sm"
            leftIcon={<Upload className="w-3.5 h-3.5" />}
            title="Import README.md or Project JSON"
          >
            <span className="hidden md:inline">Import</span>
          </Button>

          <Button
            onClick={handleExportJson}
            variant="outline"
            size="sm"
            leftIcon={<FileJson className="w-3.5 h-3.5" />}
            title="Export Project JSON"
          >
            <span className="hidden lg:inline">JSON</span>
          </Button>

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
            <span className="hidden sm:inline">
              {zipSuccess ? "Exported" : "ZIP"}
            </span>
          </Button>

          <Button
            onClick={() => setIsPublishModalOpen(true)}
            variant="glow"
            size="sm"
            leftIcon={<GitPullRequest className="w-3.5 h-3.5" />}
          >
            Publish
          </Button>

          {hasDismissedOnboarding && (
            <button
              type="button"
              onClick={resetOnboarding}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
              title="Show Studio Quick-Start Guide"
              aria-label="Show Studio Quick-Start Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* FIRST-TIME ONBOARDING GUIDE */}
      <StudioOnboarding />

      {/* MOBILE PANE SWITCHER (< md) */}
      <div className="md:hidden flex items-center gap-1 px-3 py-2 border-b border-slate-800 bg-[#0b0d15] shrink-0">
        <button
          type="button"
          onClick={() => setMobilePane("sections")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            mobilePane === "sections"
              ? "bg-indigo-600 text-white"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Sections ({sections.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobilePane("editor")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            mobilePane === "editor"
              ? "bg-indigo-600 text-white"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Editor</span>
        </button>
        <button
          type="button"
          onClick={() => setMobilePane("preview")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            mobilePane === "preview"
              ? "bg-indigo-600 text-white"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Preview</span>
        </button>
      </div>

      {/* 3-PANEL STUDIO BODY */}
      <div className="flex-1 flex overflow-hidden">
        {previewMode !== "preview" && showLeftPanel && (
          <aside
            className={`w-full md:w-72 shrink-0 h-full ${
              mobilePane === "sections" ? "block" : "hidden md:block"
            }`}
          >
            <SectionPanel
              onSectionDeleted={(title) =>
                showToast(`Removed "${title}"`, true)
              }
            />
          </aside>
        )}

        {previewMode !== "preview" && (
          <main
            className={`flex-1 h-full overflow-hidden flex-col min-w-0 ${
              mobilePane === "editor" ? "flex" : "hidden md:flex"
            }`}
          >
            <SectionEditor />
          </main>
        )}

        {previewMode !== "editor" &&
          (previewMode === "preview" || showRightPanel) && (
            <section
              className={`h-full overflow-hidden ${
                previewMode === "preview"
                  ? "flex-1"
                  : "w-full md:w-[440px] lg:w-[480px] xl:w-[540px] shrink-0"
              } ${mobilePane === "preview" ? "block" : "hidden md:block"}`}
            >
              <PreviewPanel />
            </section>
          )}
      </div>

      {/* UNDO / STATUS TOAST */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs text-slate-100">
          <span>{toastMessage.text}</span>
          {toastMessage.canUndo && canUndo && (
            <button
              type="button"
              onClick={() => {
                undo();
                setToastMessage(null);
              }}
              className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              Undo
            </button>
          )}
        </div>
      )}

      {/* IMPORT README / PROJECT MODAL */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import README.md or Project JSON"
        subtitle="Paste existing Markdown or upload a .md / .json file to populate editable sections"
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs text-slate-400">
              Upload a local <code className="text-slate-200">README.md</code> or{" "}
              <code className="text-slate-200">.json</code> file:
            </label>
            <input
              type="file"
              accept=".md,.markdown,.txt,.json"
              onChange={handleImportFile}
              className="text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-slate-700 file:bg-slate-900 file:text-slate-200 hover:file:bg-slate-800"
            />
          </div>

          <textarea
            rows={12}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste README.md Markdown or exported ProfileForge JSON here..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500 resize-y"
          />

          {importError && (
            <p className="text-xs text-red-400">{importError}</p>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                resetWorkspace();
                setIsImportModalOpen(false);
                showToast("Workspace reset to defaults");
              }}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              Reset Workspace to Default
            </button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsImportModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleImportSubmit}>
                Import into Studio
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* PUBLISH TO GITHUB MODAL */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
      />
    </div>
  );
}
