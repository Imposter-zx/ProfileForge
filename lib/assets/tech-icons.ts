// lib/assets/tech-icons.ts

export type TechCategory =
  | "languages"
  | "frontend"
  | "backend"
  | "databases"
  | "devops"
  | "tools";

export interface TechItem {
  id: string;
  name: string;
  category: TechCategory;
  color: string; // hex
  logo: string; // Simple Icons slug
  deviconSlug?: string;
  skillIconSlug?: string;
}

export const TECH_CATEGORIES: { id: TechCategory; label: string; icon: string }[] = [
  { id: "languages", label: "Programming Languages", icon: "💻" },
  { id: "frontend", label: "Frontend Development", icon: "🌐" },
  { id: "backend", label: "Backend Development", icon: "⚙️" },
  { id: "databases", label: "Databases & Storage", icon: "🗄️" },
  { id: "devops", label: "Cloud & DevOps", icon: "🚀" },
  { id: "tools", label: "Developer Tools & Testing", icon: "🛠️" },
];

export const TECH_CATALOG: TechItem[] = [
  // --- Programming Languages ---
  { id: "ts", name: "TypeScript", category: "languages", color: "3178C6", logo: "typescript", deviconSlug: "typescript/typescript-original", skillIconSlug: "ts" },
  { id: "js", name: "JavaScript", category: "languages", color: "F7DF1E", logo: "javascript", deviconSlug: "javascript/javascript-original", skillIconSlug: "js" },
  { id: "python", name: "Python", category: "languages", color: "3776AB", logo: "python", deviconSlug: "python/python-original", skillIconSlug: "py" },
  { id: "rust", name: "Rust", category: "languages", color: "000000", logo: "rust", deviconSlug: "rust/rust-plain", skillIconSlug: "rust" },
  { id: "go", name: "Go", category: "languages", color: "00ADD8", logo: "go", deviconSlug: "go/go-original", skillIconSlug: "go" },
  { id: "cpp", name: "C++", category: "languages", color: "00599C", logo: "cplusplus", deviconSlug: "cplusplus/cplusplus-original", skillIconSlug: "cpp" },
  { id: "c", name: "C", category: "languages", color: "A8B9CC", logo: "c", deviconSlug: "c/c-original", skillIconSlug: "c" },
  { id: "csharp", name: "C#", category: "languages", color: "239120", logo: "csharp", deviconSlug: "csharp/csharp-original", skillIconSlug: "cs" },
  { id: "java", name: "Java", category: "languages", color: "ED8B00", logo: "openjdk", deviconSlug: "java/java-original", skillIconSlug: "java" },
  { id: "kotlin", name: "Kotlin", category: "languages", color: "7F52FF", logo: "kotlin", deviconSlug: "kotlin/kotlin-original", skillIconSlug: "kotlin" },
  { id: "swift", name: "Swift", category: "languages", color: "F05138", logo: "swift", deviconSlug: "swift/swift-original", skillIconSlug: "swift" },
  { id: "php", name: "PHP", category: "languages", color: "777BB4", logo: "php", deviconSlug: "php/php-original", skillIconSlug: "php" },
  { id: "ruby", name: "Ruby", category: "languages", color: "CC342D", logo: "ruby", deviconSlug: "ruby/ruby-original", skillIconSlug: "ruby" },
  { id: "dart", name: "Dart", category: "languages", color: "0175C2", logo: "dart", deviconSlug: "dart/dart-original", skillIconSlug: "dart" },
  { id: "lua", name: "Lua", category: "languages", color: "2C2D72", logo: "lua", deviconSlug: "lua/lua-original", skillIconSlug: "lua" },
  { id: "elixir", name: "Elixir", category: "languages", color: "4B275F", logo: "elixir", deviconSlug: "elixir/elixir-original", skillIconSlug: "elixir" },
  { id: "haskell", name: "Haskell", category: "languages", color: "5D4F85", logo: "haskell", deviconSlug: "haskell/haskell-original", skillIconSlug: "haskell" },

  // --- Frontend Development ---
  { id: "react", name: "React", category: "frontend", color: "20232A", logo: "react", deviconSlug: "react/react-original", skillIconSlug: "react" },
  { id: "nextjs", name: "Next.js", category: "frontend", color: "000000", logo: "nextdotjs", deviconSlug: "nextjs/nextjs-original", skillIconSlug: "nextjs" },
  { id: "vue", name: "Vue.js", category: "frontend", color: "4FC08D", logo: "vuedotjs", deviconSlug: "vuejs/vuejs-original", skillIconSlug: "vue" },
  { id: "svelte", name: "Svelte", category: "frontend", color: "FF3E00", logo: "svelte", deviconSlug: "svelte/svelte-original", skillIconSlug: "svelte" },
  { id: "angular", name: "Angular", category: "frontend", color: "DD0031", logo: "angular", deviconSlug: "angularjs/angularjs-original", skillIconSlug: "angular" },
  { id: "tailwind", name: "Tailwind CSS", category: "frontend", color: "06B6D4", logo: "tailwindcss", deviconSlug: "tailwindcss/tailwindcss-original", skillIconSlug: "tailwind" },
  { id: "html5", name: "HTML5", category: "frontend", color: "E34F26", logo: "html5", deviconSlug: "html5/html5-original", skillIconSlug: "html" },
  { id: "css3", name: "CSS3", category: "frontend", color: "1572B6", logo: "css3", deviconSlug: "css3/css3-original", skillIconSlug: "css" },
  { id: "sass", name: "Sass", category: "frontend", color: "CC6699", logo: "sass", deviconSlug: "sass/sass-original", skillIconSlug: "sass" },
  { id: "vite", name: "Vite", category: "frontend", color: "646CFF", logo: "vite", deviconSlug: "vitejs/vitejs-original", skillIconSlug: "vite" },
  { id: "astro", name: "Astro", category: "frontend", color: "BC52EE", logo: "astro", skillIconSlug: "astro" },
  { id: "redux", name: "Redux", category: "frontend", color: "764ABC", logo: "redux", deviconSlug: "redux/redux-original", skillIconSlug: "redux" },

  // --- Backend Development ---
  { id: "nodejs", name: "Node.js", category: "backend", color: "339933", logo: "nodedotjs", deviconSlug: "nodejs/nodejs-original", skillIconSlug: "nodejs" },
  { id: "express", name: "Express", category: "backend", color: "000000", logo: "express", deviconSlug: "express/express-original", skillIconSlug: "express" },
  { id: "nestjs", name: "NestJS", category: "backend", color: "E0234E", logo: "nestjs", deviconSlug: "nestjs/nestjs-plain", skillIconSlug: "nestjs" },
  { id: "fastapi", name: "FastAPI", category: "backend", color: "009688", logo: "fastapi", deviconSlug: "fastapi/fastapi-original", skillIconSlug: "fastapi" },
  { id: "django", name: "Django", category: "backend", color: "092E20", logo: "django", deviconSlug: "django/django-plain", skillIconSlug: "django" },
  { id: "flask", name: "Flask", category: "backend", color: "000000", logo: "flask", deviconSlug: "flask/flask-original", skillIconSlug: "flask" },
  { id: "spring", name: "Spring Boot", category: "backend", color: "6DB33F", logo: "springboot", deviconSlug: "spring/spring-original", skillIconSlug: "spring" },
  { id: "graphql", name: "GraphQL", category: "backend", color: "E10098", logo: "graphql", deviconSlug: "graphql/graphql-plain", skillIconSlug: "graphql" },
  { id: "laravel", name: "Laravel", category: "backend", color: "FF2D20", logo: "laravel", deviconSlug: "laravel/laravel-plain", skillIconSlug: "laravel" },

  // --- Databases & Storage ---
  { id: "postgresql", name: "PostgreSQL", category: "databases", color: "4169E1", logo: "postgresql", deviconSlug: "postgresql/postgresql-original", skillIconSlug: "postgres" },
  { id: "mongodb", name: "MongoDB", category: "databases", color: "47A248", logo: "mongodb", deviconSlug: "mongodb/mongodb-original", skillIconSlug: "mongodb" },
  { id: "redis", name: "Redis", category: "databases", color: "DC382D", logo: "redis", deviconSlug: "redis/redis-original", skillIconSlug: "redis" },
  { id: "mysql", name: "MySQL", category: "databases", color: "4479A1", logo: "mysql", deviconSlug: "mysql/mysql-original", skillIconSlug: "mysql" },
  { id: "sqlite", name: "SQLite", category: "databases", color: "003B57", logo: "sqlite", deviconSlug: "sqlite/sqlite-original", skillIconSlug: "sqlite" },
  { id: "supabase", name: "Supabase", category: "databases", color: "3ECF8E", logo: "supabase", skillIconSlug: "supabase" },
  { id: "firebase", name: "Firebase", category: "databases", color: "FFCA28", logo: "firebase", deviconSlug: "firebase/firebase-plain", skillIconSlug: "firebase" },
  { id: "prisma", name: "Prisma", category: "databases", color: "2D3748", logo: "prisma", skillIconSlug: "prisma" },

  // --- Cloud & DevOps ---
  { id: "docker", name: "Docker", category: "devops", color: "2496ED", logo: "docker", deviconSlug: "docker/docker-original", skillIconSlug: "docker" },
  { id: "kubernetes", name: "Kubernetes", category: "devops", color: "326CE5", logo: "kubernetes", deviconSlug: "kubernetes/kubernetes-plain", skillIconSlug: "kubernetes" },
  { id: "aws", name: "AWS", category: "devops", color: "232F3E", logo: "amazonwebservices", deviconSlug: "amazonwebservices/amazonwebservices-original", skillIconSlug: "aws" },
  { id: "gcp", name: "Google Cloud", category: "devops", color: "4285F4", logo: "googlecloud", deviconSlug: "googlecloud/googlecloud-original", skillIconSlug: "gcp" },
  { id: "azure", name: "Azure", category: "devops", color: "0078D4", logo: "microsoftazure", deviconSlug: "azure/azure-original", skillIconSlug: "azure" },
  { id: "vercel", name: "Vercel", category: "devops", color: "000000", logo: "vercel", skillIconSlug: "vercel" },
  { id: "cloudflare", name: "Cloudflare", category: "devops", color: "F38020", logo: "cloudflare", deviconSlug: "cloudflare/cloudflare-original", skillIconSlug: "cloudflare" },
  { id: "githubactions", name: "GitHub Actions", category: "devops", color: "2088FF", logo: "githubactions", skillIconSlug: "githubactions" },
  { id: "linux", name: "Linux", category: "devops", color: "FCC624", logo: "linux", deviconSlug: "linux/linux-original", skillIconSlug: "linux" },
  { id: "nginx", name: "Nginx", category: "devops", color: "009639", logo: "nginx", deviconSlug: "nginx/nginx-original", skillIconSlug: "nginx" },

  // --- Developer Tools & Testing ---
  { id: "git", name: "Git", category: "tools", color: "F05032", logo: "git", deviconSlug: "git/git-original", skillIconSlug: "git" },
  { id: "github", name: "GitHub", category: "tools", color: "181717", logo: "github", skillIconSlug: "github" },
  { id: "vscode", name: "VS Code", category: "tools", color: "007ACC", logo: "visualstudiocode", deviconSlug: "vscode/vscode-original", skillIconSlug: "vscode" },
  { id: "neovim", name: "Neovim", category: "tools", color: "57A143", logo: "neovim", skillIconSlug: "neovim" },
  { id: "postman", name: "Postman", category: "tools", color: "FF6C37", logo: "postman", deviconSlug: "postman/postman-original", skillIconSlug: "postman" },
  { id: "figma", name: "Figma", category: "tools", color: "F24E1E", logo: "figma", deviconSlug: "figma/figma-original", skillIconSlug: "figma" },
  { id: "jest", name: "Jest", category: "tools", color: "C21325", logo: "jest", deviconSlug: "jest/jest-plain", skillIconSlug: "jest" },
  { id: "vitest", name: "Vitest", category: "tools", color: "6E9F18", logo: "vitest", skillIconSlug: "vitest" },
  { id: "cypress", name: "Cypress", category: "tools", color: "69D3A7", logo: "cypress", skillIconSlug: "cypress" },
  { id: "playwright", name: "Playwright", category: "tools", color: "2EAD33", logo: "playwright", skillIconSlug: "playwright" },
];

