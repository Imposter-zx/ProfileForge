// app/api/auth/github/callback/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeOAuthCode,
  fetchAuthenticatedUser,
  getGitHubAuthConfig,
  buildSession,
} from "@/lib/github/auth";
import { validateOAuthState } from "@/lib/github/crypto";
import {
  CSRF_COOKIE_NAME,
  getSessionCookieOptions,
  serializeSession,
} from "@/lib/github/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  const cookieStore = await cookies();
  const csrfCookie = cookieStore.get(CSRF_COOKIE_NAME)?.value || "";
  const [savedState, savedRedirect] = csrfCookie.split("|");
  const targetRedirect = savedRedirect ? decodeURIComponent(savedRedirect) : "/studio";

  // Base URL for redirection
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseUrl = `${protocol}://${host}`;

  // Handle user cancellation or GitHub errors
  if (error) {
    const errorUrl = new URL(`${baseUrl}${targetRedirect}`);
    errorUrl.searchParams.set("github_error", errorDescription || error);
    const res = NextResponse.redirect(errorUrl.toString());
    res.cookies.delete(CSRF_COOKIE_NAME);
    return res;
  }

  // Validate presence of code and state
  if (!code || !state) {
    const errorUrl = new URL(`${baseUrl}${targetRedirect}`);
    errorUrl.searchParams.set("github_error", "Missing OAuth authorization code or state.");
    const res = NextResponse.redirect(errorUrl.toString());
    res.cookies.delete(CSRF_COOKIE_NAME);
    return res;
  }

  // Validate CSRF state
  const isStateValid = validateOAuthState(state) && savedState === state;
  if (!isStateValid) {
    const errorUrl = new URL(`${baseUrl}${targetRedirect}`);
    errorUrl.searchParams.set("github_error", "Invalid or expired OAuth state parameter (CSRF protection).");
    const res = NextResponse.redirect(errorUrl.toString());
    res.cookies.delete(CSRF_COOKIE_NAME);
    return res;
  }

  try {
    const config = getGitHubAuthConfig();
    const callbackUrl = `${baseUrl}/api/auth/github/callback`;

    // Exchange code for access token
    const tokenData = await exchangeOAuthCode({
      code,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: callbackUrl,
    });

    // Fetch user details
    const user = await fetchAuthenticatedUser(tokenData.accessToken);

    // Build session
    const session = buildSession(user, tokenData);
    const sessionEncrypted = serializeSession(session);

    // Set cookie and redirect to studio with success flag
    const redirectUrl = new URL(`${baseUrl}${targetRedirect}`);
    redirectUrl.searchParams.set("github", "connected");
    redirectUrl.searchParams.set("username", user.login);

    const response = NextResponse.redirect(redirectUrl.toString());
    const cookieOpts = getSessionCookieOptions();

    response.cookies.set(cookieOpts.name, sessionEncrypted, {
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
      maxAge: cookieOpts.maxAge,
    });

    response.cookies.delete(CSRF_COOKIE_NAME);

    return response;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Authentication failed";
    const errorUrl = new URL(`${baseUrl}${targetRedirect}`);
    errorUrl.searchParams.set("github_error", errorMsg);
    const res = NextResponse.redirect(errorUrl.toString());
    res.cookies.delete(CSRF_COOKIE_NAME);
    return res;
  }
}
