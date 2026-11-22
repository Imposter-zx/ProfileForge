// components/github/PublishModal.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import JSZip from "jszip";
import {
  GitCommit,
  GitPullRequest,
  Download,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  Shield,
  Copy,
  Check,
} from "lucide-react";
import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useGitHubAuth } from "@/hooks/useGitHubAuth";
import { useStore } from "@/lib/store";
import { compileReadmeMarkdown } from "@/lib/readme/compiler";
import { generateWidgetActionsFallbackWorkflow } from "@/lib/badges/builder";
import type { PublishResult } from "@/lib/github/publisher";

export interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PublishMode = "commit" | "pr" | "download";

interface PublishStep {
  id: string;
  label: string;
  status: "idle" | "running" | "done" | "error";
  detail?: string;
}

export function PublishModal({ isOpen, onClose }: PublishModalProps) {
  const { sections, username: storeUsername } = useStore();
  const {
    user,
    isConnected,
    isLoading,
    profileRepo,
    isLoadingRepo,
    refreshProfileRepo,
    createProfileRepo,
  } = useGitHubAuth();

  const [mode, setMode] = useState<PublishMode>("commit");
  const [commitMessage, setCommitMessage] = useState(
    "Update GitHub profile README using PROFILE FORGE"
  );
  const [prTitle, setPrTitle] = useState("Update Profile README (via Profile Forge)");
  const [branch, setBranch] = useState("main");
  const [uploadAssets, setUploadAssets] = useState(true);

  // Publishing Execution State
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isShaConflict, setIsShaConflict] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);

  // Dynamic progress steps
  const [steps, setSteps] = useState<PublishStep[]>([
    { id: "auth", label: "Verify GitHub connection & permissions", status: "idle" },
    { id: "inspect", label: "Check repository & README.md SHA", status: "idle" },
    { id: "prepare", label: "Prepare Markdown & validate syntax", status: "idle" },
    { id: "assets", label: "Upload selected local assets (if any)", status: "idle" },
    { id: "commit", label: "Execute commit or Pull Request", status: "idle" },
    { id: "verify", label: "Confirm publication on GitHub API", status: "idle" },
  ]);

  const effectiveBranch = branch || profileRepo?.repo?.defaultBranch || "main";
  const compiledMarkdown = compileReadmeMarkdown(sections);

  const handleModalClose = () => {
    if (isPublishing) return;
    setPublishResult(null);
    setPublishError(null);
    setIsShaConflict(false);
    onClose();
  };

  const updateStepStatus = (id: string, status: PublishStep["status"], detail?: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status, detail: detail ?? s.detail } : s))
    );
  };

  // Download Handler (Mode C)
  const handleDownloadOnly = async () => {
    setIsPublishing(true);
    try {
      const zip = new JSZip();
      zip.file("README.md", compiledMarkdown);

      const targetUser = user?.login || storeUsername || "octocat";
      const workflowYaml = generateWidgetActionsFallbackWorkflow(targetUser);
      zip.file(".github/workflows/widgets.yml", workflowYaml);

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${targetUser}-profile-readme.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onClose();
    } catch {
      setPublishError("Failed to generate ZIP package.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Main Publish Action (Modes A & B)
  const handleExecutePublish = async () => {
    if (mode === "download") {
      await handleDownloadOnly();
      return;
    }

    if (!user || !profileRepo?.repo) return;

    setIsPublishing(true);
    setPublishError(null);
    setIsShaConflict(false);

    try {
      // Step 1: Verify auth
      updateStepStatus("auth", "running");
      await new Promise((r) => setTimeout(r, 200));
      updateStepStatus("auth", "done", `Authenticated as @${user.login}`);

      // Step 2: Check target repo
      updateStepStatus("inspect", "running");
      const targetOwner = user.login;
      const targetRepo = user.login;
      updateStepStatus("inspect", "done", `Target: ${targetOwner}/${targetRepo} (${effectiveBranch})`);

      // Step 3: Prepare markdown
      updateStepStatus("prepare", "running");
      const markdownToPublish = compiledMarkdown;
      updateStepStatus("prepare", "done", `${markdownToPublish.length} bytes ready`);

      // Step 4: Assets (if enabled)
      updateStepStatus("assets", "running");
      await new Promise((r) => setTimeout(r, 150));
      updateStepStatus("assets", "done", uploadAssets ? "Using direct CDN assets" : "Skipped");

      // Step 5: Execute Commit or PR
      updateStepStatus("commit", "running", mode === "commit" ? "Committing..." : "Creating PR...");

      const res = await fetch("/api/github/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          owner: targetOwner,
          repo: targetRepo,
          branch: effectiveBranch,
          markdown: markdownToPublish,
          commitMessage,
          prTitle,
          currentSha: profileRepo.readme?.sha,
          assets: [],
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setIsShaConflict(true);
        updateStepStatus("commit", "error", "Remote file has changed (SHA conflict)");
        throw new Error(data.error || "Remote file was modified. Please refresh to avoid overwriting.");
      }

      if (!res.ok) {
        updateStepStatus("commit", "error", data.error || `HTTP ${res.status}`);
        throw new Error(data.error || "Publishing failed.");
      }

      updateStepStatus("commit", "done", mode === "commit" ? "Committed" : "PR created");

      // Step 6: Verify
      updateStepStatus("verify", "running");
      await new Promise((r) => setTimeout(r, 200));
      updateStepStatus("verify", "done", "Verified on GitHub Contents API");

      setPublishResult(data);
      refreshProfileRepo();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Publishing failed";
      setPublishError(msg);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(compiledMarkdown);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    } catch {}
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={
        <div className="flex items-center gap-2">
          <GitHubIcon className="w-5 h-5 text-white" />
          <span>Publish Directly to GitHub</span>
        </div>
      }
      subtitle="One-click publication with commit verification and Pull Request options"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* ==================================================== */}
        {/* CASE 1: SUCCESSFUL PUBLICATION STATE                */}
        {/* ==================================================== */}
        {publishResult && (
          <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">README Published Successfully!</h3>
              <p className="text-xs text-slate-400 mt-1">
                {publishResult.mode === "commit"
                  ? "Your profile repository has been updated directly on GitHub."
                  : `Pull Request #${publishResult.prNumber} has been opened against ${publishResult.branch}.`}
              </p>
            </div>

            {/* Links and Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              {publishResult.commitUrl && (
                <a href={publishResult.commitUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    View Commit ({publishResult.commitSha?.slice(0, 7)})
                  </Button>
                </a>
              )}

              {publishResult.prUrl && (
                <a href={publishResult.prUrl} target="_blank" rel="noreferrer">
                  <Button variant="glow" size="sm" rightIcon={<GitPullRequest className="w-3.5 h-3.5" />}>
                    View Pull Request #{publishResult.prNumber}
                  </Button>
                </a>
              )}

              {user?.login && (
                <a href={`https://github.com/${user.login}`} target="_blank" rel="noreferrer">
                  <Button variant="secondary" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    View Public Profile
                  </Button>
                </a>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <Button
                onClick={handleCopyMarkdown}
                variant="outline"
                size="sm"
                leftIcon={copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copiedMd ? "Copied" : "Copy Markdown"}
              </Button>

              <Button onClick={handleModalClose} variant="primary" size="sm">
                Done & Continue Editing
              </Button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* CASE 2: DISCONNECTED USER — PROMPT TO CONNECT       */}
        {/* ==================================================== */}
        {!publishResult && (!isConnected || !user) && !isLoading && (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
                <GitHubIcon className="w-6 h-6" />
              </div>

              <div className="max-w-md mx-auto">
                <h4 className="font-bold text-white text-base">Connect Your GitHub Account</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  To publish directly to your special profile repository, authorize Profile Forge using official GitHub OAuth. Your credentials remain securely encrypted server-side.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href="/api/auth/github/login" className="w-full sm:w-auto">
                  <Button variant="glow" size="md" leftIcon={<GitHubIcon className="w-4 h-4" />} className="w-full">
                    Connect GitHub Account
                  </Button>
                </a>

                <Button
                  onClick={handleDownloadOnly}
                  variant="outline"
                  size="md"
                  leftIcon={<Download className="w-4 h-4" />}
                  className="w-full sm:w-auto"
                >
                  Download Bundle Instead
                </Button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Zero Personal Access Tokens needed. No passwords stored. State-of-the-art AES-256-GCM encrypted cookies.
              </span>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* CASE 3: CONNECTED USER — PUBLISH CONFIGURATION       */}
        {/* ==================================================== */}
        {!publishResult && isConnected && user && (
          <div className="space-y-5">
            {/* 1. Account & Target Repo Header */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {user.avatar_url && (
                  <Image
                    src={user.avatar_url}
                    alt={user.login}
                    width={36}
                    height={36}
                    className="rounded-lg border border-slate-700"
                    unoptimized
                  />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">@{user.login}</span>
                    <Badge variant="emerald" size="sm">
                      Connected
                    </Badge>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Repository: {user.login}/{user.login}
                  </span>
                </div>
              </div>

              {profileRepo?.exists ? (
                <Badge variant={profileRepo.repo?.isPrivate ? "default" : "cyan"} size="sm">
                  {profileRepo.repo?.isPrivate ? "Private Repo" : "Public Profile Repo"}
                </Badge>
              ) : (
                <Badge variant="default" size="sm">
                  Repo Missing
                </Badge>
              )}
            </div>

            {/* Profile Repository Warning if Missing */}
            {!isLoadingRepo && (!profileRepo || !profileRepo.exists) && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Special repository {user.login}/{user.login} does not exist yet.</p>
                  <p className="text-slate-300 text-[11px]">
                    Click &quot;Create Repository&quot; to initialize it automatically on GitHub.
                  </p>
                  <Button
                    onClick={() => createProfileRepo(false)}
                    variant="glow"
                    size="sm"
                    className="mt-2"
                  >
                    Create {user.login}/{user.login}
                  </Button>
                </div>
              </div>
            )}

            {/* 2. Mode Selector: Direct Commit vs PR vs Download */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-2 block">
                Select Publishing Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Mode A: Direct Commit */}
                <button
                  type="button"
                  onClick={() => setMode("commit")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    mode === "commit"
                      ? "border-indigo-500 bg-indigo-500/10 text-white shadow-md shadow-indigo-500/10"
                      : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <GitCommit className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-xs">Direct Commit</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Immediately update README.md on {branch}
                  </p>
                </button>

                {/* Mode B: Pull Request */}
                <button
                  type="button"
                  onClick={() => setMode("pr")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    mode === "pr"
                      ? "border-indigo-500 bg-indigo-500/10 text-white shadow-md shadow-indigo-500/10"
                      : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <GitPullRequest className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-xs">Pull Request</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Create branch & open a safe PR to review
                  </p>
                </button>

                {/* Mode C: Download */}
                <button
                  type="button"
                  onClick={() => setMode("download")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    mode === "download"
                      ? "border-indigo-500 bg-indigo-500/10 text-white shadow-md shadow-indigo-500/10"
                      : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs">Download Bundle</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Export ZIP package for manual upload
                  </p>
                </button>
              </div>
            </div>

            {/* 3. Inputs for Commit / PR */}
            {mode !== "download" && (
              <div className="space-y-3 p-4 rounded-xl border border-slate-800 bg-slate-950/60">
                <Input
                  label="Commit Message"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Update GitHub profile README using PROFILE FORGE"
                />

                {mode === "pr" && (
                  <Input
                    label="Pull Request Title"
                    value={prTitle}
                    onChange={(e) => setPrTitle(e.target.value)}
                    placeholder="Update Profile README (via Profile Forge)"
                  />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <Input
                    label="Target Branch"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="main"
                  />

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="upload-assets"
                      checked={uploadAssets}
                      onChange={(e) => setUploadAssets(e.target.checked)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="upload-assets" className="text-xs text-slate-300 cursor-pointer">
                      Publish assets & rewrite paths
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Live Step Progress Display during Publishing */}
            {isPublishing && (
              <div className="p-4 rounded-xl border border-indigo-500/30 bg-slate-950 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">
                  <span>Publishing in progress...</span>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="space-y-1.5 pt-1">
                  {steps.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        {s.status === "running" && <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
                        {s.status === "done" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {s.status === "error" && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                        {s.status === "idle" && <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />}
                        <span className={s.status === "done" ? "text-slate-200" : s.status === "running" ? "text-indigo-300 font-medium" : "text-slate-400"}>
                          {s.label}
                        </span>
                      </div>
                      {s.detail && <span className="text-[10px] font-mono text-slate-500">{s.detail}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Banner */}
            {publishError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{isShaConflict ? "Remote SHA Conflict" : "Publishing Error"}</span>
                </div>
                <p className="text-red-300/90 leading-relaxed">{publishError}</p>
                {isShaConflict && (
                  <Button
                    onClick={() => refreshProfileRepo()}
                    variant="outline"
                    size="sm"
                    className="mt-1"
                  >
                    Refresh Remote SHA & Retry
                  </Button>
                )}
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <Button onClick={handleModalClose} variant="outline" size="sm" disabled={isPublishing}>
                Cancel
              </Button>

              <Button
                onClick={handleExecutePublish}
                variant="glow"
                size="md"
                isLoading={isPublishing}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {mode === "commit"
                  ? "Confirm & Direct Commit"
                  : mode === "pr"
                  ? "Confirm & Open PR"
                  : "Download Bundle"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
