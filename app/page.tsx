// app/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Shield,
  Download,
} from "lucide-react";
import { Navbar } from "@/components/navigation/Navbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useStore } from "@/lib/store";
import { STARTER_TEMPLATES } from "@/lib/readme/templates";
import type { AnalyzedProfile } from "@/lib/github/analyzer";
import dynamic from "next/dynamic";

// Dynamic import for Ascii component to ensure client-only rendering
const Ascii = dynamic(
  () => import("ascii.rest/react").then((mod) => mod.Ascii),
  { ssr: false, loading: () => <div className="text-xs text-indigo-400 font-mono">Loading ASCII engine...</div> }
);

const QUICK_PROFILES = ["torvalds", "shadcn", "leerob", "antfu", "sindresorhus"];

export default function HomePage() {
  const router = useRouter();
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

  const handleAnalyze = async (unameToSearch?: string) => {
    const target = (unameToSearch || inputUsername).trim().replace(/^@/, "");
    if (!target) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/github/analyze?username=${encodeURIComponent(target)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `GitHub scan error (${res.status})`);
      }

      setStoreUsername(target);
      setAnalyzedProfile(data as AnalyzedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze profile.");
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
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-800/60 bg-grid-pattern">
          {/* Glowing background gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-indigo-600/15 to-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -top-24 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Powered by ascii.rest & GitHub GraphQL Engine</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                Craft Your Perfect{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  GitHub Profile README
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
                Scan your real GitHub stats, pick from{" "}
                <strong className="text-slate-200">217+ animated ASCII pieces</strong>,
                customize Shields.io badges, and export production-ready, GitHub-sanitized
                Markdown in seconds.
              </p>

              {/* Search Box */}
              <div className="pt-4 max-w-xl mx-auto">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAnalyze();
                  }}
                  className="flex flex-col sm:flex-row items-center gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 shadow-2xl focus-within:border-indigo-500/80 transition-colors"
                >
                  <div className="relative flex-1 w-full flex items-center">
                    <span className="absolute left-3.5 text-slate-500 font-mono text-sm">
                      @
                    </span>
                    <input
                      type="text"
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
                    Analyze
                  </Button>
                </form>

                {/* Quick suggestions */}
                <div className="flex items-center justify-center flex-wrap gap-2 mt-3 text-xs text-slate-400">
                  <span className="text-slate-500">Try demo:</span>
                  {QUICK_PROFILES.map((uname) => (
                    <button
                      key={uname}
                      onClick={() => {
                        setInputUsername(uname);
                        handleAnalyze(uname);
                      }}
                      className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 font-mono transition-colors"
                    >
                      @{uname}
                    </button>
                  ))}
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-start gap-2.5 text-left">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-200">Analysis Error</p>
                      <p className="text-xs text-red-300/90 mt-0.5">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* LIVE ANALYZED PROFILE CARD */}
            {analyzedProfile && (
              <div className="mt-12 max-w-3xl mx-auto">
                <Card glow className="border-indigo-500/30 bg-slate-900/90">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-4">
                      {analyzedProfile.avatarUrl ? (
                        <Image
                          src={analyzedProfile.avatarUrl}
                          alt={analyzedProfile.username}
                          width={60}
                          height={60}
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
                          <h2 className="text-lg font-bold text-white">
                            {analyzedProfile.name || analyzedProfile.username}
                          </h2>
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

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        onClick={handleLaunchStudio}
                        variant="glow"
                        size="md"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                        className="w-full sm:w-auto"
                      >
                        Open Studio
                      </Button>
                    </div>
                  </div>

                  {/* Metrics grid */}
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

                  {/* Top languages bar */}
                  {analyzedProfile.topLanguages.length > 0 && (
                    <div className="pt-4">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span>Language Distribution</span>
                        <span>
                          {analyzedProfile.topLanguages.slice(0, 4).map((l) => `${l.name} (${l.percentage}%)`).join(" • ")}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800 flex overflow-hidden">
                        {analyzedProfile.topLanguages.slice(0, 5).map((lang, idx) => {
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
              </div>
            )}

            {/* ASCII HERO ART PREVIEW */}
            <div className="mt-14 max-w-4xl mx-auto rounded-2xl border border-slate-800 bg-slate-950/80 p-4 sm:p-6 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 text-slate-400">ascii.rest — donut.ts</span>
                </div>
                <Badge variant="indigo" size="sm">
                  Live Canvas Engine
                </Badge>
              </div>
              <div className="flex items-center justify-center py-6 min-h-[220px] overflow-hidden text-center">
                <Ascii piece="donut" className="scale-90 sm:scale-100" />
              </div>
            </div>
          </div>
        </section>

        {/* 4 CORE PILLARS SECTION */}
        <section className="py-20 border-b border-slate-800/80 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Built for Modern Developers
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Everything you need to craft an unforgettable profile presence on GitHub.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card hover className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white">217+ ASCII Art Library</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Logos, distros, 3D shapes, space, and nature scenes powered by ascii.rest. Zero external dependencies.
              </p>
            </Card>

            <Card hover className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white">3-Panel Visual Studio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drag-and-drop section manager, dedicated section editors, and a real-time GitHub-sanitized live preview.
              </p>
            </Card>

            <Card hover className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white">Shields & Widgets</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Build custom tech badges with Simple Icons, plus resilient GitHub Actions fallback workflow for rate limits.
              </p>
            </Card>

            <Card hover className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white">ZIP & Markdown Export</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Export clean README.md, SVGs, and automated GitHub Actions workflow bundled in one convenient ZIP.
              </p>
            </Card>
          </div>
        </section>

        {/* STARTER TEMPLATES TEASER */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Curated Starter Templates
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Jumpstart your README with professionally designed architectures.
              </p>
            </div>
            <Link href="/templates">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View All Templates
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STARTER_TEMPLATES.map((tmpl) => (
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
            <span>Powered by ascii.rest</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/studio" className="hover:text-slate-300">Studio</Link>
            <Link href="/ascii" className="hover:text-slate-300">ASCII Gallery</Link>
            <Link href="/templates" className="hover:text-slate-300">Templates</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
