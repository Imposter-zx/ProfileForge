// tests/publisher.test.ts
import { test, describe, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  detectProfileRepository,
  createProfileRepository,
  publishDirectCommit,
  publishViaPullRequest,
  rewriteMarkdownAssetUrls,
  ShaConflictError,
} from "../lib/github/publisher";

describe("GitHub Publisher Engine", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("detectProfileRepository identifies existing profile repo and reads README.md", async () => {
    global.fetch = async (input) => {
      const url = String(input);

      if (url.includes("/repos/octocat/octocat/contents/README.md")) {
        const readmeBase64 = Buffer.from("# Hello World Octocat").toString("base64");
        return {
          ok: true,
          status: 200,
          headers: new Headers({ "x-ratelimit-remaining": "4999" }),
          json: async () => ({
            name: "README.md",
            path: "README.md",
            sha: "readme_sha_12345",
            content: readmeBase64,
            encoding: "base64",
            html_url: "https://github.com/octocat/octocat/blob/main/README.md",
          }),
        } as Response;
      }

      if (url.includes("/repos/octocat/octocat")) {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ "x-ratelimit-remaining": "5000" }),
          json: async () => ({
            name: "octocat",
            full_name: "octocat/octocat",
            html_url: "https://github.com/octocat/octocat",
            default_branch: "main",
            private: false,
            permissions: { push: true, admin: true },
            description: "Profile repository",
          }),
        } as Response;
      }

      return { ok: false, status: 404 } as Response;
    };

    const res = await detectProfileRepository("gho_test_token", "octocat");
    assert.equal(res.exists, true);
    assert.equal(res.repo?.fullName, "octocat/octocat");
    assert.equal(res.repo?.canPush, true);
    assert.equal(res.readme?.exists, true);
    assert.equal(res.readme?.sha, "readme_sha_12345");
    assert.equal(res.readme?.content, "# Hello World Octocat");
  });

  test("detectProfileRepository handles non-existent repository (404)", async () => {
    global.fetch = async () => {
      return {
        ok: false,
        status: 404,
        headers: new Headers(),
        json: async () => ({ message: "Not Found" }),
      } as Response;
    };

    const res = await detectProfileRepository("gho_test_token", "newuser");
    assert.equal(res.exists, false);
    assert.ok(res.error?.includes("newuser/newuser not found"));
  });

  test("createProfileRepository sends request with auto_init", async () => {
    let requestPayload: unknown = null;

    global.fetch = async (input, init) => {
      const url = String(input);
      if (url.includes("/user/repos") && init?.method === "POST") {
        requestPayload = JSON.parse(String(init.body));
        return {
          ok: true,
          status: 201,
          headers: new Headers(),
          json: async () => ({
            name: "testuser",
            full_name: "testuser/testuser",
          }),
        } as Response;
      }

      // Subsequent detectProfileRepository call
      return {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({
          name: "testuser",
          full_name: "testuser/testuser",
          html_url: "https://github.com/testuser/testuser",
          default_branch: "main",
          private: false,
        }),
      } as Response;
    };

    await createProfileRepository("gho_token", "testuser", false);
    assert.deepEqual(requestPayload, {
      name: "testuser",
      description: "My GitHub Profile README - Powered by Profile Forge",
      private: false,
      auto_init: true,
    });
  });

  test("publishDirectCommit commits README.md and returns commit details", async () => {
    let commitPayload: unknown = null;

    global.fetch = async (input, init) => {
      const url = String(input);
      if (url.includes("/repos/octocat/octocat/contents/README.md") && init?.method === "PUT") {
        commitPayload = JSON.parse(String(init.body));
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({
            commit: {
              sha: "commit_sha_abc123",
              html_url: "https://github.com/octocat/octocat/commit/commit_sha_abc123",
            },
          }),
        } as Response;
      }

      return { ok: false, status: 404 } as Response;
    };

    const result = await publishDirectCommit("gho_token", {
      mode: "commit",
      owner: "octocat",
      repo: "octocat",
      branch: "main",
      markdown: "# Updated Profile README",
      commitMessage: "chore: update profile",
      currentSha: "existing_sha_999",
    });

    assert.equal(result.success, true);
    assert.equal(result.commitSha, "commit_sha_abc123");
    assert.equal(result.branch, "main");
    assert.ok(commitPayload !== null);
  });

  test("publishDirectCommit handles 409 SHA conflict", async () => {
    global.fetch = async () => {
      return {
        ok: false,
        status: 409,
        headers: new Headers(),
        json: async () => ({ message: "is at 999 but expected 888" }),
      } as Response;
    };

    await assert.rejects(
      async () => {
        await publishDirectCommit("gho_token", {
          mode: "commit",
          owner: "octocat",
          repo: "octocat",
          branch: "main",
          markdown: "test",
          commitMessage: "test",
          currentSha: "stale_sha",
        });
      },
      (err: unknown) => err instanceof ShaConflictError
    );
  });

  test("publishViaPullRequest creates branch, commits, and opens PR", async () => {
    const executedEndpoints: string[] = [];

    global.fetch = async (input, init) => {
      const url = String(input);
      executedEndpoints.push(`${init?.method || "GET"} ${url}`);

      // 1. Get base ref
      if (url.includes("/git/ref/heads/main")) {
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({ object: { sha: "base_sha_111" } }),
        } as Response;
      }

      // 2. Create new branch
      if (url.includes("/git/refs") && init?.method === "POST") {
        return {
          ok: true,
          status: 201,
          headers: new Headers(),
          json: async () => ({ ref: "refs/heads/profile-forge/patch" }),
        } as Response;
      }

      // 3. Commit README
      if (url.includes("/contents/README.md") && init?.method === "PUT") {
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({
            commit: { sha: "patch_commit_sha", html_url: "https://github.com/pr/commit" },
          }),
        } as Response;
      }

      // 4. Create Pull Request
      if (url.includes("/pulls") && init?.method === "POST") {
        return {
          ok: true,
          status: 201,
          headers: new Headers(),
          json: async () => ({
            number: 42,
            html_url: "https://github.com/octocat/octocat/pull/42",
          }),
        } as Response;
      }

      return { ok: false, status: 404 } as Response;
    };

    const prResult = await publishViaPullRequest("gho_token", {
      mode: "pr",
      owner: "octocat",
      repo: "octocat",
      branch: "main",
      markdown: "# PR README Content",
      commitMessage: "chore: pr update",
      prTitle: "Update Profile README",
    });

    assert.equal(prResult.success, true);
    assert.equal(prResult.mode, "pr");
    assert.equal(prResult.prNumber, 42);
    assert.equal(prResult.prUrl, "https://github.com/octocat/octocat/pull/42");
    assert.ok(prResult.branch.startsWith("profile-forge/patch-"));
  });

  test("rewriteMarkdownAssetUrls replaces local asset paths with repo paths", () => {
    const input = `
<div align="center">
  <img src="./assets/banner.svg" alt="Banner" />
  <img src="assets/badge.png" alt="Badge" />
</div>
    `.trim();

    const assetMap = {
      "banner.svg": "./assets/profile-forge/banner.svg",
      "badge.png": "./assets/profile-forge/badge.png",
    };

    const output = rewriteMarkdownAssetUrls(input, assetMap);
    assert.ok(output.includes("./assets/profile-forge/banner.svg"));
    assert.ok(output.includes("./assets/profile-forge/badge.png"));
    assert.ok(!output.includes("./assets/banner.svg"));
  });
});
