# Growing Minds — Migration Progress

> **Target:** Next.js site with admin panel + student PWA on **filesystem storage**.  
> **Source:** `old/` static HTML + PHP  
> **Output:** `new-website/`

## Decisions (locked in)

| Decision | Choice |
|----------|--------|
| Framework | Next.js 16 (App Router) |
| **Hosting** | **Railway** (Docker + `/data` volume) — not Vercel serverless |
| **Storage** | **Filesystem** at `DATA_DIR` — not Vercel Blob |
| Admin | Custom `/admin` panel (password auth) |
| Student portal | PWA at `/student/*` — homework, fees, calendar, push |
| Email | Gmail SMTP (primary) + Resend fallback — see `EMAIL-SETUP.md` |
| Push | Web Push (VAPID) — see `PUSH-SETUP.md` |
| Design | Orange/lime theme from old site |

---

## Current status

**Last updated:** 2026-06-04  
**Build:** Passing (`npm run build`)  
**Legacy (Vercel):** `https://growing-minds-school.vercel.app` — replace with Railway  
**Custom domain:** `www.growingmindsschool.org` — see **`DOMAIN-SETUP-RAILWAY.md`**

---

## Deployment checklist

### Code & GitHub
- [x] Filesystem storage backend
- [x] Dockerfile, railway.toml, render.yaml
- [x] Health check `/api/health`
- [x] Blob → disk migration script
- [ ] Push latest to `origin/main`

### Railway
- [ ] Create project from GitHub (root: `new-website`)
- [ ] Mount volume at `/data`
- [ ] Set env vars — see **`DEPLOY-PLAN.md`**
- [ ] Migrate Blob data (`npm run migrate:blob-to-data`)
- [ ] Verify `/api/health` → 200

### Domain (GoDaddy)
- [ ] Point DNS to Railway — **`DOMAIN-SETUP-RAILWAY.md`**
- [ ] `NEXT_PUBLIC_SITE_URL=https://www.growingmindsschool.org`

### Production content
- [ ] Admin password set (not default)
- [ ] Students / fees / homework visible after migration
- [ ] Email working — **`EMAIL-SETUP.md`**
- [ ] VAPID keys — **`PUSH-SETUP.md`**

### Decommission Vercel
- [ ] Confirm Railway live for 1–2 weeks
- [ ] Remove Blob store / pause Vercel project

---

## Key docs

| Doc | Purpose |
|-----|---------|
| **`DEPLOY-PLAN.md`** | Full deployment steps |
| **`DEPLOY-FILE-STORAGE.md`** | Quick Railway / Docker guide |
| **`STORAGE-SETUP.md`** | Filesystem layout & env |
| **`DOMAIN-SETUP-RAILWAY.md`** | GoDaddy → Railway DNS |
| `EMAIL-SETUP.md` | Gmail App Password or Resend |
| `PUSH-SETUP.md` | Phone push notifications |
| `.env.example` | All env variables |

---

## Environment variables (Railway)

```env
STORAGE_BACKEND=filesystem
DATA_DIR=/data
ADMIN_PASSWORD=
NEXT_PUBLIC_SITE_URL=https://www.growingmindsschool.org
GMAIL_USER=growingmindsenglishschool@gmail.com
GMAIL_APP_PASSWORD=
ADMIN_EMAIL=growingmindsenglishschool@gmail.com
EMAIL_FROM_NAME=Growing Minds English School
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:growingmindsenglishschool@gmail.com
```

**Do not set** `BLOB_READ_WRITE_TOKEN` on Railway.

---

## How to run locally

```bash
cd new-website
npm install
npm run dev
```

- Site: http://localhost:3000  
- Admin: http://localhost:3000/admin/login  
- Data folder: `./data/`
