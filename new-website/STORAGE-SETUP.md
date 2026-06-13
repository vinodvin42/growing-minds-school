# Storage — JSON files on Vercel (no Blob)

CMS content, student portal data, and uploads are stored as **JSON and files in your GitHub repo** — not Vercel Blob.

| Environment | Backend | How it works |
|-------------|---------|--------------|
| **Vercel (production)** | `github` | Reads/writes via GitHub API → `new-website/data/` in the repo |
| **Local dev** | `filesystem` | Reads/writes `./data/` on your PC |

Each admin save commits a file to GitHub. Vercel redeploys automatically when `main` updates.

---

## Vercel setup

### 1. Create a GitHub token

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained token**
2. Repository access: **`vinodvin42/growing-minds-school`**
3. Permissions: **Contents** → Read and write
4. Copy the token

### 2. Vercel environment variables

In Vercel → project → **Settings** → **Environment Variables**:

| Variable | Value |
|----------|--------|
| `STORAGE_BACKEND` | `github` |
| `GITHUB_TOKEN` | Your GitHub token |
| `GITHUB_REPO` | `vinodvin42/growing-minds-school` |
| `GITHUB_BRANCH` | `main` |
| `GITHUB_DATA_PREFIX` | `new-website/data` |
| `ADMIN_PASSWORD` | Strong admin password |
| `NEXT_PUBLIC_SITE_URL` | `https://www.growingmindsschool.org` |

**Do not set** `BLOB_READ_WRITE_TOKEN` — Blob is not used.

Redeploy after adding variables.

### 3. Verify

Open: `https://your-site.vercel.app/api/health`

Expected:

```json
{ "ok": true, "backend": "github", "github": { "repo": "vinodvin42/growing-minds-school", "tokenSet": true } }
```

---

## Migrate from Vercel Blob (one time)

If you still have data in Blob:

```bash
cd new-website
BLOB_READ_WRITE_TOKEN=vercel_blob_xxx STORAGE_BACKEND=filesystem npm run migrate:blob-to-data
git add new-website/data
git commit -m "Migrate school data from Blob to JSON files"
git push
```

Or push migrated files via admin after first deploy (empty start).

---

## Local development

```bash
npm run dev          # uses ./data/ automatically
npm run seed         # creates data/site-content.json
```

No GitHub token needed locally.

---

## Folder layout

```
new-website/data/
  site-content.json
  portal/
    manifest.json
    2026/
      classes/...
      accounts/...
  uploads/
  admissions/
```

Files are served at `/api/storage/uploads/...` and `/api/storage/admissions/...`.

---

## Notes

- **No Blob operation limits** — data lives in Git, not Vercel Blob.
- **Saves commit to GitHub** — each admin save creates a git commit (may take 1–2 seconds).
- **Large uploads** — images/PDFs are stored in the repo via GitHub API (keep files reasonably sized).
- **Legacy Blob** — set `STORAGE_BACKEND=blob` only for one-time migration scripts.
