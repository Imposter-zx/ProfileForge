// lib/store.ts
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type { AnalyzedProfile } from "./github/analyzer";
import type { ReadmeSection } from "./readme/compiler";
import type { AsciiCategory } from "./ascii/catalog";
import { STARTER_TEMPLATES } from "./readme/templates";
import { importMarkdownToSections, importProjectJson } from "./readme/importer";

export const STORAGE_KEY = "profile-forge-storage";
export const STORAGE_SCHEMA_VERSION = 2;

export interface ProjectSnapshot {
  sections: ReadmeSection[];
  title: string;
}

export interface TemplateBackup {
  sections: ReadmeSection[];
  projectTitle: string;
  savedAt: string;
}

export interface SavedCustomTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  sections: ReadmeSection[];
  createdAt: string;
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
  collapsedSectionIds: string[];
  lastSavedAt: string | null;
  storageRecovered: boolean;

  // --- History (Undo / Redo) ---
  historyPast: ReadmeSection[][];
  historyFuture: ReadmeSection[][];

  // --- Templates & Backups ---
  templateBackup: TemplateBackup | null;
  savedTemplates: SavedCustomTemplate[];

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
  markSaved: () => void;

  // Section manipulation with history snapshot
  addSection: (section: ReadmeSection) => void;
  updateSection: (id: string, updates: Partial<ReadmeSection>) => void;
  updateSectionData: (id: string, dataUpdates: Record<string, unknown>) => void;
  removeSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  toggleSectionEnabled: (id: string) => void;
  toggleSectionCollapsed: (id: string) => void;
  setAllSectionsCollapsed: (collapsed: boolean) => void;

  // Import / Workspace
  importMarkdown: (markdown: string) => number;
  importProject: (jsonString: string) => void;
  resetWorkspace: () => void;

  // Templates & Custom Templates
  applyTemplate: (templateId: string) => void;
  restoreTemplateBackup: () => void;
  saveCustomTemplate: (name: string, description?: string) => SavedCustomTemplate;
  deleteCustomTemplate: (id: string) => void;
  duplicateTemplate: (templateId: string) => SavedCustomTemplate | null;
  applyCustomTemplate: (id: string) => void;
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

