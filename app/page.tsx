// app/page.tsx
"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Search,
  Sparkles,
  ArrowRight,
  GitBranch,
  Star,
  Users,
  Code2,
  AlertCircle,
  Layers,
  FileCode2,
  Film,
  Award,
  BarChart2,
  Eye,
  Download,
  Terminal,
  Wand2,
} from "lucide-react";
import { Navbar } from "@/components/navigation/Navbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useStore } from "@/lib/store";
import { STARTER_TEMPLATES } from "@/lib/readme/templates";
import { analyzeGitHubProfile } from "@/lib/github/analyzer";
import { GitHubConnectCard } from "@/components/github/GitHubConnectCard";

const Ascii = dynamic(
  () => import("ascii.rest/react").then((mod) => mod.Ascii),
  {
    ssr: false,
    loading: () => (
      <div className="text-xs text-indigo-400 font-mono">
        Loading ASCII engine...
      </div>
    ),
  }
);

const QUICK_PROFILES = ["torvalds", "shadcn", "leerob", "antfu", "sindresorhus"];

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Choose a starting point",
    description:
      "Start from scratch, pick one of 12 curated templates, or scan your GitHub profile.",
    icon: <Wand2 className="w-5 h-5 text-indigo-400" />,
  },
  {
    step: "02",
    title: "Add & customize sections",
    description:
      "Insert About Me, skills, stats, ASCII art, GIFs, and badges using visual editors.",
    icon: <Layers className="w-5 h-5 text-purple-400" />,
  },
  {
    step: "03",
    title: "Preview your README",
    description:
      "Switch between GitHub Profile, Mobile, Wide, and editable Raw Markdown views.",
    icon: <Eye className="w-5 h-5 text-cyan-400" />,
  },
  {
    step: "04",
    title: "Export or publish",
    description:
      "Download README.md, export a full ZIP bundle, or publish directly to GitHub.",
    icon: <Download className="w-5 h-5 text-emerald-400" />,
  },
];

const FEATURE_CARDS = [
  {
    title: "README Builder",
    description:
      "Drag-and-drop 50+ structured blocks with visual forms, undo/redo, and autosave.",
    href: "/studio",
    cta: "Open Studio",
    icon: <Layers className="w-5 h-5 text-indigo-400" />,
  },
  {
    title: "ASCII Art Explorer",
    description:
      "Browse 217+ animated & static ASCII pieces or draw your own in the Custom Editor.",
    href: "/ascii",
    cta: "Explore ASCII",
    icon: <Sparkles className="w-5 h-5 text-purple-400" />,
  },
  {
    title: "GIFs & Banners",
    description:
      "Customize animated Capsule Render wave headers and retro developer GIF banners.",
    href: "/assets?tab=gifs",
    cta: "Browse GIFs",
    icon: <Film className="w-5 h-5 text-pink-400" />,
  },
  {
    title: "Badge Builder",
    description:
      "Craft custom Shields.io technology, social, and status badges with live preview.",
    href: "/assets?tab=badges",
    cta: "Build Badges",
    icon: <Award className="w-5 h-5 text-emerald-400" />,
  },
  {
    title: "GitHub Widgets",
    description:
      "Insert live stats cards, streak counters, top languages, and activity graphs.",
    href: "/assets?tab=widgets",
    cta: "Configure Widgets",
    icon: <BarChart2 className="w-5 h-5 text-amber-400" />,
  },
  {
    title: "Template Library",
    description:
      "Start with 12 ready-made developer profiles and save your own custom templates.",
    href: "/templates",
    cta: "View Templates",
    icon: <FileCode2 className="w-5 h-5 text-cyan-400" />,
  },
  {
    title: "Live Preview",
    description:
      "See real-time GitHub-accurate rendering across Desktop, Mobile, and Raw Markdown.",
    href: "/studio",
    cta: "Try Live Preview",
    icon: <Eye className="w-5 h-5 text-sky-400" />,
  },
  {
    title: "Export & Publish",
    description:
      "Copy Markdown, download README.md, export Project JSON, or bundle a full ZIP.",
    href: "/studio",
    cta: "Export README",
    icon: <Download className="w-5 h-5 text-teal-400" />,
  },
];

