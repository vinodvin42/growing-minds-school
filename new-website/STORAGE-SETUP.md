# Storage — filesystem (default)

All CMS content, student portal JSON, and uploads are stored on **disk** under `DATA_DIR`.

Vercel Blob is **not used** unless you explicitly set `STORAGE_BACKEND=blob` (legacy only).

---

## Environment

```env
STORAGE_BACKEND=filesystem
DATA_DIR=/data
NEXT_PUBLIC_SITE_URL=https://www.growingmindsschool.org
```

| Variable | Default | Notes |
|----------|---------|--------|
| `STORAGE_BACKEND` | `filesystem` | Only set `blob` for old Vercel-only deploys |
| `DATA_DIR` | `./data` | Use `/data` on Railway/Docker with a mounted volume |

---

## Where to deploy

**Vercel cannot persist files.** Use a host with a persistent volume:

| Host | Guide |
|------|--------|
| Railway | `DEPLOY-FILE-STORAGE.md` |
| Docker / VPS | `Dockerfile`, `docker-compose.yml` |
| Render | Same env vars + persistent disk |

---

## Local development

```bash
npm run dev    # reads/writes ./data
npm run seed   # initial site-content.json
```

---

## Migrate from Vercel Blob (one time)

On your computer:

```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_xxx npm run migrate:blob-to-data
```

Copies all Blob files into `./data/`. Upload that folder to your server volume, then disconnect Blob on Vercel.

---

## Layout

```
data/
  site-content.json
  portal/manifest.json
  portal/{year}/classes/{class}/students.json
  portal/{year}/classes/{class}/homework.json
  portal/{year}/{month}/messages.json
  portal/{year}/accounts/{studentId}.json
  portal/{year}/calendar/holidays.json
  portal/{year}/calendar/reminders.json
  uploads/
  admissions/
```

Uploads are served via `/api/storage/[...path]`.

---

## Legacy: Vercel + Blob

Only if you cannot move hosting yet:

```env
STORAGE_BACKEND=blob
BLOB_READ_WRITE_TOKEN=...
```

Requires `@vercel/blob` and Vercel Pro for higher limits. **Not recommended** — move to file storage instead.
