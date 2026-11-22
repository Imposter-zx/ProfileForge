// app/api/github/profile-repo/route.ts
import { NextResponse } from "next/server";
import { getSessionFromServer } from "@/lib/github/session";
import {
  detectProfileRepository,
  createProfileRepository,
  GitHubApiError,
} from "@/lib/github/publisher";

export async function GET() {
  const session = await getSessionFromServer();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Please connect your GitHub account." },
      { status: 401 }
    );
  }

  try {
    const info = await detectProfileRepository(session.accessToken, session.user.login);
    return NextResponse.json(info);
  } catch (err) {
    if (err instanceof GitHubApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const msg = err instanceof Error ? err.message : "Failed to detect profile repository";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSessionFromServer();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Please connect your GitHub account." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const isPrivate = Boolean(body.isPrivate);

    const info = await createProfileRepository(session.accessToken, session.user.login, isPrivate);
    return NextResponse.json({
      success: true,
      message: `Created profile repository ${session.user.login}/${session.user.login}`,
      ...info,
    });
  } catch (err) {
    if (err instanceof GitHubApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const msg = err instanceof Error ? err.message : "Failed to create profile repository";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