export default function HomePage() {
  const router = useRouter();
  const analyzerRef = useRef<HTMLElement>(null);
  const analyzerInputRef = useRef<HTMLInputElement>(null);

  const {
    username: storedUsername,
    setUsername: setStoreUsername,
    analyzedProfile,
    setAnalyzedProfile,
    initDefaultSectionsFromProfile,
    applyTemplate,
  } = useStore();

  const [inputUsername, setInputUsername] = useState(storedUsername || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollToAnalyzer = () => {
    analyzerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => analyzerInputRef.current?.focus(), 350);
  };

  const handleAnalyze = async (unameToSearch?: string) => {
    const target = (unameToSearch || inputUsername).trim().replace(/^@/, "");
    if (!target) return;

    setLoading(true);
    setError(null);

    try {
      const data = await analyzeGitHubProfile(target);
      setStoreUsername(target);
      setAnalyzedProfile(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to analyze profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchStudio = () => {
    if (analyzedProfile) {
      initDefaultSectionsFromProfile(analyzedProfile);
    }
    router.push("/studio");
  };

  const handleTemplateSelect = (templateId: string) => {
    applyTemplate(templateId);
    router.push("/studio");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#090a0f] text-slate-100">
      <Navbar />

      <main className="flex-1">
        {/* COMPACT ACTION-FIRST HERO */}
        <section className="relative overflow-hidden pt-10 pb-14 md:pt-16 md:pb-20 border-b border-slate-800/60 bg-grid-pattern">
          <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[280px] bg-gradient-to-tr from-indigo-600/15 to-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -top-24 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Copy & Clear CTAs */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Visual GitHub Profile README Studio</span>
                </div>

                <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
                  Build a GitHub Profile{" "}
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    That Stands Out.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0">
                  Create, customize, and export your GitHub Profile README with
                  visual blocks, ASCII art, animated GIFs, badges, stats, and
                  ready-to-use templates.
                </p>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                  <Link href="/studio">
                    <Button
                      variant="glow"
                      size="lg"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Start Building
                    </Button>
                  </Link>

                  <Link href="/templates">
                    <Button
                      variant="outline"
                      size="lg"
                      leftIcon={<FileCode2 className="w-4 h-4 text-indigo-400" />}
                    >
                      Explore Templates
                    </Button>
                  </Link>

                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    onClick={scrollToAnalyzer}
                    leftIcon={<Terminal className="w-4 h-4 text-cyan-400" />}
                  >
                    Analyze GitHub
                  </Button>
                </div>
              </div>

              {/* Right Live ASCII Preview Card */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                      <span className="ml-1.5 text-slate-400">
                        ascii.rest — donut.ts
                      </span>
                    </div>
                    <Badge variant="indigo" size="sm">
                      217+ Pieces
                    </Badge>
                  </div>
                  <div className="flex items-center justify-center py-4 min-h-[200px] overflow-hidden text-center">
                    <Ascii piece="donut" className="scale-75 sm:scale-90" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE QUICK-START SECTION (3 PATHS) */}
        <section className="py-14 border-b border-slate-800/70 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400">
              Step 1 — Choose Your Starting Point
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              How Would You Like to Start?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Path A: Build from Scratch */}
            <Link href="/studio" className="group block">
              <Card
                hover
                className="h-full flex flex-col justify-between p-6 border-slate-800 bg-slate-900/70 group-hover:border-indigo-500/50 transition-all"
              >
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    Build from Scratch
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Build your README with customizable blocks, drag-and-drop
                    ordering, and live Markdown preview.
                  </p>
                </div>
                <div className="pt-5 mt-5 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400">
                  <span>Start Building</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>

            {/* Path B: Start with a Template */}
            <Link href="/templates" className="group block">
              <Card
                hover
                className="h-full flex flex-col justify-between p-6 border-slate-800 bg-slate-900/70 group-hover:border-purple-500/50 transition-all"
              >
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <FileCode2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                    Start with a Template
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Choose a ready-made developer profile from 12 curated
                    layouts and customize every section.
                  </p>
                </div>
                <div className="pt-5 mt-5 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-purple-400">
                  <span>Explore Templates</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>

            {/* Path C: Analyze GitHub */}
            <button
              type="button"
              onClick={scrollToAnalyzer}
              className="group block text-left w-full"
            >
              <Card
                hover
                className="h-full flex flex-col justify-between p-6 border-slate-800 bg-slate-900/70 group-hover:border-cyan-500/50 transition-all"
              >
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Analyze GitHub
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Scan your GitHub username to pull top languages, stars, and
                    auto-suggest README sections.
                  </p>
                </div>
                <div className="pt-5 mt-5 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-cyan-400">
                  <span>Analyze Profile</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </button>
          </div>
        </section>

        {/* INTERACTIVE GITHUB PROFILE ANALYZER */}
        <section
          id="analyze-github"
          ref={analyzerRef}
          className="py-16 border-b border-slate-800/70 bg-slate-950/40"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                GitHub Profile Analyzer
              </h2>
              <p className="text-sm text-slate-400 max-w-xl mx-auto">
                Enter any GitHub username to inspect repository stats, top
                languages, and pre-fill your README Studio.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAnalyze();
              }}
              className="flex flex-col sm:flex-row items-center gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 shadow-xl focus-within:border-indigo-500/80 transition-colors"
            >
              <div className="relative flex-1 w-full flex items-center">
                <span className="absolute left-3.5 text-slate-500 font-mono text-sm">
                  @
                </span>
                <input
                  ref={analyzerInputRef}
                  type="text"
                  aria-label="GitHub username"
                  placeholder="Enter GitHub username (e.g. torvalds)"
                  value={inputUsername}
                  onChange={(e) => setInputUsername(e.target.value)}
                  className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm pl-8 pr-3 py-2.5 focus:outline-none font-mono"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                leftIcon={<Search className="w-4 h-4" />}
                className="w-full sm:w-auto px-6 py-2.5 shrink-0"
              >
                Analyze Profile
              </Button>
            </form>

            <div className="flex items-center justify-center flex-wrap gap-2 text-xs text-slate-400">
              <span className="text-slate-500">Try demo:</span>
              {QUICK_PROFILES.map((uname) => (
                <button
                  key={uname}
                  type="button"
                  onClick={() => {
                    setInputUsername(uname);
                    handleAnalyze(uname);
                  }}
                  className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 font-mono transition-colors"
                >
                  @{uname}
                </button>
              ))}
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-200">Analysis Error</p>
                  <p className="text-xs text-red-300/90 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {analyzedProfile && (
              <Card glow className="border-indigo-500/30 bg-slate-900/90">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-4">
                    {analyzedProfile.avatarUrl ? (
                      <Image
                        src={analyzedProfile.avatarUrl}
                        alt={analyzedProfile.username}
                        width={56}
                        height={56}
                        className="rounded-2xl border-2 border-indigo-500/40 shadow-md"
                        unoptimized
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 flex items-center justify-center font-bold text-lg text-indigo-300">
                        {analyzedProfile.username[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white">
                          {analyzedProfile.name || analyzedProfile.username}
                        </h3>
                        <span className="text-xs font-mono text-slate-400">
                          @{analyzedProfile.username}
                        </span>
                      </div>
                      {analyzedProfile.bio && (
                        <p className="text-xs text-slate-300 mt-0.5 max-w-md line-clamp-2">
                          {analyzedProfile.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleLaunchStudio}
                    variant="glow"
                    size="md"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="w-full sm:w-auto"
                  >
                    Generate README in Studio
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-center border-b border-slate-800/80">
                  <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                    <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 text-amber-400" /> Stars
                    </div>
                    <div className="text-lg font-bold text-white mt-1">
                      {analyzedProfile.totalStars.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                    <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                      <GitBranch className="w-3 h-3 text-purple-400" /> Repos
                    </div>
                    <div className="text-lg font-bold text-white mt-1">
                      {analyzedProfile.publicReposCount}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                    <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                      <Users className="w-3 h-3 text-cyan-400" /> Followers
                    </div>
                    <div className="text-lg font-bold text-white mt-1">
                      {analyzedProfile.followers.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                    <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                      <Code2 className="w-3 h-3 text-emerald-400" /> Top Lang
                    </div>
                    <div className="text-lg font-bold text-emerald-300 mt-1 truncate">
                      {analyzedProfile.topLanguages[0]?.name || "N/A"}
                    </div>
                  </div>
                </div>

                {analyzedProfile.topLanguages.length > 0 && (
                  <div className="pt-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Language Distribution</span>
                      <span>
                        {analyzedProfile.topLanguages
                          .slice(0, 4)
                          .map((l) => `${l.name} (${l.percentage}%)`)
                          .join(" • ")}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 flex overflow-hidden">
                      {analyzedProfile.topLanguages
                        .slice(0, 5)
                        .map((lang, idx) => {
                          const colors = [
                            "bg-indigo-500",
                            "bg-purple-500",
                            "bg-cyan-500",
                            "bg-amber-500",
                            "bg-emerald-500",
                          ];
                          return (
                            <div
                              key={lang.name}
                              style={{ width: `${lang.percentage}%` }}
                              className={`${colors[idx % colors.length]} h-full transition-all`}
                              title={`${lang.name}: ${lang.percentage}%`}
                            />
                          );
                        })}
                    </div>
                  </div>
                )}
              </Card>
            )}

            <GitHubConnectCard />
          </div>
        </section>

        {/* 4-STEP VISUAL WORKFLOW */}
        <section className="py-16 border-b border-slate-800/80 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400">
              How Profile Forge Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              From Blank Page to Standout Profile in Minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WORKFLOW_STEPS.map((item) => (
              <Card
                key={item.step}
                className="p-5 bg-slate-900/60 border-slate-800 relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    STEP {item.step}
                  </span>
                </div>
                <h3 className="font-bold text-white text-sm">{item.title}</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* DISCOVERABLE FEATURES GRID (8 ACTIONABLE CARDS) */}
        <section className="py-16 border-b border-slate-800/80 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Everything You Need in One Place
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Jump directly to any tool, explorer, or customization studio.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURE_CARDS.map((feat) => (
              <Link key={feat.title} href={feat.href} className="group block">
                <Card
                  hover
                  className="h-full flex flex-col justify-between p-5 border-slate-800 bg-slate-900/60 group-hover:border-indigo-500/40"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                      {feat.icon}
                    </div>
                    <h3 className="font-semibold text-white text-sm group-hover:text-indigo-300 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-semibold text-indigo-400">
                    <span>{feat.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* CURATED STARTER TEMPLATES TEASER (TOP 4) */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Curated Starter Templates
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Pick a layout and customize every block in the visual studio.
              </p>
            </div>
            <Link href="/templates">
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                View All {STARTER_TEMPLATES.length} Templates
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STARTER_TEMPLATES.slice(0, 4).map((tmpl) => (
              <Card
                key={tmpl.id}
                hover
                className="flex flex-col justify-between h-full group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="indigo" size="sm">
                      {tmpl.badge}
                    </Badge>
                    <span className="text-xs font-mono text-slate-500">
                      {tmpl.previewAsciiSlug}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors">
                    {tmpl.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-3">
                    {tmpl.tagline}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-800">
                  <Button
                    onClick={() => handleTemplateSelect(tmpl.id)}
                    variant="secondary"
                    size="sm"
                    className="w-full justify-between"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Use Template
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 py-8 bg-slate-950/80 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Profile Forge</span>
            <span>•</span>
            <span>Visual GitHub README Studio</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/studio" className="hover:text-slate-300">
              Build README
            </Link>
            <Link href="/templates" className="hover:text-slate-300">
              Templates
            </Link>
            <Link href="/ascii" className="hover:text-slate-300">
              ASCII Explorer
            </Link>
            <Link href="/assets" className="hover:text-slate-300">
              Assets &amp; Badges
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
