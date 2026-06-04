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
3. Set **Root Directory** to `new-website`
4. Framework Preset: **Next.js** (auto-detected)
5. Do **not** deploy yet — add env vars first

---

## Step 3: Add Vercel Blob Storage

1. In your Vercel project → **Storage** tab
2. Click **Create Database** → **Blob**
3. Name it (e.g. `growing-minds-blob`)
4. Connect to your project
5. `BLOB_READ_WRITE_TOKEN` is added automatically

---

## Step 4: Environment Variables

In Vercel → **Settings** → **Environment Variables**, add:

| Variable | Value | Required |
|----------|-------|----------|
| `ADMIN_PASSWORD` | Strong password for `/admin` | Yes |
| `GMAIL_USER` | `growingminds2025@gmail.com` | Yes (for email) |
| `GMAIL_APP_PASSWORD` | Google App Password (see `EMAIL-SETUP.md`) | Yes (for email) |
| `ADMIN_EMAIL` | `growingminds2025@gmail.com` (where forms are received) | Yes |
| `EMAIL_FROM_NAME` | `Growing Minds English School` | Yes |
| `NEXT_PUBLIC_SITE_URL` | `https://your-project.vercel.app` | Yes |
| `BLOB_READ_WRITE_TOKEN` | Auto-set by Blob store | Yes |

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
4. Click **Save Changes** to persist to Blob storage

### Add school videos

1. In admin → **Video Library** → **Add Video**
2. Paste YouTube embed URL: `https://www.youtube.com/embed/VIDEO_ID`
3. Upload thumbnail or use image URL
4. Check **Featured on homepage** for the tour video

### Test forms

1. **Contact form** — `/contact` → check email at `ADMIN_EMAIL`
2. **Admission form** — `/admissions` → upload test files → check email with document links

---

## Step 7: Custom Domain (Optional)

1. Vercel → **Settings** → **Domains**
2. Add your domain (e.g. `growingminds.com`)
3. Update DNS as instructed by Vercel
4. Update `NEXT_PUBLIC_SITE_URL` to your custom domain
5. Redeploy

---

## Resend Email Setup (optional alternative)

If you prefer not to use Gmail App Password, see `EMAIL-SETUP.md` for Gmail setup (recommended).

For Resend instead: sign up at [resend.com](https://resend.com), set `RESEND_API_KEY` and `FROM_EMAIL`.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Admin save fails | Ensure Blob store is connected and `BLOB_READ_WRITE_TOKEN` is set |
| Forms don't send email | Check `RESEND_API_KEY` and verify `FROM_EMAIL` domain |
| Admission upload fails | Blob store required; files upload one at a time (max 5MB each) |
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
