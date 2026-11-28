// components/theme/ThemeSwitcher.tsx
"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useStore } from "@/lib/store";

export interface ThemeSwitcherProps {
  compact?: boolean;
  className?: string;
}

export function ThemeSwitcher({
  compact = false,
  className = "",
}: ThemeSwitcherProps) {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);

  const isLight = theme === "light";
  const toggleTheme = () => setTheme(isLight ? "dark" : "light");

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isLight}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
      title={isLight ? "Switch to Dark Theme" : "Switch to Light Theme"}
      className={`theme-switcher inline-flex items-center gap-1.5 rounded-xl border transition-all duration-200 select-none active:scale-[0.97] ${
        compact ? "p-1.5" : "px-2.5 py-1.5 text-xs font-medium"
      } ${
        isLight
          ? "bg-white border-slate-200 text-slate-700 hover:bg-indigo-50/70 hover:border-indigo-300 hover:text-indigo-700 shadow-xs"
          : "bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-indigo-500/40 hover:text-white"
      } ${className}`}
    >
      {isLight ? (
        <Moon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
      ) : (
        <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      )}
      {!compact && (
        <span className="hidden sm:inline">
          {isLight ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
}
