# Deployment plan — file storage (Railway)

**Goal:** Run the school site on persistent disk storage — no Vercel Blob limits.

| Item | Choice |
|------|--------|
| App | Next.js 16 (`new-website/`) |
| Storage | Filesystem at `/data` |
| Host | **Railway** (Docker + volume) |
| Domain | `www.growingmindsschool.org` |
| Repo | `github.com/vinodvin42/growing-minds-school` |

---

## Phase 1 — Code (done in repo)

- [x] Filesystem storage backend (default)
- [x] `Dockerfile` + `docker-compose.yml`
- [x] `railway.toml` (health check `/api/health`)
- [x] `render.yaml` (alternative host)
- [x] Blob → disk migration script (`npm run migrate:blob-to-data`)
- [x] Upload serving via `/api/storage/...`

---

## Phase 2 — Push to GitHub

```bash
git add new-website/
git commit -m "Switch to filesystem storage with Railway/Docker deploy"
git push origin main
```

---

## Phase 3 — Copy data from Vercel Blob (one time)

On your PC, with the Blob token from Vercel → Project → Storage → `.env.local`:

```bash
cd new-website
# Create .env.local with:
# BLOB_READ_WRITE_TOKEN=vercel_blob_...

npm run migrate:blob-to-data
```

Verify `./data/` contains `site-content.json`, `portal/`, etc.

---

## Phase 4 — Railway setup

1. Go to [railway.app/new](https://railway.app/new) → **Deploy from GitHub**
2. Select **`vinodvin42/growing-minds-school`**
3. **Settings → Root Directory:** `new-website`
4. **Settings → Builder:** Dockerfile (auto from `railway.toml`)
5. **Add Volume** to the service:
   - Mount path: **`/data`**
6. **Variables** (Railway → service → Variables):

| Variable | Value |
|----------|--------|
| `STORAGE_BACKEND` | `filesystem` |
| `DATA_DIR` | `/data` |
| `ADMIN_PASSWORD` | *(strong password — not admin123)* |
| `NEXT_PUBLIC_SITE_URL` | `https://www.growingmindsschool.org` |
| `GMAIL_USER` | `growingmindsenglishschool@gmail.com` |
| `GMAIL_APP_PASSWORD` | *(Google App Password)* |
| `ADMIN_EMAIL` | `growingmindsenglishschool@gmail.com` |
| `EMAIL_FROM_NAME` | `Growing Minds English School` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | *(from `npm run generate:vapid`)* |
| `VAPID_PRIVATE_KEY` | *(same)* |
| `VAPID_SUBJECT` | `mailto:growingmindsenglishschool@gmail.com` |

**Do not set** `BLOB_READ_WRITE_TOKEN`.

7. Deploy → note the Railway URL (e.g. `https://growing-minds-school-production.up.railway.app`)

8. **Upload migrated data** into the volume:
   - Install Railway CLI: `npm i -g @railway/cli`
   - `railway login` → link project
   - One-off copy (example):
     ```bash
     railway run -- sh -c "ls -la /data"
     ```
   - Or use Railway dashboard **Volume** tab / SFTP plugin, or copy via a temporary deploy job mounting local `./data`

   **Simplest:** After first deploy, use Railway shell:
   ```bash
   railway shell
   # In another terminal, tar and upload data — or use railway volume backup restore
   ```

   **Practical approach:** Run migration on Railway once with a throwaway env var:
   - Temporarily add `BLOB_READ_WRITE_TOKEN` on Railway
   - Run: `railway run npm run migrate:blob-to-data`
   - Remove `BLOB_READ_WRITE_TOKEN` after success

9. Verify: open `https://YOUR-RAILWAY-URL/api/health` → `{ "ok": true, "backend": "filesystem" }`

10. Test admin login, students list, uploads.

---

## Phase 5 — Custom domain (GoDaddy)

See **`DOMAIN-SETUP-RAILWAY.md`**.

Summary:
1. Railway → service → **Settings → Networking → Custom Domain**
2. Add `www.growingmindsschool.org` and `growingmindsschool.org`
3. Railway shows CNAME target (e.g. `xxxx.up.railway.app`)
4. GoDaddy DNS:
   - **CNAME** `www` → Railway target
   - **CNAME** `@` → Railway target (GoDaddy supports ALIAS/ANAME) **or** redirect apex → www

5. Update `NEXT_PUBLIC_SITE_URL` if needed → redeploy

---

## Phase 6 — Decommission Vercel

After Railway is live and domain points correctly:

1. Confirm students, fees, homework, uploads work on Railway
2. Remove Vercel Blob store (optional — stops charges)
3. Remove or pause Vercel project (optional)
4. Update bookmarks to custom domain

---

## Verify checklist

- [ ] `GET /api/health` → 200, `dataDirWritable: true`
- [ ] `/admin/login` works with production password
- [ ] Students visible in admin (data migrated)
- [ ] Student login works
- [ ] Image upload in admin saves and displays
- [ ] Fee receipt PDF downloads
- [ ] Contact / admission forms send email
- [ ] `www.growingmindsschool.org` serves the site

---

## Rollback

Keep Vercel project paused (not deleted) until Railway is verified for 1–2 weeks. DNS can be switched back to Vercel if needed.

---

## Cost estimate

| Service | ~Monthly |
|---------|----------|
| Railway Hobby + 1GB volume | $5–20 |
| Domain (GoDaddy) | existing |
| Blob | $0 (removed) |
