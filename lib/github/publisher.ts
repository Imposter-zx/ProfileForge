// lib/github/publisher.ts

export interface ProfileRepoInfo {
  exists: boolean;
  repo?: {
    name: string;
    fullName: string;
    htmlUrl: string;
    defaultBranch: string;
    isPrivate: boolean;
    canPush: boolean;
    description: string | null;
  };
  readme?: {
    exists: boolean;
    sha?: string;
    path: string;
    content?: string;
    htmlUrl?: string;
    downloadUrl?: string;
  };
  error?: string;
}

export interface PublishAssetItem {
  filename: string;
  contentBase64: string;
  mimeType?: string;
}

export interface PublishOptions {
  mode: "commit" | "pr";
  owner: string;
  repo: string;
  branch?: string;
  markdown: string;
  commitMessage: string;
  prTitle?: string;
  prBody?: string;
  currentSha?: string;
  assets?: PublishAssetItem[];
}

export interface PublishResult {
  success: boolean;
  mode: "commit" | "pr";
  branch: string;
  commitSha: string;
  commitUrl?: string;
  prNumber?: number;
  prUrl?: string;
  readmeUrl: string;
  uploadedAssets: string[];
}

export class GitHubApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "GitHubApiError";
    this.status = status;
    this.data = data;
  }
}

export class ShaConflictError extends GitHubApiError {
  constructor(message = "README.md has been modified remotely. Please refresh and review changes before publishing.") {
    super(message, 409);
    this.name = "ShaConflictError";
  }
}

/**
 * Standard GitHub API request helper with auth & version headers
 */
async function githubRequest<T = unknown>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<{ data: T; status: number; headers: Headers }> {
  const url = endpoint.startsWith("http") ? endpoint : `https://api.github.com${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      Authorization: `Bearer ${token}`,
      "User-Agent": "Profile-Forge-Studio/1.0",
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    throw new GitHubApiError("Unauthorized: GitHub token expired or invalid", 401);
  }

  if (response.status === 403) {
    const rateRemaining = response.headers.get("x-ratelimit-remaining");
    if (rateRemaining === "0") {
      throw new GitHubApiError("GitHub API rate limit exceeded. Please try again later.", 403);
    }
    throw new GitHubApiError("Forbidden: Insufficient permissions to access or write to this repository.", 403);
  }

  if (response.status === 409) {
    throw new ShaConflictError();
  }

  // Allow 404 to be handled by caller
  if (!response.ok && response.status !== 404) {
    let errBody: { message?: string } | null = null;
    try {
      errBody = await response.json();
    } catch {}
    throw new GitHubApiError(
      errBody?.message || `GitHub API request failed (${response.status})`,
      response.status,
      errBody
    );
  }

  let data: T;
  try {
    data = (await response.json()) as T;
  } catch {
    data = {} as T;
  }

  return { data, status: response.status, headers: response.headers };
}

/**
 * Automatically inspects the user's special profile repository (username/username)
 */
export async function detectProfileRepository(
  token: string,
  username: string
): Promise<ProfileRepoInfo> {
  const repoRes = await githubRequest<{
    name: string;
    full_name: string;
    html_url: string;
    default_branch: string;
    private: boolean;
    permissions?: { push: boolean; admin: boolean };
    description: string | null;
  }>(`/repos/${encodeURIComponent(username)}/${encodeURIComponent(username)}`, token);

  if (repoRes.status === 404) {
    return {
      exists: false,
      error: `Repository ${username}/${username} not found. Create it on GitHub to display your README on your profile.`,
    };
  }

  const r = repoRes.data;
  const canPush = r.permissions?.push ?? true;

  // Check README.md
  let readmeInfo: {
    exists: boolean;
    sha?: string;
    path: string;
    content?: string;
    htmlUrl?: string;
    downloadUrl?: string;
  } = {
    exists: false,
    path: "README.md",
  };

  const readmeRes = await githubRequest<{
    name: string;
    path: string;
    sha: string;
    content?: string;
    encoding?: string;
    html_url?: string;
    download_url?: string;
  }>(`/repos/${encodeURIComponent(username)}/${encodeURIComponent(username)}/contents/README.md?ref=${r.default_branch}`, token);

  if (readmeRes.status === 200 && readmeRes.data?.sha) {
    let content: string | undefined = undefined;
    if (readmeRes.data.content && readmeRes.data.encoding === "base64") {
      try {
        content = Buffer.from(readmeRes.data.content, "base64").toString("utf8");
      } catch {}
    }

    readmeInfo = {
      exists: true,
      sha: readmeRes.data.sha,
      path: "README.md",
      content,
      htmlUrl: readmeRes.data.html_url,
      downloadUrl: readmeRes.data.download_url,
    };
  }

  return {
    exists: true,
    repo: {
      name: r.name,
      fullName: r.full_name,
      htmlUrl: r.html_url,
      defaultBranch: r.default_branch || "main",
      isPrivate: r.private,
      canPush,
      description: r.description,
    },
    readme: readmeInfo,
  };
}

/**
 * Creates the special profile repository (username/username) with auto_init
 */
export async function createProfileRepository(
  token: string,
  username: string,
  isPrivate = false
): Promise<ProfileRepoInfo> {
  const createRes = await githubRequest<{
    name: string;
    full_name: string;
    html_url: string;
    default_branch: string;
    private: boolean;
    description: string | null;
  }>("/user/repos", token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: username,
      description: "My GitHub Profile README - Powered by Profile Forge",
      private: isPrivate,
      auto_init: true,
    }),
  });

  if (createRes.status !== 201) {
    throw new GitHubApiError("Failed to create profile repository on GitHub", createRes.status, createRes.data);
  }

  return detectProfileRepository(token, username);
}

/**
 * Uploads an asset (SVG, PNG, GIF) to assets/profile-forge/ in the repository
 */
export async function uploadRepositoryAsset(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  asset: PublishAssetItem
): Promise<{ path: string; rawUrl: string; sha: string }> {
  const cleanFilename = asset.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const targetPath = `assets/profile-forge/${cleanFilename}`;

  // Check if file already exists to get its SHA for update
  let currentSha: string | undefined = undefined;
  try {
    const existing = await githubRequest<{ sha: string }>(
      `/repos/${owner}/${repo}/contents/${targetPath}?ref=${branch}`,
      token
    );
    if (existing.status === 200 && existing.data?.sha) {
      currentSha = existing.data.sha;
    }
  } catch {}

  const uploadRes = await githubRequest<{
    content: { sha: string; html_url: string; download_url: string };
  }>(`/repos/${owner}/${repo}/contents/${targetPath}`, token, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `Upload asset ${cleanFilename} via Profile Forge`,
      content: asset.contentBase64,
      branch,
      sha: currentSha,
    }),
  });

  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${targetPath}`;

  return {
    path: targetPath,
    rawUrl,
    sha: uploadRes.data?.content?.sha || "",
  };
}

