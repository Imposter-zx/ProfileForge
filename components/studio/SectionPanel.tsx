// components/studio/SectionPanel.tsx
"use client";

import React, { useState } from "react";
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
import { Plus, Layers, Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { SectionCard } from "./SectionCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { ReadmeSection, SectionType } from "@/lib/readme/compiler";

let nextIdCounter = 1;
function generateSectionId(type: string): string {
  nextIdCounter += 1;
  return `sec-${type}-${nextIdCounter}`;
}

interface AddSectionOption {
  type: SectionType;
  title: string;
  category: "Visuals" | "Content" | "Skills & Stack" | "GitHub Metrics" | "Links";
  description: string;
  defaultData: Record<string, unknown>;
}

const AVAILABLE_SECTIONS: AddSectionOption[] = [
  {
    type: "capsule-render",
    title: "Capsule Render Banner",
    category: "Visuals",
    description: "Animated SVG wave, egg, shark, or cylinder header/footer banner",
    defaultData: {
      capsule: {
        type: "waving",
        height: 200,
        text: "WELCOME TO MY PROFILE",
        fontSize: 50,
        subtext: "Full Stack Engineer & Open Source Maker",
        subfontSize: 20,
        color: "gradient",
        customColor: "0:00f2fe,100:4facfe",
        animation: "twinkling",
        section: "header",
      },
    },
  },
  {
    type: "view-counter",
    title: "Profile View Counter",
    category: "GitHub Metrics",
    description: "Live real-time profile visitor counter badge (komarev.com)",
    defaultData: {
      viewCounter: {
        username: "octocat",
        label: "PROFILE VIEWS",
        color: "00f2fe",
        style: "flat-square",
      },
    },
  },
  {
    type: "gif-banner",
    title: "Animated GIF Banner",
    category: "Visuals",
    description: "Retro arcade space shooter, cyberpunk, or matrix animated banner",
    defaultData: {
      gif: {
        url: "https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif",
        alt: "Retro Arcade Space Shooter",
        width: "100%",
      },
    },
  },
  {
    type: "tech-stack-categorized",
    title: "Categorized Tech Stack",
    category: "Skills & Stack",
    description: "Categorized multi-row tech badges (Languages, Frontend, Backend, DevOps)",
    defaultData: {
      style: "badges",
      selectedIds: [
        "ts",
        "js",
        "python",
        "rust",
        "react",
        "nextjs",
        "tailwind",
        "nodejs",
        "express",
        "postgresql",
        "redis",
        "docker",
        "aws",
        "git",
      ],
    },
  },
  {
    type: "ascii-banner",
    title: "ASCII Banner",
    category: "Visuals",
    description: "Animated ASCII text banner powered by ascii.rest",
    defaultData: {
      banner: {
        text: "HELLO WORLD",
        font: "block",
        effect: "glint",
        color: ["00F2FE", "4FACFE"],
        shadow: "double",
      },
    },
  },
  {
    type: "ascii-art",
    title: "ASCII Art Piece",
    category: "Visuals",
    description: "Embed any animated ASCII artwork from the 217+ gallery",
    defaultData: {
      slug: "donut",
      width: 420,
    },
  },
  {
    type: "animated-header",
    title: "Greeting & Header",
    category: "Content",
    description: "Waving hand emoji + Name + Custom Subtitle",
    defaultData: {
      name: "Developer",
      subtitle: "Passionate software engineer",
      wave: true,
    },
  },
  {
    type: "about-me",
    title: "About Me",
    category: "Content",
    description: "Markdown bio, bullet points, current focus and hobbies",
    defaultData: {
      markdown:
        "🔭 I’m currently working on exciting open-source projects.\n🌱 I’m currently learning distributed systems and Rust.\n💬 Ask me about TypeScript, React, and cloud architectures.",
    },
  },
  {
    type: "skills",
    title: "Skills & Badges",
    category: "Skills & Stack",
    description: "Shields.io tech stack badges with official brand logos",
    defaultData: {
      badges: [
        { label: "", message: "TypeScript", color: "3178C6", logo: "typescript", style: "flat-square" },
        { label: "", message: "React", color: "20232A", logo: "react", style: "flat-square" },
        { label: "", message: "Next.js", color: "000000", logo: "nextdotjs", style: "flat-square" },
      ],
    },
  },
  {
    type: "github-stats",
    title: "GitHub Stats Card",
    category: "GitHub Metrics",
    description: "Total stars, commits, PRs, and grade metrics",
    defaultData: {
      widget: {
        type: "stats",
        username: "octocat",
        theme: "tokyonight",
        hideBorder: true,
      },
    },
  },
  {
    type: "streak",
    title: "Streak Stats",
    category: "GitHub Metrics",
    description: "Current streak, longest streak, and total contributions",
    defaultData: {
      widget: {
        type: "streak",
        username: "octocat",
        theme: "tokyonight",
        hideBorder: true,
      },
    },
  },
  {
    type: "top-languages",
    title: "Top Languages Card",
    category: "GitHub Metrics",
    description: "Compact visualization of your top programming languages",
    defaultData: {
      widget: {
        type: "top-langs",
        username: "octocat",
        theme: "tokyonight",
        hideBorder: true,
      },
    },
  },
  {
    type: "trophies",
    title: "GitHub Trophies",
    category: "GitHub Metrics",
    description: "Gamified achievement trophies for GitHub milestones",
    defaultData: {
      widget: {
        type: "trophies",
        username: "octocat",
        theme: "onedark",
        hideBorder: true,
      },
    },
  },
  {
    type: "coding-activity",
    title: "Contribution Activity Graph",
    category: "GitHub Metrics",
    description: "Animated contribution heat-map / activity graph across the last year",
    defaultData: {
      widget: {
        type: "activity-graph",
        username: "octocat",
        theme: "tokyo-night",
        hideBorder: true,
      },
    },
  },
  {
    type: "contact",
    title: "Contact & Reach Out",
    category: "Links",
    description: "Social and contact links (Email, Twitter/X, LinkedIn)",
    defaultData: {
      email: "developer@example.com",
      twitter: "@octocat",
      linkedin: "https://linkedin.com",
    },
  },
  {
    type: "sponsor",
    title: "Sponsor Me",
    category: "Links",
    description: "GitHub Sponsors call-to-action button and message",
    defaultData: {
      url: "https://github.com/sponsors/octocat",
      message: "If you like my work, consider buying me a coffee!",
    },
  },
  {
    type: "custom",
    title: "Custom Markdown",
    category: "Content",
    description: "Raw markdown section for freeform content, tables, or embeds",
    defaultData: {
      markdown: "### Custom Section\n\nAdd any custom Markdown, tables, or ASCII art here.",
    },
  },
];

export function SectionPanel() {
  const {
    sections,
    selectedSectionId,
    setSelectedSectionId,
    reorderSections,
    addSection,
    removeSection,
    duplicateSection,
    toggleSectionEnabled,
    username,
  } = useStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      reorderSections(oldIndex, newIndex);
    }
  };

  const handleAddSection = (opt: AddSectionOption) => {
    // Clone default data and personalize username if applicable
    const data = JSON.parse(JSON.stringify(opt.defaultData));
    if (data.widget && username) {
      data.widget.username = username;
    }
    if (data.banner && username) {
      data.banner.text = username.toUpperCase();
    }
    if (data.capsule && username) {
      data.capsule.text = `HI, I'M ${username.toUpperCase()}`;
    }
    if (data.viewCounter && username) {
      data.viewCounter.username = username;
    }

    const newSection: ReadmeSection = {
      id: generateSectionId(opt.type),
      type: opt.type,
      title: opt.title,
      enabled: true,
      align:
        opt.type.includes("banner") ||
        opt.type.includes("capsule") ||
        opt.type.includes("stats") ||
        opt.type.includes("streak") ||
        opt.type.includes("view-counter")
          ? "center"
          : "left",
      data,
    };

    addSection(newSection);
    setIsAddModalOpen(false);
  };

  const filteredOptions = AVAILABLE_SECTIONS.filter(
    (opt) =>
      opt.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      opt.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      opt.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#0d0f17] border-r border-slate-800/80">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Sections ({sections.length})
          </h2>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add
        </Button>
      </div>

      {/* Sortable Section Cards List */}
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
                onSelect={() => setSelectedSectionId(section.id)}
                onToggleEnabled={() => toggleSectionEnabled(section.id)}
                onDuplicate={() => duplicateSection(section.id)}
                onDelete={() => removeSection(section.id)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {sections.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-xs">
            <p>No sections yet.</p>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              Add First Section
            </Button>
          </div>
        )}
      </div>

      {/* ADD SECTION MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Section to README"
        subtitle="Choose from visual ASCII art, content blocks, or GitHub metrics"
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {/* Search filter */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search section types (e.g. banner, streak, skills)..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 text-sm pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Section Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
            {filteredOptions.map((opt) => (
              <button
                key={opt.type + opt.title}
                onClick={() => handleAddSection(opt)}
                className="flex flex-col text-left p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-indigo-500/50 transition-all group"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-semibold text-sm text-slate-200 group-hover:text-indigo-300 transition-colors">
                    {opt.title}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
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
