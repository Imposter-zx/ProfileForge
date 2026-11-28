// lib/assets/validation.ts

export interface UrlValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
  normalizedUrl?: string;
}

/**
 * Validates an external asset URL for GitHub README compatibility.
 */
export function validateAssetUrl(
  rawUrl: string,
  options?: { allowEmpty?: boolean; requireHttps?: boolean }
): UrlValidationResult {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return options?.allowEmpty
      ? { valid: true }
      : { valid: false, error: "Please enter a URL." };
  }

  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
    return {
      valid: false,
      error: "Unsafe URL scheme. Use an https:// URL hosted on GitHub or a CDN.",
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      valid: false,
      error: "Invalid URL format. Example: https://example.com/image.png",
    };
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return {
      valid: false,
      error: "Only https:// or http:// URLs are supported in GitHub READMEs.",
    };
  }

  if (options?.requireHttps && parsed.protocol !== "https:") {
    return {
      valid: false,
      error: "HTTPS is required for GitHub Camo image proxy compatibility.",
    };
  }

  const host = parsed.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host.endsWith(".local")
  ) {
    return {
      valid: false,
      error: "Localhost URLs will appear broken to visitors on GitHub.",
    };
  }

  if (parsed.protocol === "http:") {
    return {
      valid: true,
      warning: "http:// URLs may be blocked by GitHub; https:// is recommended.",
      normalizedUrl: parsed.toString(),
    };
  }

  return {
    valid: true,
    normalizedUrl: parsed.toString(),
  };
}

export function escapeHtmlAttr(val: string): string {
  return val
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
