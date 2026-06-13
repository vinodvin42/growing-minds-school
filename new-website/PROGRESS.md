# Growing Minds — Migration Progress

> **Target:** Next.js site on **Vercel** with admin panel + student PWA.  
> **Storage:** JSON files in GitHub repo (`new-website/data/`) — **not Vercel Blob**.

## Decisions (locked in)

| Decision | Choice |
|----------|--------|
| Framework | Next.js 16 (App Router) on **Vercel** |
| **Storage** | **GitHub JSON files** via `GITHUB_TOKEN` — no Blob |
| Admin | Custom `/admin` panel (password auth) |
| Student portal | PWA at `/student/*` |
| Email | Gmail SMTP + Resend fallback — `EMAIL-SETUP.md` |
| Push | Web Push (VAPID) — `PUSH-SETUP.md` |

---

## Current status

**Last updated:** 2026-06-04  
**Build:** `npm run build`  
**Live:** `https://growing-minds-school.vercel.app`  
**Domain:** `www.growingmindsschool.org` — see `DOMAIN-SETUP.md`

---

## Production checklist

### Vercel
- [ ] Root Directory = `new-website`
- [ ] `STORAGE_BACKEND=github`
- [ ] `GITHUB_TOKEN` + `GITHUB_REPO` set — **`STORAGE-SETUP.md`**
- [ ] Remove / do not set `BLOB_READ_WRITE_TOKEN`
- [ ] `ADMIN_PASSWORD`, email vars, `NEXT_PUBLIC_SITE_URL`
- [ ] Redeploy

### Data
- [ ] Recover from old Blob if needed: `npm run recover:from-blob` — see **`STORAGE-SETUP.md`**
- [ ] Or `npm run seed` + add students in admin

### Domain
- [ ] GoDaddy DNS → Vercel — `DOMAIN-SETUP.md`

---

## Key docs

| Doc | Purpose |
|-----|---------|
| **`STORAGE-SETUP.md`** | GitHub JSON storage on Vercel |
| `DEPLOYMENT.md` | Vercel import & env |
| `DOMAIN-SETUP.md` | GoDaddy DNS → Vercel |
| `.env.example` | All env variables |

---

## Local dev

```bash
cd new-website
npm install
npm run dev
```

Data folder: `./data/` (filesystem, no GitHub token needed).
