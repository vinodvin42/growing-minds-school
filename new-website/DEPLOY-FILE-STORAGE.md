# Deploy with file storage (no Vercel Blob)

This app stores CMS content, student data, and uploads on **disk** — not Vercel Blob.

**Vercel serverless cannot persist files.** To leave Blob behind, deploy to a host with a **persistent volume** (Railway, Render, VPS, or Docker).

---

## Quick start — Railway (recommended)

1. Push this repo to GitHub.
2. Create a project at [railway.app](https://railway.app) → **Deploy from GitHub** → select repo, root directory **`new-website`**.
3. Add a **Volume** to the service:
   - Mount path: **`/data`**
4. Set environment variables:

| Variable | Value |
|----------|--------|
| `STORAGE_BACKEND` | `filesystem` |
| `DATA_DIR` | `/data` |
| `ADMIN_PASSWORD` | Strong password for `/admin` |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Or use Resend — see `EMAIL-SETUP.md` |

5. Deploy. Do **not** set `BLOB_READ_WRITE_TOKEN`.
6. Point your domain (GoDaddy etc.) to Railway’s URL — see `DOMAIN-SETUP.md`.

Estimated cost: ~$5–20/month (app + volume).

---

## Docker (VPS or local production test)

```bash
cd new-website
cp .env.example .env
# Edit .env — set ADMIN_PASSWORD, email vars, NEXT_PUBLIC_SITE_URL

docker compose up -d --build
```

Data persists in the Docker volume `growing-minds-data`. Open `http://localhost:3000`.

---

## One-time: copy data from Vercel Blob

Run **on your PC** (not on Vercel) while Blob is still accessible:

```bash
cd new-website
BLOB_READ_WRITE_TOKEN=vercel_blob_xxx npm run migrate:blob-to-data
```

This writes everything into `./data/`. Then either:

- **Railway:** upload `data/` into the volume (Railway CLI or one-off copy job), or
- **Docker:** copy into the volume:  
  `docker compose run --rm -v ./data:/import web sh -c "cp -a /import/. /data/"`

After migration, remove Blob from Vercel and delete `BLOB_READ_WRITE_TOKEN` everywhere.

---

## Local development

```bash
npm install
npm run dev          # uses ./data automatically
npm run seed         # creates data/site-content.json
```

No Blob token needed.

---

## Folder layout on disk

```
data/
  site-content.json
  portal/
    manifest.json
    2026/
      classes/...
      accounts/...
      calendar/...
  uploads/
  admissions/
  portal/push/subscriptions.json
```

Files are served at `/api/storage/uploads/...` and `/api/storage/admissions/...`.

---

## Do not use Vercel for this setup

| Platform | File storage |
|----------|----------------|
| Railway / Render / VPS / Docker | Yes |
| Vercel serverless only | No — use Blob or move hosting |

More detail: `STORAGE-SETUP.md`.
