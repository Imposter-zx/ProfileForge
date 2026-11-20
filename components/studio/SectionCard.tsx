// components/studio/SectionCard.tsx
"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Type,
  Sparkles,
  BarChart2,
  Activity,
  Layers,
  Award,
  Globe,
  Mail,
  Heart,
  Code,
  FolderGit2,
} from "lucide-react";
import type { ReadmeSection } from "@/lib/readme/compiler";

export interface SectionCardProps {
  section: ReadmeSection;
  isSelected: boolean;
  onSelect: () => void;
  onToggleEnabled: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  "ascii-banner": <Sparkles className="w-4 h-4 text-indigo-400" />,
  "ascii-art": <Sparkles className="w-4 h-4 text-purple-400" />,
  "animated-header": <Type className="w-4 h-4 text-cyan-400" />,
  "about-me": <Code className="w-4 h-4 text-emerald-400" />,
  tagline: <Type className="w-4 h-4 text-slate-400" />,
  skills: <Layers className="w-4 h-4 text-blue-400" />,
  languages: <Code className="w-4 h-4 text-indigo-400" />,
  frameworks: <Layers className="w-4 h-4 text-purple-400" />,
  tools: <Layers className="w-4 h-4 text-teal-400" />,
  "github-stats": <BarChart2 className="w-4 h-4 text-amber-400" />,
  "top-languages": <BarChart2 className="w-4 h-4 text-rose-400" />,
  streak: <Activity className="w-4 h-4 text-orange-400" />,
  trophies: <Award className="w-4 h-4 text-yellow-400" />,
  "featured-projects": <FolderGit2 className="w-4 h-4 text-sky-400" />,
  "current-projects": <FolderGit2 className="w-4 h-4 text-sky-400" />,
  contact: <Mail className="w-4 h-4 text-emerald-400" />,
  socials: <Globe className="w-4 h-4 text-blue-400" />,
  sponsor: <Heart className="w-4 h-4 text-pink-400" />,
  custom: <Code className="w-4 h-4 text-slate-400" />,
};

export function SectionCard({
  section,
  isSelected,
  onSelect,
  onToggleEnabled,
  onDuplicate,
  onDelete,
}: SectionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 20 : 1,
  };

  const icon = SECTION_ICONS[section.type] || (
    <Layers className="w-4 h-4 text-slate-400" />
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center justify-between gap-2 p-2.5 rounded-xl border text-xs select-none transition-all duration-150 ${
        isSelected
          ? "bg-indigo-500/10 border-indigo-500/60 shadow-sm"
          : "bg-slate-900/80 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-850"
      } ${!section.enabled ? "opacity-60" : ""}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-slate-500 hover:text-slate-300 rounded transition-colors touch-none"
        title="Drag to reorder"
        aria-label="Drag handle"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>

      {/* Main section clickable info */}
      <div
        onClick={onSelect}
        className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
      >
        <div className="shrink-0">{icon}</div>
        <div className="truncate">
          <p
            className={`font-medium truncate ${
              isSelected ? "text-indigo-200" : "text-slate-200"
            }`}
          >
            {section.title}
          </p>
          <p className="text-[10px] text-slate-500 font-mono truncate">
            {section.type}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleEnabled();
          }}
          className={`p-1 rounded hover:bg-slate-800 transition-colors ${
            section.enabled ? "text-slate-400 hover:text-slate-200" : "text-slate-600"
          }`}
          title={section.enabled ? "Disable section" : "Enable section"}
        >
          {section.enabled ? (
            <Eye className="w-3.5 h-3.5" />
          ) : (
            <EyeOff className="w-3.5 h-3.5" />
          )}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Duplicate section"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Delete section"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