/**
 * Replaces local asset references in Markdown with the uploaded GitHub paths/URLs
 */
export function rewriteMarkdownAssetUrls(
  markdown: string,
  assetMap: Record<string, string> // localFilename -> repoPath or rawUrl
): string {
  let result = markdown;
  for (const [filename, newUrl] of Object.entries(assetMap)) {
    // Replace relative paths like ./assets/filename or src="assets/filename"
    const escaped = filename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex1 = new RegExp(`(?<=src=["'])(\\./)?(assets/)?${escaped}(?=["'])`, "g");
    const regex2 = new RegExp(`(?<=\\()(\\./)?(assets/)?${escaped}(?=\\))`, "g");
    result = result.replace(regex1, newUrl).replace(regex2, newUrl);
  }
  return result;
}

/**
 * Publishes README.md directly to repository (Direct Commit Mode)
 */
export async function publishDirectCommit(
  token: string,
  options: PublishOptions
): Promise<PublishResult> {
  const { owner, repo, branch = "main", markdown, commitMessage, currentSha, assets = [] } = options;

  let finalMarkdown = markdown;
  const uploadedAssets: string[] = [];

  // 1. Upload selected assets if any
  if (assets.length > 0) {
    const assetMap: Record<string, string> = {};
    for (const asset of assets) {
      const up = await uploadRepositoryAsset(token, owner, repo, branch, asset);
      assetMap[asset.filename] = `./${up.path}`;
      uploadedAssets.push(up.path);
    }
    finalMarkdown = rewriteMarkdownAssetUrls(markdown, assetMap);
  }

  // 2. Fetch fresh SHA if not explicitly provided or to prevent stale conflicts
  let shaToUse = currentSha;
  if (!shaToUse) {
    try {
      const existing = await githubRequest<{ sha: string }>(
        `/repos/${owner}/${repo}/contents/README.md?ref=${branch}`,
        token
      );
      if (existing.status === 200 && existing.data?.sha) {
        shaToUse = existing.data.sha;
      }
    } catch {}
  }

  // 3. Commit README.md
  const base64Content = Buffer.from(finalMarkdown, "utf8").toString("base64");
  const commitRes = await githubRequest<{
    commit: { sha: string; html_url: string };
    content: { html_url: string };
  }>(`/repos/${owner}/${repo}/contents/README.md`, token, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: commitMessage || "Update GitHub profile README using PROFILE FORGE",
      content: base64Content,
      branch,
      sha: shaToUse || undefined,
    }),
  });

  const commitSha = commitRes.data?.commit?.sha || "";
  const commitUrl = commitRes.data?.commit?.html_url || `https://github.com/${owner}/${repo}/commit/${commitSha}`;
  const readmeUrl = `https://github.com/${owner}/${repo}/blob/${branch}/README.md`;

  return {
    success: true,
    mode: "commit",
    branch,
    commitSha,
    commitUrl,
    readmeUrl,
    uploadedAssets,
  };
}

