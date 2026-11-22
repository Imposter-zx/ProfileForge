# GitHub Connect & One-Click Publishing Guide

## Overview

Profile Forge features a production-ready, enterprise-grade GitHub Account Integration and Direct README Publishing System.

Users can securely authorize Profile Forge via their GitHub Account, automatically discover their special profile repository (`{username}/{username}`), and publish their customized Profile README via **Direct Commit**, **Pull Request**, or **Download Bundle**.

---

## Architecture & Security

- **Official OAuth Flow**: Uses GitHub's OAuth User-to-Server flow (compatible with both GitHub Apps and OAuth Apps).
- **AES-256-GCM Encryption**: All access tokens are encrypted with authenticated AES-256-GCM on the server before being stored in `HttpOnly`, `SameSite=Lax`, `Secure` session cookies.
- **CSRF Protection**: Time-limited (10 min TTL), HMAC-signed OAuth state tokens prevent cross-site request forgery and replay attacks.
- **Zero Token Exposure**: Sensitive tokens are never leaked to client-side JavaScript, localStorage, or browser devtools.
- **SHA Conflict Prevention**: The publisher verifies the remote `README.md` SHA before updating to avoid overwriting remote changes silently.

---

## 1. Setting Up a GitHub App (Recommended)

1. Navigate to **[GitHub Developer Settings > GitHub Apps > New GitHub App](https://github.com/settings/apps/new)**.
2. Fill in the App details:
   - **GitHub App name**: `Profile Forge` (or unique name like `ProfileForge-YourName`)
   - **Homepage URL**: `http://localhost:3000` (or your production domain, e.g. `https://profile-forge.vercel.app`)
   - **Callback URL**: `http://localhost:3000/api/auth/github/callback` (for production: `https://your-domain.com/api/auth/github/callback`)
   - **Expire user authorization tokens**: Optional (leave checked or unchecked)
   - **Request user authorization (OAuth) during installation**: Checked
3. **Webhook**:
   - Uncheck **Active** (no webhook needed for client-side publishing).
4. **Permissions**:
   - **Repository permissions**:
     - `Contents`: **Read & write** (Required to commit `README.md` and assets).
     - `Pull requests`: **Read & write** (Required for Pull Request publishing mode).
     - `Metadata`: **Read-only** (Automatically selected).
   - **Account permissions**:
     - `Email addresses`: **Read-only** (To read user email address).
5. Click **Create GitHub App**.
6. Generate a **Client secret** and note down the **App ID**, **Client ID**, and **Client secret**.
7. (Optional) Generate a **Private Key** (.pem) if using installation authentication.

---

## 2. Setting Up a GitHub OAuth App (Standard Alternative)

If you prefer standard OAuth Apps:

1. Navigate to **[GitHub Settings > Developer Settings > OAuth Apps > New OAuth App](https://github.com/settings/developers)**.
2. Configure:
   - **Application name**: `Profile Forge`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback`
3. Click **Register application**.
4. Generate a **Client secret** and copy the **Client ID** and **Client secret**.

---

## 3. Environment Variables Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Add your credentials:

```ini
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 32-byte encryption secret (generate with `openssl rand -hex 32`)
SESSION_SECRET=b7e28dfc9a456108f91234567890abcdef1234567890abcdef1234567890abcd

# GitHub Credentials (from step 1 or 2)
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here

# (Optional) GitHub Token for public scans (bypasses 60/hr unauthenticated rate limit)
GITHUB_READ_TOKEN=ghp_optional_read_token
```

---

## 4. Local Testing

1. Start development server:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:3000`.
3. In the homepage or studio toolbar, click **Connect with GitHub**.
4. Authorize on GitHub.
5. You will be redirected to `/studio?github=connected`.
6. Profile Forge will automatically:
   - Display your authenticated username and avatar.
   - Scan for repository `{username}/{username}`.
   - If missing, offer a one-click button to create `{username}/{username}`.
   - Read the existing `README.md` SHA and content.
7. Click **Publish to GitHub**:
   - Choose **Direct Commit** to commit immediately to your default branch.
   - Choose **Pull Request** to create branch `profile-forge/patch-<timestamp>` and open a PR.
   - Choose **Download Bundle** to export a ZIP.
8. Verify on GitHub that the README was updated.

---

## 5. Automated Tests

Run the comprehensive unit and integration test suite:

```bash
npm test
```

Runs 19 automated tests covering:
- OAuth URL generation & parameter validation
- Token exchange & 401 error handling
- AES-256-GCM encryption, decryption, and tamper resistance
- OAuth CSRF state HMAC signing and expiration
- Profile repository auto-detection
- Direct commit with SHA validation
- Remote 409 SHA conflict handling
- Pull Request publishing flow
- Asset upload & Markdown URL rewriting

---

## 6. Production Deployment

### Deploying to Vercel
1. Push your repository to GitHub.
2. Import project into Vercel.
3. In Vercel Project Settings > Environment Variables, add:
   - `NEXT_PUBLIC_APP_URL`: Your Vercel production URL
   - `SESSION_SECRET`: 32-byte random hex string
   - `GITHUB_CLIENT_ID`: Production GitHub App/OAuth Client ID
   - `GITHUB_CLIENT_SECRET`: Production GitHub App/OAuth Client Secret
4. In your GitHub App settings, add your production callback URL:
   `https://your-domain.com/api/auth/github/callback`
5. Deploy.
