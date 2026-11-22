// components/github/GitHubConnectCard.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  AlertTriangle,
  FolderGit2,
  ExternalLink,
  Plus,
  RefreshCw,
  LogOut,
  Shield,
  FileText,
} from "lucide-react";
import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useGitHubAuth } from "@/hooks/useGitHubAuth";

export function GitHubConnectCard() {
  const {
    user,
    isConnected,
    isLoading,
    profileRepo,
    isLoadingRepo,
    refreshProfileRepo,
    createProfileRepo,
    disconnect,
  } = useGitHubAuth();

  const [isCreatingRepo, setIsCreatingRepo] = useState(false);

  const handleCreateRepo = async () => {
    setIsCreatingRepo(true);
    await createProfileRepo(false);
    setIsCreatingRepo(false);
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-slate-900/60 border-slate-800 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-800" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 bg-slate-800 rounded" />
            <div className="h-3 w-48 bg-slate-800 rounded" />
          </div>
        </div>
      </Card>
    );
  }

  // DISCONNECTED STATE
  if (!isConnected || !user) {
    return (
      <Card glow className="p-6 bg-slate-900/80 border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
              <GitHubIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Connect GitHub Account</h3>
                <Badge variant="default" size="sm">
                  Disconnected
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Authorize Profile Forge to automatically detect your profile repository and publish READMEs with one click.
              </p>
            </div>
          </div>

          <a href="/api/auth/github/login" className="w-full sm:w-auto shrink-0">
            <Button variant="glow" size="md" leftIcon={<GitHubIcon className="w-4 h-4" />}>
              Connect with GitHub
            </Button>
          </a>
        </div>

        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            Tokens encrypted server-side with AES-256-GCM
          </span>
          <span>•</span>
          <span>Official OAuth App & GitHub App flow</span>
          <span>•</span>
          <span>No password or token pasting</span>
        </div>
      </Card>
    );
  }

  // CONNECTED STATE
  return (
    <div className="space-y-4">
      {/* 1. Account Info Card */}
      <Card glow className="p-5 bg-slate-900/80 border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.login}
                width={48}
                height={48}
                className="rounded-xl border border-indigo-500/40 shadow"
                unoptimized
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-indigo-600/30 flex items-center justify-center font-bold text-indigo-300">
                {user.login[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">{user.name || user.login}</h3>
                <span className="text-xs font-mono text-indigo-300">@{user.login}</span>
                <Badge variant="emerald" size="sm" className="gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Connected
                </Badge>
              </div>
              <a
                href={user.html_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-400 hover:text-indigo-300 inline-flex items-center gap-1 mt-0.5"
              >
                <span>github.com/{user.login}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={() => disconnect()}
              variant="outline"
              size="sm"
              leftIcon={<LogOut className="w-3.5 h-3.5 text-slate-400" />}
            >
              Disconnect
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. Detected Profile Repository Card */}
      <Card className="p-5 bg-slate-950/70 border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
            <h4 className="font-semibold text-sm text-slate-200">Detected Profile Repository</h4>
          </div>
          <button
            onClick={() => refreshProfileRepo()}
            disabled={isLoadingRepo}
            className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 disabled:opacity-50"
            title="Refresh repository status"
          >
            <RefreshCw className={`w-3 h-3 ${isLoadingRepo ? "animate-spin" : ""}`} />
            <span>Check</span>
          </button>
        </div>

        {/* Loading state for repo */}
        {isLoadingRepo && (
          <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Scanning repositories for {user.login}/{user.login}...</span>
          </div>
        )}

        {/* Repository Found */}
        {!isLoadingRepo && profileRepo?.exists && profileRepo.repo && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-white">
                    {profileRepo.repo.fullName}
                  </span>
                  <Badge variant={profileRepo.repo.isPrivate ? "default" : "cyan"} size="sm">
                    {profileRepo.repo.isPrivate ? "Private" : "Public"}
                  </Badge>
                  <span className="text-[11px] font-mono text-slate-400">
                    branch: {profileRepo.repo.defaultBranch}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {profileRepo.repo.description || "Special repository for your public GitHub profile."}
                </p>
              </div>

              <a
                href={profileRepo.repo.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0"
              >
                <Button variant="secondary" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                  Open Repo
                </Button>
              </a>
            </div>

            {/* README Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[11px]">README.md Status</span>
                  <span className="font-semibold text-slate-200">
                    {profileRepo.readme?.exists
                      ? `Existing (${profileRepo.readme.sha?.slice(0, 7)})`
                      : "Not created yet (Ready for creation)"}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Write Permission</span>
                  <span className="font-semibold text-emerald-300">
                    {profileRepo.repo.canPush ? "Push permission verified" : "Read-only"}
                  </span>
                </div>
              </div>
            </div>

            {profileRepo.repo.isPrivate && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span>
                  <strong>Note:</strong> This repository is private. GitHub only displays READMEs on your public profile if the special repository is <strong>Public</strong>.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Repository NOT Found */}
        {!isLoadingRepo && (!profileRepo || !profileRepo.exists) && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="font-semibold text-sm text-amber-200">
                  Profile repository <code className="font-mono">{user.login}/{user.login}</code> not found
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  GitHub requires a special public repository with the exact same name as your username to display a README directly on your profile page.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                onClick={handleCreateRepo}
                variant="glow"
                size="sm"
                isLoading={isCreatingRepo}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Create {user.login}/{user.login}
              </Button>

              <a
                href={`https://github.com/new?name=${user.login}&public=true&description=My+GitHub+Profile+README`}
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                  Create manually on GitHub
                </Button>
              </a>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
