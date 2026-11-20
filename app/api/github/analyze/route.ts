// app/api/github/analyze/route.ts
import { analyzeGitHubProfile, type AnalyzedProfile } from "@/lib/github/analyzer";

// Simple in-memory cache with 15-minute TTL
interface CacheEntry {
  data: AnalyzedProfile;
  cachedAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim().replace(/^@/, "");

  if (!username) {
    return Response.json(
      { error: "Query parameter 'username' is required." },
      { status: 400 }
    );
  }

  const cacheKey = username.toLowerCase();
  const cached = cache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
    return Response.json(cached.data, {
      headers: {
        "X-Cache": "HIT",
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=60",
      },
    });
  }

  try {
    const token = process.env.GITHUB_READ_TOKEN || process.env.GITHUB_TOKEN;
    const profile = await analyzeGitHubProfile(username, token);

    cache.set(cacheKey, { data: profile, cachedAt: now });

    // Clean up expired cache items if memory grows
    if (cache.size > 200) {
      for (const [k, v] of cache.entries()) {
        if (now - v.cachedAt > CACHE_TTL_MS) cache.delete(k);
      }
    }

    return Response.json(profile, {
      headers: {
        "X-Cache": "MISS",
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to analyze GitHub profile.";
    const status = message.includes("not found")
      ? 404
      : message.includes("rate limit")
      ? 429
      : message.includes("Invalid GitHub username")
      ? 400
      : 500;

    return Response.json({ error: message }, { status });
  }
}
