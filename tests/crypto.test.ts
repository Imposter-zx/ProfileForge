// tests/crypto.test.ts
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  encryptPayload,
  decryptPayload,
  generateOAuthState,
  validateOAuthState,
} from "../lib/github/crypto";

describe("Crypto & Security Engine", () => {
  const testSecret = "test-secret-key-that-is-at-least-32-chars-long";

  test("encrypts and decrypts string payload accurately using AES-256-GCM", () => {
    const rawData = JSON.stringify({
      accessToken: "gho_test_1234567890abcdef",
      user: { login: "octocat", id: 583231 },
    });

    const encrypted = encryptPayload(rawData, testSecret);
    assert.ok(encrypted.includes(":"), "Encrypted string should have colon delimiters");
    assert.notEqual(encrypted, rawData, "Ciphertext must not be plaintext");

    const decrypted = decryptPayload(encrypted, testSecret);
    assert.equal(decrypted, rawData);
  });

  test("rejects tampered or corrupted ciphertext", () => {
    const rawData = "sensitive_token_data";
    const encrypted = encryptPayload(rawData, testSecret);
    const parts = encrypted.split(":");

    // Corrupt ciphertext
    const corruptedCiphertext = `${parts[0]}:${parts[1]}:corruptedData`;
    assert.equal(decryptPayload(corruptedCiphertext, testSecret), null);

    // Corrupt auth tag
    const corruptedTag = `${parts[0]}:YWJjZGVmZ2hpamtsbW5vcA==:${parts[2]}`;
    assert.equal(decryptPayload(corruptedTag, testSecret), null);

    // Corrupt IV length
    const invalidIv = `short:${parts[1]}:${parts[2]}`;
    assert.equal(decryptPayload(invalidIv, testSecret), null);
  });

  test("generates and validates OAuth state with HMAC signature (CSRF protection)", () => {
    const state = generateOAuthState(testSecret);
    assert.ok(state.includes("."), "State should contain payload and HMAC separator");

    const isValid = validateOAuthState(state, 10 * 60 * 1000, testSecret);
    assert.equal(isValid, true, "Fresh state should be valid");
  });

  test("rejects forged or expired OAuth state tokens", () => {
    const state = generateOAuthState(testSecret);
    const [payloadB64] = state.split(".");

    // Forged signature
    const forgedState = `${payloadB64}.fake_invalid_hmac_signature`;
    assert.equal(validateOAuthState(forgedState, 10 * 60 * 1000, testSecret), false);

    // Expired state (max age 0ms)
    assert.equal(validateOAuthState(state, -1000, testSecret), false);
  });
});
