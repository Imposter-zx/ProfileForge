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
  ChevronDown,
  ChevronRight,
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
  Image as ImageIcon,
  Table as TableIcon,
  Quote,
  Minus,
  Megaphone,
  MousePointerClick,
  MapPin,
  Briefcase,
  GraduationCap,
  User,
  FileText,
  Cpu,
} from "lucide-react";
import type { ReadmeSection } from "@/lib/readme/compiler";

export interface SectionCardProps {
  section: ReadmeSection;
  isSelected: boolean;
  isCollapsed?: boolean;
  isDropTarget?: boolean;
  onSelect: () => void;
  onToggleCollapsed?: () => void;
  onToggleEnabled: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  "profile-header": <User className="w-4 h-4 text-cyan-400" />,
  "animated-header": <Type className="w-4 h-4 text-cyan-400" />,
  avatar: <User className="w-4 h-4 text-indigo-400" />,
  introduction: <FileText className="w-4 h-4 text-emerald-400" />,
  "about-me": <Code className="w-4 h-4 text-emerald-400" />,
  tagline: <Type className="w-4 h-4 text-slate-400" />,
  "profile-info": <User className="w-4 h-4 text-sky-400" />,
  "view-counter": <Eye className="w-4 h-4 text-cyan-400" />,
  "social-links": <Globe className="w-4 h-4 text-blue-400" />,
  socials: <Globe className="w-4 h-4 text-blue-400" />,
  contact: <Mail className="w-4 h-4 text-emerald-400" />,
  location: <MapPin className="w-4 h-4 text-rose-400" />,
  education: <GraduationCap className="w-4 h-4 text-amber-400" />,
  experience: <Briefcase className="w-4 h-4 text-indigo-400" />,
  certifications: <Award className="w-4 h-4 text-teal-400" />,
  achievements: <Award className="w-4 h-4 text-yellow-400" />,
  sponsor: <Heart className="w-4 h-4 text-pink-400" />,
  footer: <Minus className="w-4 h-4 text-slate-400" />,
  "text-block": <FileText className="w-4 h-4 text-slate-300" />,
  heading: <Type className="w-4 h-4 text-indigo-300" />,
  paragraph: <FileText className="w-4 h-4 text-slate-300" />,
  quote: <Quote className="w-4 h-4 text-purple-400" />,
  divider: <Minus className="w-4 h-4 text-slate-500" />,
  "markdown-block": <Code className="w-4 h-4 text-slate-300" />,
  "custom-html": <Code className="w-4 h-4 text-orange-400" />,
  announcement: <Megaphone className="w-4 h-4 text-amber-400" />,
  cta: <MousePointerClick className="w-4 h-4 text-emerald-400" />,
  skills: <Layers className="w-4 h-4 text-blue-400" />,
  "tech-stack-categorized": <Cpu className="w-4 h-4 text-indigo-400" />,
  languages: <Code className="w-4 h-4 text-indigo-400" />,
  frameworks: <Layers className="w-4 h-4 text-purple-400" />,
  tools: <Layers className="w-4 h-4 text-teal-400" />,
  "github-stats": <BarChart2 className="w-4 h-4 text-amber-400" />,
  "top-languages": <BarChart2 className="w-4 h-4 text-rose-400" />,
  streak: <Activity className="w-4 h-4 text-orange-400" />,
  trophies: <Award className="w-4 h-4 text-yellow-400" />,
  "contribution-graph": <Activity className="w-4 h-4 text-emerald-400" />,
  "coding-activity": <Activity className="w-4 h-4 text-emerald-400" />,
  "repo-showcase": <FolderGit2 className="w-4 h-4 text-sky-400" />,
  "gif-banner": <ImageIcon className="w-4 h-4 text-pink-400" />,
  image: <ImageIcon className="w-4 h-4 text-sky-400" />,
  banner: <ImageIcon className="w-4 h-4 text-indigo-400" />,
  "capsule-render": <Sparkles className="w-4 h-4 text-cyan-400" />,
  "ascii-banner": <Sparkles className="w-4 h-4 text-indigo-400" />,
  "ascii-art": <Sparkles className="w-4 h-4 text-purple-400" />,
  svg: <ImageIcon className="w-4 h-4 text-emerald-400" />,
  "featured-projects": <FolderGit2 className="w-4 h-4 text-sky-400" />,
  "current-projects": <FolderGit2 className="w-4 h-4 text-sky-400" />,
  "project-cards": <FolderGit2 className="w-4 h-4 text-indigo-400" />,
  custom: <Code className="w-4 h-4 text-slate-400" />,
  table: <TableIcon className="w-4 h-4 text-teal-400" />,
  "raw-embed": <Code className="w-4 h-4 text-amber-400" />,
};

