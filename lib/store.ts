// lib/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AnalyzedProfile } from "./github/analyzer";
import type { ReadmeSection } from "./readme/compiler";
import type { AsciiCategory } from "./ascii/catalog";
import { STARTER_TEMPLATES } from "./readme/templates";

export interface ProjectSnapshot {
  sections: ReadmeSection[];
  title: string;
}

export interface StoreState {
  // --- Profile analysis ---
  username: string;
  analyzedProfile: AnalyzedProfile | null;
  isAnalyzing: boolean;
  analyzeError: string | null;

  // --- Document & sections ---
  projectId: string;
  projectTitle: string;
  sections: ReadmeSection[];
  selectedSectionId: string | null;

  // --- History (Undo / Redo) ---
  historyPast: ReadmeSection[][];
  historyFuture: ReadmeSection[][];

  // --- Studio UI ---
  previewMode: "split" | "editor" | "preview";
  activePreviewTab: "preview" | "raw";

  // --- ASCII Gallery & Favorites ---
  favoriteSlugs: string[];
  recentlyViewedSlugs: string[];
  asciiSearchQuery: string;
  selectedCategory: AsciiCategory | "all" | "favorites";
  selectedTagFilter: string;

  // --- Actions ---
  setUsername: (username: string) => void;
  setAnalyzedProfile: (profile: AnalyzedProfile | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setAnalyzeError: (error: string | null) => void;

  setSections: (sections: ReadmeSection[]) => void;
  setProjectTitle: (title: string) => void;
  setSelectedSectionId: (id: string | null) => void;
  setPreviewMode: (mode: "split" | "editor" | "preview") => void;
  setActivePreviewTab: (tab: "preview" | "raw") => void;

  // Section manipulation with history snapshot
  addSection: (section: ReadmeSection) => void;
  updateSection: (id: string, updates: Partial<ReadmeSection>) => void;
  updateSectionData: (id: string, dataUpdates: Record<string, unknown>) => void;
  removeSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  toggleSectionEnabled: (id: string) => void;

  // Templates
  applyTemplate: (templateId: string) => void;
  initDefaultSectionsFromProfile: (profile: AnalyzedProfile) => void;

  // History controls
  undo: () => void;
  redo: () => void;

  // ASCII state
  toggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  addRecentlyViewed: (slug: string) => void;
  setAsciiSearchQuery: (query: string) => void;
  setSelectedCategory: (category: AsciiCategory | "all" | "favorites") => void;
  setSelectedTagFilter: (tag: string) => void;
}

const DEFAULT_SECTIONS: ReadmeSection[] = [
  {
    id: "sec-banner",
    type: "ascii-banner",
    title: "Header Banner",
    enabled: true,
    align: "center",
    data: {
      banner: {
        text: "PROFILE FORGE",
        font: "block",
        effect: "glint",
        color: ["00F2FE", "4FACFE"],
        shadow: "double",
      },
    },
  },
  {
    id: "sec-about",
    type: "about-me",
    title: "About Me",
    enabled: true,
    align: "left",
    data: {
      markdown:
        "👋 Hi, I'm a software developer passionate about building performant applications and exploring creative engineering.",
    },
  },
  {
    id: "sec-skills",
    type: "skills",
    title: "Skills & Technologies",
    enabled: true,
    align: "center",
    data: {
      badges: [
        { label: "", message: "TypeScript", color: "3178C6", logo: "typescript", style: "flat-square" },
        { label: "", message: "React", color: "20232A", logo: "react", style: "flat-square" },
        { label: "", message: "Next.js", color: "000000", logo: "nextdotjs", style: "flat-square" },
        { label: "", message: "Tailwind CSS", color: "06B6D4", logo: "tailwindcss", style: "flat-square" },
      ],
    },
  },
  {
    id: "sec-stats",
    type: "github-stats",
    title: "GitHub Stats",
    enabled: true,
    align: "center",
    data: {
      widget: {
        type: "stats",
        username: "octocat",
        theme: "tokyonight",
        hideBorder: true,
      },
    },
  },
  {
    id: "sec-streak",
    type: "streak",
    title: "Contribution Streak",
    enabled: true,
    align: "center",
    data: {
      widget: {
        type: "streak",
        username: "octocat",
        theme: "tokyonight",
        hideBorder: true,
      },
    },
  },
  {
    id: "sec-contact",
    type: "contact",
    title: "Connect",
    enabled: true,
    align: "left",
    data: {
      email: "hello@example.com",
      twitter: "@octocat",
    },
  },
];

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Profile
      username: "",
      analyzedProfile: null,
      isAnalyzing: false,
      analyzeError: null,

      // Document
      projectId: "default-project",
      projectTitle: "My Profile README",
      sections: DEFAULT_SECTIONS,
      selectedSectionId: "sec-banner",

      // History
      historyPast: [],
      historyFuture: [],

      // Studio UI
      previewMode: "split",
      activePreviewTab: "preview",

      // ASCII
      favoriteSlugs: ["donut", "matrix-rain", "tokyo-rain", "terminal", "arch-linux"],
      recentlyViewedSlugs: ["donut", "matrix-rain"],
      asciiSearchQuery: "",
      selectedCategory: "all",
      selectedTagFilter: "all",

      // Actions
      setUsername: (username) => set({ username }),
      setAnalyzedProfile: (analyzedProfile) => set({ analyzedProfile }),
      setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
      setAnalyzeError: (analyzeError) => set({ analyzeError }),

