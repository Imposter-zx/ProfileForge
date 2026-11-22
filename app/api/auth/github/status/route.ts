// app/api/auth/github/status/route.ts
import { NextResponse } from "next/server";
import { getSessionFromServer, PublicSessionUser } from "@/lib/github/session";

export async function GET() {
  const session = await getSessionFromServer();

  if (!session) {
    const publicState: PublicSessionUser = {
      connected: false,
      user: null,
    };
    return NextResponse.json(publicState);
  }

  const publicState: PublicSessionUser = {
    connected: true,
    user: session.user,
    scope: session.scope,
    createdAt: session.createdAt,
  };

  return NextResponse.json(publicState);
}
