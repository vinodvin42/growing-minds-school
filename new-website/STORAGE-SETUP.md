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

**Do not set** `BLOB_READ_WRITE_TOKEN` — the app no longer uses Vercel Blob.

Redeploy after adding variables.

### 3. Verify

Open: `https://your-site.vercel.app/api/health`

Expected:

```json
{ "ok": true, "backend": "github", "github": { "repo": "vinodvin42/growing-minds-school", "tokenSet": true } }
```

---

## Recover data from old Vercel Blob (one time)

If student/fee data still lives in the **old** Vercel project’s Blob store:

1. Open the old project on Vercel → **Storage** → Blob → **.env.local** tab
2. Copy `BLOB_READ_WRITE_TOKEN`
3. Run locally:

```bash
cd new-website
$env:BLOB_READ_WRITE_TOKEN="vercel_blob_xxx"
$env:GITHUB_TOKEN="ghp_xxx"
$env:GITHUB_REPO="vinodvin42/growing-minds-school"
$env:GITHUB_BRANCH="main"
$env:GITHUB_DATA_PREFIX="new-website/data"
$env:STORAGE_BACKEND="github"
npm run recover:from-blob
```

This copies every Blob file into GitHub storage and rebuilds `portal/manifest.json`.

---

## Local development

```bash
npm run dev          # uses ./data/ automatically
npm run seed         # creates data/site-content.json
npm run seed:portal  # demo student for testing
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
- **Rebuild manifest** — POST `/api/admin/migrate-storage` (admin login required) rescans storage and updates `portal/manifest.json`.