      setSections: (sections) => set({ sections }),
      setProjectTitle: (projectTitle) => set({ projectTitle }),
      setSelectedSectionId: (selectedSectionId) => set({ selectedSectionId }),
      setPreviewMode: (previewMode) => set({ previewMode }),
      setActivePreviewTab: (activePreviewTab) => set({ activePreviewTab }),

      addSection: (section) => {
        const { sections, historyPast } = get();
        set({
          historyPast: [...historyPast.slice(-20), sections],
          historyFuture: [],
          sections: [...sections, section],
          selectedSectionId: section.id,
        });
      },

      updateSection: (id, updates) => {
        const { sections, historyPast } = get();
        set({
          historyPast: [...historyPast.slice(-20), sections],
          historyFuture: [],
          sections: sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        });
      },

      updateSectionData: (id, dataUpdates) => {
        const { sections, historyPast } = get();
        set({
          historyPast: [...historyPast.slice(-20), sections],
          historyFuture: [],
          sections: sections.map((s) =>
            s.id === id ? { ...s, data: { ...s.data, ...dataUpdates } } : s
          ),
        });
      },

      removeSection: (id) => {
        const { sections, selectedSectionId, historyPast } = get();
        const next = sections.filter((s) => s.id !== id);
        set({
          historyPast: [...historyPast.slice(-20), sections],
          historyFuture: [],
          sections: next,
          selectedSectionId:
            selectedSectionId === id ? (next[0]?.id ?? null) : selectedSectionId,
        });
      },

      duplicateSection: (id) => {
        const { sections, historyPast } = get();
        const idx = sections.findIndex((s) => s.id === id);
        if (idx === -1) return;
        const original = sections[idx];
        const clone: ReadmeSection = {
          ...original,
          id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: `${original.title} (Copy)`,
        };
        const next = [...sections];
        next.splice(idx + 1, 0, clone);
        set({
          historyPast: [...historyPast.slice(-20), sections],
          historyFuture: [],
          sections: next,
          selectedSectionId: clone.id,
        });
      },

      reorderSections: (fromIndex, toIndex) => {
        const { sections, historyPast } = get();
        if (
          fromIndex < 0 ||
          fromIndex >= sections.length ||
          toIndex < 0 ||
          toIndex >= sections.length
        ) {
          return;
        }
        const next = [...sections];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        set({
          historyPast: [...historyPast.slice(-20), sections],
          historyFuture: [],
          sections: next,
        });
      },

      toggleSectionEnabled: (id) => {
        const { sections } = get();
        set({
          sections: sections.map((s) =>
            s.id === id ? { ...s, enabled: !s.enabled } : s
          ),
        });
      },

      applyTemplate: (templateId) => {
        const { analyzedProfile, username, sections, historyPast } = get();
        const tmpl = STARTER_TEMPLATES.find((t) => t.id === templateId);
        if (!tmpl) return;
        const profile = analyzedProfile || {
          username: username || "octocat",
          name: username || "Developer",
        };
        const newSections = tmpl.createSections(profile);
        set({
          historyPast: [...historyPast.slice(-20), sections],
          historyFuture: [],
          sections: newSections,
          selectedSectionId: newSections[0]?.id ?? null,
          projectTitle: `${tmpl.name} Profile`,
        });
      },

      initDefaultSectionsFromProfile: (profile) => {
        const { sections, historyPast } = get();
        const tmpl = STARTER_TEMPLATES[0]; // Minimalist Cyberpunk default
        const newSections = tmpl.createSections(profile);
        set({
          historyPast: [...historyPast.slice(-20), sections],
          historyFuture: [],
          sections: newSections,
          selectedSectionId: newSections[0]?.id ?? null,
          projectTitle: `${profile.name || profile.username}'s Profile`,
        });
      },

      undo: () => {
        const { historyPast, historyFuture, sections } = get();
        if (historyPast.length === 0) return;
        const previous = historyPast[historyPast.length - 1];
        set({
          sections: previous,
          historyPast: historyPast.slice(0, -1),
          historyFuture: [sections, ...historyFuture],
        });
      },

      redo: () => {
        const { historyPast, historyFuture, sections } = get();
        if (historyFuture.length === 0) return;
        const next = historyFuture[0];
        set({
          sections: next,
          historyPast: [...historyPast, sections],
          historyFuture: historyFuture.slice(1),
        });
      },

      toggleFavorite: (slug) => {
        const { favoriteSlugs } = get();
        if (favoriteSlugs.includes(slug)) {
          set({ favoriteSlugs: favoriteSlugs.filter((s) => s !== slug) });
        } else {
          set({ favoriteSlugs: [...favoriteSlugs, slug] });
        }
      },

      isFavorite: (slug) => {
        return get().favoriteSlugs.includes(slug);
      },

      addRecentlyViewed: (slug) => {
        const { recentlyViewedSlugs } = get();
        const next = [slug, ...recentlyViewedSlugs.filter((s) => s !== slug)].slice(0, 12);
        set({ recentlyViewedSlugs: next });
      },

      setAsciiSearchQuery: (asciiSearchQuery) => set({ asciiSearchQuery }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      setSelectedTagFilter: (selectedTagFilter) => set({ selectedTagFilter }),
    }),
    {
      name: "profile-forge-storage",
      partialize: (state) => ({
        username: state.username,
        projectTitle: state.projectTitle,
        sections: state.sections,
        favoriteSlugs: state.favoriteSlugs,
        previewMode: state.previewMode,
      }),
    }
  )
);
