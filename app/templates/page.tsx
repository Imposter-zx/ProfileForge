// app/templates/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  Sparkles,
  Eye,
  Copy,
  Trash2,
  BookmarkPlus,
  RotateCcw,
} from "lucide-react";
import { Navbar } from "@/components/navigation/Navbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { MarkdownRenderer } from "@/components/studio/MarkdownRenderer";
import { useStore } from "@/lib/store";
import { STARTER_TEMPLATES, type StarterTemplate } from "@/lib/readme/templates";
import { compileReadmeMarkdown } from "@/lib/readme/compiler";
import type { PieceName } from "ascii.rest";

const Ascii = dynamic(
  () => import("ascii.rest/react").then((m) => m.Ascii),
  {
    ssr: false,
    loading: () => (
      <div className="text-[10px] text-slate-500 font-mono py-6">
        Loading preview...
      </div>
    ),
  }
);

export default function TemplatesPage() {
  const router = useRouter();
  const {
    applyTemplate,
    applyCustomTemplate,
    saveCustomTemplate,
    deleteCustomTemplate,
    duplicateTemplate,
    restoreTemplateBackup,
    resetWorkspace,
    savedTemplates,
    templateBackup,
    username,
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<StarterTemplate | null>(
    null
  );
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const categories = useMemo(() => {
    const uniqueCats = Array.from(
      new Set(STARTER_TEMPLATES.map((t) => t.category))
    );
    return [
      { id: "all", label: `All (${STARTER_TEMPLATES.length})` },
      ...uniqueCats.map((c) => ({
        id: c,
        label: c.charAt(0).toUpperCase() + c.slice(1),
      })),
    ];
  }, []);

  const filtered = STARTER_TEMPLATES.filter((t) =>
    selectedCategory === "all" ? true : t.category === selectedCategory
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((prev) => (prev === msg ? null : prev)), 3000);
  };

  const handleApply = (tmplId: string) => {
    applyTemplate(tmplId);
    router.push("/studio");
  };

  const handleSaveCurrent = () => {
    if (!customName.trim()) return;
    saveCustomTemplate(customName.trim(), customDesc.trim() || undefined);
    setCustomName("");
    setCustomDesc("");
    setIsSaveModalOpen(false);
    showToast("Saved current workspace as custom template");
  };

  const previewMarkdown = useMemo(() => {
    if (!previewTemplate) return "";
    const secs = previewTemplate.createSections({
      username: username || "octocat",
      name: username || "Developer",
    });
    return compileReadmeMarkdown(secs);
  }, [previewTemplate, username]);

  return (
    <div className="flex flex-col min-h-screen bg-[#090a0f] text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{STARTER_TEMPLATES.length} Pre-Engineered README Architectures</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Starter & Custom Templates
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Preview, apply, duplicate, or save your own reusable GitHub Profile
              README layouts. Applying a template automatically backs up your
              previous workspace.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<BookmarkPlus className="w-4 h-4" />}
              onClick={() => setIsSaveModalOpen(true)}
            >
              Save Current as Template
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="w-4 h-4" />}
              onClick={() => {
                resetWorkspace();
                showToast("Workspace reset to default");
              }}
            >
              Reset Workspace
            </Button>
          </div>
        </div>

        {/* Recoverable Backup Banner */}
        {templateBackup && (
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-300">
              <strong className="text-indigo-300">Workspace Backup Available:</strong>{" "}
              Previous project &ldquo;{templateBackup.projectTitle}&rdquo; (
              {templateBackup.sections.length} sections) was backed up before
              applying a template.
            </div>
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={() => {
                restoreTemplateBackup();
                router.push("/studio");
              }}
            >
              Restore Previous Workspace
            </Button>
          </div>
        )}

        {/* Saved Custom Templates */}
        {savedTemplates.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white">
              Your Saved Templates ({savedTemplates.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedTemplates.map((ct) => (
                <Card
                  key={ct.id}
                  className="p-5 bg-slate-900/70 border-slate-800 flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Badge variant="indigo" size="sm">
                        Custom
                      </Badge>
                      <span className="text-[11px] font-mono text-slate-500">
                        {ct.sections.length} sections
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">{ct.name}</h3>
                    {ct.description && (
                      <p className="text-xs text-slate-400 mt-1">
                        {ct.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        deleteCustomTemplate(ct.id);
                        showToast(`Deleted "${ct.name}"`);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                      title="Delete custom template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Button
                      size="sm"
                      variant="primary"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      onClick={() => {
                        applyCustomTemplate(ct.id);
                        router.push("/studio");
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === c.id
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Starter Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((tmpl) => {
            const previewSections = tmpl.createSections({
              username: username || "octocat",
              name: username || "Developer",
            });

            return (
              <Card
                key={tmpl.id}
                hover
                className="flex flex-col justify-between p-6 bg-slate-900/70 border-slate-800"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="indigo" size="sm">
                      {tmpl.badge}
                    </Badge>
                    <span className="text-xs font-mono text-slate-500">
                      {previewSections.length} sections included
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-white">{tmpl.name}</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {tmpl.description}
                    </p>
                  </div>

                  {/* Mini ASCII preview */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-center min-h-[140px] overflow-hidden text-center">
                    <Ascii
                      piece={tmpl.previewAsciiSlug as PieceName}
                      label={tmpl.name}
                      className="scale-75"
                    />
                  </div>

                  {/* Included Sections List */}
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 block mb-1.5">
                      Included Architecture Blocks:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {previewSections.map((sec) => (
                        <span
                          key={sec.id}
                          className="px-2 py-0.5 rounded bg-slate-800/80 text-[11px] font-mono text-slate-300 border border-slate-700/50"
                        >
                          {sec.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="pt-6 mt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      onClick={() => setPreviewTemplate(tmpl)}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Copy className="w-3.5 h-3.5" />}
                      onClick={() => {
                        const dup = duplicateTemplate(tmpl.id);
                        if (dup) showToast(`Duplicated "${tmpl.name}" to Saved Templates`);
                      }}
                    >
                      Duplicate
                    </Button>
                  </div>
                  <Button
                    onClick={() => handleApply(tmpl.id)}
                    variant="glow"
                    size="sm"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Open in Studio
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      {/* TEMPLATE PREVIEW MODAL */}
      <Modal
        isOpen={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        title={previewTemplate?.name || "Template Preview"}
        subtitle={previewTemplate?.description}
        maxWidth="2xl"
      >
        {previewTemplate && (
          <div className="space-y-4">
            <div className="max-h-[460px] overflow-y-auto rounded-xl border border-[#30363d] bg-[#0d1117] p-5">
              <MarkdownRenderer markdown={previewMarkdown} />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewTemplate(null)}
              >
                Close
              </Button>
              <Button
                variant="glow"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => handleApply(previewTemplate.id)}
              >
                Apply & Open in Studio
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* SAVE CUSTOM TEMPLATE MODAL */}
      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Save Current Workspace as Template"
        subtitle="Store your current sections so you can reuse or duplicate them later"
        maxWidth="md"
      >
        <div className="space-y-4">
          <Input
            label="Template Name"
            placeholder="e.g. My Cyberpunk Profile"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />
          <Input
            label="Description (optional)"
            placeholder="Short summary of this layout"
            value={customDesc}
            onChange={(e) => setCustomDesc(e.target.value)}
          />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSaveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!customName.trim()}
              onClick={handleSaveCurrent}
            >
              Save Template
            </Button>
          </div>
        </div>
      </Modal>

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs text-slate-100">
          {toast}
        </div>
      )}
    </div>
  );
}
