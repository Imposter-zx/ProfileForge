// lib/github/crypto.ts
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const DEFAULT_SECRET_FALLBACK = "profile-forge-default-session-secret-change-in-production-min32chars";

/**
 * Derives a consistent 32-byte encryption key from the provided secret
 */
function getDerivedKey(secret?: string): Buffer {
  const secretKey = secret || process.env.SESSION_SECRET || process.env.GITHUB_CLIENT_SECRET || DEFAULT_SECRET_FALLBACK;
  return crypto.createHash("sha256").update(secretKey).digest();
}

/**
 * Encrypts arbitrary text or JSON payload using AES-256-GCM.
 * Output format: base64(iv:tag:ciphertext)
 */
export function encryptPayload(data: string, secret?: string): string {
  const key = getDerivedKey(secret);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(data, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag();

  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
}

/**
 * Decrypts AES-256-GCM payload. Returns decrypted string or null if tampered/invalid.
 */
export function decryptPayload(encryptedPayload: string, secret?: string): string | null {
  try {
    const parts = encryptedPayload.split(":");
    if (parts.length !== 3) return null;

    const [ivB64, tagB64, ciphertextB64] = parts;
    const iv = Buffer.from(ivB64, "base64");
    const tag = Buffer.from(tagB64, "base64");

    if (iv.length !== IV_LENGTH || tag.length !== TAG_LENGTH) {
      return null;
    }

    const key = getDerivedKey(secret);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(ciphertextB64, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return null;
  }
}

/**
 * Generates a signed, time-limited OAuth state token with CSRF protection.
 * Format: hex(nonce:timestamp):hex(hmac)
 */
export function generateOAuthState(secret?: string): string {
  const nonce = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now().toString();
  const payload = `${nonce}:${timestamp}`;
  const key = secret || process.env.SESSION_SECRET || DEFAULT_SECRET_FALLBACK;

  const hmac = crypto.createHmac("sha256", key).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${hmac}`;
}

/**
 * Validates an OAuth state token.
 * Ensures HMAC signature is authentic and timestamp is within 10 minutes (TTL).
 */
export function validateOAuthState(state: string, maxAgeMs = 10 * 60 * 1000, secret?: string): boolean {
  try {
    const [payloadB64, hmac] = state.split(".");
    if (!payloadB64 || !hmac) return false;

    const payload = Buffer.from(payloadB64, "base64url").toString("utf8");
    const [nonce, timestampStr] = payload.split(":");
    if (!nonce || !timestampStr) return false;

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return false;

    // Check expiration
    if (Date.now() - timestamp > maxAgeMs || timestamp > Date.now() + 60000) {
      return false;
    }

    const key = secret || process.env.SESSION_SECRET || DEFAULT_SECRET_FALLBACK;
    const expectedHmac = crypto.createHmac("sha256", key).update(payload).digest("hex");

    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac));
  } catch {
    return false;
  }
}
