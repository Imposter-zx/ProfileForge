// components/navigation/Navbar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Terminal,
  Layers,
  Code2,
  FileCode2,
  Menu,
  X,
  Palette,
} from "lucide-react";
import Image from "next/image";
import { GitHubIcon } from "../ui/GitHubIcon";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { useGitHubAuth } from "@/hooks/useGitHubAuth";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isConnected } = useGitHubAuth();

  const navLinks = [
    { href: "/", label: "Analyzer", icon: <Terminal className="w-4 h-4" /> },
    {
      href: "/studio",
      label: "Studio",
      icon: <Layers className="w-4 h-4" />,
      badge: "Live",
    },
    {
      href: "/ascii",
      label: "ASCII Gallery",
      icon: <Sparkles className="w-4 h-4" />,
      badge: "217+",
    },
    {
      href: "/assets",
      label: "Assets & Banners",
      icon: <Palette className="w-4 h-4" />,
      badge: "New",
    },
    {
      href: "/templates",
      label: "Templates",
      icon: <FileCode2 className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090a0f]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">
                Profile<span className="text-indigo-400">Forge</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono font-medium">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              ASCII README Studio
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
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
                    ? "bg-slate-800/80 text-white border border-slate-700/60"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
                {link.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      link.badge === "Live"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-2.5">
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
                  width={22}
                  height={22}
                  className="rounded-full"
                  unoptimized
                />
              )}
              <span className="text-xs font-mono text-indigo-300 hidden sm:inline">
                @{user.login}
              </span>
            </Link>
          ) : (
            <a
              href="/api/auth/github/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-xs text-slate-300 hover:text-white transition-colors"
              title="Connect GitHub account"
            >
              <GitHubIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Connect</span>
            </a>
          )}

          <Link href="/studio">
            <Button
              size="sm"
              variant="glow"
              leftIcon={<Layers className="w-4 h-4" />}
            >
              Open Studio
            </Button>
          </Link>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Toggle menu"
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
        <div className="md:hidden border-b border-slate-800 bg-[#090a0f] px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  {link.icon}
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <Badge variant="indigo" size="sm">
                    {link.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
