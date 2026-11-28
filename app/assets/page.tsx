// app/assets/page.tsx
"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Film,
  Code2,
  BarChart2,
  Award,
  Image as ImageIcon,
} from "lucide-react";
import { Navbar } from "@/components/navigation/Navbar";
import { CapsuleStudio } from "@/components/assets/CapsuleStudio";
import { GifLibrary } from "@/components/assets/GifLibrary";
import { TechIconsStudio } from "@/components/assets/TechIconsStudio";
import { WidgetsStudio } from "@/components/assets/WidgetsStudio";
import { BadgesStudio } from "@/components/assets/BadgesStudio";
import { CustomImageStudio } from "@/components/assets/CustomImageStudio";

type AssetTab = "capsule" | "gifs" | "tech" | "widgets" | "badges" | "custom-image";

export default function AssetsPage() {
  const [activeTab, setActiveTab] = useState<AssetTab>("capsule");

  return (
    <div className="flex flex-col min-h-screen bg-[#090a0f] text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Complete GitHub README Asset Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              README Asset Explorer & Studios
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Design animated Capsule headers, browse retro gaming and cyberpunk GIFs,
              organize tech icon matrices, and test live GitHub metrics widgets.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs shrink-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab("capsule")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all ${
                activeTab === "capsule"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span>Capsule Render</span>
            </button>

            <button
              onClick={() => setActiveTab("gifs")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all ${
                activeTab === "gifs"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Film className="w-4 h-4 text-pink-400" />
              <span>GIFs & Visuals</span>
            </button>

            <button
              onClick={() => setActiveTab("tech")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all ${
                activeTab === "tech"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Tech Icons Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab("widgets")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all ${
                activeTab === "widgets"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BarChart2 className="w-4 h-4 text-amber-400" />
              <span>GitHub Widgets</span>
            </button>

            <button
              onClick={() => setActiveTab("badges")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all ${
                activeTab === "badges"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Badges</span>
            </button>

            <button
              onClick={() => setActiveTab("custom-image")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all ${
                activeTab === "custom-image"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ImageIcon className="w-4 h-4 text-sky-400" />
              <span>Custom Images</span>
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        {activeTab === "capsule" && <CapsuleStudio />}
        {activeTab === "gifs" && <GifLibrary />}
        {activeTab === "tech" && <TechIconsStudio />}
        {activeTab === "widgets" && <WidgetsStudio />}
        {activeTab === "badges" && <BadgesStudio />}
        {activeTab === "custom-image" && <CustomImageStudio />}
      </main>
    </div>
  );
}
