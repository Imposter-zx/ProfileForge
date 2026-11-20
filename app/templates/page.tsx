// app/templates/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/navigation/Navbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useStore } from "@/lib/store";
import { STARTER_TEMPLATES } from "@/lib/readme/templates";
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
  const { applyTemplate, username } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Templates" },
    { id: "minimal", label: "Minimalist" },
    { id: "fullstack", label: "Full-Stack" },
    { id: "terminal", label: "CLI & Terminal" },
    { id: "creative", label: "Creative & Open Source" },
  ];

  const filtered = STARTER_TEMPLATES.filter((t) =>
    selectedCategory === "all" ? true : t.category === selectedCategory
  );

  const handleApply = (tmplId: string) => {
    applyTemplate(tmplId);
    router.push("/studio");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#090a0f] text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 space-y-8">
        {/* Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pre-Engineered README Architectures</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Starter Templates
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Choose a battle-tested GitHub Profile README layout. Each template
            features coordinated ASCII banners, metrics cards, tech stacks, and
            structured sections.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((c) => (
            <button
              key={c.id}
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

        {/* Templates Grid */}
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
                  {/* Top line */}
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
                    <p className="text-xs text-slate-400 mt-1">{tmpl.description}</p>
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
                <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">
                    ID: {tmpl.id}
                  </span>
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
    </div>
  );
}
