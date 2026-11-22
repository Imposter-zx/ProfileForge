// lib/github/auth.ts
import { GitHubUser, GitHubSession } from "./session";

export interface GitHubAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
  scopes?: string[];
}

export function getGitHubAuthConfig(): GitHubAuthConfig {
  const clientId =
    process.env.GITHUB_CLIENT_ID ||
    process.env.GITHUB_APP_CLIENT_ID ||
    "";
  const clientSecret =
    process.env.GITHUB_CLIENT_SECRET ||
    process.env.GITHUB_APP_CLIENT_SECRET ||
    "";

  return {
    clientId,
    clientSecret,
    scopes: ["read:user", "repo"],
  };
}

/**
 * Builds the GitHub OAuth authorization URL
 */
export function buildGitHubAuthorizeUrl(params: {
  clientId: string;
  redirectUri?: string;
  state: string;
  scopes?: string[];
  allowSignup?: boolean;
}): string {
  const base = "https://github.com/login/oauth/authorize";
  const searchParams = new URLSearchParams({
    client_id: params.clientId,
    state: params.state,
    scope: (params.scopes || ["read:user", "repo"]).join(" "),
    allow_signup: params.allowSignup !== false ? "true" : "false",
  });

  if (params.redirectUri) {
    searchParams.set("redirect_uri", params.redirectUri);
  }

  return `${base}?${searchParams.toString()}`;
}

/**
 * Exchanges authorization code for GitHub access token
 */
export async function exchangeOAuthCode(params: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
}): Promise<{
  accessToken: string;
  tokenType: string;
  scope: string;
}> {
  const tokenUrl = "https://github.com/login/oauth/access_token";

  const bodyParams = new URLSearchParams({
    client_id: params.clientId,
    client_secret: params.clientSecret,
    code: params.code,
  });

  if (params.redirectUri) {
    bodyParams.set("redirect_uri", params.redirectUri);
  }

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Profile-Forge-Studio/1.0",
    },
    body: bodyParams.toString(),
  });

  if (!response.ok) {
    throw new Error(`GitHub token exchange failed with status ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    const desc = data.error_description ? `${data.error}: ${data.error_description}` : data.error;
    throw new Error(`GitHub authorization error: ${desc}`);
  }

  if (!data.access_token) {
    throw new Error("No access token returned from GitHub OAuth");
  }

  return {
    accessToken: data.access_token,
    tokenType: data.token_type || "bearer",
    scope: data.scope || "",
  };
}

/**
 * Fetches authenticated user profile from GitHub API
 */
export async function fetchAuthenticatedUser(accessToken: string): Promise<GitHubUser> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Profile-Forge-Studio/1.0",
    },
  });

  if (response.status === 401) {
    throw new Error("GitHub access token is expired or revoked (401 Unauthorized)");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile from GitHub: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    login: data.login,
    name: data.name || null,
    avatar_url: data.avatar_url,
    html_url: data.html_url,
    email: data.email || null,
  };
}

/**
 * Creates full session object from token and user data
 */
export function buildSession(
  user: GitHubUser,
  tokenData: { accessToken: string; tokenType: string; scope: string },
  installationId?: number | null
): GitHubSession {
  return {
    accessToken: tokenData.accessToken,
    tokenType: tokenData.tokenType,
    scope: tokenData.scope,
    user,
    createdAt: Date.now(),
    installationId: installationId || null,
  };
}
