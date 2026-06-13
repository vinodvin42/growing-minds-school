# Growing Minds English School — Next.js Website

Vercel-deployable school website with admin panel and student portal. Data is stored as **JSON files in your GitHub repo** — not Vercel Blob.

## Features

- Public pages: Home, About, Admissions, News, Videos, Contact
- Admin panel at `/admin` — edit content, upload images, manage students/fees
- Student portal — homework, messages, fees, calendar, push notifications
- Admission form with document uploads
- Contact form with email notifications

## Quick Start (Local)

```bash
cd new-website
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Data saves to `./data/` locally.

**Admin login:** `/admin/login` — dev password `admin123` if `ADMIN_PASSWORD` is unset.

## Deploy to Vercel

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** and **[STORAGE-SETUP.md](./STORAGE-SETUP.md)**.

1. Import repo on Vercel — **Root Directory:** `new-website`
2. Set env vars (no Blob token):

| Variable | Purpose |
|----------|---------|
| `STORAGE_BACKEND` | `github` |
| `GITHUB_TOKEN` | GitHub PAT with repo write access |
| `GITHUB_REPO` | `vinodvin42/growing-minds-school` |
| `ADMIN_PASSWORD` | Admin login password |
| `NEXT_PUBLIC_SITE_URL` | Your domain |

3. Deploy — admin saves commit JSON files to GitHub automatically.

## Admin Panel

Login at `/admin/login` to manage site content, gallery, videos, students, homework, fees, and calendar.

## Scripts

```bash
npm run dev          # Local development
npm run build        # Production build
npm run seed         # Seed data/site-content.json locally
npm run recover:from-blob   # One-time: copy old Vercel Blob → GitHub storage
```

## Project structure

```
new-website/
  data/              # JSON storage (Git-backed on Vercel)
  src/app/           # Pages and API routes
  src/components/    # UI components
  STORAGE-SETUP.md   # Storage configuration
  DEPLOYMENT.md      # Vercel deployment guide
```
