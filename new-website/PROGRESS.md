# Growing Minds — Migration Progress

> **Target:** Vercel-deployable Next.js site with admin panel for content, images, and video library.  
> **Source:** `old/` static HTML + PHP  
> **Output:** `new-website/`

## Decisions (locked in)

| Decision | Choice |
|----------|--------|
| Framework | Next.js 16 (App Router) on Vercel |
| Admin | Custom `/admin` panel (password auth) |
| Content storage | Vercel Blob JSON + built-in defaults fallback |
| Images | Vercel Blob uploads via admin |
| Videos | YouTube embed URLs + thumbnail upload |
| Forms | Next.js API routes (replaces PHP) |
| File uploads (admissions) | Vercel Blob + email links via Resend |
| Email | Gmail SMTP → receive at + send acknowledgments from `growingminds2025@gmail.com` |
| Design | Orange/lime theme preserved from old site |

---

## Phase checklist

### Phase 1 — Foundation
- [x] Review old website (`old/`)
- [x] Create `PROGRESS.md`
- [x] Scaffold Next.js in `new-website/`
- [x] Port theme CSS and shared layout (navbar, footer)
- [x] Add default content data from old HTML
- [x] Configure env template (`.env.example`)

### Phase 2 — Public pages
- [x] Home (`/`) — carousel, programs, teachers, gallery, testimonials
- [x] About (`/about`)
- [x] News (`/news`)
- [x] Contact (`/contact`)
- [x] Videos (`/videos`) — video library page
- [x] Admissions (`/admissions`) — form UI

### Phase 3 — Admin panel
- [x] Login at `/admin/login`
- [x] Dashboard — edit site settings, homepage, about
- [x] Image gallery manager (upload/reorder/delete)
- [x] Video library manager (add/edit/delete, featured flag)
- [x] News & events manager
- [x] Teachers & testimonials manager
- [x] Carousel slides manager

### Phase 4 — API & forms
- [x] Content API (read/write Blob)
- [x] Image upload API
- [x] `/api/contact` — Resend email
- [x] `/api/admission` — Blob uploads + Resend email

### Phase 5 — SEO & deploy
- [x] Metadata, sitemap, robots.txt
- [x] `README.md` with Vercel deployment steps
- [x] Build verification (`npm run build` — passed)

### Phase 6 — Production hardening
- [x] Local images saved and wired (`public/assets/images/`)
- [x] Logo optimized (3.3MB → ~10KB)
- [x] JSON-LD Schema.org on homepage
- [x] Open Graph + Twitter metadata
- [x] Admission form: per-file upload (Vercel body size limit fix)
- [x] `/api/admission/upload` public upload endpoint
- [x] Removed placeholder YouTube videos (add via admin)
- [x] `DEPLOYMENT.md` step-by-step Vercel guide
- [x] `vercel.json` + `npm run seed` for Blob content
- [x] Root `.gitignore` + git repo initialized

---

## Current status

**Last updated:** 2026-06-04  
**Phase:** 6 complete — ready to push and deploy  
**Build:** 20 routes, all passing  
**Next action:** Push to GitHub → import on Vercel (see `DEPLOYMENT.md`)

---

## What was built

| Old (`old/`) | New (`new-website/`) |
|--------------|----------------------|
| `index.html` | `/` |
| `about.html` | `/about` |
| `admissions.html` + `submit-admission.php` | `/admissions` + `/api/admission` |
| `news.html` | `/news` |
| `contact.html` + `submit-contact.php` | `/contact` + `/api/contact` |
| Video button (placeholder alert) | `/videos` + homepage modal |
| Hardcoded HTML content | `/admin` content manager |
| Shared hosting / PHP | Vercel + Blob + Resend |

---

## How to run locally

```bash
cd new-website
npm install
npm run dev
```

- Site: http://localhost:3000  
- Admin: http://localhost:3000/admin/login (dev password: `admin123`)

---

## Vercel deployment checklist

1. [ ] Push to GitHub (repo initialized at project root — run `git commit` then push)
2. [ ] Import in Vercel (set root to `new-website`) — see **`DEPLOYMENT.md`**
3. [ ] Create Vercel Blob store and connect to project
4. [ ] Set `ADMIN_PASSWORD` (change from dev default)
5. [ ] Set Gmail env vars — see **`EMAIL-SETUP.md`**
6. [ ] Set `NEXT_PUBLIC_SITE_URL` to your domain
7. [ ] Deploy and test admission + contact forms (check inbox + acknowledgment emails)
8. [ ] Run `npm run seed` or log in to `/admin` and save content once
9. [ ] Add school tour videos in admin → Video Library

---

## Environment variables

```env
ADMIN_PASSWORD=your-secure-password
BLOB_READ_WRITE_TOKEN=
GMAIL_USER=growingminds2025@gmail.com
GMAIL_APP_PASSWORD=your-google-app-password
ADMIN_EMAIL=growingminds2025@gmail.com
EMAIL_FROM_NAME=Growing Minds English School
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

---

## Notes

- Site renders with **default content** when Blob is not configured (works out of the box).
- Admin **save** and **image upload** require `BLOB_READ_WRITE_TOKEN`.
- Forms send email when Gmail (or Resend) is configured; otherwise log to console in dev.
- **Email setup:** see **`EMAIL-SETUP.md`** (Gmail App Password for `growingminds2025@gmail.com`).
- All site images are in `public/assets/images/` (see `src/data/images.ts`).
- Admission files upload one-by-one to avoid Vercel request size limits.
- Add school tour videos via admin → Video Library after deploy.
- Full deploy guide: **`DEPLOYMENT.md`**
