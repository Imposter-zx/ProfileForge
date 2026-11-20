// lib/github/analyzer.ts

export interface AnalyzedRepo {
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  homepage: string | null;
  stars: number;
  forks: number;
  primaryLanguage: string | null;
  topics: string[];
  updatedAt: string;
  isFork: boolean;
  isPinned: boolean;
}

export interface AnalyzedProfile {
  username: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  website: string | null;
  twitterUsername: string | null;
  followers: number;
  following: number;
  publicReposCount: number;
  createdAt: string;
  profileUrl: string;

  // Repository analysis
  totalStars: number;
  totalForks: number;
  topLanguages: Array<{ name: string; repoCount: number; percentage: number }>;
  pinnedRepos: AnalyzedRepo[];
  popularRepos: AnalyzedRepo[];
  recentlyUpdatedRepos: AnalyzedRepo[];

  // Activity & availability flags (never fabricated)
  contributions: {
    available: boolean;
    totalLastYear: number | null;
    totalCommits: number | null;
    totalPRs: number | null;
    totalIssues: number | null;
    totalReviews: number | null;
    reasonIfUnavailable?: string;
  };
  recentPublicEventsCount: number;
  rateLimitRemaining: number | null;
}

const GITHUB_REST = "https://api.github.com";
const GITHUB_GRAPHQL = "https://api.github.com/graphql";

const GRAPHQL_QUERY = `
  query ProfileForgeScan($login: String!) {
    user(login: $login) {
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            nameWithOwner
            description
            url
            homepageUrl
            stargazerCount
            forkCount
            updatedAt
            isFork
            primaryLanguage { name }
            repositoryTopics(first: 8) {
              nodes { topic { name } }
            }
          }
        }
      }
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        totalPullRequestReviewContributions
        contributionCalendar {
          totalContributions
        }
      }
    }
  }
`;

interface RawGitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage?: string | null;
  stargazers_count?: number;
  forks_count?: number;
  language?: string | null;
  topics?: string[];
  updated_at: string;
  fork?: boolean;
}

interface RawGraphQLPinnedItem {
  name: string;
  nameWithOwner: string;
  description: string | null;
  url: string;
  homepageUrl?: string | null;
  stargazerCount?: number;
  forkCount?: number;
  primaryLanguage?: { name: string } | null;
  repositoryTopics?: { nodes?: Array<{ topic: { name: string } }> } | null;
  updatedAt: string;
  isFork?: boolean;
}