function getSectionSummary(section: ReadmeSection): string {
  const d = section.data || {};
  if (section.rawMarkdownOverride?.trim()) return "Custom markdown override";
  if (typeof d.text === "string" && d.text.trim()) return d.text.trim();
  if (typeof d.markdown === "string" && d.markdown.trim()) return d.markdown.trim();
  if (typeof d.slug === "string") return `Piece: ${d.slug}`;
  if (d.banner && typeof (d.banner as Record<string, unknown>).text === "string") {
    return String((d.banner as Record<string, unknown>).text);
  }
  if (d.capsule && typeof (d.capsule as Record<string, unknown>).text === "string") {
    return String((d.capsule as Record<string, unknown>).text);
  }
  if (d.widget && typeof (d.widget as Record<string, unknown>).username === "string") {
    return `@${String((d.widget as Record<string, unknown>).username)}`;
  }
  if (Array.isArray(d.badges)) return `${d.badges.length} badges`;
  if (Array.isArray(d.selectedIds)) return `${d.selectedIds.length} technologies`;
  if (Array.isArray(d.projects)) return `${d.projects.length} projects`;
  if (Array.isArray(d.repos)) return `${d.repos.length} repositories`;
  if (Array.isArray(d.items)) return `${d.items.length} items`;
  if (Array.isArray(d.rows)) return `${d.rows.length} rows`;
  return section.type;
}

export function SectionCard({
  section,
  isSelected,
  isCollapsed = false,
  isDropTarget = false,
  onSelect,
  onToggleCollapsed,
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

  const summary = getSectionSummary(section);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl border text-xs select-none transition-all duration-150 motion-reduce:transition-none ${
        isDropTarget ? "ring-2 ring-indigo-400 border-indigo-400" : ""
      } ${
        isSelected
          ? "bg-indigo-500/10 border-indigo-500/60 shadow-sm"
          : "bg-slate-900/80 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900"
      } ${!section.enabled ? "opacity-55" : ""}`}
    >
      <div className="flex items-center justify-between gap-1.5 p-2.5">
        {/* Drag handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-slate-500 hover:text-slate-300 rounded transition-colors touch-none"
          title="Drag to reorder"
          aria-label={`Drag ${section.title}`}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        {/* Collapse toggle */}
        {onToggleCollapsed && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapsed();
            }}
            className="p-0.5 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title={isCollapsed ? "Expand section details" : "Collapse section details"}
            aria-label={isCollapsed ? "Expand section" : "Collapse section"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* Main section clickable info */}
        <div
          onClick={onSelect}
          className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
        >
          <div className="shrink-0">{icon}</div>
          <div className="truncate flex-1 min-w-0">
            <p
              className={`font-medium truncate ${
                isSelected ? "text-indigo-200" : "text-slate-200"
              }`}
            >
              {section.title}
            </p>
            {!isCollapsed && (
              <p className="text-[10px] text-slate-500 font-mono truncate">
                {summary}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleEnabled();
            }}
            className={`p-1 rounded hover:bg-slate-800 transition-colors ${
              section.enabled
                ? "text-slate-400 hover:text-slate-200"
                : "text-slate-600"
            }`}
            title={section.enabled ? "Hide section" : "Show section"}
            aria-label={section.enabled ? "Hide section" : "Show section"}
          >
            {section.enabled ? (
              <Eye className="w-3.5 h-3.5" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Duplicate section"
            aria-label="Duplicate section"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete section (Del)"
            aria-label="Delete section"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
