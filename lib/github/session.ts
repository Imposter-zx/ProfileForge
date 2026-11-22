// lib/github/session.ts
import { cookies } from "next/headers";
import { encryptPayload, decryptPayload } from "./crypto";

export const SESSION_COOKIE_NAME = "pf_gh_session";
export const CSRF_COOKIE_NAME = "pf_gh_oauth_state";

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  email: string | null;
}

export interface GitHubSession {
  accessToken: string;
  tokenType: string;
  scope: string;
  user: GitHubUser;
  createdAt: number;
  installationId?: number | null;
}

export interface PublicSessionUser {
  connected: boolean;
  user: GitHubUser | null;
  scope?: string;
  createdAt?: number;
}

/**
 * Serializes and encrypts session into an opaque, tamper-proof cookie string.
 */
export function serializeSession(session: GitHubSession): string {
  const json = JSON.stringify(session);
  return encryptPayload(json);
}

/**
 * Decrypts and parses session from encrypted cookie string.
 */
export function deserializeSession(cookieValue: string): GitHubSession | null {
  const decrypted = decryptPayload(cookieValue);
  if (!decrypted) return null;

  try {
    const parsed = JSON.parse(decrypted) as GitHubSession;
    if (!parsed.accessToken || !parsed.user?.login) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Standard cookie configuration for secure HttpOnly session cookies.
 */
export function getSessionCookieOptions(maxAgeSeconds = 30 * 24 * 60 * 60) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/**
 * Helper to get current session from server context (e.g. inside Route Handlers).
 */
export async function getSessionFromServer(): Promise<GitHubSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return null;

    return deserializeSession(sessionCookie.value);
  } catch {
    return null;
  }
}
