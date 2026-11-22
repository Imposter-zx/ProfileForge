// app/api/github/publish/route.ts
import { NextResponse } from "next/server";
import { getSessionFromServer } from "@/lib/github/session";
import {
  publishDirectCommit,
  publishViaPullRequest,
  PublishOptions,
  ShaConflictError,
  GitHubApiError,
} from "@/lib/github/publisher";

export async function POST(request: Request) {
  const session = await getSessionFromServer();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Please connect your GitHub account to publish." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const mode = (body.mode as "commit" | "pr") || "commit";
    const owner = String(body.owner || session.user.login).trim();
    const repo = String(body.repo || session.user.login).trim();
    const branch = String(body.branch || "main").trim();
    const markdown = String(body.markdown || "").trim();
    const commitMessage = String(
      body.commitMessage || "Update GitHub profile README using PROFILE FORGE"
    ).trim();
    const prTitle = body.prTitle ? String(body.prTitle).trim() : undefined;
    const prBody = body.prBody ? String(body.prBody).trim() : undefined;
    const currentSha = body.currentSha ? String(body.currentSha).trim() : undefined;
    const assets = Array.isArray(body.assets) ? body.assets : [];

    if (!markdown) {
      return NextResponse.json(
        { error: "Markdown content cannot be empty." },
        { status: 400 }
      );
    }

    const publishOptions: PublishOptions = {
      mode,
      owner,
      repo,
      branch,
      markdown,
      commitMessage,
      prTitle,
      prBody,
      currentSha,
      assets,
    };

    if (mode === "pr") {
      const result = await publishViaPullRequest(session.accessToken, publishOptions);
      return NextResponse.json(result);
    } else {
      const result = await publishDirectCommit(session.accessToken, publishOptions);
      return NextResponse.json(result);
    }
  } catch (err) {
    if (err instanceof ShaConflictError) {
      return NextResponse.json(
        {
          error: "SHA Conflict: The remote README.md has been modified since it was loaded.",
          conflict: true,
          resolution: "Please inspect the remote changes and refresh before re-publishing.",
        },
        { status: 409 }
      );
    }

    if (err instanceof GitHubApiError) {
      return NextResponse.json(
        { error: err.message, status: err.status, details: err.data },
        { status: err.status }
      );
    }

    const errorMsg = err instanceof Error ? err.message : "Failed to publish README to GitHub";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
