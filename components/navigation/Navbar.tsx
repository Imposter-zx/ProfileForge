// components/navigation/Navbar.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Home,
  Layers,
  Code2,
  FileCode2,
  Menu,
  X,
  Palette,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { GitHubIcon } from "../ui/GitHubIcon";
import { Button } from "../ui/Button";
import { useGitHubAuth } from "@/hooks/useGitHubAuth";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [assetsMenuOpen, setAssetsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isConnected } = useGitHubAuth();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setAssetsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAssetsMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const primaryLinks = [
    { href: "/", label: "Home", icon: <Home className="w-4 h-4" /> },
    {
      href: "/studio",
      label: "Build README",
      icon: <Layers className="w-4 h-4" />,
    },
    {
      href: "/templates",
      label: "Templates",
      icon: <FileCode2 className="w-4 h-4" />,
    },
  ];

  const assetLinks = [
    {
      href: "/ascii",
      label: "ASCII Art Explorer",
      description: "217+ animated & static ASCII pieces + custom editor",
      icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
    },
    {
      href: "/assets",
      label: "Banners, GIFs & Badges",
      description: "Capsule headers, GIF library, tech icons & widgets",
      icon: <Palette className="w-4 h-4 text-purple-400" />,
    },
  ];

  const isAssetsActive =
    pathname.startsWith("/ascii") || pathname.startsWith("/assets");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090a0f]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">
                Profile<span className="text-indigo-400">Forge</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono font-medium">
                Studio
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Visual GitHub README Builder
            </p>
          </div>
        </Link>

        {/* Simplified Desktop Nav */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-1"
        >
          {primaryLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-800/90 text-white border border-slate-700/60"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* Secondary Elements & Assets Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setAssetsMenuOpen((o) => !o)}
              aria-expanded={assetsMenuOpen}
              aria-haspopup="menu"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isAssetsActive || assetsMenuOpen
                  ? "bg-slate-800/90 text-white border border-slate-700/60"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Assets &amp; ASCII</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  assetsMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {assetsMenuOpen && (
              <div
                role="menu"
                className="absolute left-0 mt-2 w-72 rounded-2xl border border-slate-800 bg-[#0d101a] p-2 shadow-2xl space-y-1 z-50"
              >
                {assetLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    onClick={() => setAssetsMenuOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-800/70 transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-100 group-hover:text-indigo-300">
                        {item.label}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right Contextual Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {isConnected && user ? (
            <Link
              href="/studio"
              className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
              title={`Connected as @${user.login}`}
            >
              {user.avatar_url && (
                <Image
                  src={user.avatar_url}
                  alt={user.login}
                  width={20}
                  height={20}
                  className="rounded-full"
                  unoptimized
                />
              )}
              <span className="text-xs font-mono text-indigo-300 hidden sm:inline">
                @{user.login}
              </span>
            </Link>
          ) : (
            <Link
              href="/#analyze-github"
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-300 hover:text-white transition-colors"
              title="Analyze a GitHub profile"
            >
              <GitHubIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Analyze</span>
            </Link>
          )}

          {!pathname.startsWith("/studio") && (
            <Link href="/studio">
              <Button
                size="sm"
                variant="glow"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Start Building
              </Button>
            </Link>
          )}

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden border-b border-slate-800 bg-[#090a0f] px-4 pt-2 pb-4 space-y-1.5"
        >
          {primaryLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-2 mt-2 border-t border-slate-800/80 space-y-1">
            <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Assets &amp; Explorers
            </span>
            {assetLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium ${
                  pathname.startsWith(item.href)
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