export async function analyzeGitHubProfile(
  rawUsername: string,
  token?: string
): Promise<AnalyzedProfile> {
  const username = rawUsername.trim().replace(/^@/, "");
  if (!/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
    throw new Error("Invalid GitHub username format. Allowed: alphanumeric & single hyphens, 1-39 chars.");
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "Profile-Forge-Studio/1.0",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const userRes = await fetch(`${GITHUB_REST}/users/${encodeURIComponent(username)}`, {
    headers,
    next: { revalidate: 900 },
  });

  if (userRes.status === 404) throw new Error(`GitHub user "${username}" not found.`);
  if (userRes.status === 403 || userRes.status === 429) {
    throw new Error("GitHub API rate limit reached. Configure GITHUB_READ_TOKEN or try again later.");
  }
  if (!userRes.ok) throw new Error(`GitHub REST error (${userRes.status}).`);

  const rateLimitRemaining = Number(userRes.headers.get("x-ratelimit-remaining") ?? NaN);
  const user = await userRes.json();

  // Fetch up to 100 public owned repos sorted by updated
  const reposRes = await fetch(
    `${GITHUB_REST}/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated&type=owner`,
    { headers, next: { revalidate: 900 } }
  );
  const rawRepos = reposRes.ok ? ((await reposRes.json()) as RawGitHubRepo[]) : [];

  const repos: AnalyzedRepo[] = Array.isArray(rawRepos)
    ? rawRepos.map((r: RawGitHubRepo) => ({
        name: r.name,
        fullName: r.full_name,
        description: r.description,
        url: r.html_url,
        homepage: r.homepage || null,
        stars: r.stargazers_count ?? 0,
        forks: r.forks_count ?? 0,
        primaryLanguage: r.language ?? null,
        topics: Array.isArray(r.topics) ? r.topics : [],
        updatedAt: r.updated_at,
        isFork: Boolean(r.fork),
        isPinned: false,
      }))
    : [];

  // Language distribution from actual public owned repos
  const langMap = new Map<string, number>();
  let totalStars = 0;
  let totalForks = 0;
  for (const r of repos) {
    totalStars += r.stars;
    totalForks += r.forks;
    if (r.primaryLanguage && !r.isFork) {
      langMap.set(r.primaryLanguage, (langMap.get(r.primaryLanguage) ?? 0) + 1);
    }
  }
  const totalLangRepos = Array.from(langMap.values()).reduce((a, b) => a + b, 0) || 1;
  const topLanguages = Array.from(langMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, repoCount]) => ({
      name,
      repoCount,
      percentage: Math.round((repoCount / totalLangRepos) * 1000) / 10,
    }));

  const popularRepos = [...repos].sort((a, b) => b.stars - a.stars).slice(0, 6);
  const recentlyUpdatedRepos = [...repos]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  // Public events count (last 30 public events)
  const eventsRes = await fetch(
    `${GITHUB_REST}/users/${encodeURIComponent(username)}/events/public?per_page=30`,
    { headers, next: { revalidate: 900 } }
  );
  const eventsJson = eventsRes.ok ? ((await eventsRes.json()) as unknown[]) : [];

  // Optional GraphQL enrichment (requires token)
  let pinnedRepos: AnalyzedRepo[] = [];
  let contributions: AnalyzedProfile["contributions"] = {
    available: false,
    totalLastYear: null,
    totalCommits: null,
    totalPRs: null,
    totalIssues: null,
    totalReviews: null,
    reasonIfUnavailable: token
      ? "GraphQL data unavailable"
      : "GitHub GraphQL requires a server read token (GITHUB_READ_TOKEN).",
  };

  if (token) {
    try {
      const gqlRes = await fetch(GITHUB_GRAPHQL, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ query: GRAPHQL_QUERY, variables: { login: username } }),
        next: { revalidate: 900 },
      });

      if (gqlRes.ok) {
        const gqlData = await gqlRes.json();
        const gqlUser = gqlData?.data?.user;
        if (gqlUser) {
          pinnedRepos = ((gqlUser.pinnedItems?.nodes ?? []) as RawGraphQLPinnedItem[]).map((n: RawGraphQLPinnedItem) => ({
            name: n.name,
            fullName: n.nameWithOwner,
            description: n.description,
            url: n.url,
            homepage: n.homepageUrl || null,
            stars: n.stargazerCount ?? 0,
            forks: n.forkCount ?? 0,
            primaryLanguage: n.primaryLanguage?.name ?? null,
            topics: (n.repositoryTopics?.nodes ?? []).map((t: { topic: { name: string } }) => t.topic.name),
            updatedAt: n.updatedAt,
            isFork: Boolean(n.isFork),
            isPinned: true,
          }));

          const cc = gqlUser.contributionsCollection;
          if (cc) {
            contributions = {
              available: true,
              totalLastYear: cc.contributionCalendar?.totalContributions ?? null,
              totalCommits: cc.totalCommitContributions ?? null,
              totalPRs: cc.totalPullRequestContributions ?? null,
              totalIssues: cc.totalIssueContributions ?? null,
              totalReviews: cc.totalPullRequestReviewContributions ?? null,
            };
          }
        }
      }
    } catch {
      // GraphQL failure is graceful fallback
    }
  }

  return {
    username: user.login,
    name: user.name ?? null,
    avatarUrl: user.avatar_url,
    bio: user.bio ?? null,
    location: user.location ?? null,
    company: user.company ?? null,
    website: user.blog
      ? user.blog.startsWith("http")
        ? user.blog
        : `https://${user.blog}`
      : null,
    twitterUsername: user.twitter_username ?? null,
    followers: user.followers ?? 0,
    following: user.following ?? 0,
    publicReposCount: user.public_repos ?? 0,
    createdAt: user.created_at,
    profileUrl: user.html_url,
    totalStars,
    totalForks,
    topLanguages,
    pinnedRepos,
    popularRepos,
    recentlyUpdatedRepos,
    contributions,
    recentPublicEventsCount: Array.isArray(eventsJson) ? eventsJson.length : 0,
    rateLimitRemaining: Number.isNaN(rateLimitRemaining) ? null : rateLimitRemaining,
  };
}
