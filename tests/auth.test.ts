// tests/auth.test.ts
import { test, describe, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  buildGitHubAuthorizeUrl,
  exchangeOAuthCode,
  fetchAuthenticatedUser,
} from "../lib/github/auth";

describe("GitHub OAuth Flow", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("buildGitHubAuthorizeUrl generates valid GitHub OAuth endpoint with required scopes", () => {
    const urlStr = buildGitHubAuthorizeUrl({
      clientId: "test_client_id_123",
      redirectUri: "https://example.com/api/auth/github/callback",
      state: "test_csrf_state",
      scopes: ["read:user", "repo"],
    });

    const parsed = new URL(urlStr);
    assert.equal(parsed.origin, "https://github.com");
    assert.equal(parsed.pathname, "/login/oauth/authorize");
    assert.equal(parsed.searchParams.get("client_id"), "test_client_id_123");
    assert.equal(parsed.searchParams.get("state"), "test_csrf_state");
    assert.equal(parsed.searchParams.get("scope"), "read:user repo");
    assert.equal(parsed.searchParams.get("redirect_uri"), "https://example.com/api/auth/github/callback");
  });

  test("exchangeOAuthCode exchanges authorization code for access token", async () => {
    global.fetch = async (input) => {
      const url = String(input);
      if (url.includes("/login/oauth/access_token")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            access_token: "gho_mocked_access_token_abc123",
            token_type: "bearer",
            scope: "read:user,repo",
          }),
        } as Response;
      }
      return { ok: false, status: 404 } as Response;
    };

    const tokenData = await exchangeOAuthCode({
      code: "mock_code_xyz",
      clientId: "client_id",
      clientSecret: "client_secret",
      redirectUri: "https://example.com/callback",
    });

    assert.equal(tokenData.accessToken, "gho_mocked_access_token_abc123");
    assert.equal(tokenData.tokenType, "bearer");
    assert.equal(tokenData.scope, "read:user,repo");
  });

  test("exchangeOAuthCode handles GitHub error response", async () => {
    global.fetch = async () => {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          error: "bad_verification_code",
          error_description: "The code passed is incorrect or has expired.",
        }),
      } as Response;
    };

    await assert.rejects(
      async () => {
        await exchangeOAuthCode({
          code: "invalid_code",
          clientId: "id",
          clientSecret: "secret",
        });
      },
      /bad_verification_code/
    );
  });

  test("fetchAuthenticatedUser parses GitHub user profile", async () => {
    global.fetch = async (input) => {
      const url = String(input);
      if (url.includes("api.github.com/user")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: 998877,
            login: "octocat",
            name: "The Octocat",
            avatar_url: "https://avatars.githubusercontent.com/u/583231",
            html_url: "https://github.com/octocat",
            email: "octocat@github.com",
          }),
        } as Response;
      }
      return { ok: false, status: 404 } as Response;
    };

    const user = await fetchAuthenticatedUser("gho_valid_token");
    assert.equal(user.id, 998877);
    assert.equal(user.login, "octocat");
    assert.equal(user.name, "The Octocat");
  });

  test("fetchAuthenticatedUser throws on 401 Unauthorized", async () => {
    global.fetch = async () => {
      return {
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      } as Response;
    };

    await assert.rejects(
      async () => {
        await fetchAuthenticatedUser("gho_expired_token");
      },
      /401 Unauthorized/
    );
  });
});