/**
 * Publishes README.md by creating a dedicated branch and opening a Pull Request (PR Mode)
 */
export async function publishViaPullRequest(
  token: string,
  options: PublishOptions
): Promise<PublishResult> {
  const { owner, repo, branch: baseBranch = "main", markdown, commitMessage, prTitle, prBody, assets = [] } = options;

  // 1. Get base branch latest commit SHA
  const refRes = await githubRequest<{ object: { sha: string } }>(
    `/repos/${owner}/${repo}/git/ref/heads/${baseBranch}`,
    token
  );

  if (refRes.status !== 200 || !refRes.data?.object?.sha) {
    throw new GitHubApiError(`Could not find base branch "${baseBranch}" in ${owner}/${repo}`, 404);
  }

  const baseCommitSha = refRes.data.object.sha;

  // 2. Create new branch: profile-forge/patch-<timestamp>
  const newBranchName = `profile-forge/patch-${Date.now()}`;
  await githubRequest(`/repos/${owner}/${repo}/git/refs`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ref: `refs/heads/${newBranchName}`,
      sha: baseCommitSha,
    }),
  });

  // 3. Upload assets to new branch if any
  let finalMarkdown = markdown;
  const uploadedAssets: string[] = [];
  if (assets.length > 0) {
    const assetMap: Record<string, string> = {};
    for (const asset of assets) {
      const up = await uploadRepositoryAsset(token, owner, repo, newBranchName, asset);
      assetMap[asset.filename] = `./${up.path}`;
      uploadedAssets.push(up.path);
    }
    finalMarkdown = rewriteMarkdownAssetUrls(markdown, assetMap);
  }

  // 4. Check if README.md exists on the new branch to get its SHA
  let branchReadmeSha: string | undefined = undefined;
  try {
    const existing = await githubRequest<{ sha: string }>(
      `/repos/${owner}/${repo}/contents/README.md?ref=${newBranchName}`,
      token
    );
    if (existing.status === 200 && existing.data?.sha) {
      branchReadmeSha = existing.data.sha;
    }
  } catch {}

  // 5. Commit README.md to new branch
  const base64Content = Buffer.from(finalMarkdown, "utf8").toString("base64");
  const commitRes = await githubRequest<{
    commit: { sha: string; html_url: string };
  }>(`/repos/${owner}/${repo}/contents/README.md`, token, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: commitMessage || "Update GitHub profile README using PROFILE FORGE",
      content: base64Content,
      branch: newBranchName,
      sha: branchReadmeSha || undefined,
    }),
  });

  const commitSha = commitRes.data?.commit?.sha || "";
  const commitUrl = commitRes.data?.commit?.html_url;

  // 6. Create Pull Request
  const title = prTitle || "Update Profile README (via Profile Forge)";
  const body =
    prBody ||
    `### 🚀 Profile README Update\n\nThis Pull Request was generated automatically using **[Profile Forge](https://github.com/Imposter-zx/ProfileForge)**.\n\n- ✨ Features updated layout, modern badges & dynamic widgets\n- 🛡️ Sanitized and validated against GitHub README rendering restrictions\n\n*Review the diff and merge when ready!*`;

  const prRes = await githubRequest<{
    number: number;
    html_url: string;
  }>(`/repos/${owner}/${repo}/pulls`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      head: newBranchName,
      base: baseBranch,
      body,
    }),
  });

  if (prRes.status !== 201) {
    throw new GitHubApiError("Failed to create Pull Request on GitHub", prRes.status, prRes.data);
  }

  return {
    success: true,
    mode: "pr",
    branch: newBranchName,
    commitSha,
    commitUrl,
    prNumber: prRes.data.number,
    prUrl: prRes.data.html_url,
    readmeUrl: `https://github.com/${owner}/${repo}/blob/${newBranchName}/README.md`,
    uploadedAssets,
  };
}
