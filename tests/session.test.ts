// tests/session.test.ts
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  serializeSession,
  deserializeSession,
  getSessionCookieOptions,
  GitHubSession,
} from "../lib/github/session";

describe("Session Management", () => {
  const sampleSession: GitHubSession = {
    accessToken: "gho_sample_token_xyz987",
    tokenType: "bearer",
    scope: "read:user,repo",
    user: {
      id: 12345,
      login: "Imposter-zx",
      name: "Imposter",
      avatar_url: "https://avatars.githubusercontent.com/u/12345",
      html_url: "https://github.com/Imposter-zx",
      email: "imposter@example.com",
    },
    createdAt: Date.now(),
    installationId: 4567,
  };

  test("serializes and deserializes GitHub session accurately", () => {
    const serialized = serializeSession(sampleSession);
    assert.ok(typeof serialized === "string");

    const recovered = deserializeSession(serialized);
    assert.ok(recovered !== null);
    assert.equal(recovered.accessToken, sampleSession.accessToken);
    assert.equal(recovered.user.login, "Imposter-zx");
    assert.equal(recovered.installationId, 4567);
  });

  test("returns null for malformed or corrupted session strings", () => {
    assert.equal(deserializeSession("invalid_session_string"), null);
    assert.equal(deserializeSession(""), null);
  });

  test("cookie options enforce HttpOnly, SameSite=Lax, and reasonable expiration", () => {
    const opts = getSessionCookieOptions();
    assert.equal(opts.httpOnly, true);
    assert.equal(opts.sameSite, "lax");
    assert.equal(opts.path, "/");
    assert.ok(opts.maxAge > 0);
  });
});
