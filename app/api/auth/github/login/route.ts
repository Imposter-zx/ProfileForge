// app/api/auth/github/login/route.ts
import { NextResponse } from "next/server";
import { buildGitHubAuthorizeUrl, getGitHubAuthConfig } from "@/lib/github/auth";
import { generateOAuthState } from "@/lib/github/crypto";
import { CSRF_COOKIE_NAME } from "@/lib/github/session";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectPath = searchParams.get("redirect") || "/studio";

  const config = getGitHubAuthConfig();

  if (!config.clientId) {
    return NextResponse.json(
      {
        error: "GITHUB_CLIENT_ID or GITHUB_APP_CLIENT_ID is not configured in environment variables.",
        setupGuideUrl: "/#setup-github-app",
      },
      { status: 500 }
    );
  }

  // Generate tamper-proof state
  const state = generateOAuthState();

  // Determine redirect URI
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const callbackUrl = `${protocol}://${host}/api/auth/github/callback`;

  const authorizeUrl = buildGitHubAuthorizeUrl({
    clientId: config.clientId,
    redirectUri: callbackUrl,
    state,
    scopes: config.scopes,
  });

  const response = NextResponse.redirect(authorizeUrl);

  // Set CSRF verification cookie (10 minutes TTL)
  const isProd = process.env.NODE_ENV === "production";
  response.cookies.set(CSRF_COOKIE_NAME, `${state}|${encodeURIComponent(redirectPath)}`, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60, // 10 minutes
  });

  return response;
}
