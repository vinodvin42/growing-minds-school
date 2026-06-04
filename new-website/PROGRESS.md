# Growing Minds — Migration Progress

> **Target:** Vercel-deployable Next.js site with admin panel + student PWA.  
> **Source:** `old/` static HTML + PHP  
> **Output:** `new-website/`

## Decisions (locked in)

| Decision | Choice |
|----------|--------|
| Framework | Next.js 16 (App Router) on Vercel |
| Admin | Custom `/admin` panel (password auth) |
| Content storage | Vercel Blob JSON + built-in defaults fallback |
| Student portal | PWA at `/student/*` — homework, fees, calendar, push |
| Email | Gmail SMTP (primary) + Resend fallback — see `EMAIL-SETUP.md` |
| Push | Web Push (VAPID) — see `PUSH-SETUP.md` |
| Design | Orange/lime theme from old site |

---

## Phase checklist

### Phases 1–6 — Public site + admin CMS
- [x] Next.js scaffold, theme, public pages, admin panel
- [x] Blob content API, image upload, contact/admission forms
- [x] SEO, deployment docs, build verification

### Phase 7 — Student app
- [x] Student login (Blob-backed accounts, class-wise storage)
- [x] Homework (class-wise Blob), messages, profile
- [x] Fees & accounts (per-student Blob)
- [x] Holiday calendar + reminders (fees, homework, PTM)
- [x] School branding, bottom nav, mobile-first UI
- [x] In-app reminders (banner + tab badges when admin posts)
- [x] Web Push notifications (OS alerts when admin saves)
- [x] Collapsible fee breakdown + payment history
- [x] Fee statement print / save as PDF

---

## Current status

**Last updated:** 2026-06-04  
**Build:** Passing (`npm run build`)  
**Live (Vercel):** `https://growing-minds-school.vercel.app`  
**Custom domain:** Pending GoDaddy DNS — see **`DOMAIN-SETUP.md`**

---

## Production checklist

### Deploy & domain
- [ ] Fix GoDaddy DNS → Vercel (`76.76.21.21` + `cname.vercel-dns.com`)
- [ ] Set `NEXT_PUBLIC_SITE_URL=https://www.growingmindsschool.org`
- [ ] Vercel Root Directory = `new-website`
- [ ] Redeploy after env changes

### Vercel services
- [ ] Blob store connected
- [ ] `ADMIN_PASSWORD` (not default)
- [ ] Gmail or Resend — **`EMAIL-SETUP.md`**
- [ ] Web Push VAPID keys — **`PUSH-SETUP.md`** (`npm run generate:vapid`)

### School content (admin)
- [ ] Save site content once (or `npm run seed`)
- [ ] Add real students (replace demo login)
- [ ] Post homework, messages, fees, calendar
- [ ] Add tour videos in Video Library

### Student app
- [ ] Students install PWA / bookmark `/student/login`
- [ ] Students tap **Enable** for phone alerts
- [ ] Test homework → push + in-app badge

---

## Key docs

| Doc | Purpose |
|-----|---------|
| `DEPLOYMENT.md` | Vercel import & env |
| `DOMAIN-SETUP.md` | GoDaddy DNS → Vercel |
| `EMAIL-SETUP.md` | Gmail App Password or Resend |
| `PUSH-SETUP.md` | Phone push notifications |
| `PORTAL-STORAGE.md` | Blob folder layout |
| `.env.example` | All env variables |

---

## Environment variables

```env
ADMIN_PASSWORD=
BLOB_READ_WRITE_TOKEN=
GMAIL_USER=growingmindsenglishschool@gmail.com
GMAIL_APP_PASSWORD=
ADMIN_EMAIL=growingmindsenglishschool@gmail.com
EMAIL_FROM_NAME=Growing Minds English School
# EMAIL_PREFER=resend
# RESEND_API_KEY=
NEXT_PUBLIC_SITE_URL=https://www.growingmindsschool.org
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:growingmindsenglishschool@gmail.com
```

---

## How to run locally

```bash
cd new-website
npm install
npm run dev
```

- Site: http://localhost:3000  
- Admin: http://localhost:3000/admin/login  
- Student: http://localhost:3000/student/login (demo: `GMS2026001` / `student123`)
