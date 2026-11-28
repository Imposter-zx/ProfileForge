// components/studio/SectionPanel.tsx
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Plus,
  Layers,
  Search,
  Library,
  ChevronsDownUp,
  ChevronsUpDown,
  X,
  Sparkles,
  Palette,
  ExternalLink,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { SectionCard } from "./SectionCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  SECTION_LIBRARY_META,
  type SectionCategory,
  type SectionTypeMeta,
} from "@/lib/readme/compiler";
import { createSectionFromType } from "@/lib/readme/section-defaults";

const CATEGORY_TABS: Array<{ id: SectionCategory | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "profile", label: "Profile" },
  { id: "content", label: "Content" },
  { id: "skills", label: "Skills" },
  { id: "stats", label: "Stats" },
  { id: "visuals", label: "Visuals" },
  { id: "social", label: "Social" },
  { id: "projects", label: "Projects" },
  { id: "advanced", label: "Advanced" },
];

export interface SectionPanelProps {
  onSectionDeleted?: (title: string) => void;
}

export function SectionPanel({ onSectionDeleted }: SectionPanelProps) {
  const {
    sections,
    selectedSectionId,
    collapsedSectionIds,
    username,
    setSelectedSectionId,
    addSection,
    removeSection,
    duplicateSection,
    toggleSectionEnabled,
    toggleSectionCollapsed,
    setAllSectionsCollapsed,
    reorderSections,
  } = useStore();

  const [panelTab, setPanelTab] = useState<"outline" | "library">("outline");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<SectionCategory | "all">(
    "all"
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderSections(oldIndex, newIndex);
      }
    }
  };

  const handleAddMetaSection = (meta: SectionTypeMeta) => {
    const newSection = createSectionFromType(
      meta.type,
      meta.label,
      username || "octocat"
    );
    addSection(newSection);
    setIsAddModalOpen(false);
    setPanelTab("outline");
  };

  const filteredMeta = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    return SECTION_LIBRARY_META.filter((meta) => {
      const matchesCat =
        categoryFilter === "all" || meta.category === categoryFilter;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        meta.label.toLowerCase().includes(q) ||
        meta.description.toLowerCase().includes(q) ||
        meta.category.toLowerCase().includes(q) ||
        meta.type.toLowerCase().includes(q)
      );
    });
  }, [searchFilter, categoryFilter]);

  const allCollapsed =
    sections.length > 0 && collapsedSectionIds.length >= sections.length;

  return (
    <div className="flex flex-col h-full bg-[#0d0f17] border-r border-slate-800/80">
      {/* Panel Top Switcher: Outline vs Library */}
      <div className="p-2.5 border-b border-slate-800 space-y-2 shrink-0 bg-slate-900/40">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setPanelTab("outline")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              panelTab === "outline"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Outline ({sections.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setPanelTab("library")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              panelTab === "library"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Library className="w-3.5 h-3.5" />
            <span>Library ({SECTION_LIBRARY_META.length})</span>
          </button>
        </div>

        {panelTab === "outline" ? (
          <div className="flex items-center justify-between gap-2 px-1">
            <button
              type="button"
              onClick={() => setAllSectionsCollapsed(!allCollapsed)}
              disabled={sections.length === 0}
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 disabled:opacity-40 transition-colors"
              title={allCollapsed ? "Expand all cards" : "Collapse all cards"}
            >
              {allCollapsed ? (
                <>
                  <ChevronsUpDown className="w-3.5 h-3.5" />
                  <span>Expand all</span>
                </>
              ) : (
                <>
                  <ChevronsDownUp className="w-3.5 h-3.5" />
                  <span>Collapse all</span>
                </>
              )}
            </button>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Section
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search 50+ section blocks..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 text-xs pl-8 pr-7 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter("")}
                  className="absolute right-2 top-2 text-slate-500 hover:text-slate-200"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {CATEGORY_TABS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-colors ${
                    categoryFilter === cat.id
                      ? "bg-indigo-600/90 text-white"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Scrollable Content */}
      {panelTab === "outline" ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((section) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  isSelected={section.id === selectedSectionId}
                  isCollapsed={collapsedSectionIds.includes(section.id)}
                  onSelect={() => setSelectedSectionId(section.id)}
                  onToggleCollapsed={() => toggleSectionCollapsed(section.id)}
                  onToggleEnabled={() => toggleSectionEnabled(section.id)}
                  onDuplicate={() => duplicateSection(section.id)}
                  onDelete={() => {
                    removeSection(section.id);
                    onSectionDeleted?.(section.title);
                  }}
                />
              ))}
            </SortableContext>
          </DndContext>

          {sections.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-xs">
              <p>No sections yet.</p>
              <Button
                onClick={() => setPanelTab("library")}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                Browse Section Library
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
          {/* Quick Links to Dedicated Explorers */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Visual Explorers &amp; Studios
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <Link
                href="/ascii"
                className="flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-medium text-indigo-300 transition-colors"
              >
                <span className="inline-flex items-center gap-1 truncate">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  ASCII Art
                </span>
                <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
              </Link>
              <Link
                href="/assets"
                className="flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-medium text-purple-300 transition-colors"
              >
                <span className="inline-flex items-center gap-1 truncate">
                  <Palette className="w-3 h-3 shrink-0" />
                  GIFs &amp; Badges
                </span>
                <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
              </Link>
            </div>
          </div>

          {filteredMeta.map((meta) => (
            <button
              key={meta.type}
              type="button"
              onClick={() => handleAddMetaSection(meta)}
              className="w-full text-left p-2.5 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:bg-slate-900 hover:border-indigo-500/50 transition-all group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                  {meta.label}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono uppercase">
                  {meta.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                {meta.description}
              </p>
            </button>
          ))}
          {filteredMeta.length === 0 && (
            <p className="text-center text-xs text-slate-500 py-8">
              No matching section blocks found.
            </p>
          )}
        </div>
      )}

      {/* ADD SECTION MODAL (Quick Picker) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Section to README"
        subtitle="Choose from 8 categories of visual, content, stats, and project blocks"
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search section types (e.g. banner, streak, quote, table)..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 text-sm pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {CATEGORY_TABS.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === cat.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
            {filteredMeta.map((opt) => (
              <button
                key={opt.type}
                type="button"
                onClick={() => handleAddMetaSection(opt)}
                className="flex flex-col text-left p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-indigo-500/50 transition-all group"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-semibold text-sm text-slate-200 group-hover:text-indigo-300 transition-colors">
                    {opt.label}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono uppercase">
                    {opt.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {opt.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
