// components/studio/StudioOnboarding.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  X,
  FileCode2,
  Layers,
  Sliders,
  Download,
} from "lucide-react";
import { useStore } from "@/lib/store";

const STEPS = [
  {
    num: "1",
    title: "Start or Pick a Template",
    desc: "Begin with the default layout or load one of 12 templates.",
    icon: <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />,
  },
  {
    num: "2",
    title: "Add from Element Library",
    desc: "Switch to the Library tab on the left to insert 50+ blocks.",
    icon: <Layers className="w-3.5 h-3.5 text-purple-400" />,
  },
  {
    num: "3",
    title: "Customize Visually",
    desc: "Edit text, badges, ASCII art, GIFs, and stats in the center editor.",
    icon: <Sliders className="w-3.5 h-3.5 text-cyan-400" />,
  },
  {
    num: "4",
    title: "Preview & Export",
    desc: "Check Desktop/Mobile/Raw views on the right, then copy or download.",
    icon: <Download className="w-3.5 h-3.5 text-emerald-400" />,
  },
];

export function StudioOnboarding() {
  const { hasDismissedOnboarding, dismissOnboarding } = useStore();

  if (hasDismissedOnboarding) return null;

  return (
    <div
      role="region"
      aria-label="Welcome to README Studio"
      className="border-b border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-[#0e1222] to-purple-950/50 px-4 py-3 shrink-0"
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-white">
                Welcome to README Studio
              </h2>
              <Link
                href="/templates"
                className="text-[11px] font-medium text-indigo-300 hover:text-indigo-200 underline underline-offset-2"
              >
                Browse Templates
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-5 gap-y-1.5 mt-1.5">
              {STEPS.map((s) => (
                <div
                  key={s.num}
                  className="flex items-center gap-1.5 text-[11px] text-slate-300"
                >
                  {s.icon}
                  <span>
                    <strong className="text-white">{s.num}. {s.title}:</strong>{" "}
                    <span className="text-slate-400">{s.desc}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
          <button
            type="button"
            onClick={dismissOnboarding}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-[11px] font-medium text-slate-200 transition-colors"
          >
            <span>Skip Guide</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