export const DEFAULT_SECTIONS: ReadmeSection[] = [
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

function cloneSections(sections: ReadmeSection[]): ReadmeSection[] {
  return sections.map((s) => ({
    ...s,
    data: s.data ? JSON.parse(JSON.stringify(s.data)) : {},
  }));
}

function getStorageBackend(): Storage | null {
  try {
    if (typeof globalThis !== "undefined" && "localStorage" in globalThis && globalThis.localStorage) {
      return globalThis.localStorage;
    }
  } catch {
    // Ignore environments where localStorage access throws
  }
  return null;
}

/**
 * Safe StateStorage wrapper that validates JSON payloads and recovers
 * gracefully from corrupted localStorage entries.
 */
export function createSafeStorage(): StateStorage {
  const memoryFallback = new Map<string, string>();

  return {
    getItem: (name: string): string | null => {
      const backend = getStorageBackend();
      if (!backend) return memoryFallback.get(name) ?? null;

      try {
        const raw = backend.getItem(name);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as unknown;
        if (!parsed || typeof parsed !== "object" || !("state" in parsed)) {
          throw new Error("Malformed persisted store envelope");
        }
        return raw;
      } catch {
        // Corrupted payload detected: remove it so the app recovers cleanly
        try {
          backend.removeItem(name);
        } catch {
          // ignore
        }
        return null;
      }
    },
    setItem: (name: string, value: string): void => {
      const backend = getStorageBackend();
      if (!backend) {
        memoryFallback.set(name, value);
        return;
      }
      try {
        backend.setItem(name, value);
      } catch {
        // Ignore quota exceeded or private-mode errors
      }
    },
    removeItem: (name: string): void => {
      const backend = getStorageBackend();
      if (!backend) {
        memoryFallback.delete(name);
        return;
      }
      try {
        backend.removeItem(name);
      } catch {
        // ignore
      }
    },
  };
}

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
      sections: cloneSections(DEFAULT_SECTIONS),
      selectedSectionId: "sec-banner",
      collapsedSectionIds: [],
      lastSavedAt: null,
      storageRecovered: false,

      // History
      historyPast: [],
      historyFuture: [],

      // Templates & Backups
      templateBackup: null,
      savedTemplates: [],

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

      setSections: (sections) =>
        set({ sections, lastSavedAt: new Date().toISOString() }),
      setProjectTitle: (projectTitle) =>
        set({ projectTitle, lastSavedAt: new Date().toISOString() }),
      setSelectedSectionId: (selectedSectionId) => set({ selectedSectionId }),
      setPreviewMode: (previewMode) => set({ previewMode }),
      setActivePreviewTab: (activePreviewTab) => set({ activePreviewTab }),
      markSaved: () => set({ lastSavedAt: new Date().toISOString() }),

      addSection: (section) => {
        const { sections, historyPast } = get();
        set({
          historyPast: [...historyPast.slice(-20), sections],
          historyFuture: [],
          sections: [...sections, section],
          selectedSectionId: section.id,
          lastSavedAt: new Date().toISOString(),
        });
      },

      updateSection: (id, updates) => {
        const { sections, historyPast } = get();
        set({
          historyPast: [...historyPast.slice(-20), sections],
          historyFuture: [],
          sections: sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
          lastSavedAt: new Date().toISOString(),
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
          lastSavedAt: new Date().toISOString(),
        });
      },

      removeSection: (id) => {
        const { sections, selectedSectionId, collapsedSectionIds, historyPast } = get();
        const next = sections.filter((s) => s.id !== id);
        set({
          historyPast: [...historyPast.slice(-20), sections],
          historyFuture: [],
          sections: next,
          selectedSectionId:
            selectedSectionId === id ? (next[0]?.id ?? null) : selectedSectionId,
          collapsedSectionIds: collapsedSectionIds.filter((cid) => cid !== id),
          lastSavedAt: new Date().toISOString(),
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
          data: original.data ? JSON.parse(JSON.stringify(original.data)) : {},
        };
        const next = [...sections];
        next.splice(idx + 1, 0, clone);
        set({
          historyPast: [...historyPast.slice(-20), sections],
          historyFuture: [],
          sections: next,
          selectedSectionId: clone.id,
          lastSavedAt: new Date().toISOString(),
        });
      },

      reorderSections: (fromIndex, toIndex) => {
        const { sections, historyPast } = get();
        if (
          fromIndex < 0 ||
          fromIndex >= sections.length ||
          toIndex < 0 ||
          toIndex >= sections.length ||
          fromIndex === toIndex
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
          lastSavedAt: new Date().toISOString(),
        });
      },

      toggleSectionEnabled: (id) => {
        const { sections, historyPast } = get();
        set({
          historyPast: [...historyPast.slice(-20), sections],
          historyFuture: [],
          sections: sections.map((s) =>
            s.id === id ? { ...s, enabled: !s.enabled } : s
          ),
          lastSavedAt: new Date().toISOString(),
        });
      },

      toggleSectionCollapsed: (id) => {
        const { collapsedSectionIds } = get();
        if (collapsedSectionIds.includes(id)) {
          set({ collapsedSectionIds: collapsedSectionIds.filter((cid) => cid !== id) });
        } else {
          set({ collapsedSectionIds: [...collapsedSectionIds, id] });
        }
      },

      setAllSectionsCollapsed: (collapsed) => {
        const { sections } = get();
        set({
          collapsedSectionIds: collapsed ? sections.map((s) => s.id) : [],
        });
      },

      importMarkdown: (markdown) => {
        const parsed = importMarkdownToSections(markdown);
        if (!parsed.length) return 0;
        const { sections, historyPast } = get();
        set({
          historyPast: [...historyPast.slice(-20), sections],
          historyFuture: [],
          sections: parsed,
          selectedSectionId: parsed[0]?.id ?? null,
          collapsedSectionIds: [],
          lastSavedAt: new Date().toISOString(),
        });
        return parsed.length;
      },

      importProject: (jsonString) => {
        const imported = importProjectJson(jsonString);
        const { sections, historyPast } = get();
        set({
          historyPast: [...historyPast.slice(-20), sections],
          historyFuture: [],
          sections: imported.sections,
          projectTitle: imported.title,
          username: imported.username || get().username,
          selectedSectionId: imported.sections[0]?.id ?? null,
          collapsedSectionIds: [],
          lastSavedAt: new Date().toISOString(),
        });
      },

      resetWorkspace: () => {
        const { sections, historyPast } = get();
        const defaults = cloneSections(DEFAULT_SECTIONS);
        set({
          historyPast: [...historyPast.slice(-20), sections],
          historyFuture: [],
          sections: defaults,
          projectTitle: "My Profile README",
          selectedSectionId: defaults[0]?.id ?? null,
          collapsedSectionIds: [],
          lastSavedAt: new Date().toISOString(),
        });
      },

      applyTemplate: (templateId) => {
        const { analyzedProfile, username, sections, projectTitle, historyPast, savedTemplates } = get();
        const starter = STARTER_TEMPLATES.find((t) => t.id === templateId);
        const custom = !starter ? savedTemplates.find((t) => t.id === templateId) : undefined;

        if (!starter && !custom) return;

        const backup: TemplateBackup = {
          sections: cloneSections(sections),
          projectTitle,
          savedAt: new Date().toISOString(),
        };

        let newSections: ReadmeSection[];
        let newTitle: string;

        if (starter) {
          const profile = analyzedProfile || {
            username: username || "octocat",
            name: username || "Developer",
          };
          newSections = starter.createSections(profile);
          newTitle = `${starter.name} Profile`;
        } else {
          newSections = cloneSections(custom!.sections);
          newTitle = custom!.name;
        }

        set({
          templateBackup: backup,
          historyPast: [...historyPast.slice(-20), sections],
          historyFuture: [],
          sections: newSections,
          selectedSectionId: newSections[0]?.id ?? null,
          collapsedSectionIds: [],
          projectTitle: newTitle,
          lastSavedAt: new Date().toISOString(),
        });
      },

      restoreTemplateBackup: () => {
        const { templateBackup, sections, historyPast } = get();
        if (!templateBackup) return;
        const restored = cloneSections(templateBackup.sections);
        set({
          historyPast: [...historyPast.slice(-20), sections],
          historyFuture: [],
          sections: restored,
          projectTitle: templateBackup.projectTitle,
          selectedSectionId: restored[0]?.id ?? null,
          templateBackup: null,
          lastSavedAt: new Date().toISOString(),
        });
      },

      saveCustomTemplate: (name, description = "Custom saved profile template") => {
        const { sections, savedTemplates } = get();
        const tmpl: SavedCustomTemplate = {
          id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: name.trim() || "Custom Template",
          description: description.trim() || "Custom saved profile template",
          category: "custom",
          sections: cloneSections(sections),
          createdAt: new Date().toISOString(),
        };
        set({ savedTemplates: [tmpl, ...savedTemplates] });
        return tmpl;
      },

      deleteCustomTemplate: (id) => {
        const { savedTemplates } = get();
        set({ savedTemplates: savedTemplates.filter((t) => t.id !== id) });
      },

      duplicateTemplate: (templateId) => {
        const { savedTemplates, analyzedProfile, username } = get();
        const starter = STARTER_TEMPLATES.find((t) => t.id === templateId);
        const custom = savedTemplates.find((t) => t.id === templateId);

        let baseSections: ReadmeSection[] = [];
        let baseName = "";
        let baseDesc = "";

        if (starter) {
          const profile = analyzedProfile || {
            username: username || "octocat",
            name: username || "Developer",
          };
          baseSections = starter.createSections(profile);
          baseName = `${starter.name} (Copy)`;
          baseDesc = starter.description;
        } else if (custom) {
          baseSections = cloneSections(custom.sections);
          baseName = `${custom.name} (Copy)`;
          baseDesc = custom.description;
        } else {
          return null;
        }

        const copy: SavedCustomTemplate = {
          id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: baseName,
          description: baseDesc,
          category: "custom",
          sections: baseSections,
          createdAt: new Date().toISOString(),
        };
        set({ savedTemplates: [copy, ...savedTemplates] });
        return copy;
      },

      applyCustomTemplate: (id) => {
        get().applyTemplate(id);
      },

      initDefaultSectionsFromProfile: (profile) => {
        const { sections, historyPast } = get();
        const tmpl = STARTER_TEMPLATES[0];
        const newSections = tmpl.createSections(profile);
        set({
          historyPast: [...historyPast.slice(-20), sections],
          historyFuture: [],
          sections: newSections,
          selectedSectionId: newSections[0]?.id ?? null,
          projectTitle: `${profile.name || profile.username}'s Profile`,
          lastSavedAt: new Date().toISOString(),
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
          lastSavedAt: new Date().toISOString(),
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
          lastSavedAt: new Date().toISOString(),
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
      name: STORAGE_KEY,
      version: STORAGE_SCHEMA_VERSION,
      storage: createJSONStorage(() => createSafeStorage()),
      migrate: (persistedState: unknown, version: number) => {
        if (!persistedState || typeof persistedState !== "object") {
          return {
            sections: cloneSections(DEFAULT_SECTIONS),
            storageRecovered: true,
          } as Partial<StoreState>;
        }
        const s = persistedState as Partial<StoreState>;
        if (version < 2) {
          return {
            ...s,
            sections: Array.isArray(s.sections) && s.sections.length > 0 ? s.sections : cloneSections(DEFAULT_SECTIONS),
            collapsedSectionIds: Array.isArray(s.collapsedSectionIds) ? s.collapsedSectionIds : [],
            savedTemplates: Array.isArray(s.savedTemplates) ? s.savedTemplates : [],
            templateBackup: s.templateBackup ?? null,
          };
        }
        return s;
      },
      partialize: (state) => ({
        username: state.username,
        projectTitle: state.projectTitle,
        sections: state.sections,
        collapsedSectionIds: state.collapsedSectionIds,
        favoriteSlugs: state.favoriteSlugs,
        previewMode: state.previewMode,
        savedTemplates: state.savedTemplates,
        templateBackup: state.templateBackup,
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
);