export type TechIconStyle = "badges" | "devicon" | "simpleicons" | "skillicons";

export function buildTechIconHtml(item: TechItem, style: TechIconStyle = "badges"): string {
  if (style === "devicon" && item.deviconSlug) {
    const src = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${item.deviconSlug}.svg`;
    return `<img src="${src}" alt="${item.name}" width="40" height="40" />`;
  }
  if (style === "simpleicons") {
    const src = `https://cdn.simpleicons.org/${item.logo}/${item.color}`;
    return `<img src="${src}" alt="${item.name}" width="36" height="36" />`;
  }
  if (style === "skillicons" && item.skillIconSlug) {
    const src = `https://skillicons.dev/icons?i=${item.skillIconSlug}`;
    return `<img src="${src}" alt="${item.name}" height="40" />`;
  }
  // Standard Shields.io for-the-badge
  const url = `https://img.shields.io/badge/${encodeURIComponent(item.name)}-${item.color}?style=for-the-badge&logo=${item.logo}&logoColor=white`;
  return `<img src="${url}" alt="${item.name}" />`;
}

export function buildCategorizedTechStackMarkdown(
  selectedIds: string[],
  style: TechIconStyle = "badges"
): string {
  const selectedSet = new Set(selectedIds);
  const blocks: string[] = [];

  for (const cat of TECH_CATEGORIES) {
    const items = TECH_CATALOG.filter(
      (t) => t.category === cat.id && selectedSet.has(t.id)
    );
    if (!items.length) continue;

    const imgs = items.map((t) => buildTechIconHtml(t, style)).join(" ");
    blocks.push(`### ${cat.icon} ${cat.label}\n\n<p align="left">\n  ${imgs}\n</p>`);
  }

  return blocks.join("\n\n");
}
