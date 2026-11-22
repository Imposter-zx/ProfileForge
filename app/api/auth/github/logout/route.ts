// app/api/auth/github/logout/route.ts
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/github/session";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out from GitHub" });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
