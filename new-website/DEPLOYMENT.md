# Growing Minds — Vercel Deployment Guide

Step-by-step guide to deploy `new-website` to Vercel.

## Prerequisites

- GitHub account
- [Vercel account](https://vercel.com) (free tier works)
- [Resend account](https://resend.com) for form emails (optional for initial deploy)

---

## Step 1: Push to GitHub

From the project root:

```bash
git init
git add .
git commit -m "Add Growing Minds Next.js website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/growing-minds-school.git
git push -u origin main
```

> If `new-website` has its own `.git` folder, remove it first so the whole repo is tracked from the root.

---

## Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. **Important:** Set **Root Directory** to `new-website`  
   - Click **Edit** next to Root Directory  
   - Enter `new-website` and confirm  
   - Without this, the site will show **404: NOT_FOUND** because the Next.js app is not at the repo root
4. Framework Preset: **Next.js** (auto-detected after root is set)
5. Do **not** deploy yet — add env vars first

---

## Step 3: GitHub storage (JSON files — no Blob)

School data is stored as JSON files in your GitHub repo, not Vercel Blob.

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained token**
2. Repository: **`vinodvin42/growing-minds-school`**
3. Permission: **Contents** → Read and write
4. Copy the token — you will set it as `GITHUB_TOKEN` on Vercel

See **`STORAGE-SETUP.md`** for full details.

---

## Step 4: Environment Variables

In Vercel → **Settings** → **Environment Variables**, add:

| Variable | Value | Required |
|----------|-------|----------|
| `ADMIN_PASSWORD` | Strong password for `/admin` | Yes |
| `STORAGE_BACKEND` | `github` | Yes |
| `GITHUB_TOKEN` | GitHub PAT from Step 3 | Yes |
| `GITHUB_REPO` | `vinodvin42/growing-minds-school` | Yes |
| `GITHUB_BRANCH` | `main` | Yes |
| `GITHUB_DATA_PREFIX` | `new-website/data` | Yes |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Gmail SMTP — see `EMAIL-SETUP.md` | Yes (email) |
| `ADMIN_EMAIL` | Where forms are received | Yes |
| `EMAIL_FROM_NAME` | `Growing Minds English School` | Yes |
| `NEXT_PUBLIC_SITE_URL` | `https://www.growingmindsschool.org` | Yes |
| `RESEND_API_KEY` | Optional — if Gmail unavailable | Optional |

**Do not connect Vercel Blob** — `BLOB_READ_WRITE_TOKEN` is not needed.

--- 

## Step 5: Deploy

Click **Deploy**. First build takes ~1–2 minutes.

Your site will be live at `https://your-project.vercel.app`

---

## Step 6: Post-Deploy Setup

### Admin panel

1. Visit `https://your-project.vercel.app/admin/login`
2. Log in with your `ADMIN_PASSWORD`
3. Review content in each tab
4. Click **Save Changes** — data is saved as JSON files in your GitHub repo

### Add school videos

1. In admin → **Video Library** → **Add Video**
2. Paste YouTube embed URL: `https://www.youtube.com/embed/VIDEO_ID`
3. Upload thumbnail or use image URL
4. Check **Featured on homepage** for the tour video

### Test forms

1. **Contact form** — `/contact` → check email at `ADMIN_EMAIL`
2. **Admission form** — `/admissions` → upload test files → check email with document links

---

## Step 7: Custom Domain

**If the domain shows the old LiteSpeed site**, DNS still points to previous hosting — see **`DOMAIN-SETUP.md`** (full guide).

Quick summary:

1. Vercel → **Settings** → **Domains** → add `growingmindsschool.org` + `www.growingmindsschool.org`
2. **Change nameservers** at your domain registrar to Vercel (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`)  
   - Your domain currently uses **Terabytes** nameservers — that serves the **old** site
3. Or update A/CNAME at Terabytes DNS to Vercel (`76.76.21.21` + `cname.vercel-dns.com`)
4. Set `NEXT_PUBLIC_SITE_URL` = `https://www.growingmindsschool.org`
5. Redeploy
6. Verify in **incognito**: response header should say `Server: Vercel`, not `LiteSpeed`

---

## Resend Email Setup (optional alternative)

If you prefer not to use Gmail App Password, see `EMAIL-SETUP.md` for Gmail setup (recommended).

For Resend instead: sign up at [resend.com](https://resend.com), set `RESEND_API_KEY` and `FROM_EMAIL`.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| **Domain shows old LiteSpeed site** | DNS still on Terabytes hosting — follow **`DOMAIN-SETUP.md`** |
| Admin save / upload fails | Check `GITHUB_TOKEN` has repo write access, `STORAGE_BACKEND=github`, then **redeploy** |
| Forms don't send email | Add Gmail App Password or `RESEND_API_KEY` on Vercel + redeploy |
| Admission upload fails | GitHub token needs Contents write; max ~5MB per file |
| Images not loading | Local images are in `public/assets/images/` — no external deps needed |
| 401 on admin | Clear cookies, log in again with correct `ADMIN_PASSWORD` |

---

## Local Development with Production Services

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
npm run dev
```

---

## Quick Reference

| URL | Purpose |
|-----|---------|
| `/` | Homepage |
| `/admin/login` | Admin panel |
| `/admissions` | Admission form |
| `/contact` | Contact form |
| `/videos` | Video library |

© 2026 Growing Minds English School
